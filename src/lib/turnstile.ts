import "server-only";

// Vérifie la case anti-robots Cloudflare Turnstile (gratuit).
// Sans clés configurées (développement), la vérification est ignorée.
export function isTurnstileConfigured() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  if (!isTurnstileConfigured()) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(8000),
    });
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch (e) {
    console.error("[VotePlus] Turnstile :", e);
    return false;
  }
}
