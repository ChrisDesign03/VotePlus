import Link from "next/link";
import { Brand } from "./brand";
import { Container, buttonClass } from "./ui";

// En-tête des pages publiques (concours, candidates)
export function PublicHeader() {
  return (
    <header className="bg-nuit">
      <Container className="flex h-16 items-center justify-between sm:h-20">
        <Brand tone="light" />
        <nav aria-label="Menu principal" className="flex items-center gap-1">
          <Link href="/inscription" className="hidden rounded-lg px-4 py-2.5 text-sm font-medium text-lavande transition-colors hover:text-white sm:block">
            Organiser un concours
          </Link>
          <Link href="/connexion" className={buttonClass({ variant: "ghost-light" })}>
            Connexion
          </Link>
        </nav>
      </Container>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="mt-auto bg-nuit py-10">
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Brand tone="light" />
          <p className="mt-3 max-w-xs text-sm text-lavande">Un vote par personne en mode gratuit ; chaque vote payant est lié à un paiement confirmé.</p>
        </div>
        <nav aria-label="Informations légales" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/aide" className="text-lavande hover:text-white">Aide</Link>
          <Link href="/conditions" className="text-lavande hover:text-white">Conditions</Link>
          <Link href="/confidentialite" className="text-lavande hover:text-white">Confidentialité</Link>
          <Link href="/remboursement" className="text-lavande hover:text-white">Remboursement</Link>
          <Link href="/mentions-legales" className="text-lavande hover:text-white">Mentions légales</Link>
        </nav>
      </Container>
    </footer>
  );
}
