"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// Affiche une date à l'heure de l'appareil de la personne (Kinshasa, Lubumbashi, Paris…).
// Côté serveur, on n'affiche rien : le navigateur complète juste après le chargement.
export function LocalDate({ iso, fallback = "Non définie" }: { iso: string | null; fallback?: string }) {
  const text = useSyncExternalStore(
    subscribe,
    () =>
      iso
        ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" }).format(new Date(iso))
        : fallback,
    () => (iso ? "" : fallback),
  );
  return <span>{text || " "}</span>;
}
