import { z } from "zod";
import { database } from "../../infrastructure/supabase";
import { HttpError, databaseError } from "../../http/errors";
import type { RouteContext } from "../../http/context";
import { config } from "../../config/env";
import { authProvider } from "../../infrastructure/supabase";
import {
  credentialsSchema,
  signupSchema,
  type AuthAccountType,
  type StaffRole,
} from "../../../shared/contracts";
import { body, rate } from "../../http/support";
import {
  login,
  refresh,
  verify,
  revoke,
  requireAccount,
  mintFromAuthUser,
} from "./service";
import { cookieName, readCookie, sessionCookies } from "../../http/cookies";
export async function handleAuthRoutes({
  request,
  path,
  method,
  cookies,
  respond,
}: RouteContext) {
  const c = config();
  const authMatch = path.match(
    /^(customers|admin|staff)\/auth\/(signup|login|refresh|logout|session|recovery|reset|callback)$/,
  );
  if (authMatch) {
    const portal = authMatch[1] as "customers" | "admin" | "staff";
    const kind: AuthAccountType =
      portal === "customers" ? "customer" : "staff_member";
    const role: StaffRole | undefined =
      portal === "admin" ? "admin" : portal === "staff" ? "staff" : undefined;
    const action = authMatch[2];
    if (action === "session" && method === "GET") {
      const p = await requireAccount(request, kind, role);
      return respond({
        id: p.id,
        account_type: kind,
        role: p.role,
        full_name: p.fullName,
        email: p.email,
      });
    }
    if (method !== "POST") throw new HttpError(405, "Method not allowed.");
    await rate(
      request,
      `auth:${kind}:${action}`,
      action === "recovery" ? 5 : 20,
      300,
    );
    if (action === "login") {
      const input = credentialsSchema.parse(await body(request));
      const session = await login(kind, input.email, input.password, role);
      cookies.push(...sessionCookies(kind, session));
      return respond({ ok: true });
    }
    if (action === "refresh") {
      try {
        const session = await refresh(request, kind, role);
        cookies.push(...sessionCookies(kind, session));
        return respond({ ok: true });
      } catch (error) {
        cookies.push(...sessionCookies(kind, null));
        throw error;
      }
    }
    if (action === "logout") {
      const token = readCookie(request, cookieName(kind, "access"));
      let p;
      let refreshToken = readCookie(request, cookieName(kind, "refresh"));
      if (token) {
        try {
          p = await verify(token, kind, role);
        } catch (error) {
          if (!(error instanceof HttpError) || error.status !== 401)
            throw error;
        }
      }
      if (!p && refreshToken) {
        try {
          const s = await refresh(request, kind, role);
          p = await verify(s.access_token, kind, role);
          refreshToken = s.refresh_token;
        } catch (error) {
          if (!(error instanceof HttpError) || error.status !== 401)
            throw error;
        }
      }
      if (p) await revoke(p, refreshToken);
      cookies.push(...sessionCookies(kind, null));
      return respond({ ok: true });
    }
    if (action === "signup") {
      if (kind !== "customer")
        throw new HttpError(403, "Registration is not available here.");
      const input = signupSchema.parse(await body(request));
      const { data, error } = await authProvider().auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: { full_name: input.full_name },
          emailRedirectTo: c.appUrl + "/auth/callback",
        },
      });
      if (error)
        throw new HttpError(
          400,
          "Could not register. Check your details or try signing in.",
        );
      if (data.session && data.user) {
        const session = await mintFromAuthUser(
          "customer",
          data.user.id,
          data.session.refresh_token,
        );
        cookies.push(...sessionCookies(kind, session));
      }
      return respond({
        message: data.session
          ? "Account created. You can continue."
          : "Check your email to confirm your account.",
      });
    }
    if (action === "recovery") {
      const { email } = z
        .object({ email: z.email() })
        .parse(await body(request));
      const callback =
        kind === "customer" ? "/auth/callback" : `/${portal}/auth/callback`;
      await authProvider().auth.resetPasswordForEmail(email, {
        redirectTo: c.appUrl + callback,
      });
      return respond({
        message: "If the account exists, a recovery link has been sent.",
      });
    }
    if (action === "callback") {
      const input = z
        .object({
          token_hash: z.string().min(10).max(500),
          type: z.enum(["email", "signup", "recovery"]),
        })
        .parse(await body(request));
      const result = await authProvider().auth.verifyOtp(input);
      if (result.error || !result.data.session || !result.data.user)
        throw new HttpError(400, "This link is invalid or expired.");
      const session = await mintFromAuthUser(
        kind,
        result.data.user.id,
        result.data.session.refresh_token,
        role,
      );
      cookies.push(...sessionCookies(kind, session));
      return respond({ recovery: input.type === "recovery" });
    }
    if (action === "reset") {
      const p = await requireAccount(request, kind, role);
      const { password } = z
        .object({ password: z.string().min(8).max(128) })
        .parse(await body(request));
      const result = await database().auth.admin.updateUserById(p.authId, {
        password,
      });
      databaseError(result.error);
      await revoke(p, readCookie(request, cookieName(kind, "refresh")));
      cookies.push(...sessionCookies(kind, null));
      return respond({ message: "Password updated. Please sign in again." });
    }
  }
}
