import { Card, PageTitle } from "@/features/ui";

export function ComingSoon({
  title,
  eyebrow,
  sub,
}: {
  title: string;
  eyebrow: string;
  sub: string;
}) {
  return (
    <>
      <PageTitle title={title} eyebrow={eyebrow} sub={sub} />
      <Card className="text-center">
        <h2 className="headline text-3xl text-ink">
          This workspace will be connected to its operational features in the
          next stage.
        </h2>
      </Card>
    </>
  );
}
