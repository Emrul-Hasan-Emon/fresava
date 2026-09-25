import { z } from "zod";
import { database } from "../../infrastructure/supabase";
import { HttpError, databaseError } from "../../http/errors";
import type { RouteContext } from "../../http/context";
import { advanceSchema } from "../../../shared/contracts";
import { body, rate, id } from "../../http/support";
import { requireStaff } from "./auth";
import { detail } from "../orders/service";
export async function handleStaffRoutes({
  request,
  path,
  method,
  respond,
}: RouteContext) {
  const db = database();
  if (path.startsWith("staff/")) {
    const p = await requireStaff(request);
    await rate(request, `staff:${p.id}`, 90);
    if (path === "staff/fulfillment/lookup" && method === "POST") {
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
      return respond(await detail(result.data.id, "staff"));
    }
    if (path === "staff/fulfillment/advance" && method === "POST") {
      const input = advanceSchema.parse(await body(request));
      const result = await db.rpc("advance_order", {
        p_order: input.order_id,
        p_staff: p.id,
        p_version: input.expected_version,
        p_request: input.request_id,
      });
      databaseError(result.error);
      return respond(result.data);
    }
    const match = path.match(/^staff\/orders\/([^/]+)$/);
    if (match && method === "GET")
      return respond(await detail(id(match[1]), "staff"));
  }
}
