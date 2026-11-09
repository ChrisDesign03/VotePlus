import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Règlement type des concours", description: "Règlement type applicable aux concours VotePlus." };

export default function Page() {
  return (
    <LegalPage title="Règlement type des concours" updated="novembre 2026">
      <p>Chaque concours est organisé par un organisateur indépendant qui peut publier son propre règlement sur la page du concours. À défaut, ces règles s&apos;appliquent.</p>
      <h2>Vote</h2>
      <ul>
        <li>Le type de vote (gratuit, payant ou mixte) et la fréquence du vote gratuit sont fixés avant la publication et ne changent plus ensuite.</li>
        <li>Le vote n&apos;est possible qu&apos;entre la date d&apos;ouverture et la date de fin du concours.</li>
        <li>Un vote gratuit est limité à une fois par compte (ou une fois par jour, selon le concours).</li>
      </ul>
      <h2>Équité</h2>
      <ul>
        <li>Après publication, on ne supprime ni candidat ni pack : on les retire du vote. Chaque changement est inscrit au journal du concours.</li>
        <li>Un organisateur ne peut pas voter dans son propre concours.</li>
        <li>Les votes gratuits suspects (rafales depuis une même connexion) peuvent être annulés par l&apos;organisateur ; l&apos;annulation est tracée et réversible.</li>
      </ul>
      <h2>Résultats</h2>
      <p>Le classement peut être visible en direct ou masqué jusqu&apos;à la clôture, au choix de l&apos;organisateur. Les résultats finaux sont ceux affichés à la clôture. Les litiges relatifs aux prix et à la désignation des gagnantes relèvent de l&apos;organisateur.</p>
    </LegalPage>
  );
}
