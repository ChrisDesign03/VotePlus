import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth-shell";
import { SignInForm } from "@/components/sign-in-form";

export const metadata: Metadata = { title: "Connexion organisateur" };

export default function ConnexionPage({ searchParams }: PageProps<"/connexion">) {
  return (
    <AuthShell
      title="Content de vous revoir"
      subtitle="Connectez-vous pour gérer vos concours."
      panelTitle="Vos concours vous attendent."
      panelText="Retrouvez vos candidates, vos packs de votes et le classement en direct."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-semibold text-prune underline underline-offset-4">
            Créez-en un gratuitement
          </Link>
        </>
      }
    >
      {/* La lecture de l'adresse (?erreur=...) se fait derrière un Suspense, comme l'exige Next.js 16 */}
      <Suspense fallback={<SignInForm />}>
        <FormWithLinkError searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function FormWithLinkError({
  searchParams,
}: {
  searchParams: PageProps<"/connexion">["searchParams"];
}) {
  const { erreur } = await searchParams;
  const initialError =
    erreur === "lien"
      ? "Ce lien de confirmation n'est plus valable. Connectez-vous, ou recréez un compte."
      : undefined;
  return <SignInForm initialError={initialError} />;
}
