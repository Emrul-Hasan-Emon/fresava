import type { Metadata } from "next";
import { SpreadClient } from "@/components/spread-client";

export const metadata: Metadata = {
  title: "The Signature Jar — Fresava",
  description:
    "Fresava Dragon Fruit Spread. Premium organic fruit, pure black cumin honey sweetness, and a clean label you can read in one breath.",
};

export default function SpreadPage() {
  return <SpreadClient />;
}
