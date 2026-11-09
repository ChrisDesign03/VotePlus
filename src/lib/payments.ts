// Règles de paiement partagées (serveur et navigateur).

export const OPERATORS = [
  { id: "mpesa", label: "M-Pesa", note: "Vodacom" },
  { id: "airtel", label: "Airtel Money", note: "Airtel" },
  { id: "orange", label: "Orange Money", note: "Orange" },
] as const;
export type OperatorId = (typeof OPERATORS)[number]["id"];

export const operatorLabel = (id: string) => OPERATORS.find((o) => o.id === id)?.label ?? id;
export const isOperator = (v: string): v is OperatorId => OPERATORS.some((o) => o.id === v);

// Accepte 081 234 5678, 0812345678, +243 81 234 5678, 00243…, 812345678 → 243812345678
export function normalizePhone(raw: string): string | null {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("00243")) d = d.slice(2);
  if (d.startsWith("243") && d.length === 12) return d;
  if (d.startsWith("0") && d.length === 10) return "243" + d.slice(1);
  if (d.length === 9) return "243" + d;
  return null;
}

// 243812345678 → +243 81 ••• •678
export function maskPhone(p: string | null) {
  if (!p || p.length < 12) return "votre téléphone";
  return `+243 ${p.slice(3, 5)} ••• •${p.slice(-3)}`;
}

/**
 * Mode de paiement.
 * - "simulation" : faux paiement pour tester (jamais d'argent réel). Par défaut en développement.
 * - "off"        : paiements fermés. Par défaut en production tant que rien n'est configuré :
 *                  une erreur de configuration ne peut donc jamais offrir des votes gratuits.
 * - "live"       : agrégateur réel (étape suivante).
 */
export type PaymentMode = "simulation" | "live" | "off";
export function getPaymentMode(): PaymentMode {
  const v = process.env.PAYMENT_MODE;
  if (v === "simulation" || v === "live" || v === "off") return v;
  return process.env.NODE_ENV === "production" ? "off" : "simulation";
}

export const PENDING_LIFETIME_MS = 15 * 60 * 1000; // au-delà : « expiré »

export const isStalePending = (createdAt: string) => Date.now() - new Date(createdAt).getTime() > PENDING_LIFETIME_MS;

// 243812345678 → +243 81 234 5678 (affichage complet, réservé à l'administration)
export function formatPhone(p: string | null | undefined) {
  if (!p || !/^243\d{9}$/.test(p)) return p ?? "";
  return `+243 ${p.slice(3, 5)} ${p.slice(5, 8)} ${p.slice(8)}`;
}

export const PAYOUT_METHODS = [
  { id: "mpesa", label: "M-Pesa" },
  { id: "airtel", label: "Airtel Money" },
  { id: "orange", label: "Orange Money" },
  { id: "bank", label: "Compte bancaire" },
  { id: "cash", label: "Espèces" },
] as const;
export const payoutMethodLabel = (id: string | null | undefined) => PAYOUT_METHODS.find((m) => m.id === id)?.label ?? "Non renseigné";
