import type { AuthAccountType } from "../../shared/contracts";
export function readCookie(request: Request, name: string) {
  const parts = (request.headers.get("cookie") ?? "").split(";");
  const part = parts.find((p) => p.trim().startsWith(name + "="));
  return part
    ? decodeURIComponent(part.trim().slice(name.length + 1))
    : undefined;
}
export const cookieName = (
  type: AuthAccountType,
  kind: "access" | "refresh" | "supabase",
) => `fresava_${type}_${kind}`;
export function cookie(name: string, value: string, age: number) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}
export function sessionCookies(
  type: AuthAccountType,
  session: {
    access_token: string;
    refresh_token: string;
    supabase_access_token?: string;
  } | null,
) {
  return [
    cookie(
      cookieName(type, "access"),
      session?.access_token ?? "",
      session ? 86400 * 7 : 0,
    ),
    cookie(
      cookieName(type, "refresh"),
      session?.refresh_token ?? "",
      session ? 86400 * 7 : 0,
    ),
    cookie(
      cookieName(type, "supabase"),
      session?.supabase_access_token ?? "",
      session?.supabase_access_token ? 900 : 0,
    ),
  ];
}
