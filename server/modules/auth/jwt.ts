import { SignJWT, jwtVerify } from "jose";
import type { AuthAccountType, StaffRole } from "../../../shared/contracts";
const ISSUER = "fresava";
const AUDIENCE = "fresava-app";
export interface AccessTokenParams {
  sub: string;
  sessionId: string;
  accountType: AuthAccountType;
  entityId: string;
  role?: StaffRole;
}
export async function signAccessToken(
  params: AccessTokenParams,
  secret: Uint8Array,
  expiresIn: string,
) {
  return new SignJWT({
    session_id: params.sessionId,
    account_type: params.accountType,
    entity_id: params.entityId,
    ...(params.role ? { role: params.role } : {}),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(params.sub)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}
export async function verifyAccessToken(token: string, secret: Uint8Array) {
  return jwtVerify(token, secret, {
    issuer: ISSUER,
    audience: AUDIENCE,
    algorithms: ["HS256"],
    requiredClaims: [
      "sub",
      "exp",
      "iat",
      "session_id",
      "account_type",
      "entity_id",
    ],
  });
}
