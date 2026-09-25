import { createHash } from "node:crypto";
import { z } from "zod";
import { database } from "../infrastructure/supabase";
import { HttpError, databaseError } from "./errors";
export async function body(request: Request) {
  const raw = await request.text();
  if (raw.length > 20000) throw new HttpError(413, "Request too large.");
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, "Invalid JSON.");
  }
}
export async function rate(
  request: Request,
  bucket: string,
  limit = 30,
  seconds = 60,
) {
  // Netlify supplies this header; arbitrary forwarded IPs are not trusted elsewhere.
  const ip = process.env.NETLIFY
    ? (request.headers.get("x-nf-client-connection-ip") ?? "unknown")
    : "local";
  const key = createHash("sha256").update(`${bucket}:${ip}`).digest("hex");
  const result = await database().rpc("consume_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_seconds: seconds,
  });
  databaseError(result.error);
  if (!result.data)
    throw new HttpError(429, "Too many requests. Please try again shortly.");
}
export const id = (value: string) => z.uuid().parse(value);
