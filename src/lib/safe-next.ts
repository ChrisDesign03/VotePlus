// Chemin de retour : uniquement une page de ce site (jamais une adresse extérieure)
export function safeNext(raw: string | null | undefined) {
  return raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("\\") ? raw : "/";
}
