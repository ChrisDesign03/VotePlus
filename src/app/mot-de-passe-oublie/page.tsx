import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function Page() {
  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Indiquez votre adresse e-mail : nous vous envoyons un lien pour en choisir un nouveau."
      panelTitle="Pas de panique."
      panelText="Un lien sécurisé vous permet de retrouver l'accès à vos concours en quelques secondes."
      footer={<Link href="/connexion" className="font-semibold text-prune underline underline-offset-4">Retour à la connexion</Link>}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
