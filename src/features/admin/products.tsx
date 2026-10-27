"use client";
import { useState } from "react";
import { useResource } from "@/features/use-resource";
import { api } from "@/lib/api/client";
import {
  type AdminProduct,
  productCategories,
  extraCurrencies,
  money,
  formatMoney,
} from "@shared/contracts";
import {
  Card,
  Message,
  PageTitle,
  Field,
  TextArea,
  SelectField,
  button,
  secondary,
} from "@/features/ui";

type FormState = {
  sku: string;
  name: string;
  blurb: string;
  jars: string;
  jar_weight_g: string;
  price: string;
  compare_at: string;
  badge: string;
  image_path: string;
  active: boolean;
  category: string;
  description: string;
  ingredients: string;
  claims: string;
};

const EMPTY_FORM: FormState = {
  sku: "",
  name: "",
  blurb: "",
  jars: "1",
  jar_weight_g: "340",
  price: "",
  compare_at: "",
  badge: "",
  image_path: "",
  active: false,
  category: "",
  description: "",
  ingredients: "",
  claims: "",
};

function toForm(p: AdminProduct): FormState {
  return {
    sku: p.sku,
    name: p.name,
    blurb: p.blurb,
    jars: String(p.jars),
    jar_weight_g: String(p.jar_weight_g),
    price: String(p.price),
    compare_at: p.compare_at === null ? "" : String(p.compare_at),
    badge: p.badge ?? "",
    image_path: p.image_path,
    active: p.active,
    category: p.category ?? "",
    description: p.description ?? "",
    ingredients: (p.ingredients ?? []).join("\n"),
    claims: (p.claims ?? []).join("\n"),
  };
}

function toLines(value: string): string[] | null {
  const lines = value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.length ? lines : null;
}

type PriceRow = { price: string; compare_at: string };
const EMPTY_PRICE_ROWS: Record<string, PriceRow> = Object.fromEntries(
  extraCurrencies.map((c) => [c, { price: "", compare_at: "" }]),
);

export function AdminProducts() {
  const { data, error, loading, reload } = useResource<{
    products: AdminProduct[];
  }>("admin/products", "admin");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [priceRows, setPriceRows] = useState(EMPTY_PRICE_ROWS);
  const [formError, setFormError] = useState("");
  const [pricesError, setPricesError] = useState("");
  const [pricesSaved, setPricesSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [savingPrices, setSavingPrices] = useState(false);
  const [uploading, setUploading] = useState(false);

  function startAdd() {
    setForm(EMPTY_FORM);
    setPriceRows(EMPTY_PRICE_ROWS);
    setFormError("");
    setEditingId(null);
    setAdding(true);
  }
  function startEdit(p: AdminProduct) {
    setForm(toForm(p));
    setPriceRows({
      ...EMPTY_PRICE_ROWS,
      ...Object.fromEntries(
        p.prices.map((pr) => [
          pr.currency,
          {
            price: String(pr.price),
            compare_at: pr.compare_at === null ? "" : String(pr.compare_at),
          },
        ]),
      ),
    });
    setFormError("");
    setPricesError("");
    setPricesSaved(false);
    setEditingId(p.id);
    setAdding(true);
  }
  function cancelForm() {
    setAdding(false);
    setEditingId(null);
  }

  async function savePrices() {
    if (!editingId) return;
    setSavingPrices(true);
    setPricesError("");
    setPricesSaved(false);
    const prices = extraCurrencies
      .filter((c) => priceRows[c].price)
      .map((c) => ({
        currency: c,
        price: Math.round(Number(priceRows[c].price) * 100),
        compare_at: priceRows[c].compare_at
          ? Math.round(Number(priceRows[c].compare_at) * 100)
          : null,
      }));
    try {
      await api(`admin/products/${editingId}/prices`, {
        method: "POST",
        kind: "admin",
        body: { prices },
      });
      setPricesSaved(true);
      reload();
    } catch (e) {
      setPricesError((e as Error).message);
    } finally {
      setSavingPrices(false);
    }
  }

  async function uploadImage(file: File) {
    setUploading(true);
    setFormError("");
    try {
      const body = new FormData();
      body.set("file", file);
      const result = await api<{ image_path: string }>("admin/products/image", {
        method: "POST",
        kind: "admin",
        body,
      });
      setForm((f) => ({ ...f, image_path: result.image_path }));
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setFormError("");
    const payload = {
      name: form.name,
      blurb: form.blurb,
      jars: Number(form.jars),
      jar_weight_g: Number(form.jar_weight_g),
      price: Math.round(Number(form.price) * 100),
      compare_at: form.compare_at ? Math.round(Number(form.compare_at) * 100) : null,
      badge: form.badge || null,
      image_path: form.image_path,
      active: form.active,
      category: form.category || null,
      description: form.description || null,
      ingredients: toLines(form.ingredients),
      claims: toLines(form.claims),
    };
    try {
      if (editingId) {
        await api(`admin/products/${editingId}`, {
          method: "PATCH",
          kind: "admin",
          body: payload,
        });
      } else {
        if (!form.image_path) throw new Error("Upload a product image first.");
        await api("admin/products", {
          method: "POST",
          kind: "admin",
          body: { ...payload, sku: form.sku },
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

  return (
    <>
      <PageTitle
        title="Products"
        eyebrow="Catalog"
        sub="Manage the products customers can order. New products start inactive until you publish them."
      >
        <button className={secondary} onClick={reload}>
          Refresh
        </button>
        <button className={button} onClick={startAdd}>
          Add product
        </button>
      </PageTitle>
      <Message error>{error}</Message>

      {adding && (
        <Card className="mb-6">
          <p className="eyebrow text-crimson/70">
            {editingId ? "Edit product" : "New product"}
          </p>
          <h2 className="headline mt-3 text-3xl text-ink">
            {editingId ? form.name : "Add a product"}
          </h2>
          <form onSubmit={save} className="mt-6 space-y-5">
            <Message error>{formError}</Message>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="SKU"
                value={form.sku}
                disabled={!!editingId}
                required
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              />
              <Field
                label="Name"
                value={form.name}
                required
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <Field
                label="Price (BDT)"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                required
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
              <Field
                label="Compare-at price (BDT, optional)"
                type="number"
                min="0"
                step="0.01"
                value={form.compare_at}
                onChange={(e) => setForm((f) => ({ ...f, compare_at: e.target.value }))}
              />
              <Field
                label="Jars"
                type="number"
                min="1"
                value={form.jars}
                required
                onChange={(e) => setForm((f) => ({ ...f, jars: e.target.value }))}
              />
              <Field
                label="Weight per jar (g)"
                type="number"
                min="1"
                value={form.jar_weight_g}
                required
                onChange={(e) => setForm((f) => ({ ...f, jar_weight_g: e.target.value }))}
              />
              <Field
                label="Badge (optional)"
                value={form.badge}
                onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
              />
              <SelectField
                label="Category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                <option value="">Select category</option>
                {productCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </SelectField>
              <label className="flex items-center gap-3 self-end pb-3 text-sm font-semibold text-ink/70">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                />
                Published (visible to customers)
              </label>
            </div>
            <TextArea
              label="Short description"
              value={form.blurb}
              maxLength={300}
              rows={2}
              onChange={(e) => setForm((f) => ({ ...f, blurb: e.target.value }))}
            />
            <TextArea
              label="Full description"
              value={form.description}
              maxLength={4000}
              rows={4}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <TextArea
              label="Ingredients (one per line)"
              value={form.ingredients}
              rows={4}
              onChange={(e) => setForm((f) => ({ ...f, ingredients: e.target.value }))}
            />
            <TextArea
              label="Product claims (one per line)"
              value={form.claims}
              rows={4}
              onChange={(e) => setForm((f) => ({ ...f, claims: e.target.value }))}
            />
            <label className="block text-[0.78rem] font-semibold tracking-wide text-ink/70">
              Product image
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading}
                className="mt-2 block w-full text-xs text-ink/70 file:mr-3 file:rounded-full file:border-0 file:bg-crimson/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-crimson"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file);
                }}
              />
            </label>
            {form.image_path && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.image_path}
                alt="Product preview"
                className="h-32 w-32 rounded-2xl object-cover"
              />
            )}
            <div className="flex flex-wrap gap-3">
              <button className={button} disabled={busy || uploading}>
                {busy ? "Saving…" : "Save product"}
              </button>
              <button type="button" className={secondary} onClick={cancelForm}>
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {adding && editingId && (
        <Card className="mb-6">
          <p className="eyebrow text-crimson/70">Display pricing</p>
          <h2 className="headline mt-3 text-3xl text-ink">
            Currency pricing for reference
          </h2>
          <p className="mt-2 text-sm text-ink/55">
            Shown to customers browsing in that currency. Checkout still runs
            in BDT only. Leave a currency blank to hide it.
          </p>
          <Message error>{pricesError}</Message>
          <Message>{pricesSaved ? "Pricing saved." : ""}</Message>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {extraCurrencies.map((c) => (
              <div key={c} className="rounded-2xl border border-ink/8 p-4">
                <p className="text-sm font-semibold text-ink">{c}</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Field
                    label="Price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={priceRows[c].price}
                    onChange={(e) =>
                      setPriceRows((rows) => ({
                        ...rows,
                        [c]: { ...rows[c], price: e.target.value },
                      }))
                    }
                  />
                  <Field
                    label="Compare-at"
                    type="number"
                    min="0"
                    step="0.01"
                    value={priceRows[c].compare_at}
                    onChange={(e) =>
                      setPriceRows((rows) => ({
                        ...rows,
                        [c]: { ...rows[c], compare_at: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            className={`${button} mt-6`}
            disabled={savingPrices}
            onClick={savePrices}
          >
            {savingPrices ? "Saving…" : "Save pricing"}
          </button>
        </Card>
      )}

      <Card>
        {loading ? (
          <p role="status" className="text-sm text-ink/60">
            Loading products…
          </p>
        ) : (
          <div className="hidden overflow-hidden rounded-3xl border border-ink/8 bg-white/55 lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink/8 text-xs uppercase tracking-[0.16em] text-ink/38">
                  {["Product", "Price", "Status", ""].map((s) => (
                    <th key={s} className="p-4">
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.products.map((p) => (
                  <tr key={p.id} className="border-b border-ink/6 last:border-0 hover:bg-cream/50">
                    <td className="p-4">
                      <span className="font-semibold text-ink">{p.name}</span>
                      <small className="mt-1 block text-ink/48">
                        {p.sku}
                        {p.category ? ` · ${p.category}` : ""}
                      </small>
                    </td>
                    <td className="p-4 font-semibold text-ink">
                      {money(p.price)}
                      {p.prices.length > 0 && (
                        <small className="mt-1 block font-normal text-ink/48">
                          {p.prices
                            .map((pr) => formatMoney(pr.price, pr.currency))
                            .join(" · ")}
                        </small>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          p.active ? "bg-emerald-50 text-emerald-700" : "bg-ink/8 text-ink/55"
                        }`}
                      >
                        {p.active ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="p-4">
                      <button className={secondary} onClick={() => startEdit(p)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !data?.products.length && (
          <p className="py-12 text-center text-sm text-ink/55">No products yet.</p>
        )}
      </Card>
    </>
  );
}
