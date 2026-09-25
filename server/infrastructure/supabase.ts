import { createClient } from "@supabase/supabase-js";
import { config } from "../config/env";
export function database() {
  const c = config();
  return createClient(c.url, c.secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
export function authProvider() {
  const c = config();
  return createClient(c.url, c.publicKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
