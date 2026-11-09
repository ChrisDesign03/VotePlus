import type { Metadata } from "next";
import { Suspense } from "react";
import { safeNext } from "@/lib/safe-next";
import { AuthShell } from "@/components/auth-shell";
import { VoterLogin } from "@/components/voter-login";

export const metadata: Metadata = { title: "Se connecter pour voter" };

export default function ConnexionVotantPage({ searchParams }: PageProps<"/connexion-votant">) {
  return (
    <Suspense fallback={null}>
      <Page searchParams={searchParams} />
    </Suspense>
  );
}

async function Page({ searchParams }: { searchParams: PageProps<"/connexion-votant">["searchParams"] }) {
  const sp = await searchParams;
  const next = safeNext(typeof sp.next === "string" ? sp.next : undefined);
  const erreur = sp.erreur;
  const initialError =
    erreur === "conditions"
      ? "Cochez la case pour accepter les conditions."
      : erreur === "google"
        ? "La connexion avec Google n'est pas disponible pour le moment. Utilisez votre e-mail."
        : erreur === "lien"
          ? "Ce lien n'est plus valable. Demandez-en un nouveau."
          : undefined;

  return (
    <AuthShell
      title="Connectez-vous pour voter"
      subtitle="Un compte vérifié garantit un vote par personne. Aucun mot de passe à retenir."
      panelTitle="Un vote, une voix."
      panelText="Pour que le résultat soit juste, chaque personne vote une seule fois. Connectez-vous en quelques secondes."
      footer={<>Vous organisez un concours ? <a href="/connexion" className="font-semibold text-prune underline underline-offset-4">Espace organisateur</a></>}
    >
      <VoterLogin next={next} initialError={initialError} />
    </AuthShell>
  );
}
