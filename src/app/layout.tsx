import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { OrderNow } from "@/components/order-now";
import { CartDrawer } from "@/components/cart-drawer";
import { CartProvider } from "@/lib/cart-context";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Fresava — Dragon Fruit Spread",
  description:
    "Fresava Dragon Fruit Spread — one jar, one fruit, nothing hidden. 100% organic dragon fruit, no refined sugar, no preservatives. Made Halal. Made Clean. Made Fresava.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-ink font-sans">
        <CartProvider>
          {children}
          <OrderNow />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
