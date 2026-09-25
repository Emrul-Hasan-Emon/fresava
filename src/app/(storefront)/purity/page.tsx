import type { Metadata } from "next";
import { PurityClient } from "@/components/purity-client";

export const metadata: Metadata = {
  title: "The Purity Standard — Fresava",
  description:
    "Fresava is defined by subtraction. Every ingredient must earn its place in the jar — most never do.",
};

export default function PurityPage() {
  return <PurityClient />;
}
