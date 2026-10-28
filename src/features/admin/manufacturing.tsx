"use client";
import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { useResource } from "@/features/use-resource";
import { api } from "@/lib/api/client";
import type { AdminProduct, Batch } from "@shared/contracts";
import {
  Card,
  Message,
  PageTitle,
  Field,
  SelectField,
  button,
  secondary,
} from "@/features/ui";
import { Scanner } from "@/features/fulfillment/scanner";

function BatchBarcode({ value }: { value: string }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (ref.current)
      JsBarcode(ref.current, value, {
        format: "CODE128",
        width: 1.6,
        height: 40,
        displayValue: true,
        fontSize: 11,
      });
  }, [value]);
  return <svg ref={ref} />;
}

export function AdminManufacturing() {
  const { data: productsData } = useResource<{ products: AdminProduct[] }>(
    "admin/products",
    "admin",
  );
  const { data, error, loading, reload } = useResource<{ batches: Batch[] }>(
    "admin/batches",
    "admin",
  );
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");
  const [scan, setScan] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [lookupResult, setLookupResult] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmForm, setConfirmForm] = useState({
    filled_quantity: "",
    rejected_quantity: "0",
    held_quantity: "0",
    manufacturing_date: "",
    expiry_date: "",
    notes: "",
  });
  const [confirmError, setConfirmError] = useState("");
  const [confirmBusy, setConfirmBusy] = useState(false);

  const activeProducts = (productsData?.products ?? []).filter((p) => p.active);

  function startConfirm(b: Batch) {
    setConfirmingId(b.id);
    setConfirmForm({
      filled_quantity: String(b.planned_quantity),
      rejected_quantity: "0",
      held_quantity: "0",
      manufacturing_date: "",
      expiry_date: "",
      notes: "",
    });
    setConfirmError("");
  }

  async function confirmManufacturing(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!confirmingId) return;
    setConfirmBusy(true);
    setConfirmError("");
    try {
      await api("admin/batches/confirm-manufacturing", {
        method: "POST",
        kind: "admin",
        body: {
          batch_id: confirmingId,
          filled_quantity: Number(confirmForm.filled_quantity),
          rejected_quantity: Number(confirmForm.rejected_quantity),
          held_quantity: Number(confirmForm.held_quantity),
          manufacturing_date: confirmForm.manufacturing_date,
          expiry_date: confirmForm.expiry_date,
          notes: confirmForm.notes || null,
        },
      });
      setConfirmingId(null);
      reload();
    } catch (e) {
      setConfirmError((e as Error).message);
    } finally {
      setConfirmBusy(false);
    }
  }

  async function createBatch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setFormError("");
    setSuccess("");
    try {
      const result = await api<{ batch_number: string }>("admin/batches", {
        method: "POST",
        kind: "admin",
        body: {
          product_id: productId,
          planned_quantity: Number(quantity),
          notes,
        },
      });
      setSuccess(`Batch ${result.batch_number} created successfully.`);
      setProductId("");
      setQuantity("");
      setNotes("");
      reload();
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function lookup(code: string) {
    setLookupError("");
    setLookupResult("");
    try {
      const result = await api<
        | { type: "product"; product: { name: string; sku: string } }
        | { type: "batch"; batch: { batch_number: string; status: string } }
      >("admin/batches/lookup", {
        method: "POST",
        kind: "admin",
        body: { code },
      });
      setLookupResult(
        result.type === "product"
          ? `Product: ${result.product.name} (${result.product.sku})`
          : `Batch ${result.batch.batch_number} — ${result.batch.status}`,
      );
    } catch (e) {
      setLookupError((e as Error).message);
    }
  }

  async function deleteBatch(id: string) {
    setBusy(true);
    try {
      await api(`admin/batches/${id}/delete`, { method: "POST", kind: "admin" });
      setDeletingId(null);
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
        title="Manufacturing"
        eyebrow="Production"
        sub="Create and track manufacturing batches for each product."
      >
        <button className={secondary} onClick={reload}>
          Refresh
        </button>
        <button className={button} onClick={() => setScan(!scan)}>
          {scan ? "Hide scanner" : "Find by barcode"}
        </button>
      </PageTitle>

      {scan && (
        <Card className="mb-6">
          <p className="eyebrow text-crimson/70">Barcode lookup</p>
          <h2 className="headline mt-3 text-3xl text-ink">
            Scan a product or batch barcode
          </h2>
          <div className="mt-5">
            <Scanner
              onScan={lookup}
              formats={["CODE_128", "EAN_13"]}
              label="Barcode"
              placeholder="Scan or type a barcode"
            />
          </div>
          <Message>{lookupResult}</Message>
          <Message error>{lookupError}</Message>
        </Card>
      )}

      <Card className="mb-6">
        <p className="eyebrow text-crimson/70">New batch</p>
        <h2 className="headline mt-3 text-3xl text-ink">
          Create a manufacturing batch
        </h2>
        <form onSubmit={createBatch} className="mt-6 space-y-5">
          <Message error>{formError}</Message>
          <Message>{success}</Message>
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Product"
              value={productId}
              required
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Select product</option>
              {activeProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </SelectField>
            <Field
              label="Planned quantity"
              type="number"
              min="1"
              max="1000000"
              value={quantity}
              required
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <Field
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <button className={button} disabled={busy}>
            {busy ? "Creating…" : "Create batch"}
          </button>
        </form>
      </Card>

      <Card>
        <p className="eyebrow text-crimson/70">Registry</p>
        <h2 className="headline mt-3 text-3xl text-ink">
          Production batch registry
        </h2>
        <Message error>{error}</Message>
        {loading ? (
          <p role="status" className="mt-5 text-sm text-ink/60">
            Loading batches…
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            {data?.batches.map((b) => (
              <details
                key={b.id}
                className="rounded-2xl border border-ink/8 bg-white/55 p-4"
              >
                <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
                  <span className="font-semibold text-ink">{b.batch_number}</span>
                  <span className="text-sm text-ink/60">{b.product_name}</span>
                  <span className="text-sm text-ink/60">
                    {b.filled_quantity} / {b.planned_quantity}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      ["planned", "in_production"].includes(b.status)
                        ? "bg-amber-50 text-amber-700"
                        : b.status === "awaiting_qc"
                          ? "bg-blue-50 text-blue-700"
                          : b.status === "qc_approved" || b.status === "completed"
                            ? "bg-emerald-50 text-emerald-700"
                            : b.status === "qc_held" || b.status === "qc_rejected"
                              ? "bg-red-50 text-red-700"
                              : "bg-ink/8 text-ink/55"
                    }`}
                  >
                    {b.status.replaceAll("_", " ")}
                  </span>
                </summary>
                <div className="mt-4 flex flex-wrap items-center gap-6">
                  {b.barcode_value && <BatchBarcode value={b.barcode_value} />}
                  {["planned", "in_production"].includes(b.status) && (
                    <button className={button} onClick={() => startConfirm(b)}>
                      Confirm manufacturing
                    </button>
                  )}
                  {b.status === "planned" &&
                    (deletingId === b.id ? (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-ink/60">Delete this batch?</span>
                        <button
                          className={secondary}
                          disabled={busy}
                          onClick={() => deleteBatch(b.id)}
                        >
                          Confirm delete
                        </button>
                        <button
                          className={secondary}
                          onClick={() => setDeletingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className={secondary}
                        onClick={() => setDeletingId(b.id)}
                      >
                        Delete
                      </button>
                    ))}
                </div>
                {b.manufacturing_date && (
                  <p className="mt-3 text-xs text-ink/55">
                    Filled {b.filled_quantity} · Rejected {b.rejected_quantity} · Held{" "}
                    {b.held_quantity} · Mfg {b.manufacturing_date} · Exp {b.expiry_date}
                  </p>
                )}
                {confirmingId === b.id && (
                  <form
                    onSubmit={confirmManufacturing}
                    className="mt-5 space-y-4 rounded-2xl border border-ink/8 bg-cream/40 p-4"
                  >
                    <Message error>{confirmError}</Message>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field
                        label="Filled quantity"
                        type="number"
                        min="0"
                        max={b.planned_quantity}
                        required
                        value={confirmForm.filled_quantity}
                        onChange={(e) =>
                          setConfirmForm((f) => ({ ...f, filled_quantity: e.target.value }))
                        }
                      />
                      <Field
                        label="Rejected quantity"
                        type="number"
                        min="0"
                        required
                        value={confirmForm.rejected_quantity}
                        onChange={(e) =>
                          setConfirmForm((f) => ({ ...f, rejected_quantity: e.target.value }))
                        }
                      />
                      <Field
                        label="Held quantity"
                        type="number"
                        min="0"
                        required
                        value={confirmForm.held_quantity}
                        onChange={(e) =>
                          setConfirmForm((f) => ({ ...f, held_quantity: e.target.value }))
                        }
                      />
                      <Field
                        label="Manufacturing date"
                        type="date"
                        required
                        value={confirmForm.manufacturing_date}
                        onChange={(e) =>
                          setConfirmForm((f) => ({ ...f, manufacturing_date: e.target.value }))
                        }
                      />
                      <Field
                        label="Expiry date"
                        type="date"
                        required
                        value={confirmForm.expiry_date}
                        onChange={(e) =>
                          setConfirmForm((f) => ({ ...f, expiry_date: e.target.value }))
                        }
                      />
                    </div>
                    <Field
                      label="Notes (optional)"
                      value={confirmForm.notes}
                      onChange={(e) =>
                        setConfirmForm((f) => ({ ...f, notes: e.target.value }))
                      }
                    />
                    <div className="flex flex-wrap gap-3">
                      <button className={button} disabled={confirmBusy}>
                        {confirmBusy ? "Saving…" : "Confirm manufacturing"}
                      </button>
                      <button
                        type="button"
                        className={secondary}
                        onClick={() => setConfirmingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </details>
            ))}
            {!data?.batches.length && (
              <p className="py-12 text-center text-sm text-ink/55">
                No batches yet.
              </p>
            )}
          </div>
        )}
      </Card>
    </>
  );
}
