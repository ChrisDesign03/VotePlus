import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth-shell";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { getOptionalUser } from "@/lib/voter";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default function Page() {
  return (
    <AuthShell
      title="Choisissez un nouveau mot de passe"
      subtitle="Au moins 8 caractères."
      panelTitle="Plus qu'une étape."
      panelText="Votre nouveau mot de passe remplace l'ancien immédiatement."
      footer={<Link href="/connexion" className="font-semibold text-prune underline underline-offset-4">Retour à la connexion</Link>}
    >
      <Suspense fallback={null}>
        <Gate />
      </Suspense>
    </AuthShell>
  );
}

async function Gate() {
  const user = await getOptionalUser();
  if (!user) {
    return (
      <p className="rounded-lg bg-prune-50 p-4 text-encre-2">
        Ce lien a expiré ou a déjà été utilisé. <Link href="/mot-de-passe-oublie" className="font-semibold text-prune underline">Demandez-en un nouveau</Link>.
      </p>
    );
  }
  return <ResetPasswordForm />;
}
