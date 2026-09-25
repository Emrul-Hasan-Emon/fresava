import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireAccount } from "../../modules/auth/service";
import type { AccountType } from "../../../shared/contracts";
export async function portalGuard(kind: AccountType) {
  let principal;
  try {
    principal = await requireAccount(
      new Request("http://internal", { headers: await headers() }),
      kind === "customer" ? "customer" : "staff_member",
      kind === "admin" ? "admin" : kind === "staff" ? "staff" : undefined,
    );
  } catch {
    redirect(kind === "customer" ? "/auth" : `/${kind}/login`);
  }
  return principal;
}
