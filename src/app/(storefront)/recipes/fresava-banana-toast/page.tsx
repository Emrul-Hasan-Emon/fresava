import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MorningRushToastClient } from "@/components/recipes/morning-rush-toast";

export const metadata: Metadata = {
  title: "FRESAVA Banana Toast — Fresava",
  description:
    "A quick breakfast for busy mornings: warm toast layered with fresh banana and FRESAVA Dragon Fruit Spread.",
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <MorningRushToastClient />
      <SiteFooter />
    </>
  );
}
