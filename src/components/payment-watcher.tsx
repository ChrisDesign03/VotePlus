"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Tant que le paiement est en attente, la page se recharge toute seule toutes les 3 secondes.
export function PaymentWatcher() {
  const router = useRouter();
  useEffect(() => {
    const t = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 3000);
    return () => window.clearInterval(t);
  }, [router]);
  return null;
}
