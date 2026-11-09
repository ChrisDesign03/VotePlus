import { PublicFooter, PublicHeader } from "./public-header";
import { Container } from "./ui";

// Mise en page commune des textes juridiques et de l'aide.
export function LegalPage({ title, updated, children, draft = true }: { title: string; updated?: string; children: React.ReactNode; draft?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col bg-papier">
      <PublicHeader />
      <main id="contenu" className="flex-1">
        <Container className="max-w-3xl py-10 sm:py-14">
          <h1 className="text-balance font-display text-4xl font-semibold tracking-tight text-nuit sm:text-5xl">{title}</h1>
          {updated ? <p className="mt-2 text-sm text-encre-2">Dernière mise à jour : {updated}</p> : null}
          {draft ? (
            <p className="mt-5 rounded-lg border border-or/50 bg-or/10 p-3 text-sm text-encre-2">
              Texte-type fourni avec la plateforme : il doit être relu et adapté par un juriste congolais avant l&apos;ouverture au public.
            </p>
          ) : null}
          <div className="mt-8 space-y-4 leading-relaxed text-encre-2 [&_a]:font-semibold [&_a]:text-prune [&_a:hover]:underline [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-nuit [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-nuit">
            {children}
          </div>
        </Container>
      </main>
      <PublicFooter />
    </div>
  );
}
