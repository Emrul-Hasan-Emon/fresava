import { requireAccount } from "../auth/service";
export const requireAdmin = (request: Request) =>
  requireAccount(request, "staff_member", "admin");
