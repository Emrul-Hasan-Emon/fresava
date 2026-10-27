import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DragonFruitPancakesClient } from "@/components/recipes/dragon-fruit-pancakes";

export const metadata: Metadata = {
  title: "Dragon Fruit Pancakes — Fresava",
  description:
    "Warm pancakes layered with fresh banana and finished with FRESAVA Dragon Fruit Spread and granola.",
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <DragonFruitPancakesClient />
      <SiteFooter />
    </>
  );
}
