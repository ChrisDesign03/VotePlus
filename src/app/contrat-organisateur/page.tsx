import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { COMPANY } from "@/lib/legal";

export const metadata: Metadata = { title: "Contrat organisateur", description: "Contrat entre VotePlus et les organisateurs de concours." };

export default function Page() {
  return (
    <LegalPage title="Contrat organisateur" updated="novembre 2026">
      <p>Ce contrat s&apos;applique à toute personne ou organisation qui crée un concours sur {COMPANY.name}.</p>
      <h2>1. Commission</h2>
      <p>{COMPANY.name} retient <strong>{COMPANY.feePct} %</strong> des recettes brutes de <strong>votes payants confirmés</strong>. Les votes gratuits ne génèrent ni recette ni commission. Les frais éventuels de l&apos;opérateur Mobile Money ou de l&apos;agrégateur sont indiqués avant votre premier concours payant.</p>
      <h2>2. Reversement</h2>
      <p>Le net (recettes confirmées moins commission) est reversé sur le moyen indiqué dans « Mon profil », selon le calendrier convenu. Chaque reversement est enregistré et visible dans votre tableau de bord.</p>
      <h2>3. Vos engagements</h2>
      <ul>
        <li>Fournir des informations exactes et disposer des droits sur les photos, textes et noms des candidats.</li>
        <li>Publier un règlement clair et organiser le concours (jury, prix, remise) sous votre seule responsabilité.</li>
        <li>Ne pas manipuler les résultats : après publication, vos modifications sont tracées.</li>
        <li>Respecter la loi congolaise, notamment sur les jeux, loteries et paiements.</li>
      </ul>
      <h2>4. Suspension</h2>
      <p>{COMPANY.name} peut suspendre un concours en cas de fraude, de contenu illicite ou de plainte sérieuse, et retenir les reversements le temps de la vérification.</p>
    </LegalPage>
  );
}
