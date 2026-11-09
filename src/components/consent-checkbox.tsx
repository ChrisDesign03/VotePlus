import Link from "next/link";
import { LEGAL_LINKS } from "@/lib/legal";

// Case « J'accepte » obligatoire. Le serveur enregistre la version acceptée.
export function ConsentCheckbox({ paid = false, organizer = false }: { paid?: boolean; organizer?: boolean }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm text-encre-2">
      <input type="checkbox" name="accept_terms" value="yes" required className="mt-0.5 h-5 w-5 shrink-0 accent-prune" />
      <span>
        J&apos;accepte les{" "}
        <Link href={LEGAL_LINKS.cgu} target="_blank" className="font-semibold text-prune hover:underline">
          conditions d&apos;utilisation
        </Link>
        , la{" "}
        <Link href={LEGAL_LINKS.privacy} target="_blank" className="font-semibold text-prune hover:underline">
          politique de confidentialité
        </Link>
        {organizer ? (
          <>
            {" "}et le{" "}
            <Link href="/contrat-organisateur" target="_blank" className="font-semibold text-prune hover:underline">
              contrat organisateur
            </Link>
          </>
        ) : null}
        {paid ? (
          <>
            {" "}et la{" "}
            <Link href={LEGAL_LINKS.refund} target="_blank" className="font-semibold text-prune hover:underline">
              politique de remboursement
            </Link>{" "}
            (les votes achetés ne sont pas remboursables)
          </>
        ) : null}
        .
      </span>
    </label>
  );
}
