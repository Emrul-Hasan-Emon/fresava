import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DragonFruitCrostiniClient } from "@/components/recipes/dragon-fruit-crostini";

export const metadata: Metadata = {
  title: "Cream Cheese & Dragon Fruit Crostini — Fresava",
  description:
    "Crisp crostini, creamy cheese and FRESAVA Dragon Fruit Spread in a colourful sharing plate.",
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <DragonFruitCrostiniClient />
      <SiteFooter />
    </>
  );
}
