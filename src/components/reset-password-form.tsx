"use client";

import { useActionState } from "react";
import { resetPasswordAction, type FormState } from "@/app/actions/auth";
import { FormAlert, PasswordField, SubmitButton } from "./form-parts";

export function ResetPasswordForm() {
  const [state, action] = useActionState<FormState, FormData>(resetPasswordAction, null);
  return (
    <form action={action} className="space-y-5">
      <FormAlert error={state?.error} />
      <PasswordField label="Nouveau mot de passe" name="password" autoComplete="new-password" minLength={8} hint="Au moins 8 caractères." />
      <SubmitButton>Enregistrer le mot de passe</SubmitButton>
    </form>
  );
}
