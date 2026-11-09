"use client";

import { useActionState } from "react";
import { signUpAction, type FormState } from "@/app/actions/auth";
import { ConsentCheckbox } from "./consent-checkbox";
import { TurnstileField } from "./turnstile-field";
import { Field, FormAlert, PasswordField, SubmitButton } from "./form-parts";

export function SignUpForm() {
  const [state, action] = useActionState<FormState, FormData>(signUpAction, null);

  return (
    <form action={action} className="space-y-5">
      <FormAlert error={state?.error} message={state?.message} />
      <Field
        label="Nom complet ou de l'organisation"
        name="full_name"
        autoComplete="name"
        placeholder="Ex. Agence Étoile"
        defaultValue={state?.values?.fullName}
      />
      <Field
        label="Adresse e-mail"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="vous@exemple.com"
        defaultValue={state?.values?.email}
      />
      <PasswordField
        label="Mot de passe"
        name="password"
        autoComplete="new-password"
        minLength={8}
        hint="Au moins 8 caractères."
      />
      <ConsentCheckbox organizer />
      <TurnstileField />
      <SubmitButton>Créer mon compte</SubmitButton>
    </form>
  );
}
