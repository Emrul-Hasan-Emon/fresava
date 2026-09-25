import { database } from "../../infrastructure/supabase";
import { HttpError, databaseError } from "../../http/errors";
import type { RouteContext } from "../../http/context";
import { accountSchema } from "../../../shared/contracts";
import { body, rate } from "../../http/support";
import { requireCustomer } from "./auth";
import { uploadAvatar } from "./avatar";
export async function handleCustomerRoutes({
  request,
  path,
  method,
  respond,
}: RouteContext) {
  const db = database();
  if (path === "customers/account" || path === "customers/account/avatar") {
    const p = await requireCustomer(request);
    if (method === "GET" && path === "customers/account") {
      const result = await db
        .from("customers")
        .select("id,full_name,phone,address,city,avatar_path")
        .eq("id", p.id)
        .single();
      databaseError(result.error);
      const account = result.data!;
      let avatar_url = null;
      if (account.avatar_path) {
        const signed = await db.storage
          .from("avatars")
          .createSignedUrl(account.avatar_path, 300);
        databaseError(signed.error);
        avatar_url = signed.data!.signedUrl;
      }
      return respond({
        ...account,
        avatar_url,
        email: p.email,
        account_type: "customer",
      });
    }
    if (method === "PATCH" && path === "customers/account") {
      const input = accountSchema.parse(await body(request));
      const result = await db.from("customers").update(input).eq("id", p.id);
      databaseError(result.error);
      return respond({ ok: true });
    }
    if (method === "POST" && path.endsWith("avatar")) {
      await rate(request, `avatar:${p.id}`, 10, 300);
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) throw new HttpError(400, "Choose an image.");
      await uploadAvatar(p.id, file);
      return respond({ ok: true });
    }
  }
}
