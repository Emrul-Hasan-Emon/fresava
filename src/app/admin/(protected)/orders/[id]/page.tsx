import { OrderDetailPage } from "@/features/orders/detail";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailPage id={id} kind="admin" />;
}
