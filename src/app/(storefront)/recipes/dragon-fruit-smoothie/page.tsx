import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DragonFruitSmoothieClient } from "@/components/recipes/dragon-fruit-smoothie";

export const metadata: Metadata = {
  title: "Dragon Fruit Smoothie — Fresava",
  description:
    "A quick, creamy blend of banana, chilled milk and FRESAVA Dragon Fruit Spread made in minutes.",
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <DragonFruitSmoothieClient />
      <SiteFooter />
    </>
  );
}
