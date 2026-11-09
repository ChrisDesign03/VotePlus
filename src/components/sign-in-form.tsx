"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, type FormState } from "@/app/actions/auth";
import { Field, FormAlert, PasswordField, SubmitButton } from "./form-parts";

export function SignInForm({ initialError }: { initialError?: string }) {
  const [state, action] = useActionState<FormState, FormData>(signInAction, null);

  return (
    <form action={action} className="space-y-5">
      <FormAlert error={state?.error ?? initialError} message={state?.message} />
      <Field
        label="Adresse e-mail"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="vous@exemple.com"
        defaultValue={state?.values?.email}
      />
      <PasswordField label="Mot de passe" name="password" autoComplete="current-password" />
      <p className="text-right text-sm">
        <Link href="/mot-de-passe-oublie" className="font-semibold text-prune hover:underline">
          Mot de passe oublié ?
        </Link>
      </p>
      <SubmitButton>Me connecter</SubmitButton>
    </form>
  );
}
