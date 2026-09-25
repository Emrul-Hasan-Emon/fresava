import { requireAccount } from "../auth/service";
export const requireCustomer = (request: Request) =>
  requireAccount(request, "customer");
