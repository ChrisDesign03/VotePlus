"use client";

import { useActionState } from "react";
import { updateProfileAction, type ProfileState } from "@/app/actions/profile";
import { Field, FormAlert, RadioGroup, SubmitButton } from "./form-parts";

export type ProfileValues = {
  full_name: string;
  phone: string | null;
  payout_method: string | null;
  payout_account: string | null;
};

const METHOD_OPTIONS = [
  { value: "", label: "Pas encore choisi" },
  { value: "mpesa", label: "M-Pesa" },
  { value: "airtel", label: "Airtel Money" },
  { value: "orange", label: "Orange Money" },
  { value: "bank", label: "Compte bancaire" },
];

export function ProfileForm({ profile }: { profile: ProfileValues }) {
  const [state, action] = useActionState<ProfileState, FormData>(updateProfileAction, null);
  return (
    <form action={action} className="space-y-6">
      <FormAlert error={state?.error} message={state?.message} />
      <Field label="Nom complet" name="full_name" autoComplete="name" maxLength={80} defaultValue={profile.full_name} />
      <Field
        label="Téléphone"
        name="phone"
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        optional
        placeholder="081 234 5678"
        defaultValue={profile.phone ? `0${profile.phone.slice(3)}` : ""}
        hint="Pour vous joindre au sujet de vos concours."
      />
      <RadioGroup
        legend="Où voulez-vous recevoir l'argent des votes ?"
        name="payout_method"
        defaultValue={profile.payout_method ?? ""}
        options={METHOD_OPTIONS}
        note="Votre part (la recette moins la commission) vous est reversée sur ce compte."
      />
      <Field
        label="Numéro Mobile Money ou coordonnées bancaires"
        name="payout_account"
        optional
        maxLength={80}
        placeholder="081 234 5678"
        defaultValue={
          profile.payout_method && profile.payout_method !== "bank" && profile.payout_account
            ? `0${profile.payout_account.slice(3)}`
            : (profile.payout_account ?? "")
        }
      />
      <div className="sm:max-w-xs">
        <SubmitButton>Enregistrer</SubmitButton>
      </div>
    </form>
  );
}
