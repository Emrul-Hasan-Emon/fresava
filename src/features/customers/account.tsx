"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { useResource } from "@/features/use-resource";
import type { SessionView } from "@shared/contracts";
import {
  Card,
  Field,
  PageTitle,
  Message,
  button,
  secondary,
} from "@/features/ui";
import { CustomerAddresses } from "@/features/customers/addresses";

function Initials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-crimson text-3xl font-semibold text-cream shadow-[0_18px_45px_rgba(142,15,19,0.25)]">
      {initials || "F"}
    </div>
  );
}

export function CustomerAccount() {
  const router = useRouter();
  const { data, error, loading, reload } = useResource<SessionView>(
    "customers/account",
    "customer",
  );
  const [message, setMessage] = useState(""),
    [actionError, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [passwordBusy, setPasswordBusy] = useState(false),
    [passwordMessage, setPasswordMessage] = useState(""),
    [passwordError, setPasswordError] = useState("");
  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordBusy(true);
    setPasswordError("");
    setPasswordMessage("");
    const password = new FormData(e.currentTarget).get("password");
    try {
      const result = await api<{ message: string }>("customers/auth/reset", {
        method: "POST",
        kind: "customer",
        body: { password },
      });
      setPasswordMessage(result.message);
      router.push("/auth");
      router.refresh();
    } catch (e) {
      setPasswordError((e as Error).message);
    } finally {
      setPasswordBusy(false);
    }
  }
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("customers/account", {
        method: "PATCH",
        kind: "customer",
        body: Object.fromEntries(new FormData(e.currentTarget)),
      });
      setMessage("Your details are saved.");
      reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageTitle
        title="Your Fresava space"
        eyebrow="Customer account"
        sub="Keep your delivery details ready, follow every jar from kitchen to doorstep, and make repeat orders feel effortless."
      >
        <Link className={button} href="/orders">
          View my orders
        </Link>
      </PageTitle>
      <Message error>{error || actionError}</Message>
      <Message>{message}</Message>
      {loading ? (
        <Card>
          <p role="status" className="text-sm text-ink/60">
            Preparing your account…
          </p>
        </Card>
      ) : data ? (
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.6fr]">
          <Card className="relative overflow-hidden bg-crimson-dark text-cream">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(214,33,110,0.36),transparent_34%),radial-gradient(circle_at_90%_0%,rgba(250,245,236,0.18),transparent_26%)]" />
            <div className="relative">
              {data.avatar_url ? (
                <img
                  src={data.avatar_url}
                  alt="Your avatar"
                  className="h-24 w-24 rounded-[2rem] border border-cream/20 object-cover shadow-2xl"
                />
              ) : (
                <Initials name={data.full_name} />
              )}
              <p className="eyebrow mt-8 text-cream/55">Signed in as</p>
              <h2 className="headline mt-3 text-4xl">{data.full_name}</h2>
              <p className="mt-3 break-all text-sm text-cream/68">{data.email}</p>
              <div className="mt-7 rounded-3xl border border-cream/12 bg-cream/8 p-4 text-sm text-cream/74">
                Fresava remembers your details so checkout feels calm, fast, and personal every time.
              </div>
              <label className="mt-7 block rounded-3xl border border-cream/12 bg-cream/8 p-4 text-sm text-cream/75">
                <span className="font-medium text-cream">Change photo</span>
                <span className="mt-1 block text-xs text-cream/50">JPG, PNG, WebP; max 5 MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={busy}
                  className="mt-4 block w-full text-xs text-cream/70 file:mr-3 file:rounded-full file:border-0 file:bg-cream file:px-4 file:py-2 file:text-xs file:font-semibold file:text-crimson"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setBusy(true);
                    setError("");
                    try {
                      const body = new FormData();
                      body.set("file", file);
                      await api("customers/account/avatar", {
                        method: "POST",
                        kind: "customer",
                        body,
                      });
                      reload();
                    } catch (e) {
                      setError((e as Error).message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
              </label>
              <button
                className="mt-6 rounded-full border border-cream/20 px-5 py-2.5 text-sm font-semibold text-cream/80 transition hover:bg-cream hover:text-crimson"
                onClick={async () => {
                  try {
                    await api("customers/auth/logout", { method: "POST" });
                    router.push("/auth");
                    router.refresh();
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                Sign out
              </button>
            </div>
          </Card>
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-crimson/70">Delivery profile</p>
                <h2 className="headline mt-3 text-4xl text-ink">Personal information</h2>
              </div>
              <Link href="/spread" className={secondary}>
                Shop again
              </Link>
            </div>
            <form
              key={`${data.id}:${data.full_name}:${data.phone}:${data.address}`}
              onSubmit={save}
              className="mt-8 grid gap-5 sm:grid-cols-2"
            >
              <Field
                name="full_name"
                label="Full name"
                defaultValue={data.full_name}
                maxLength={120}
                required
              />
              <Field name="phone" label="Phone" defaultValue={data.phone} maxLength={25} />
              <div className="sm:col-span-2">
                <Field
                  name="address"
                  label="Delivery address"
                  defaultValue={data.address}
                  maxLength={400}
                />
              </div>
              <Field name="city" label="City" defaultValue={data.city} maxLength={100} />
              <div className="flex items-end">
                <button className={`${button} w-full sm:w-auto`} disabled={busy}>
                  {busy ? "Saving…" : "Save details"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
      {data && (
        <div className="mt-6 grid gap-6">
          <CustomerAddresses />
          <Card>
            <p className="eyebrow text-crimson/70">Security</p>
            <h2 className="headline mt-3 text-4xl text-ink">Change your password</h2>
            <p className="mt-3 text-sm text-ink/55">
              You&rsquo;ll be signed out on this device after changing it.
            </p>
            <form onSubmit={changePassword} className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Field
                  name="password"
                  label="New password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                />
              </div>
              <button className={button} disabled={passwordBusy}>
                {passwordBusy ? "Updating…" : "Update password"}
              </button>
            </form>
            <Message error>{passwordError}</Message>
            <Message>{passwordMessage}</Message>
          </Card>
          <Card>
            <p className="eyebrow text-crimson/70">Support</p>
            <h2 className="headline mt-3 text-4xl text-ink">Need a hand?</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-ink/55">
              Questions about an order, a delivery, or your account? Our team
              replies within one working day.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className={button} href="/contact">
                Contact support
              </Link>
              <Link className={secondary} href="/orders">
                Order support
              </Link>
            </div>
          </Card>
        </div>
      )}
      {!data && !loading && (
        <Card className="text-center">
          <h2 className="headline text-4xl text-ink">Come back to your jar story.</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-ink/58">
            Sign in to see your saved delivery details and order history across devices.
          </p>
          <Link className={`${button} mt-7`} href="/auth">
            Sign in
          </Link>
        </Card>
      )}
    </>
  );
}
