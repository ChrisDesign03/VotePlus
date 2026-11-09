"use client";

import Script from "next/script";

// Case « Je ne suis pas un robot » (Cloudflare Turnstile). Invisible si aucune clé n'est configurée.
export function TurnstileField() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
      <div className="cf-turnstile" data-sitekey={siteKey} data-language="fr" data-theme="light" />
    </>
  );
}
