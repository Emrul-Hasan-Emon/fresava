"use client";
import { useState } from "react";
import Link from "next/link";
import { useResource } from "@/features/use-resource";
import type { Feedback } from "@shared/contracts";
import { Card, PageTitle, Message, Pager, secondary } from "@/features/ui";

export function AdminFeedback() {
  const [page, setPage] = useState(1);
  const { data, error, loading } = useResource<{ feedback: Feedback[]; total: number }>(`admin/feedback?page=${page}`, "admin");
  return (
    <>
      <PageTitle title="Customer feedback" eyebrow="Voice of customer" sub="Review delivered-order feedback and jump straight to the order when follow-up is needed." />
      <Message error>{error}</Message>
      {loading ? (
        <Card><p role="status" className="text-sm text-ink/60">Loading feedback…</p></Card>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2">
            {data?.feedback.map((f) => (
              <Card key={f.id}>
                <div className="flex items-center justify-between gap-4">
                  <p className="headline text-4xl text-crimson">{f.rating}/5</p>
                  <span className="rounded-full bg-crimson/8 px-3 py-1 text-xs font-semibold text-crimson">Verified order</span>
                </div>
                <p className="mt-5 whitespace-pre-wrap rounded-3xl bg-cream/70 p-5 text-sm leading-6 text-ink/70">{f.feedback}</p>
                <p className="mt-5 text-xs font-medium uppercase tracking-[0.16em] text-ink/35">{new Date(f.created_at).toLocaleString()}</p>
                <Link href={`/admin/orders/${f.order_id}`} className={`${secondary} mt-5`}>View order</Link>
              </Card>
            ))}
          </div>
          {!data?.feedback.length && (
            <Card className="text-center">
              <h2 className="headline text-4xl text-ink">No feedback yet.</h2>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-ink/58">Feedback appears after customers submit a rating from a delivered order.</p>
            </Card>
          )}
          <Pager page={page} more={page * 20 < (data?.total ?? 0)} onPage={setPage} />
        </>
      )}
    </>
  );
}
