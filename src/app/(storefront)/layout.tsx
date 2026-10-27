import { CartProvider } from "@/lib/cart-context";
import { MarketProvider } from "@/lib/market-context";
import { CartDrawer } from "@/components/cart-drawer";
import { OrderNow } from "@/components/order-now";
export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarketProvider>
      <CartProvider>
        {children}
        <CartDrawer />
        <OrderNow />
      </CartProvider>
    </MarketProvider>
  );
}
