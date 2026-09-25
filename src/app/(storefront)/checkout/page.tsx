import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout-client";

export const metadata: Metadata = {
  title: "Checkout — Fresava",
  description: "Bag, details, payment — securely check out your Fresava order.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
