import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { COMPANY } from "@/lib/legal";

export const metadata: Metadata = { title: "Politique de remboursement", description: "Politique de remboursement des votes payants." };

export default function Page() {
  return (
    <LegalPage title="Politique de remboursement" updated="novembre 2026">
      <p>Un vote payant est un service numérique fourni immédiatement après confirmation du paiement : <strong>il n&apos;est en principe ni annulable ni remboursable</strong>.</p>
      <h2>Cas de remboursement</h2>
      <ul>
        <li><strong>Double débit ou erreur technique</strong> prouvée (deux paiements pour une seule demande, par exemple) : le surplus est remboursé.</li>
        <li><strong>Paiement débité mais vote non compté</strong> : les votes sont ajoutés, ou le montant remboursé si ce n&apos;est pas possible.</li>
        <li><strong>Concours annulé par l&apos;organisateur ou par {COMPANY.name}</strong> avant sa fin : les paiements des votes concernés peuvent être remboursés selon les règles du concours.</li>
      </ul>
      <h2>Comment demander</h2>
      <p>Écrivez à {COMPANY.email} avec : le numéro Mobile Money utilisé, la date, le montant et la référence de transaction indiquée sur la page de confirmation. Délai de traitement indicatif : 7 jours ouvrés.</p>
    </LegalPage>
  );
}
