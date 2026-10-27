import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { YogurtGranolaBowlClient } from "@/components/recipes/yogurt-granola-bowl";

export const metadata: Metadata = {
  title: "Yogurt & Granola Bowl — Fresava",
  description:
    "A simple bowl of chilled yogurt, crisp granola and FRESAVA Dragon Fruit Spread.",
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <YogurtGranolaBowlClient />
      <SiteFooter />
    </>
  );
}
