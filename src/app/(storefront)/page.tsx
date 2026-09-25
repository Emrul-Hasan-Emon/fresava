import type { Metadata } from "next";
import { HomeClient } from "@/components/home-client";

export const metadata: Metadata = {
  title: "Fresava — Dragon Fruit Spread",
  description:
    "Fresava Dragon Fruit Spread — one jar, one fruit, nothing hidden. 100% organic dragon fruit, no refined sugar, no preservatives. Made Halal. Made Clean. Made Fresava.",
};

export default function Home() {
  return <HomeClient />;
}
