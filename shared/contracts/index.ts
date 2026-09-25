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
export type OrderStatus = (typeof statuses)[number];
export const statusLabel = (s: string) =>
  s.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
export const money = (paisa: number) =>
  new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(
    paisa / 100,
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
export type QuoteInput = z.infer<typeof quoteSchema>;
export interface Product {
  id: string;
  sku: string;
  name: string;
  blurb: string;
  jars: number;
  jar_weight_g: number;
  price: number;
  compare_at: number | null;
  badge: string | null;
  image_path: string;
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
