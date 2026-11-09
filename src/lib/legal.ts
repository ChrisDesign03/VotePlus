// Version des conditions acceptées. Changez cette valeur quand vous modifiez les textes
// juridiques : elle est enregistrée avec chaque consentement (preuve de ce qui a été accepté).
export const TERMS_VERSION = "2026-11";

export const LEGAL_LINKS = {
  cgu: "/conditions",
  privacy: "/confidentialite",
  rules: "/reglement",
  refund: "/remboursement",
} as const;

// À COMPLÉTER avec vos vraies informations avant l'ouverture au public (voir le guide de déploiement).
export const COMPANY = {
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || "VotePlus",
  legalForm: process.env.NEXT_PUBLIC_COMPANY_FORM || "[forme juridique et numéro d'enregistrement à compléter]",
  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "Kinshasa, République démocratique du Congo",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@votreplus.example",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "[numéro WhatsApp / téléphone à compléter]",
  feePct: 10,
};

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
