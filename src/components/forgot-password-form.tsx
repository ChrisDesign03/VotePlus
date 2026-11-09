"use client";

import { useActionState } from "react";
import { forgotPasswordAction, type FormState } from "@/app/actions/auth";
import { Field, FormAlert, SubmitButton } from "./form-parts";
import { TurnstileField } from "./turnstile-field";

export function ForgotPasswordForm() {
  const [state, action] = useActionState<FormState, FormData>(forgotPasswordAction, null);
  return (
    <form action={action} className="space-y-5">
      <FormAlert error={state?.error} message={state?.message} />
      <Field label="Adresse e-mail du compte" name="email" type="email" autoComplete="email" placeholder="vous@exemple.com" defaultValue={state?.values?.email} />
      <TurnstileField />
      <SubmitButton>Recevoir le lien</SubmitButton>
    </form>
  );
}
