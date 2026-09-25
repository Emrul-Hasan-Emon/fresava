import type { AuthAccountType, StaffRole } from "../../shared/contracts";
import { HttpError } from "../http/errors";
export const entityTables = {
  staff_member: "staff_members",
  customer: "customers",
} as const;
export function assertPrincipal(
  claims: Record<string, unknown>,
  kind: AuthAccountType,
  entity: {
    id: string;
    auth_user_id: string;
    active: boolean;
    role?: StaffRole | null;
  } | null,
  role?: StaffRole,
) {
  if (
    claims.account_type !== kind ||
    !entity ||
    !entity.active ||
    entity.id !== claims.entity_id ||
    entity.auth_user_id !== claims.sub ||
    (role && (claims.role !== role || entity.role !== role))
  )
    throw new HttpError(403, "This account cannot access this area.");
}
export function enforceOrigin(origin: string | null, expected: string) {
  if (origin !== expected) throw new HttpError(403, "Invalid request origin.");
}
