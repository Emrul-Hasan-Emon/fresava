"use client";
import { useState } from "react";
import { api } from "@/lib/api/client";
import { Card, Message, PageTitle, Field, button } from "@/features/ui";
import { Scanner } from "@/features/fulfillment/scanner";

export function AdminReceiving() {
  const [barcode, setBarcode] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [scan, setScan] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function receive(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const result = await api<{ receipt_number: string; remaining_receivable: number }>(
        "admin/batches/receive-stock",
        {
          method: "POST",
          kind: "admin",
          body: {
            batch_barcode: barcode.trim(),
            received_quantity: Number(quantity),
            warehouse_location: location,
            idempotency_key: crypto.randomUUID(),
            notes: notes || null,
          },
        },
      );
      setSuccess(
        `Receipt ${result.receipt_number} recorded. ${result.remaining_receivable} unit(s) remain receivable for this batch.`,
      );
      setBarcode("");
      setQuantity("");
      setNotes("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageTitle
        title="Stock Receiving"
        eyebrow="Products"
        sub="Record QC-approved manufacturing batches as received into finished-goods stock."
      >
        <button className={button} onClick={() => setScan(!scan)}>
          {scan ? "Hide scanner" : "Scan batch barcode"}
        </button>
      </PageTitle>

      {scan && (
        <Card className="mb-6">
          <p className="eyebrow text-crimson/70">Barcode scan</p>
          <h2 className="headline mt-3 text-3xl text-ink">Scan the batch barcode</h2>
          <div className="mt-5">
            <Scanner
              onScan={(code) => {
                setBarcode(code);
                setScan(false);
              }}
              formats={["CODE_128", "EAN_13"]}
              label="Batch barcode"
              placeholder="Scan or type a batch barcode"
            />
          </div>
        </Card>
      )}

      <Card>
        <p className="eyebrow text-crimson/70">Receive stock</p>
        <h2 className="headline mt-3 text-3xl text-ink">Record a warehouse receipt</h2>
        <p className="mt-2 text-sm text-ink/55">
          The batch must be QC-approved. Receiving is capped at the quantity QC released and
          rejects duplicate submissions automatically.
        </p>
        <form onSubmit={receive} className="mt-6 space-y-5">
          <Message error>{error}</Message>
          <Message>{success}</Message>
          <Field
            label="Batch barcode"
            value={barcode}
            required
            onChange={(e) => setBarcode(e.target.value)}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Received quantity"
              type="number"
              min="1"
              value={quantity}
              required
              onChange={(e) => setQuantity(e.target.value)}
            />
            <Field
              label="Warehouse location"
              value={location}
              required
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <Field
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <button className={button} disabled={busy}>
            {busy ? "Recording…" : "Record receipt"}
          </button>
        </form>
      </Card>
    </>
  );
}
