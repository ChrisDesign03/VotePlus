import Link from "next/link";

// Le nom de la plateforme est défini ici, à un seul endroit.
export const SITE_NAME = "VotePlus";

/**
 * Logo : le « + » est une petite étoile dorée, clin d'œil au podium.
 * `tone="light"` pour les fonds sombres, `tone="dark"` pour les fonds clairs.
 */
export function Brand({ tone = "dark" }: { tone?: "light" | "dark" }) {
  const text = tone === "light" ? "text-white" : "text-nuit";
  return (
    <Link
      href="/"
      aria-label={`${SITE_NAME}, retour à l'accueil`}
      className={`inline-flex items-center gap-2 font-display text-[1.65rem] font-semibold leading-none tracking-tight ${text}`}
    >
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="9" fill={tone === "light" ? "#f0b93a" : "#4a1470"} />
        <path
          d="M16 6.5l2.6 6.1 6.4.6-4.9 4.2 1.5 6.3L16 20.6l-5.6 3.1 1.5-6.3L7 13.2l6.4-.6L16 6.5z"
          fill={tone === "light" ? "#1e0a2e" : "#f0b93a"}
        />
      </svg>
      <span>
        Vote<span className={tone === "light" ? "text-or" : "text-prune"}>Plus</span>
      </span>
    </Link>
  );
}
