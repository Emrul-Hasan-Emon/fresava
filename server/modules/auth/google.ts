import { randomBytes, createHash } from "node:crypto";
import { HttpError } from "../../http/errors";
import { config } from "../../config/env";

function base64url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function createPkcePair() {
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

export function googleAuthorizeUrl(challenge: string) {
  const c = config();
  const redirectTo = `${c.appUrl}/auth/callback`;
  const url = new URL(`${c.url}/auth/v1/authorize`);
  url.searchParams.set("provider", "google");
  url.searchParams.set("redirect_to", redirectTo);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "s256");
  return url.toString();
}

export async function exchangeGoogleCode(code: string, verifier: string) {
  const c = config();
  const response = await fetch(`${c.url}/auth/v1/token?grant_type=pkce`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: c.publicKey },
    body: JSON.stringify({ auth_code: code, code_verifier: verifier }),
  });
  if (!response.ok) throw new HttpError(401, "Google sign-in could not be completed.");
  const data = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    user?: { id: string };
  };
  if (!data.refresh_token || !data.access_token || !data.user?.id)
    throw new HttpError(401, "Google sign-in could not be completed.");
  return {
    userId: data.user.id,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
}
