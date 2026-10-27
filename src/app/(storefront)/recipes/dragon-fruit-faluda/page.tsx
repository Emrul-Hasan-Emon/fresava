import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DragonFruitFaludaClient } from "@/components/recipes/dragon-fruit-faluda";

export const metadata: Metadata = {
  title: "Dragon Fruit Faluda — Fresava",
  description:
    "A cold and creamy afternoon favourite layered with sabja, faluda sev and FRESAVA Dragon Fruit Spread.",
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <DragonFruitFaludaClient />
      <SiteFooter />
    </>
  );
}
