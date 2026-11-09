"use client";

import { useState } from "react";
import { buttonClass } from "./ui";

// Partage : WhatsApp (très utilisé), puis le partage natif du téléphone, ou la copie du lien.
export function ShareButtons({ title, text, url }: { title: string; text: string; url?: string }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = () => (url ? new URL(url, window.location.origin).href : window.location.href.split("#")[0]);

  function whatsapp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${shareUrl()}`)}`, "_blank", "noopener,noreferrer");
  }

  async function share() {
    const link = shareUrl();
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url: link });
        return;
      }
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Partage annulé par la personne : rien à faire
    }
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      <button type="button" onClick={whatsapp} className={buttonClass({ variant: "outline" })}>
        Partager sur WhatsApp
      </button>
      <button type="button" onClick={share} className={buttonClass({ variant: "outline" })}>
        {copied ? "Lien copié" : "Partager"}
      </button>
      <span role="status" className="sr-only">
        {copied ? "Lien copié dans le presse-papiers" : ""}
      </span>
    </div>
  );
}
