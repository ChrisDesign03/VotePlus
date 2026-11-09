import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { COMPANY } from "@/lib/legal";

export const metadata: Metadata = { title: "Mentions légales", description: "Mentions légales de VotePlus." };

export default function Page() {
  return (
    <LegalPage title="Mentions légales" updated="novembre 2026">
      <h2>Éditeur du site</h2>
      <p>{COMPANY.name}<br />{COMPANY.legalForm}<br />{COMPANY.address}<br />E-mail : {COMPANY.email}<br />Téléphone : {COMPANY.phone}</p>
      <h2>Hébergement</h2>
      <p>Site hébergé par Vercel Inc. Données stockées chez Supabase.</p>
      <h2>Propriété intellectuelle</h2>
      <p>La marque, le design et le code de la plateforme appartiennent à son éditeur. Les photos et textes des candidats sont fournis par les organisateurs, qui garantissent disposer des droits nécessaires.</p>
    </LegalPage>
  );
}
