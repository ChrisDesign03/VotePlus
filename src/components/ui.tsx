import Link from "next/link";

/* ---------------------------------------------------------------------
   Composants de base réutilisés dans tout le site
   --------------------------------------------------------------------- */

type ButtonVariant = "primary" | "gold" | "outline" | "ghost" | "ghost-light";
type ButtonSize = "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 " +
  "disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-prune text-white hover:bg-prune-fonce",
  gold: "bg-or text-nuit hover:bg-or-clair",
  outline: "border border-trait bg-white text-encre hover:border-prune hover:text-prune",
  ghost: "text-encre-2 hover:text-prune",
  "ghost-light": "text-lavande hover:text-white",
};

const SIZES: Record<ButtonSize, string> = {
  md: "min-h-11 px-4 py-2.5 text-sm",
  lg: "min-h-12 px-6 py-3 text-base",
};

export function buttonClass({
  variant = "primary",
  size = "md",
  full = false,
}: { variant?: ButtonVariant; size?: ButtonSize; full?: boolean } = {}) {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${full ? "w-full" : ""}`;
}

export function ButtonLink({
  href,
  children,
  variant,
  size,
  full,
}: {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
}) {
  const isAnchor = href.startsWith("#");
  const className = buttonClass({ variant, size, full });
  return isAnchor ? (
    <a href={href} className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/** Conteneur centré, avec marges adaptées au mobile */
export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

/** Pastille de statut d'un concours */
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    draft: { label: "Brouillon", className: "bg-prune-50 text-prune" },
    open: { label: "Ouvert au vote", className: "bg-succes-50 text-succes" },
    closed: { label: "Clôturé", className: "bg-or/20 text-or-texte" },
  };
  const s = map[status] ?? map.draft;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${s.className}`}>
      {s.label}
    </span>
  );
}
