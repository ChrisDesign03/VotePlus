import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { COMPANY } from "@/lib/legal";

export const metadata: Metadata = { title: "Aide et contact", description: "Questions fréquentes sur le vote et l'organisation de concours." };

const FAQ: { q: string; a: React.ReactNode }[] = [
  { q: "Comment voter gratuitement ?", a: "Ouvrez la fiche d'une candidate, cliquez sur « Me connecter pour voter » (Google ou lien par e-mail), cochez l'acceptation des conditions puis validez. Aucun mot de passe." },
  { q: "Pourquoi dois-je me connecter pour voter ?", a: "C'est ce qui garantit un seul vote par personne et protège le résultat contre les robots et les faux comptes." },
  { q: "Puis-je voter plusieurs fois ?", a: "Cela dépend du concours : une seule fois, ou une fois par jour. La page de la candidate l'indique." },
  { q: "Je n'ai pas reçu mon lien de connexion.", a: "Patientez une minute, regardez dans les courriers indésirables, ou utilisez la connexion Google. Vous pouvez demander un nouveau lien." },
  { q: "Mon paiement Mobile Money est débité mais mes votes n'apparaissent pas.", a: <>Gardez la référence affichée sur la page de confirmation et écrivez-nous (voir ci-dessous). Consultez aussi la <Link href="/remboursement">politique de remboursement</Link>.</> },
  { q: "Je suis organisateur : comment ça marche ?", a: <>Créez un compte, ajoutez candidates et (si payant) packs de votes, publiez, puis partagez le lien. Voir le <Link href="/contrat-organisateur">contrat organisateur</Link>.</> },
  { q: "Un vote gratuit suspect peut-il être annulé ?", a: "Oui : l'organisateur peut annuler les votes venant en rafale d'une même connexion. L'opération est tracée et réversible." },
];

export default function Page() {
  return (
    <LegalPage title="Aide et contact" draft={false}>
      <div className="space-y-3">
        {FAQ.map((f) => (
          <details key={f.q} className="rounded-xl border border-trait bg-white p-4">
            <summary className="cursor-pointer font-semibold text-nuit">{f.q}</summary>
            <p className="mt-2">{f.a}</p>
          </details>
        ))}
      </div>
      <h2>Nous contacter</h2>
      <p>E-mail : <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a><br />Téléphone / WhatsApp : {COMPANY.phone}</p>
    </LegalPage>
  );
}
