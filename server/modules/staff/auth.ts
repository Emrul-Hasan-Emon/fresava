import { requireAccount } from "../auth/service";
export const requireStaff = (request: Request) =>
  requireAccount(request, "staff_member", "staff");
