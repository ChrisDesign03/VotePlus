"use client";

import { useEffect } from "react";
import { Brand } from "@/components/brand";
import { Container, buttonClass } from "@/components/ui";

// Page affichée si une erreur imprévue survient (au lieu d'un écran blanc).
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="contenu" className="flex min-h-screen flex-col">
      <header className="py-5">
        <Container>
          <Brand />
        </Container>
      </header>
      <div className="flex flex-1 items-center">
        <Container className="py-16">
          <h1 className="max-w-xl text-balance font-display text-3xl font-semibold tracking-tight text-nuit sm:text-5xl">
            Un problème est survenu.
          </h1>
          <p className="mt-4 max-w-md text-lg text-encre-2">
            Ce n&apos;est pas de votre faute. Vérifiez votre connexion internet, puis réessayez.
          </p>
          {error.digest ? <p className="mt-3 text-sm text-encre-2">Référence : {error.digest}</p> : null}
          <div className="mt-8">
            <button type="button" onClick={reset} className={buttonClass({ variant: "primary", size: "lg" })}>
              Réessayer
            </button>
          </div>
        </Container>
      </div>
    </main>
  );
}
