import { randomBytes, createHash } from "node:crypto";
import { database } from "../../infrastructure/supabase";
import { databaseError, HttpError } from "../../http/errors";
import { cookie, readCookie, cookieName } from "../../http/cookies";
import { requireCustomer } from "../customers/auth";
export interface Owner {
  customer: string | null;
  guest: string | null;
}
export const orderColumns =
  "id,order_number,tracking_code,customer_name,phone,email,address,city,notes,subtotal,discount,shipping,total,status,version,payment_status,payment_method,created_at,eta,zone";
export async function owner(
  request: Request,
  create: boolean,
  cookies: string[],
): Promise<Owner> {
  if (readCookie(request, cookieName("customer", "access"))) {
    const p = await requireCustomer(request);
    return { customer: p.id, guest: null };
  }
  const db = database(),
    token = readCookie(request, "fresava_guest");
  if (token) {
    const result = await db
      .from("guest_sessions")
      .select("id")
      .eq("token_hash", createHash("sha256").update(token).digest("hex"))
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    databaseError(result.error);
    if (result.data) return { customer: null, guest: result.data.id };
  }
  if (!create) return { customer: null, guest: null };
  const fresh = randomBytes(32).toString("base64url");
  const result = await db
    .from("guest_sessions")
    .insert({
      token_hash: createHash("sha256").update(fresh).digest("hex"),
      expires_at: new Date(Date.now() + 86400 * 30 * 1000).toISOString(),
    })
    .select("id")
    .single();
  databaseError(result.error);
  cookies.push(cookie("fresava_guest", fresh, 86400 * 30));
  return { customer: null, guest: result.data!.id };
}
export async function detail(id: string, access: Owner | "admin" | "staff") {
  const db = database();
  let query = db.from("orders").select(orderColumns).eq("id", id);
  if (typeof access !== "string") {
    if (!access.customer && !access.guest)
      throw new HttpError(404, "Order not found");
    query = access.customer
      ? query.eq("customer_id", access.customer)
      : query.eq("guest_session_id", access.guest!);
  }
  const o = await query.maybeSingle();
  databaseError(o.error);
  if (!o.data) throw new HttpError(404, "Order not found");
  const [items, history, feedback] = await Promise.all([
    db
      .from("order_items")
      .select(
        "id,sku,product_name,jars,jar_weight_g,quantity,unit_price,subtotal",
      )
      .eq("order_id", id),
    db
      .from("order_status_history")
      .select("id,to_status,created_at")
      .eq("order_id", id)
      .order("version"),
    db
      .from("order_feedback")
      .select("id,order_id,rating,feedback,created_at")
      .eq("order_id", id)
      .maybeSingle(),
  ]);
  databaseError(items.error);
  databaseError(history.error);
  databaseError(feedback.error);
  if (access === "staff") {
    o.data.email = null;
    o.data.notes = null;
  }
  return {
    order: o.data,
    items: items.data ?? [],
    history: history.data ?? [],
    feedback: access === "staff" ? null : feedback.data,
  };
}
