import { Container } from "./container";

export function SiteFooter() {
  return (
    <footer className="border-t border-maroon/10 py-10">
      <Container className="flex flex-col items-center justify-between gap-4 text-sm text-ink/50 sm:flex-row">
        <p className="font-display text-lg tracking-[0.3em] text-ink">
          FRESAVA
        </p>
        <p>&copy; {new Date().getFullYear()} Fresava. Made in Bangladesh.</p>
      </Container>
    </footer>
  );
}
