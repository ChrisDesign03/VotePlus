import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { SignUpForm } from "@/components/sign-up-form";

export const metadata: Metadata = { title: "Créer un compte organisateur" };

export default function InscriptionPage() {
  return (
    <AuthShell
      title="Créez votre compte"
      subtitle="Gratuit et sans abonnement. Il vous faut moins de deux minutes."
      panelTitle="Lancez votre premier concours."
      panelText="Ajoutez vos candidates, fixez le prix des votes et partagez le lien avec votre public."
      footer={
        <>
          Vous avez déjà un compte ?{" "}
          <Link href="/connexion" className="font-semibold text-prune underline underline-offset-4">
            Connectez-vous
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}
