import { z } from "zod";
export const accountTypes = ["admin", "staff", "customer"] as const;
export type AccountType = (typeof accountTypes)[number];
export const authAccountTypes = ["staff_member", "customer"] as const;
export type AuthAccountType = (typeof authAccountTypes)[number];
export const staffRoles = ["admin", "staff"] as const;
export type StaffRole = (typeof staffRoles)[number];
export const statuses = [
  "order_confirmed",
  "ready_for_packing",
  "packing",
  "quality_check",
  "ready_for_dispatch",
  "handed_to_delivery",
  "out_for_delivery",
  "delivered",
] as const;
export type OrderStatus = (typeof statuses)[number] | "cancelled";
export const statusLabel = (s: string) =>
  s.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
export const money = (paisa: number) =>
  `৳${(paisa / 100).toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
export const extraCurrencies = [
  "USD",
  "GBP",
  "AED",
  "SAR",
  "CAD",
  "AUD",
  "SGD",
  "QAR",
] as const;
export type ExtraCurrency = (typeof extraCurrencies)[number];
export const formatMoney = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    cents / 100,
  );
const text = (max: number) => z.string().trim().min(1).max(max);
export const credentialsSchema = z
  .object({ email: z.email().max(254), password: z.string().min(8).max(128) })
  .strict();
export const signupSchema = credentialsSchema.extend({ full_name: text(120) });
export const quoteSchema = z
  .object({
    lines: z
      .array(
        z
          .object({ sku: text(40), quantity: z.number().int().min(1).max(99) })
          .strict(),
      )
      .min(1)
      .max(20),
    zone: z.enum(["dhaka", "outside"]),
    promo: z.string().trim().max(40).default(""),
  })
  .strict()
  .refine(
    (x) => new Set(x.lines.map((l) => l.sku)).size === x.lines.length,
    "Duplicate products are not allowed",
  );
export const checkoutSchema = z
  .object({
    quote: quoteSchema,
    customer: z
      .object({
        name: text(120),
        phone: z.string().regex(/^\+?[0-9 -]{8,20}$/),
        email: z.union([z.email().max(254), z.literal("")]),
        address: text(400),
        city: text(100),
        notes: z.string().trim().max(1000).default(""),
      })
      .strict(),
    idempotency_key: z.uuid(),
  })
  .strict();
export const accountSchema = z
  .object({
    full_name: text(120),
    phone: z.string().trim().max(25),
    address: z.string().trim().max(400),
    city: z.string().trim().max(100),
  })
  .strict();
export const addressSchema = z
  .object({
    label: text(40),
    recipient_name: text(120),
    phone: z.string().trim().min(1).max(25),
    address: text(400),
    city: text(100),
    is_default: z.boolean().default(false),
  })
  .strict();
export interface CustomerAddress {
  id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address: string;
  city: string;
  is_default: boolean;
  created_at: string;
}
export const feedbackSchema = z
  .object({ rating: z.number().int().min(1).max(5), feedback: text(500) })
  .strict();
export const advanceSchema = z
  .object({
    order_id: z.uuid(),
    expected_version: z.number().int().min(0),
    request_id: z.uuid(),
  })
  .strict();
export const cancelSchema = z
  .object({
    expected_version: z.number().int().min(0),
    reason: text(500),
  })
  .strict();
const compareAtValid = (v: { compare_at: number | null; price: number }) =>
  v.compare_at === null || v.compare_at >= v.price;
const compareAtMessage = "Compare-at price must be at least the selling price";
export const productCategories = [
  "Fruit Spreads",
  "Jams",
  "Marmalades",
  "Preserves",
  "Bundles & Gift Boxes",
] as const;
export type ProductCategory = (typeof productCategories)[number];
const productFields = z
  .object({
    sku: text(40),
    name: text(120),
    blurb: z.string().trim().max(300).default(""),
    jars: z.number().int().min(1).max(50),
    jar_weight_g: z.number().int().min(1).max(100000),
    price: z.number().int().min(0).max(100000000),
    compare_at: z.number().int().min(0).max(100000000).nullable().default(null),
    badge: z.string().trim().max(60).nullable().default(null),
    image_path: z.string().trim().min(1).max(2000),
    active: z.boolean().default(false),
    category: z.enum(productCategories).nullable().default(null),
    description: z.string().trim().max(4000).nullable().default(null),
    ingredients: z.array(text(200)).max(40).nullable().default(null),
    claims: z.array(text(200)).max(40).nullable().default(null),
    stock_quantity: z.number().int().min(0).max(100000000).default(0),
  })
  .strict();
export const productSchema = productFields.refine(compareAtValid, compareAtMessage);
export const productUpdateSchema = productFields
  .omit({ sku: true })
  .refine(compareAtValid, compareAtMessage);
const productPriceFields = z.object({
  currency: z.enum(extraCurrencies),
  price: z.number().int().min(0).max(100000000),
  compare_at: z.number().int().min(0).max(100000000).nullable().default(null),
});
export const productPricesSchema = z
  .object({
    prices: z
      .array(
        productPriceFields
          .strict()
          .refine(
            (v) => v.compare_at === null || v.compare_at >= v.price,
            "Compare-at price must be at least the selling price",
          ),
      )
      .max(extraCurrencies.length)
      .refine(
        (prices) =>
          new Set(prices.map((p) => p.currency)).size === prices.length,
        "Duplicate currency",
      ),
  })
  .strict();
export const createBatchSchema = z
  .object({
    product_id: z.uuid(),
    planned_quantity: z.number().int().min(1).max(1000000),
    notes: z.string().trim().max(500).default(""),
  })
  .strict();
export type QuoteInput = z.infer<typeof quoteSchema>;
export interface ProductPrice {
  currency: ExtraCurrency;
  price: number;
  compare_at: number | null;
}
export interface Product {
  id: string;
  sku: string;
  name: string;
  blurb: string;
  jars: number;
  jar_weight_g: number;
  price: number;
  compare_at: number | null;
  prices: ProductPrice[];
  badge: string | null;
  image_path: string;
}
export interface AdminProduct extends Product {
  active: boolean;
  category: ProductCategory | null;
  description: string | null;
  ingredients: string[] | null;
  claims: string[] | null;
  barcode_value: string | null;
  stock_quantity: number;
}
export type BatchStatus =
  | "planned"
  | "in_production"
  | "awaiting_qc"
  | "qc_approved"
  | "qc_held"
  | "qc_rejected"
  | "completed"
  | "cancelled";
export interface Batch {
  id: string;
  batch_number: string;
  barcode_value: string | null;
  product_id: string;
  product_name: string;
  planned_quantity: number;
  filled_quantity: number;
  rejected_quantity: number | null;
  held_quantity: number | null;
  manufacturing_date: string | null;
  expiry_date: string | null;
  status: BatchStatus;
  created_at: string;
}
export const confirmManufacturingSchema = z
  .object({
    batch_id: z.uuid(),
    filled_quantity: z.number().int().min(0).max(1000000),
    rejected_quantity: z.number().int().min(0).max(1000000),
    held_quantity: z.number().int().min(0).max(1000000),
    manufacturing_date: z.iso.date(),
    expiry_date: z.iso.date(),
    notes: z.string().trim().max(500).nullable().default(null),
  })
  .strict();
export const qcDecisions = ["approved", "held", "rejected"] as const;
export const approveQcSchema = z
  .object({
    batch_id: z.uuid(),
    decision: z.enum(qcDecisions),
    released_quantity: z.number().int().min(0).max(1000000),
    packaging_passed: z.boolean(),
    seal_passed: z.boolean(),
    labeling_passed: z.boolean(),
    lab_testing_passed: z.boolean(),
    documentation_passed: z.boolean(),
    remarks: z.string().trim().max(500).nullable().default(null),
  })
  .strict();
export const receiveStockSchema = z
  .object({
    batch_barcode: text(80),
    received_quantity: z.number().int().min(1).max(1000000),
    warehouse_location: text(120),
    idempotency_key: z.uuid(),
    notes: z.string().trim().max(500).nullable().default(null),
  })
  .strict();
export interface QcCheck {
  id: string;
  batch_id: string;
  packaging_passed: boolean;
  seal_passed: boolean;
  labeling_passed: boolean;
  lab_testing_passed: boolean;
  documentation_passed: boolean;
  decision: (typeof qcDecisions)[number];
  released_quantity: number;
  remarks: string | null;
  reviewed_at: string;
}
export interface InventoryLot {
  id: string;
  batch_id: string;
  batch_number: string;
  product_id: string;
  product_name: string;
  warehouse_location: string;
  received_quantity: number;
  available_quantity: number;
  reserved_quantity: number;
  updated_at: string;
}
export interface Quote {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  eta: string;
  currency: string;
  lines: {
    sku: string;
    name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    jars: number;
    jar_weight_g: number;
  }[];
}
export interface SessionView {
  id: string;
  account_type: AuthAccountType;
  role?: StaffRole;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  avatar_url?: string | null;
}
export interface Order {
  id: string;
  order_number: string;
  tracking_code: string;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  notes: string | null;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  version: number;
  payment_status: string;
  payment_method: string;
  created_at: string;
  eta: string;
  zone: string;
}
export interface OrderItem {
  id: string;
  sku: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  jars: number;
  jar_weight_g: number;
}
export interface History {
  id: string;
  to_status: OrderStatus;
  created_at: string;
}
export interface Feedback {
  id: string;
  order_id: string;
  rating: number;
  feedback: string;
  created_at: string;
}
export interface OrderDetail {
  order: Order;
  items: OrderItem[];
  history: History[];
  feedback: Feedback | null;
}
export interface Customer {
  key: string;
  name: string;
  phone: string;
  email: string | null;
  city: string;
  address: string;
  orders: number;
  spent: number;
  last_order_at: string;
}
export interface Dashboard {
  order_count: number;
  placed_value: number;
  collected_revenue: number;
  pending: number;
  delivered: number;
  customers: number;
  months: { month: string; value: number }[];
  top_products: { name: string; quantity: number; sales: number }[];
}
