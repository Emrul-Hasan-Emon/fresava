import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { SignatureJar } from "@/components/signature-jar";
import { Ingredients } from "@/components/ingredients";
import { Purity } from "@/components/purity";
import { Serving } from "@/components/serving";
import { Origin } from "@/components/origin";
import { Circle } from "@/components/circle";
import { FAQ } from "@/components/faq";
import { Story } from "@/components/story";
import { Contact } from "@/components/contact";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <SignatureJar />
        <Ingredients />
        <Purity />
        <Serving />
        <Origin />
        <Circle />
        <FAQ />
        <Story />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
