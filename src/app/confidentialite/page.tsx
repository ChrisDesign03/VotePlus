import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { COMPANY } from "@/lib/legal";

export const metadata: Metadata = { title: "Politique de confidentialité", description: "Politique de confidentialité de VotePlus." };

export default function Page() {
  return (
    <LegalPage title="Politique de confidentialité" updated="novembre 2026">
      <p>Cette page explique quelles données nous collectons et pourquoi. Responsable du traitement : {COMPANY.name}, {COMPANY.address}.</p>
      <h2>Données collectées</h2>
      <ul>
        <li><strong>Compte :</strong> nom, adresse e-mail (et identifiant Google si vous choisissez cette connexion). Aucun mot de passe n&apos;est demandé aux votants.</li>
        <li><strong>Vote gratuit :</strong> votre identifiant de compte, le candidat choisi, la date. Nous conservons aussi une <strong>empreinte illisible</strong> de votre connexion (jamais l&apos;adresse elle-même) pour détecter les fraudes.</li>
        <li><strong>Vote payant :</strong> numéro Mobile Money, opérateur, montant, référence de transaction, acceptation des conditions.</li>
        <li><strong>Organisateurs :</strong> coordonnées et moyen de reversement des recettes.</li>
      </ul>
      <h2>Pourquoi</h2>
      <p>Pour compter les votes, garantir un vote par personne, traiter les paiements et reversements, prévenir la fraude, répondre à vos demandes et respecter nos obligations légales.</p>
      <h2>Partage</h2>
      <p>Nous ne vendons pas vos données. Elles peuvent être traitées par nos prestataires techniques (hébergement, base de données, envoi d&apos;e-mails, anti-robots Cloudflare, agrégateur de paiement Mobile Money). L&apos;organisateur voit les statistiques de son concours mais pas votre identité de votant.</p>
      <h2>Conservation et droits</h2>
      <p>Les données de vote sont conservées pendant la durée du concours et la période nécessaire aux contrôles et obligations comptables. Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos données en écrivant à {COMPANY.email}.</p>
      <h2>Cookies</h2>
      <p>Nous utilisons uniquement des cookies nécessaires à votre connexion. Aucun cookie publicitaire.</p>
    </LegalPage>
  );
}
