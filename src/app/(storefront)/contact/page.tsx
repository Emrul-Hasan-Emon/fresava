import type { Metadata } from "next";
import { ContactClient } from "@/components/contact-client";

export const metadata: Metadata = {
  title: "Contact & Pre-order — Fresava",
  description:
    "Let's get a jar into your kitchen. Pre-order, stock Fresava, or get in touch — seasonal batches are limited.",
};

export default function ContactPage() {
  return <ContactClient />;
}
