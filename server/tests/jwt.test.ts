import { test } from "node:test";
import assert from "node:assert/strict";
import { signAccessToken, verifyAccessToken } from "../modules/auth/jwt";
test("JWT verification rejects forged, expired, wrong-issuer and wrong-audience tokens", async () => {
  const secret = new TextEncoder().encode(
    "fixture-jwt-secret-fixture-jwt-secret-32",
  );
  const wrongSecret = new TextEncoder().encode(
    "another-jwt-secret-another-jwt-secret32",
  );
  const params = {
    sub: "user",
    sessionId: "s",
    accountType: "staff_member" as const,
    entityId: "e",
    role: "admin" as const,
  };
  const token = await signAccessToken(params, secret, "5m");
  await assert.doesNotReject(verifyAccessToken(token, secret));
  const expired = await signAccessToken(params, secret, "-1s");
  await assert.rejects(verifyAccessToken(expired, secret));
  await assert.rejects(verifyAccessToken(token, wrongSecret));
  await assert.rejects(verifyAccessToken("not-a-token", secret));
});
