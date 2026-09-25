import { z } from "zod";
import { database } from "../../infrastructure/supabase";
import { HttpError, databaseError } from "../../http/errors";
import type { RouteContext } from "../../http/context";
import { statuses } from "../../../shared/contracts";
import { body, id } from "../../http/support";
import { requireAdmin } from "./auth";
import { detail, orderColumns } from "../orders/service";
export async function handleAdminRoutes({
  request,
  path,
  method,
  url,
  respond,
}: RouteContext) {
  const db = database();
  if (path.startsWith("admin/")) {
    const p = await requireAdmin(request);
    if (path === "admin/dashboard" && method === "GET") {
      const result = await db.rpc("dashboard");
      databaseError(result.error);
      return respond(result.data);
    }
    if (path === "admin/orders" && method === "GET") {
      const page = z.coerce
        .number()
        .int()
        .min(1)
        .max(10000)
        .parse(url.searchParams.get("page") ?? 1);
      const search = (url.searchParams.get("search") ?? "")
        .replace(/[^\p{L}\p{N} @+-]/gu, "")
        .slice(0, 100);
      const status = url.searchParams.get("status") ?? "";
      let query = db
        .from("orders")
        .select(orderColumns, { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * 20, page * 20 - 1);
      if (search)
        query = query.or(
          `order_number.ilike.%${search}%,customer_name.ilike.%${search}%,phone.ilike.%${search}%,city.ilike.%${search}%,tracking_code.ilike.%${search}%`,
        );
      if (status) query = query.eq("status", z.enum(statuses).parse(status));
      const result = await query;
      databaseError(result.error);
      return respond({ orders: result.data, total: result.count });
    }
    if (path === "admin/feedback" && method === "GET") {
      const page = z.coerce
        .number()
        .int()
        .min(1)
        .max(10000)
        .parse(url.searchParams.get("page") ?? 1);
      const result = await db
        .from("order_feedback")
        .select("id,order_id,rating,feedback,created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * 20, page * 20 - 1);
      databaseError(result.error);
      return respond({ feedback: result.data, total: result.count });
    }
    if (path === "admin/orders/lookup" && method === "POST") {
      const input = z
        .object({ tracking_code: z.string().trim().min(1).max(80) })
        .parse(await body(request));
      const result = await db
        .from("orders")
        .select("id")
        .eq("tracking_code", input.tracking_code.toUpperCase())
        .maybeSingle();
      databaseError(result.error);
      if (!result.data) throw new HttpError(404, "Order not found");
      return respond(await detail(result.data.id, "admin"));
    }
    const match = path.match(
      /^admin\/orders\/([^/]+)(\/(label|payment-collected))?$/,
    );
    if (match) {
      const orderId = id(match[1]);
      if (method === "GET") return respond(await detail(orderId, "admin"));
      if (method === "POST" && match[3] === "payment-collected") {
        const result = await db.rpc("collect_payment", {
          p_order: orderId,
          p_admin: p.id,
        });
        databaseError(result.error);
        return respond({ ok: true });
      }
    }
  }
}
