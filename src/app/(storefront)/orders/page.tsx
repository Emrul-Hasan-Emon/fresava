import { CustomerOrders } from "@/features/customers/orders";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PortalBackdrop } from "@/features/ui";

export default function Page() {
  return (
    <>
      <SiteHeader />
      <PortalBackdrop>
        <CustomerOrders />
      </PortalBackdrop>
      <SiteFooter />
    </>
  );
}
