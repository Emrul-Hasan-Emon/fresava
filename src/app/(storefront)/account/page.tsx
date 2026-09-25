import { CustomerAccount } from "@/features/customers/account";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PortalBackdrop } from "@/features/ui";

export default function Page() {
  return (
    <>
      <SiteHeader />
      <PortalBackdrop>
        <CustomerAccount />
      </PortalBackdrop>
      <SiteFooter />
    </>
  );
}
