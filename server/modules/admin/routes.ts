import { randomUUID } from "node:crypto";
import { z } from "zod";
import { database } from "../../infrastructure/supabase";
import { HttpError, databaseError } from "../../http/errors";
import type { RouteContext } from "../../http/context";
import {
  statuses,
  cancelSchema,
  productSchema,
  productUpdateSchema,
  productPricesSchema,
  createBatchSchema,
  confirmManufacturingSchema,
  approveQcSchema,
  receiveStockSchema,
  type Customer,
  type Batch,
  type InventoryLot,
} from "../../../shared/contracts";
import { body, id, rate } from "../../http/support";
import { requireAdmin } from "./auth";
import { detail, orderColumns } from "../orders/service";
import { imageType } from "../customers/avatar";
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
      if (status)
        query = query.eq(
          "status",
          z.enum([...statuses, "cancelled"]).parse(status),
        );
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
    if (path === "admin/customers" && method === "GET") {
      const page = z.coerce
        .number()
        .int()
        .min(1)
        .max(10000)
        .parse(url.searchParams.get("page") ?? 1);
      const search = (url.searchParams.get("search") ?? "")
        .toLowerCase()
        .slice(0, 100);
      const result = await db
        .from("orders")
        .select(
          "id,customer_id,guest_session_id,customer_name,phone,email,address,city,total,created_at",
        )
        .order("created_at", { ascending: false })
        .limit(5000);
      databaseError(result.error);
      const groups = new Map<string, Customer>();
      for (const o of result.data ?? []) {
        const phoneDigits = (o.phone ?? "").replace(/\D/g, "");
        const email = o.email ? o.email.trim().toLowerCase() : "";
        const key = o.customer_id
          ? `customer:${o.customer_id}`
          : o.guest_session_id
            ? phoneDigits
              ? `phone:${phoneDigits}`
              : email
                ? `email:${email}`
                : `order:${o.id}`
            : phoneDigits
              ? `phone:${phoneDigits}`
              : email
                ? `email:${email}`
                : `order:${o.id}`;
        const existing = groups.get(key);
        if (existing) {
          existing.orders += 1;
          existing.spent += o.total;
        } else {
          groups.set(key, {
            key,
            name: o.customer_name,
            phone: o.phone,
            email: o.email,
            city: o.city,
            address: o.address,
            orders: 1,
            spent: o.total,
            last_order_at: o.created_at,
          });
        }
      }
      let customers = Array.from(groups.values());
      if (search)
        customers = customers.filter((c) =>
          [c.name, c.phone, c.email ?? "", c.city]
            .join(" ")
            .toLowerCase()
            .includes(search),
        );
      customers.sort(
        (a, b) =>
          new Date(b.last_order_at).getTime() -
          new Date(a.last_order_at).getTime(),
      );
      const total = customers.length;
      const page_items = customers.slice((page - 1) * 20, page * 20);
      return respond({ customers: page_items, total });
    }
    if (path === "admin/products" && method === "GET") {
      const result = await db
        .from("products")
        .select(
          "id,sku,name,blurb,jars,jar_weight_g,price,compare_at,badge,image_path,active,category,description,ingredients,claims,barcode_value,stock_quantity,product_prices(currency,price,compare_at)",
        )
        .order("name");
      databaseError(result.error);
      const withPrices = (result.data ?? []).map(
        ({ product_prices, ...p }) => ({ ...p, prices: product_prices }),
      );
      return respond({ products: withPrices });
    }
    if (path === "admin/products" && method === "POST") {
      const input = productSchema.parse(await body(request));
      const result = await db.from("products").insert(input).select().single();
      if (result.error) {
        if (result.error.code === "23505")
          throw new HttpError(409, "A product with this SKU already exists.");
        databaseError(result.error);
      }
      await db.from("audit_log").insert({
        actor_type: "admin",
        staff_member_id: p.id,
        action: "product.created",
        entity_id: result.data!.id,
        details: { sku: input.sku },
      });
      return respond({ ...result.data, prices: [] }, 201);
    }
    if (path === "admin/products/image" && method === "POST") {
      await rate(request, `product-image:${p.id}`, 20, 300);
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) throw new HttpError(400, "Choose an image.");
      if (file.size > 5 * 1024 * 1024 || file.size < 12)
        throw new HttpError(400, "Choose an image smaller than 5 MB.");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const type = imageType(bytes);
      if (type.mime !== file.type)
        throw new HttpError(400, "Image type does not match its content.");
      const path = `catalog/${randomUUID()}.${type.ext}`;
      const upload = await db.storage
        .from("product-images")
        .upload(path, bytes, { contentType: type.mime });
      databaseError(upload.error);
      const url = db.storage.from("product-images").getPublicUrl(path);
      return respond({ image_path: url.data.publicUrl });
    }
    const productMatch = path.match(/^admin\/products\/([^/]+)$/);
    if (productMatch && method === "PATCH") {
      const productId = id(productMatch[1]);
      const input = productUpdateSchema.parse(await body(request));
      const result = await db
        .from("products")
        .update(input)
        .eq("id", productId)
        .select()
        .single();
      databaseError(result.error);
      await db.from("audit_log").insert({
        actor_type: "admin",
        staff_member_id: p.id,
        action: "product.updated",
        entity_id: productId,
        details: {},
      });
      return respond(result.data);
    }
    const pricesMatch = path.match(/^admin\/products\/([^/]+)\/prices$/);
    if (pricesMatch && method === "POST") {
      const productId = id(pricesMatch[1]);
      const input = productPricesSchema.parse(await body(request));
      const del = await db
        .from("product_prices")
        .delete()
        .eq("product_id", productId);
      databaseError(del.error);
      if (input.prices.length) {
        const insert = await db
          .from("product_prices")
          .insert(input.prices.map((p) => ({ ...p, product_id: productId })));
        databaseError(insert.error);
      }
      await db.from("audit_log").insert({
        actor_type: "admin",
        staff_member_id: p.id,
        action: "product.prices_updated",
        entity_id: productId,
        details: { currencies: input.prices.map((x) => x.currency) },
      });
      return respond({ ok: true });
    }
    if (path === "admin/batches" && method === "GET") {
      const result = await db
        .from("production_batches")
        .select(
          "id,batch_number,barcode_value,planned_quantity,filled_quantity,rejected_quantity,held_quantity,manufacturing_date,expiry_date,status,created_at,product_id,products(name)",
        )
        .order("created_at", { ascending: false })
        .limit(100);
      databaseError(result.error);
      const batches: Batch[] = (result.data ?? []).map((b) => ({
        id: b.id,
        batch_number: b.batch_number,
        barcode_value: b.barcode_value,
        planned_quantity: b.planned_quantity,
        filled_quantity: b.filled_quantity,
        rejected_quantity: b.rejected_quantity,
        held_quantity: b.held_quantity,
        manufacturing_date: b.manufacturing_date,
        expiry_date: b.expiry_date,
        status: b.status,
        created_at: b.created_at,
        product_id: b.product_id,
        product_name:
          (b.products as unknown as { name: string } | null)?.name ?? "",
      }));
      return respond({ batches });
    }
    if (path === "admin/batches/confirm-manufacturing" && method === "POST") {
      const input = confirmManufacturingSchema.parse(await body(request));
      const result = await db.rpc("confirm_fresava_batch_manufacturing", {
        p_admin: p.id,
        p_batch_id: input.batch_id,
        p_filled_quantity: input.filled_quantity,
        p_rejected_quantity: input.rejected_quantity,
        p_held_quantity: input.held_quantity,
        p_manufacturing_date: input.manufacturing_date,
        p_expiry_date: input.expiry_date,
        p_notes: input.notes,
      });
      databaseError(result.error);
      return respond(result.data);
    }
    if (path === "admin/batches/qc" && method === "POST") {
      const input = approveQcSchema.parse(await body(request));
      const result = await db.rpc("approve_fresava_batch_qc", {
        p_admin: p.id,
        p_batch_id: input.batch_id,
        p_decision: input.decision,
        p_released_quantity: input.released_quantity,
        p_packaging_passed: input.packaging_passed,
        p_seal_passed: input.seal_passed,
        p_labeling_passed: input.labeling_passed,
        p_lab_testing_passed: input.lab_testing_passed,
        p_documentation_passed: input.documentation_passed,
        p_remarks: input.remarks,
      });
      databaseError(result.error);
      return respond(result.data);
    }
    if (path === "admin/batches/receive-stock" && method === "POST") {
      const input = receiveStockSchema.parse(await body(request));
      const result = await db.rpc("receive_fresava_batch_stock", {
        p_admin: p.id,
        p_batch_barcode: input.batch_barcode,
        p_received_quantity: input.received_quantity,
        p_warehouse_location: input.warehouse_location,
        p_idempotency_key: input.idempotency_key,
        p_notes: input.notes,
      });
      databaseError(result.error);
      return respond(result.data);
    }
    if (path === "admin/inventory" && method === "GET") {
      const result = await db
        .from("inventory_lots")
        .select(
          "id,batch_id,warehouse_location,received_quantity,available_quantity,reserved_quantity,updated_at,production_batches(batch_number,product_id,products(name))",
        )
        .order("updated_at", { ascending: false });
      databaseError(result.error);
      const lots: InventoryLot[] = (result.data ?? []).map((l) => {
        const batch = l.production_batches as unknown as {
          batch_number: string;
          product_id: string;
          products: { name: string } | null;
        } | null;
        return {
          id: l.id,
          batch_id: l.batch_id,
          batch_number: batch?.batch_number ?? "",
          product_id: batch?.product_id ?? "",
          product_name: batch?.products?.name ?? "",
          warehouse_location: l.warehouse_location,
          received_quantity: l.received_quantity,
          available_quantity: l.available_quantity,
          reserved_quantity: l.reserved_quantity,
          updated_at: l.updated_at,
        };
      });
      return respond({ lots });
    }
    if (path === "admin/batches" && method === "POST") {
      const input = createBatchSchema.parse(await body(request));
      const result = await db.rpc("create_fresava_manufacturing_batch", {
        p_admin: p.id,
        p_product_id: input.product_id,
        p_planned_quantity: input.planned_quantity,
        p_notes: input.notes,
      });
      databaseError(result.error);
      return respond(result.data, 201);
    }
    if (path === "admin/batches/lookup" && method === "POST") {
      const input = z
        .object({ code: z.string().trim().min(1).max(80) })
        .parse(await body(request));
      const product = await db
        .from("products")
        .select("id,name,sku,barcode_value")
        .eq("barcode_value", input.code)
        .maybeSingle();
      databaseError(product.error);
      if (product.data) return respond({ type: "product", product: product.data });
      const batch = await db
        .from("production_batches")
        .select("id,batch_number,barcode_value,product_id,planned_quantity,filled_quantity,status")
        .eq("barcode_value", input.code)
        .maybeSingle();
      databaseError(batch.error);
      if (batch.data) return respond({ type: "batch", batch: batch.data });
      throw new HttpError(404, "Batch not found");
    }
    const batchMatch = path.match(/^admin\/batches\/([^/]+)\/delete$/);
    if (batchMatch && method === "POST") {
      const result = await db.rpc("delete_fresava_planned_batch", {
        p_admin: p.id,
        p_batch_id: id(batchMatch[1]),
      });
      databaseError(result.error);
      return respond({ ok: true });
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
      /^admin\/orders\/([^/]+)(\/(label|payment-collected|cancel))?$/,
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
      if (method === "POST" && match[3] === "cancel") {
        const input = cancelSchema.parse(await body(request));
        const result = await db.rpc("cancel_order", {
          p_order: orderId,
          p_admin: p.id,
          p_expected_version: input.expected_version,
          p_reason: input.reason,
        });
        databaseError(result.error);
        return respond(result.data);
      }
    }
  }
}
