import Link from "next/link";
import type { ReactNode } from "react";

const panel =
  "border border-white/70 bg-white/82 shadow-[0_24px_80px_rgba(47,20,13,0.10)] backdrop-blur-xl";

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[2rem] ${panel} p-6 sm:p-8 ${className}`}>
      {children}
    </section>
  );
}

export function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[2rem] border border-white/55 bg-white/62 p-6 shadow-[0_18px_60px_rgba(93,9,12,0.10)] backdrop-blur-2xl sm:p-8 ${className}`}
    >
      {children}
    </section>
  );
}

export function Field({
  label,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block text-[0.78rem] font-semibold tracking-wide text-ink/70">
      {label}
      <input
        {...props}
        className={`mt-2 w-full rounded-2xl border border-ink/10 bg-white/85 px-4 py-3.5 text-sm text-ink shadow-inner shadow-black/[0.02] outline-none transition focus:border-crimson/50 focus:bg-white focus:ring-4 focus:ring-crimson/10 disabled:bg-black/5 ${className}`}
      />
    </label>
  );
}

export function TextArea({
  label,
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block text-[0.78rem] font-semibold tracking-wide text-ink/70">
      {label}
      <textarea
        {...props}
        className={`mt-2 w-full rounded-2xl border border-ink/10 bg-white/85 px-4 py-3.5 text-sm text-ink shadow-inner shadow-black/[0.02] outline-none transition focus:border-crimson/50 focus:bg-white focus:ring-4 focus:ring-crimson/10 disabled:bg-black/5 ${className}`}
      />
    </label>
  );
}

export function SelectField({
  label,
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-[0.78rem] font-semibold tracking-wide text-ink/70">
      {label}
      <select
        {...props}
        className={`mt-2 w-full rounded-2xl border border-ink/10 bg-white/85 px-4 py-3.5 text-sm text-ink shadow-inner shadow-black/[0.02] outline-none transition focus:border-crimson/50 focus:bg-white focus:ring-4 focus:ring-crimson/10 disabled:bg-black/5 ${className}`}
      >
        {children}
      </select>
    </label>
  );
}

export function Message({
  children,
  error = false,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return children ? (
    <p
      role={error ? "alert" : "status"}
      className={`my-4 rounded-2xl border px-4 py-3 text-sm ${
        error
          ? "border-red-200 bg-red-50/90 text-red-800"
          : "border-emerald-200 bg-emerald-50/90 text-emerald-800"
      }`}
    >
      {children}
    </p>
  ) : null;
}

export const button =
  "inline-flex items-center justify-center rounded-full bg-crimson px-6 py-3 text-sm font-semibold text-cream shadow-[0_14px_35px_rgba(142,15,19,0.25)] transition hover:-translate-y-0.5 hover:bg-crimson-dark hover:shadow-[0_18px_42px_rgba(142,15,19,0.30)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50";

export const secondary =
  "inline-flex items-center justify-center rounded-full border border-ink/10 bg-white/80 px-5 py-2.5 text-sm font-semibold text-ink/75 shadow-sm transition hover:-translate-y-0.5 hover:border-crimson/25 hover:bg-white hover:text-crimson disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50";

export function PageTitle({
  eyebrow,
  title,
  children,
  sub,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div className="mb-8 overflow-hidden rounded-[2rem] border border-white/60 bg-white/58 p-6 shadow-[0_22px_70px_rgba(47,20,13,0.08)] backdrop-blur-xl sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow text-crimson/70">{eyebrow ?? "Fresava"}</p>
          <h1 className="headline mt-3 text-4xl text-ink sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {sub && <div className="mt-4 max-w-2xl text-sm leading-6 text-ink/58">{sub}</div>}
        </div>
        {children && <div className="flex flex-wrap gap-3">{children}</div>}
      </div>
    </div>
  );
}

export function PortalBackdrop({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_0%,rgba(214,33,110,0.16),transparent_32%),radial-gradient(circle_at_88%_12%,rgba(142,15,19,0.12),transparent_28%),linear-gradient(135deg,#fffaf2_0%,#f6efe3_50%,#fce8f0_100%)] px-5 pt-28 pb-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.70),transparent)]" />
      <div className="relative mx-auto max-w-6xl">{children}</div>
    </main>
  );
}

export function Pager({
  page,
  more,
  onPage,
}: {
  page: number;
  more: boolean;
  onPage: (page: number) => void;
}) {
  return (
    <div className="mt-6 flex items-center justify-between rounded-full border border-white/70 bg-white/65 p-2 text-sm shadow-sm backdrop-blur">
      <button
        className={secondary}
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        Previous
      </button>
      <span className="px-3 font-medium text-ink/60">Page {page}</span>
      <button className={secondary} disabled={!more} onClick={() => onPage(page + 1)}>
        Next
      </button>
    </div>
  );
}

export function Back({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="mb-6 inline-flex items-center rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-medium text-crimson shadow-sm backdrop-blur transition hover:bg-white"
    >
      ← {children}
    </Link>
  );
}
