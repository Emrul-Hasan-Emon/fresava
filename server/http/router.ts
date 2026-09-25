import { randomUUID } from "node:crypto";
import { z } from "zod";
import { config } from "../config/env";
import { enforceOrigin } from "../domain/authorization";
import { HttpError } from "./errors";
import { rate } from "./support";
import { handleAuthRoutes } from "../modules/auth/routes";
import { handleCatalogRoutes } from "../modules/catalog/routes";
import { handleOrdersRoutes } from "../modules/orders/routes";
import { handleCustomerRoutes } from "../modules/customers/routes";
import { handleAdminRoutes } from "../modules/admin/routes";
import { handleStaffRoutes } from "../modules/staff/routes";
const handlers = [
  handleAuthRoutes,
  handleCatalogRoutes,
  handleOrdersRoutes,
  handleCustomerRoutes,
  handleAdminRoutes,
  handleStaffRoutes,
];
export async function dispatch(request: Request): Promise<Response> {
  const cookies: string[] = [];
  const requestId = randomUUID();
  const respond = (data: unknown, status = 200) => {
    const headers = new Headers({
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Request-ID": requestId,
    });
    for (const c of cookies) headers.append("Set-Cookie", c);
    return new Response(JSON.stringify(data), { status, headers });
  };
  try {
    const url = new URL(request.url),
      path = url.pathname.replace(/^\/api\/v1\/?/, "").replace(/\/$/, ""),
      method = request.method;
    if (!["GET", "POST", "PATCH"].includes(method))
      throw new HttpError(405, "Method not allowed.");
    const c = config();
    if (method !== "GET") {
      enforceOrigin(request.headers.get("origin"), c.appUrl);
      const length = Number(request.headers.get("content-length") ?? 0);
      if (length > 6 * 1024 * 1024)
        throw new HttpError(413, "Request too large.");
      await rate(request, "mutations", 120);
    }
    for (const handler of handlers) {
      const response = await handler({
        request,
        url,
        path,
        method,
        cookies,
        respond,
      });
      if (response) return response;
    }
    throw new HttpError(404, "Not found.");
  } catch (error) {
    if (error instanceof z.ZodError)
      return respond(
        { error: error.issues[0]?.message ?? "Invalid input.", requestId },
        400,
      );
    if (error instanceof HttpError)
      return respond({ error: error.message, requestId }, error.status);
    if (error instanceof Error && error.message === "SERVER_NOT_CONFIGURED")
      return respond(
        {
          error:
            "Online services are not available yet. Please contact Fresava to order.",
          requestId,
        },
        503,
      );
    console.error(
      "Request failed",
      requestId,
      error instanceof Error ? error.name : "Unknown",
    );
    return respond(
      { error: "Something went wrong. Please try again.", requestId },
      500,
    );
  }
}
