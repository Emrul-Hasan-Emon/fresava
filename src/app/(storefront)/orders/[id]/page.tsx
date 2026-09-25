import { OrderDetailPage } from "@/features/orders/detail";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PortalBackdrop } from "@/features/ui";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <SiteHeader />
      <PortalBackdrop>
        <OrderDetailPage id={id} kind="customer" />
      </PortalBackdrop>
      <SiteFooter />
    </>
  );
}
