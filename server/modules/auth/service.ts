import { randomUUID } from "node:crypto";
import { signAccessToken, verifyAccessToken } from "./jwt";
import { config } from "../../config/env";
import { database, authProvider } from "../../infrastructure/supabase";
import { HttpError, databaseError } from "../../http/errors";
import { assertPrincipal, entityTables } from "../../domain/authorization";
import { cookieName, readCookie } from "../../http/cookies";
import type { AuthAccountType, StaffRole } from "../../../shared/contracts";
const ACCESS_TOKEN_TTL = "15m";
export interface Principal {
  kind: AuthAccountType;
  id: string;
  authId: string;
  sessionId: string;
  token: string;
  email: string;
  fullName: string;
  role?: StaffRole;
}
export interface Session {
  access_token: string;
  refresh_token: string;
  supabase_access_token: string;
}
type AccountRow = {
  id: string;
  auth_user_id: string;
  active: boolean;
  full_name: string;
  role?: StaffRole | null;
};
async function loadAccount(kind: AuthAccountType, authUserId: string) {
  const db = database();
  const account = await db
    .from(entityTables[kind])
    .select(
      kind === "staff_member"
        ? "id,auth_user_id,active,full_name,role"
        : "id,auth_user_id,active,full_name",
    )
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  databaseError(account.error);
  return account.data as AccountRow | null;
}
async function mintSession(
  kind: AuthAccountType,
  authUserId: string,
  supabaseRefreshToken: string,
  supabaseAccessToken: string,
  role?: StaffRole,
): Promise<Session> {
  const entity = await loadAccount(kind, authUserId);
  if (!entity || !entity.active || (role && entity.role !== role))
    throw new HttpError(403, "This account cannot access this area.");
  const c = config();
  const access_token = await signAccessToken(
    {
      sub: authUserId,
      sessionId: randomUUID(),
      accountType: kind,
      entityId: entity.id,
      role: entity.role ?? undefined,
    },
    c.jwtSecret,
    ACCESS_TOKEN_TTL,
  );
  return {
    access_token,
    refresh_token: supabaseRefreshToken,
    supabase_access_token: supabaseAccessToken,
  };
}
export async function verify(
  token: string,
  kind: AuthAccountType,
  role?: StaffRole,
): Promise<Principal> {
  const c = config();
  let payload;
  try {
    ({ payload } = await verifyAccessToken(token, c.jwtSecret));
  } catch {
    throw new HttpError(401, "Please sign in again.");
  }
  if (typeof payload.sub !== "string" || typeof payload.session_id !== "string")
    throw new HttpError(401, "Invalid session.");
  const db = database();
  const [account, revoked] = await Promise.all([
    loadAccount(kind, payload.sub),
    db
      .from("revoked_auth_sessions")
      .select("session_id")
      .eq("session_id", payload.session_id)
      .maybeSingle(),
  ]);
  databaseError(revoked.error);
  if (revoked.data)
    throw new HttpError(401, "Session ended. Please sign in again.");
  assertPrincipal(payload, kind, account, role);
  return {
    kind,
    id: account!.id,
    authId: payload.sub,
    sessionId: payload.session_id,
    token,
    email: typeof payload.email === "string" ? payload.email : "",
    fullName: account!.full_name,
    role: account!.role ?? undefined,
  };
}
export async function requireAccount(
  request: Request,
  kind: AuthAccountType,
  role?: StaffRole,
) {
  const token = readCookie(request, cookieName(kind, "access"));
  if (!token) throw new HttpError(401, "Please sign in.");
  return verify(token, kind, role);
}
export async function login(
  kind: AuthAccountType,
  email: string,
  password: string,
  role?: StaffRole,
) {
  const { data, error } = await authProvider().auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.session || !data.user)
    throw new HttpError(401, "Invalid credentials or unconfirmed email.");
  return mintSession(
    kind,
    data.user.id,
    data.session.refresh_token,
    data.session.access_token,
    role,
  );
}
export async function refresh(
  request: Request,
  kind: AuthAccountType,
  role?: StaffRole,
) {
  const token = readCookie(request, cookieName(kind, "refresh"));
  if (!token) throw new HttpError(401, "Please sign in.");
  const { data, error } = await authProvider().auth.refreshSession({
    refresh_token: token,
  });
  if (error || !data.session || !data.user)
    throw new HttpError(401, "Please sign in again.");
  return mintSession(
    kind,
    data.user.id,
    data.session.refresh_token,
    data.session.access_token,
    role,
  );
}
export async function mintFromAuthUser(
  kind: AuthAccountType,
  authUserId: string,
  supabaseRefreshToken: string,
  supabaseAccessToken: string,
  role?: StaffRole,
) {
  return mintSession(
    kind,
    authUserId,
    supabaseRefreshToken,
    supabaseAccessToken,
    role,
  );
}
export async function revoke(principal: Principal, supabaseAccessToken?: string) {
  const db = database();
  const result = await db.from("revoked_auth_sessions").upsert({
    session_id: principal.sessionId,
    auth_user_id: principal.authId,
    expires_at: new Date(Date.now() + 86400 * 30 * 1000).toISOString(),
  });
  databaseError(result.error);
  if (supabaseAccessToken) {
    try {
      await db.auth.admin.signOut(supabaseAccessToken, "local");
    } catch {
      // Best-effort: local revocation above is the enforced guarantee.
    }
  }
}
