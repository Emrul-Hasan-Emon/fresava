"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import type { AccountType } from "@shared/contracts";
import { button, Card, Field, Message } from "@/features/ui";

const copy = {
  customer: {
    eyebrow: "Customer account",
    title: "Return to your Fresava ritual.",
    body: "Save delivery details, follow orders, and make every jar feel personal from checkout to doorstep.",
    panel: "Made for clean breakfasts, gifted jars, and calmer repeat orders.",
  },
  staff: {
    eyebrow: "Staff access",
    title: "Fulfillment without friction.",
    body: "Scan, verify, and move orders through the delivery journey with a focused mobile workflow.",
    panel: "Designed for quick decisions on the packing floor and on the move.",
  },
  admin: {
    eyebrow: "Admin access",
    title: "Control the Fresava operation.",
    body: "Review orders, revenue, customer feedback, and fulfillment progress from one command center.",
    panel: "A secure workspace for the people running the store.",
  },
} satisfies Record<AccountType, { eyebrow: string; title: string; body: string; panel: string }>;

export function AuthForm({
  kind,
  mode = "login",
}: {
  kind: AccountType;
  mode?: "login" | "recovery" | "reset" | "callback";
}) {
  const router = useRouter();
  const [signup, setSignup] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [checkingSession, setCheckingSession] = useState(mode === "login");
  const prefix = kind === "customer" ? "customers" : kind,
    home = kind === "customer" ? "/account" : kind === "admin" ? "/admin/dashboard" : "/staff/scan",
    login = kind === "customer" ? "/auth" : `/${kind}/login`,
    forgot = kind === "customer" ? "/auth/forgot-password" : `/${kind}/forgot-password`;
  useEffect(() => {
    if (mode !== "login") return;
    let active = true;
    api(`${prefix}/auth/session`)
      .then(() => {
        if (active) router.replace(home);
      })
      .catch(() => {
        api(`${prefix}/auth/refresh`, { method: "POST" })
          .then(() => {
            if (active) router.replace(home);
          })
          .catch(() => {
            if (active) setCheckingSession(false);
          });
      });
    return () => {
      active = false;
    };
  }, [mode, prefix, home, router]);
  useEffect(() => {
    if (mode !== "callback") return;
    let active = true;
    async function run() {
      setBusy(true);
      setError("");
      const params = new URLSearchParams(window.location.search);
      const oauthError = params.get("error_description") || params.get("error");
      if (oauthError) {
        if (active) {
          setError(oauthError);
          setBusy(false);
        }
        return;
      }
      try {
        const code = params.get("code");
        if (code && kind === "customer") {
          await api(`${prefix}/auth/google/callback`, { method: "POST", body: { code } });
          if (active) {
            router.replace(home);
            router.refresh();
          }
          return;
        }
        const result = await api<{ recovery: boolean }>(`${prefix}/auth/callback`, {
          method: "POST",
          body: { token_hash: params.get("token_hash"), type: params.get("type") ?? "email" },
        });
        if (active) {
          router.replace(
            result.recovery
              ? kind === "customer"
                ? "/auth/reset-password"
                : `/${kind}/reset-password`
              : home,
          );
          router.refresh();
        }
      } catch (e) {
        if (active) setError((e as Error).message);
      } finally {
        if (active) setBusy(false);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, [mode, prefix, home, kind, router]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const action = mode === "recovery" ? "recovery" : mode === "reset" ? "reset" : signup ? "signup" : "login";
      const body =
        mode === "recovery"
          ? { email: form.get("email") }
          : mode === "reset"
            ? { password: form.get("password") }
            : { email: form.get("email"), password: form.get("password"), ...(signup ? { full_name: form.get("full_name") } : {}) };
      const result = await api<{ message?: string }>(`${prefix}/auth/${action}`, { method: "POST", body });
      if (action === "login") {
        router.replace(home);
        router.refresh();
      } else setMessage(result.message ?? "Check your email to continue.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const c = copy[kind];
  if ((kind === "admin" || kind === "staff") && mode === "login") {
    const roleCopy =
      kind === "admin"
        ? {
            heading: "Admin Login",
            subtitle: "Sign in with your authorized FRESAVA administrator account.",
            emailLabel: "Admin email",
            submit: "Sign in to Admin",
            footer: "Restricted FRESAVA administration system.",
            checking: "Checking administrator access…",
          }
        : {
            heading: "Staff Login",
            subtitle: "Sign in with your authorized FRESAVA fulfillment and order operations account.",
            emailLabel: "Staff email",
            submit: "Sign in to Staff Portal",
            footer: "Authorized FRESAVA staff only.",
            checking: "Checking staff access…",
          };
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#fffaf2_0%,#f5eadc_52%,#fbe4ed_100%)] px-5 py-16">
        <div className="w-full max-w-[440px]">
          <Link href="/" className="wordmark mb-8 block text-center text-crimson">FRESAVA</Link>
          <Card className="bg-white/90">
            {checkingSession ? (
              <p role="status" className="py-10 text-center text-sm text-ink/55">
                {roleCopy.checking}
              </p>
            ) : (
              <>
                <h1 className="headline text-center text-4xl text-ink">{roleCopy.heading}</h1>
                <p className="mt-3 text-center text-sm leading-6 text-ink/55">{roleCopy.subtitle}</p>
                <form onSubmit={submit} className="mt-8 space-y-5">
                  <Field
                    label={roleCopy.emailLabel}
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder={`${kind}@fresava.com`}
                  />
                  <Field
                    label="Password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    maxLength={128}
                    autoComplete="current-password"
                  />
                  <Message error>{error}</Message>
                  <button className={`${button} w-full`} disabled={busy}>
                    {busy ? "Please wait…" : roleCopy.submit}
                  </button>
                </form>
                <Link className="mt-6 block text-center text-sm text-ink/55 underline underline-offset-4" href={forgot}>
                  Forgot password?
                </Link>
                <p className="mt-8 border-t border-ink/8 pt-5 text-center text-xs text-ink/40">
                  {roleCopy.footer}
                </p>
              </>
            )}
          </Card>
        </div>
      </main>
    );
  }
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_18%_12%,rgba(214,33,110,0.18),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(142,15,19,0.14),transparent_30%),linear-gradient(135deg,#fffaf2_0%,#f5eadc_52%,#fbe4ed_100%)] px-5 py-16">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-fuchsia-flesh/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-20 h-80 w-80 rounded-full bg-crimson/10 blur-3xl" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/65 bg-white/45 shadow-[0_30px_100px_rgba(47,20,13,0.14)] backdrop-blur-2xl lg:grid-cols-[1fr_0.92fr]">
        <section className="hidden min-h-[620px] flex-col justify-between bg-crimson-dark p-10 text-cream lg:flex">
          <Link href="/" className="wordmark text-xl">FRESAVA</Link>
          <div>
            <p className="eyebrow text-cream/45">{c.eyebrow}</p>
            <h1 className="headline mt-5 text-6xl">{c.title}</h1>
            <p className="mt-6 max-w-md text-sm leading-6 text-cream/68">{c.body}</p>
          </div>
          <div className="rounded-[2rem] border border-cream/12 bg-cream/8 p-5 text-sm leading-6 text-cream/70">
            {c.panel}
          </div>
        </section>
        <section className="p-6 sm:p-10">
          <Link href="/" className="wordmark mb-8 block text-center text-crimson lg:hidden">FRESAVA</Link>
          <Card className="bg-white/88">
            <p className="eyebrow text-crimson/70">{c.eyebrow}</p>
            <h1 className="headline mt-3 text-4xl text-ink sm:text-5xl">
              {mode === "callback" ? "Completing your sign in…" : mode === "recovery" ? "Forgot password?" : mode === "reset" ? "Choose a password" : signup ? "Create an account" : "Welcome back"}
            </h1>
            <p className="mt-4 text-sm leading-6 text-ink/55">{mode === "login" ? c.body : mode === "callback" ? "Please wait while we sign you in." : "Complete this secure step to continue."}</p>
            {mode === "callback" ? (
              <>
                <Message error>{error}</Message>
                {!error && <p className="mt-6 text-sm text-ink/55">One moment…</p>}
              </>
            ) : (
              <>
                <form onSubmit={submit} className="mt-8 space-y-5">
                  {signup && <Field label="Full name" name="full_name" required maxLength={120} autoComplete="name" />}
                  {mode !== "reset" && <Field label="Email" name="email" type="email" required autoComplete="email" />}
                  {mode !== "recovery" && (
                    <Field
                      label="Password"
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      maxLength={128}
                      autoComplete={signup || mode === "reset" ? "new-password" : "current-password"}
                    />
                  )}
                  <Message error>{error}</Message>
                  <Message>{message}</Message>
                  <button className={`${button} w-full`} disabled={busy}>
                    {busy ? "Please wait…" : mode === "recovery" ? "Send recovery email" : mode === "reset" ? "Update password" : signup ? "Create account" : "Sign in"}
                  </button>
                </form>
                {mode === "login" && kind === "customer" && (
                  <div className="mt-5 flex items-center gap-3 text-xs text-ink/40">
                    <span className="h-px flex-1 bg-ink/10" />
                    or
                    <span className="h-px flex-1 bg-ink/10" />
                  </div>
                )}
                {mode === "login" && kind === "customer" && (
                  <a
                    href={`/api/v1/customers/auth/google`}
                    className="mt-5 flex w-full items-center justify-center gap-3 rounded-full border border-ink/15 py-3 text-sm font-medium text-ink transition-colors hover:border-ink/30"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.48a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.56-5.17 3.56-8.82Z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3a7.37 7.37 0 0 1-11-3.88H1.08v3.09A12 12 0 0 0 12 24Z" />
                      <path fill="#FBBC05" d="M5.07 14.21a7.2 7.2 0 0 1 0-4.42V6.7H1.08a12 12 0 0 0 0 10.6l3.99-3.09Z" />
                      <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.6 11.6 0 0 0 12 0 12 12 0 0 0 1.08 6.7l3.99 3.09A7.16 7.16 0 0 1 12 4.75Z" />
                    </svg>
                    Continue with Google
                  </a>
                )}
                {mode === "login" ? (
                  <div className="mt-6 space-y-4 text-center text-sm">
                    {kind === "customer" && (
                      <button
                        className="font-semibold text-crimson underline underline-offset-4"
                        onClick={() => {
                          setSignup(!signup);
                          setError("");
                          setMessage("");
                        }}
                      >
                        {signup ? "Already have an account? Sign in" : "Create a customer account"}
                      </button>
                    )}
                    <Link className="block text-ink/55 underline underline-offset-4" href={forgot}>Forgot password?</Link>
                  </div>
                ) : (
                  <Link className="mt-6 block text-center text-sm text-crimson underline underline-offset-4" href={login}>Back to sign in</Link>
                )}
              </>
            )}
          </Card>
        </section>
      </div>
    </main>
  );
}
