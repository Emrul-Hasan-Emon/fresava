"use client";
import { useState } from "react";
import { api } from "@/lib/api/client";
import { useResource } from "@/features/use-resource";
import type { CustomerAddress } from "@shared/contracts";
import { Card, Field, Message, button, secondary } from "@/features/ui";

type FormState = {
  label: string;
  recipient_name: string;
  phone: string;
  address: string;
  city: string;
  is_default: boolean;
};

const EMPTY: FormState = {
  label: "Home",
  recipient_name: "",
  phone: "",
  address: "",
  city: "",
  is_default: false,
};

export function CustomerAddresses() {
  const { data, error, loading, reload } = useResource<{
    addresses: CustomerAddress[];
  }>("customers/addresses", "customer");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  function startAdd() {
    setForm(EMPTY);
    setFormError("");
    setEditingId(null);
    setAdding(true);
  }
  function startEdit(a: CustomerAddress) {
    setForm({
      label: a.label,
      recipient_name: a.recipient_name,
      phone: a.phone,
      address: a.address,
      city: a.city,
      is_default: a.is_default,
    });
    setFormError("");
    setEditingId(a.id);
    setAdding(true);
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setFormError("");
    try {
      if (editingId) {
        await api(`customers/addresses/${editingId}`, {
          method: "PATCH",
          kind: "customer",
          body: form,
        });
      } else {
        await api("customers/addresses", {
          method: "POST",
          kind: "customer",
          body: form,
        });
      }
      setAdding(false);
      setEditingId(null);
      reload();
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      await api(`customers/addresses/${id}/delete`, { method: "POST", kind: "customer" });
      reload();
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-crimson/70">Saved addresses</p>
          <h2 className="headline mt-3 text-4xl text-ink">Your delivery addresses</h2>
        </div>
        <button className={secondary} onClick={startAdd}>
          Add address
        </button>
      </div>
      <Message error>{error}</Message>

      {adding && (
        <form onSubmit={save} className="mt-6 space-y-5 rounded-3xl bg-cream/60 p-5">
          <Message error>{formError}</Message>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Label"
              value={form.label}
              required
              maxLength={40}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            />
            <Field
              label="Recipient name"
              value={form.recipient_name}
              required
              maxLength={120}
              onChange={(e) => setForm((f) => ({ ...f, recipient_name: e.target.value }))}
            />
            <Field
              label="Phone"
              value={form.phone}
              required
              maxLength={25}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
            <Field
              label="City"
              value={form.city}
              required
              maxLength={100}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
          </div>
          <Field
            label="Street address"
            value={form.address}
            required
            maxLength={400}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
          <label className="flex items-center gap-3 text-sm font-semibold text-ink/70">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
            />
            Set as default address
          </label>
          <div className="flex flex-wrap gap-3">
            <button className={button} disabled={busy}>
              {busy ? "Saving…" : "Save address"}
            </button>
            <button
              type="button"
              className={secondary}
              onClick={() => {
                setAdding(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!loading && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {data?.addresses.map((a) => (
            <div key={a.id} className="rounded-3xl border border-ink/8 bg-white/55 p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-ink">{a.label}</p>
                {a.is_default && (
                  <span className="rounded-full bg-crimson/8 px-3 py-1 text-xs font-semibold text-crimson">
                    Default
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-ink/70">{a.recipient_name}</p>
              <p className="text-sm text-ink/55">{a.phone}</p>
              <p className="mt-1 text-sm text-ink/55">
                {a.address}, {a.city}
              </p>
              <div className="mt-4 flex gap-3">
                <button className={secondary} onClick={() => startEdit(a)}>
                  Edit
                </button>
                <button className={secondary} disabled={busy} onClick={() => remove(a.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!data?.addresses.length && (
            <p className="text-sm text-ink/55">No saved addresses yet.</p>
          )}
        </div>
      )}
    </Card>
  );
}
