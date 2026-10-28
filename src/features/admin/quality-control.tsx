"use client";
import { useState } from "react";
import { useResource } from "@/features/use-resource";
import { api } from "@/lib/api/client";
import type { Batch } from "@shared/contracts";
import { Card, Message, PageTitle, Field, TextArea, button, secondary } from "@/features/ui";

const CHECKS = [
  ["packaging_passed", "Packaging"],
  ["seal_passed", "Seal"],
  ["labeling_passed", "Labeling"],
  ["lab_testing_passed", "Lab testing"],
  ["documentation_passed", "Documentation"],
] as const;

type Checks = Record<(typeof CHECKS)[number][0], boolean>;

const EMPTY_CHECKS: Checks = {
  packaging_passed: false,
  seal_passed: false,
  labeling_passed: false,
  lab_testing_passed: false,
  documentation_passed: false,
};

export function AdminQualityControl() {
  const { data, error, loading, reload } = useResource<{ batches: Batch[] }>(
    "admin/batches",
    "admin",
  );
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [checks, setChecks] = useState<Checks>(EMPTY_CHECKS);
  const [releasedQuantity, setReleasedQuantity] = useState("");
  const [remarks, setRemarks] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const awaiting = (data?.batches ?? []).filter((b) => b.status === "awaiting_qc");
  const reviewed = (data?.batches ?? []).filter((b) =>
    ["qc_approved", "qc_held", "qc_rejected"].includes(b.status),
  );

  function startReview(b: Batch) {
    setReviewingId(b.id);
    setChecks(EMPTY_CHECKS);
    setReleasedQuantity(String(b.filled_quantity - (b.rejected_quantity ?? 0) - (b.held_quantity ?? 0)));
    setRemarks("");
    setFormError("");
  }

  async function decide(batchId: string, decision: "approved" | "held" | "rejected") {
    setBusy(true);
    setFormError("");
    try {
      await api("admin/batches/qc", {
        method: "POST",
        kind: "admin",
        body: {
          batch_id: batchId,
          decision,
          released_quantity: decision === "approved" ? Number(releasedQuantity) : 0,
          ...checks,
          remarks: remarks || null,
        },
      });
      setReviewingId(null);
      reload();
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageTitle
        title="Quality Control"
        eyebrow="Production"
        sub="Review manufactured batches before they can be received into finished-goods stock."
      >
        <button className={secondary} onClick={reload}>
          Refresh
        </button>
      </PageTitle>

      <Card className="mb-6">
        <p className="eyebrow text-crimson/70">Awaiting review</p>
        <h2 className="headline mt-3 text-3xl text-ink">Batches ready for QC</h2>
        <Message error>{error}</Message>
        {loading ? (
          <p role="status" className="mt-5 text-sm text-ink/60">
            Loading batches…
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {awaiting.map((b) => {
              const eligible = b.filled_quantity - (b.rejected_quantity ?? 0) - (b.held_quantity ?? 0);
              return (
                <div key={b.id} className="rounded-2xl border border-ink/8 bg-white/55 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{b.batch_number}</p>
                      <p className="text-sm text-ink/60">{b.product_name}</p>
                    </div>
                    <span className="text-sm text-ink/60">
                      Eligible: {eligible} of {b.filled_quantity} filled
                    </span>
                    {reviewingId !== b.id && (
                      <button className={button} onClick={() => startReview(b)}>
                        Review
                      </button>
                    )}
                  </div>
                  {reviewingId === b.id && (
                    <div className="mt-5 space-y-4 rounded-2xl border border-ink/8 bg-cream/40 p-4">
                      <Message error>{formError}</Message>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {CHECKS.map(([key, label]) => (
                          <label key={key} className="flex items-center gap-3 text-sm font-semibold text-ink/70">
                            <input
                              type="checkbox"
                              checked={checks[key]}
                              onChange={(e) =>
                                setChecks((c) => ({ ...c, [key]: e.target.checked }))
                              }
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                      <Field
                        label="Released quantity (on approval)"
                        type="number"
                        min="0"
                        max={eligible}
                        value={releasedQuantity}
                        onChange={(e) => setReleasedQuantity(e.target.value)}
                      />
                      <TextArea
                        label="Remarks (required to hold or reject)"
                        rows={3}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          className={button}
                          disabled={busy}
                          onClick={() => decide(b.id, "approved")}
                        >
                          {busy ? "Saving…" : "Approve"}
                        </button>
                        <button
                          type="button"
                          className={secondary}
                          disabled={busy}
                          onClick={() => decide(b.id, "held")}
                        >
                          Hold
                        </button>
                        <button
                          type="button"
                          className={secondary}
                          disabled={busy}
                          onClick={() => decide(b.id, "rejected")}
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          className={secondary}
                          onClick={() => setReviewingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {!loading && !awaiting.length && (
              <p className="py-8 text-center text-sm text-ink/55">
                No batches are awaiting QC review.
              </p>
            )}
          </div>
        )}
      </Card>

      <Card>
        <p className="eyebrow text-crimson/70">History</p>
        <h2 className="headline mt-3 text-3xl text-ink">Reviewed batches</h2>
        <div className="mt-6 space-y-3">
          {reviewed.map((b) => (
            <div
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/8 bg-white/55 p-4"
            >
              <div>
                <p className="font-semibold text-ink">{b.batch_number}</p>
                <p className="text-sm text-ink/60">{b.product_name}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  b.status === "qc_approved"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {b.status.replaceAll("_", " ")}
              </span>
            </div>
          ))}
          {!reviewed.length && (
            <p className="py-8 text-center text-sm text-ink/55">No reviewed batches yet.</p>
          )}
        </div>
      </Card>
    </>
  );
}
