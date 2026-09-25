import { portalGuard } from "@server/adapters/next/guard";
import { PortalShell } from "@/features/portal/shell";
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const p = await portalGuard("admin");
  return (
    <PortalShell kind="admin" name={p.fullName}>
      {children}
    </PortalShell>
  );
}
