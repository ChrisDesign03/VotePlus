import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { COMPANY } from "@/lib/legal";

export const metadata: Metadata = { title: "Conditions d'utilisation", description: "Conditions d'utilisation de la plateforme de vote VotePlus." };

export default function Page() {
  return (
    <LegalPage title="Conditions d'utilisation" updated="novembre 2026">
      <p>Ces conditions encadrent l&apos;utilisation de {COMPANY.name} par les votants et par les organisateurs de concours. En cochant « J&apos;accepte » ou en utilisant la plateforme, vous les acceptez.</p>
      <h2>1. Le service</h2>
      <p>{COMPANY.name} est une plateforme qui permet à des organisateurs de publier des concours (Miss, talents, élections de popularité) et au public d&apos;y voter, gratuitement ou par achat de votes via Mobile Money, selon le choix de l&apos;organisateur. {COMPANY.name} fournit l&apos;outil ; <strong>l&apos;organisateur reste responsable de son concours</strong> (règlement, candidats, remise des prix, autorisations nécessaires).</p>
      <h2>2. Compte et vote gratuit</h2>
      <ul>
        <li>Le vote gratuit exige un compte vérifié (Google ou lien envoyé par e-mail). Une personne = un compte.</li>
        <li>Selon le concours, vous votez une seule fois, ou une fois par jour. La plateforme refuse automatiquement tout second vote.</li>
        <li>Il est interdit de créer plusieurs comptes, d&apos;utiliser des programmes automatiques ou de tenter de contourner les limites.</li>
        <li>Les votes jugés frauduleux peuvent être annulés par l&apos;organisateur ou par {COMPANY.name}.</li>
      </ul>
      <h2>3. Votes payants</h2>
      <ul>
        <li>Le prix et le nombre de votes de chaque pack sont affichés avant le paiement. Le prix est calculé par nos serveurs.</li>
        <li>Les votes sont ajoutés uniquement après confirmation du paiement par l&apos;opérateur Mobile Money.</li>
        <li>Les votes achetés ne sont pas remboursables, sauf cas prévus à la page <Link href="/remboursement">Remboursement</Link>.</li>
      </ul>
      <h2>4. Obligations de l&apos;organisateur</h2>
      <p>L&apos;organisateur accepte le <Link href="/contrat-organisateur">contrat organisateur</Link> : commission de {COMPANY.feePct} % sur les recettes de votes payants, exactitude des informations fournies, droit d&apos;utiliser les photos et informations des candidats, respect de la loi.</p>
      <h2>5. Contenus et comportements interdits</h2>
      <p>Contenus illégaux, injurieux, discriminatoires, trompeurs ou portant atteinte aux droits d&apos;autrui ; fraude, manipulation des résultats, usurpation d&apos;identité. {COMPANY.name} peut suspendre un concours ou un compte en cas de manquement.</p>
      <h2>6. Responsabilité</h2>
      <p>{COMPANY.name} s&apos;efforce d&apos;assurer la disponibilité du service mais ne peut garantir l&apos;absence d&apos;interruption (réseau, opérateurs, force majeure). {COMPANY.name} n&apos;est pas responsable de l&apos;organisation, du déroulement ou des résultats d&apos;un concours, qui relèvent de l&apos;organisateur.</p>
      <h2>7. Modification et contact</h2>
      <p>Ces conditions peuvent évoluer ; la version acceptée est conservée avec chaque consentement. Contact : {COMPANY.email}.</p>
    </LegalPage>
  );
}
