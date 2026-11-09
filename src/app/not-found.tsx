import type { Metadata } from "next";
import { Brand } from "@/components/brand";
import { ButtonLink, Container } from "@/components/ui";

export const metadata: Metadata = { title: "Page introuvable" };

export default function NotFound() {
  return (
    <main id="contenu" className="flex min-h-screen flex-col">
      <header className="py-5">
        <Container>
          <Brand />
        </Container>
      </header>
      <div className="flex flex-1 items-center">
        <Container className="py-16">
          <p className="font-display text-7xl font-semibold leading-none text-prune sm:text-9xl">404</p>
          <h1 className="mt-6 max-w-xl text-balance font-display text-3xl font-semibold tracking-tight text-nuit sm:text-5xl">
            Cette page n&apos;existe pas ou a été retirée.
          </h1>
          <p className="mt-4 max-w-md text-lg text-encre-2">
            Le lien est peut-être incomplet, ou le concours n&apos;est plus publié.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/" variant="primary" size="lg">
              Retour à l&apos;accueil
            </ButtonLink>
          </div>
        </Container>
      </div>
    </main>
  );
}
