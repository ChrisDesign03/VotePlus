"use client";

import { useActionState } from "react";
import { verifyVoterCodeAction, voterGoogleAction, voterMagicLinkAction, type VoterAuthState } from "@/app/actions/free-vote";
import { ConsentCheckbox } from "./consent-checkbox";
import { Field, FormAlert, SubmitButton } from "./form-parts";
import { TurnstileField } from "./turnstile-field";
import { buttonClass } from "./ui";

// Connexion du votant : Google en un clic, ou un lien envoyé par e-mail. Pas de mot de passe.
export function VoterLogin({ next, initialError }: { next: string; initialError?: string }) {
  const [state, action] = useActionState<VoterAuthState, FormData>(voterMagicLinkAction, null);
  const [codeState, codeAction] = useActionState<VoterAuthState, FormData>(verifyVoterCodeAction, null);
  const sent = state?.sent || codeState?.sent;
  const email = codeState?.email ?? state?.email ?? "";

  return (
    <div className="space-y-6">
      <FormAlert error={initialError} />

      <form action={voterGoogleAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <ConsentCheckbox />
        <button type="submit" className={buttonClass({ variant: "outline", size: "lg", full: true })}>
          Continuer avec Google
        </button>
      </form>

      <p className="text-center text-sm text-encre-2">ou</p>

      {sent ? (
        <form action={codeAction} className="space-y-5">
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="email" value={email} />
          <FormAlert error={codeState?.error} message={codeState?.error ? undefined : state?.message} />
          <Field label="Code reçu par e-mail" name="code" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" />
          <SubmitButton>Valider le code et me connecter</SubmitButton>
          <p className="text-center text-sm text-encre-2">Pas de code ? Patientez une minute, regardez les spams, puis rechargez la page pour en redemander un.</p>
        </form>
      ) : (
      <form action={action} className="space-y-5">
        <input type="hidden" name="next" value={next} />
        <FormAlert error={state?.error} message={state?.message} />
        <Field label="Votre adresse e-mail" name="email" type="email" autoComplete="email" placeholder="vous@exemple.com" />
        <ConsentCheckbox />
        <TurnstileField resetKey={state} />
        <SubmitButton>Recevoir mon code par e-mail</SubmitButton>
      </form>
      )}
    </div>
  );
}
