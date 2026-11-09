import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { Brand } from "./brand";
import { Container, buttonClass } from "./ui";

// Cadre commun des pages de l'espace organisateur : en-tête + contenu.
export function AppShell({
  name,
  isAdmin = false,
  children,
  back,
}: {
  name: string;
  isAdmin?: boolean;
  children: React.ReactNode;
  back?: { href: string; label: string };
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "O";
  return (
    <div className="min-h-screen">
      <header className="border-b border-trait bg-white">
        <Container className="flex flex-wrap items-center justify-between gap-x-4 py-2 sm:h-20 sm:flex-nowrap sm:py-0">
          <Brand />
          {/* Sur téléphone, les liens passent sur une ligne à part : rien ne déborde */}
          <nav aria-label="Mon espace" className="order-last -ml-3 flex basis-full items-center sm:order-none sm:ml-0 sm:basis-auto">
            <Link href="/tableau-de-bord/profil" className={buttonClass({ variant: "ghost" })}>
              Mon profil
            </Link>
            {isAdmin ? (
              <Link href="/admin" className={buttonClass({ variant: "ghost" })}>
                Administration
              </Link>
            ) : null}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2.5 sm:flex">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-prune font-display text-lg font-semibold text-white"
              >
                {initial}
              </span>
              <span className="max-w-40 truncate text-sm font-semibold text-nuit">{name}</span>
            </span>
            <form action={signOutAction}>
              <button type="submit" className={buttonClass({ variant: "outline" })}>
                Se déconnecter
              </button>
            </form>
          </div>
        </Container>
      </header>

      <main id="contenu" className="py-8 sm:py-12">
        <Container>
          {back ? (
            <Link
              href={back.href}
              className="mb-6 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-prune hover:underline"
            >
              <span aria-hidden="true">←</span> {back.label}
            </Link>
          ) : null}
          {children}
        </Container>
      </main>
    </div>
  );
}
