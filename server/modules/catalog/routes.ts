import { database } from "../../infrastructure/supabase";
import { databaseError } from "../../http/errors";
import type { RouteContext } from "../../http/context";
import { quoteSchema } from "../../../shared/contracts";
import { body } from "../../http/support";
export async function handleCatalogRoutes({
  request,
  path,
  method,
  respond,
}: RouteContext) {
  const db = database();
  if (path === "catalog" && method === "GET") {
    const [products, zones] = await Promise.all([
      db
        .from("products")
        .select(
          "id,sku,name,blurb,jars,jar_weight_g,price,compare_at,badge,image_path,product_prices(currency,price,compare_at)",
        )
        .eq("active", true)
        .order("price"),
      db
        .from("shipping_zones")
        .select("code,label,fee,free_threshold,eta")
        .eq("active", true),
    ]);
    databaseError(products.error);
    databaseError(zones.error);
    const withPrices = (products.data ?? []).map(
      ({ product_prices, ...p }) => ({ ...p, prices: product_prices }),
    );
    return respond({ products: withPrices, zones: zones.data });
  }
  if (path === "checkout/quote" && method === "POST") {
    const input = quoteSchema.parse(await body(request));
    const result = await db.rpc("quote_order", { p_quote: input });
    databaseError(result.error);
    return respond(result.data);
  }
}
