import { ShippingLabel } from "@/features/admin/label";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ShippingLabel id={id} />;
}
