import { z } from "zod";
import { database } from "../../infrastructure/supabase";
import { databaseError } from "../../http/errors";
import type { RouteContext } from "../../http/context";
import { checkoutSchema, feedbackSchema, cancelSchema } from "../../../shared/contracts";
import { body, rate, id } from "../../http/support";
import { owner, detail, orderColumns } from "./service";
export async function handleOrdersRoutes({
  request,
  path,
  method,
  url,
  cookies,
  respond,
}: RouteContext) {
  const db = database();
  if (path === "customers/guest-session" && method === "POST") {
    await owner(request, true, cookies);
    return respond({ ok: true });
  }
  if (path === "orders" && method === "POST") {
    const input = checkoutSchema.parse(await body(request));
    const access = await owner(request, true, cookies);
    await rate(request, `checkout:${access.customer ?? access.guest}`, 10, 300);
    const result = await db.rpc("place_order", {
      p_customer: access.customer,
      p_guest: access.guest,
      p_input: input,
    });
    databaseError(result.error);
    return respond(await detail(result.data.id, access), 201);
  }
  if (path === "customers/orders" && method === "GET") {
    const access = await owner(request, false, cookies);
    if (!access.customer && !access.guest)
      return respond({ orders: [], hasMore: false });
    const page = z.coerce
      .number()
      .int()
      .min(1)
      .max(10000)
      .parse(url.searchParams.get("page") ?? 1);
    let query = db
      .from("orders")
      .select(orderColumns)
      .order("created_at", { ascending: false })
      .range((page - 1) * 20, page * 20);
    query = access.customer
      ? query.eq("customer_id", access.customer)
      : query.eq("guest_session_id", access.guest!);
    const result = await query;
    databaseError(result.error);
    return respond({
      orders: result.data?.slice(0, 20),
      hasMore: (result.data?.length ?? 0) > 20,
    });
  }
  const customerOrder = path.match(
    /^customers\/orders\/([^/]+)(\/(feedback|cancel))?$/,
  );
  if (customerOrder) {
    const orderId = id(customerOrder[1]);
    const access = await owner(request, false, cookies);
    if (method === "GET" && !customerOrder[2])
      return respond(await detail(orderId, access));
    if (method === "POST" && customerOrder[3] === "feedback") {
      const input = feedbackSchema.parse(await body(request));
      const result = await db.rpc("submit_feedback", {
        p_order: orderId,
        p_customer: access.customer,
        p_guest: access.guest,
        p_rating: input.rating,
        p_feedback: input.feedback,
      });
      databaseError(result.error);
      return respond({ ok: true });
    }
    if (method === "POST" && customerOrder[3] === "cancel") {
      const input = cancelSchema.parse(await body(request));
      const result = await db.rpc("cancel_order_by_customer", {
        p_order: orderId,
        p_customer: access.customer,
        p_guest: access.guest,
        p_expected_version: input.expected_version,
        p_reason: input.reason,
      });
      databaseError(result.error);
      return respond(result.data);
    }
  }
}
