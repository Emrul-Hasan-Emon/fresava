import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RecipesClient } from "@/components/recipes-client";

export const metadata: Metadata = {
  title: "Recipes — Fresava",
  description:
    "Everyday ways to enjoy FRESAVA Dragon Fruit Spread, from quick breakfasts to shared table bites.",
};

export default function Recipes() {
  return (
    <>
      <SiteHeader />
      <main>
        <RecipesClient />
      </main>
      <SiteFooter />
    </>
  );
}
