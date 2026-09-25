export function config() {
  const {
    APP_URL,
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SECRET_KEY,
    APP_JWT_SECRET,
  } = process.env;
  if (
    !APP_URL ||
    !SUPABASE_URL ||
    !SUPABASE_PUBLISHABLE_KEY ||
    !SUPABASE_SECRET_KEY ||
    !APP_JWT_SECRET ||
    APP_JWT_SECRET.length < 32
  )
    throw new Error("SERVER_NOT_CONFIGURED");
  return {
    appUrl: new URL(APP_URL).origin,
    url: SUPABASE_URL.replace(/\/$/, ""),
    publicKey: SUPABASE_PUBLISHABLE_KEY,
    secretKey: SUPABASE_SECRET_KEY,
    jwtSecret: new TextEncoder().encode(APP_JWT_SECRET),
  };
}
