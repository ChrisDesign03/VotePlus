"use client";

import { useActionState } from "react";
import { recordPayoutAction, type PayoutState } from "@/app/actions/admin";
import { PAYOUT_METHODS } from "@/lib/payments";
import { Field, FormAlert, SubmitButton } from "./form-parts";

export function PayoutForm({ contestId, due, method }: { contestId: string; due: number; method: string | null }) {
  const [state, action] = useActionState<PayoutState, FormData>(recordPayoutAction, null);
  return (
    <form key={state?.nonce ?? "initial"} action={action} className="space-y-4">
      <FormAlert error={state?.error} message={state?.message} />
      <input type="hidden" name="contest_id" value={contestId} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Montant reversé" name="amount" type="number" inputMode="decimal" min={0.01} step="0.01" max={due} defaultValue={String(due)} />
        <div>
          <label htmlFor={`m-${contestId}`} className="mb-1.5 block text-sm font-semibold text-nuit">Mode</label>
          <select
            id={`m-${contestId}`}
            name="method"
            required
            defaultValue={method ?? ""}
            className="block min-h-12 w-full rounded-lg border border-trait bg-white px-4 py-3 text-base text-encre focus:border-prune focus:outline-none focus:ring-4 focus:ring-prune/15"
          >
            <option value="" disabled>
              Choisir…
            </option>
            {PAYOUT_METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <Field label="Référence de l'opération" name="reference" optional maxLength={80} placeholder="Ex. code M-Pesa" />
      </div>
      <div className="sm:max-w-xs">
        <SubmitButton size="md">Enregistrer le reversement</SubmitButton>
      </div>
    </form>
  );
}
