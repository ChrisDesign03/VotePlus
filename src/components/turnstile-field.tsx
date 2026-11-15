"use client";

import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;

// Charge le script Cloudflare une seule fois pour toute la page
function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        scriptPromise = null;
        reject(new Error("turnstile"));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

// Case « Je ne suis pas un robot » (Cloudflare Turnstile). Invisible si aucune clé n'est configurée.
// `resetKey` : changez-la après chaque envoi du formulaire, car un jeton ne sert qu'une fois.
export function TurnstileField({ resetKey }: { resetKey?: unknown }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [token, setToken] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !box.current || !window.turnstile) return;
        widget.current = window.turnstile.render(box.current, {
          sitekey: siteKey,
          language: "fr",
          callback: (t: string) => setToken(t),
          "expired-callback": () => setToken(""),
          "error-callback": () => setToken(""),
        });
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
      widget.current = null;
    };
  }, [siteKey]);

  // Après un envoi (réussi ou non), on redemande un jeton neuf
  useEffect(() => {
    if (resetKey === undefined || !widget.current || !window.turnstile) return;
    window.turnstile.reset(widget.current);
    const t = window.setTimeout(() => setToken(""), 0);
    return () => window.clearTimeout(t);
  }, [resetKey]);

  if (!siteKey) return null;
  return (
    <div>
      <div ref={box} className="min-h-[65px]" />
      <input type="hidden" name="cf-turnstile-response" value={token} readOnly />
      {failed ? (
        <p role="alert" className="text-sm text-erreur">
          La vérification anti-robots n&apos;a pas pu se charger. Vérifiez votre connexion et rechargez la page.
        </p>
      ) : null}
    </div>
  );
}
