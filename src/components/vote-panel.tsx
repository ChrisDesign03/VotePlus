"use client";

import { useActionState, useState } from "react";
import { startPaymentAction, type PayState } from "@/app/actions/payments";
import { formatMoney } from "@/lib/contest-rules";
import { OPERATORS } from "@/lib/payments";
import type { Currency } from "@/lib/types";
import { nf } from "@/lib/voting";
import { ConsentCheckbox } from "./consent-checkbox";
import { Field, FormAlert, SubmitButton } from "./form-parts";
import { TurnstileField } from "./turnstile-field";

type Pack = { id: string; label: string; votes: number; price: number };

const OPTION =
  "flex cursor-pointer items-center gap-3.5 rounded-lg border border-trait bg-white p-4 transition-colors " +
  "hover:border-prune/40 has-[:checked]:border-prune has-[:checked]:bg-prune-50 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-prune/15";

// Choix du pack, de l'opérateur et du numéro. Le serveur recalcule TOUJOURS le prix.
export function VotePanel({
  contestId,
  candidateId,
  packs,
  currency,
  candidateName,
}: {
  contestId: string;
  candidateId: string;
  packs: Pack[];
  currency: Currency;
  candidateName: string;
}) {
  const [state, action] = useActionState<PayState, FormData>(startPaymentAction, null);
  // Par défaut : le pack du milieu (souvent le plus choisi)
  const [selectedId, setSelectedId] = useState(
    state?.values?.pack_id || packs[Math.floor((packs.length - 1) / 2)]?.id || "",
  );
  // Opérateur et numéro sont gardés en mémoire : après une erreur, rien n'est à ressaisir
  const [provider, setProvider] = useState(state?.values?.provider ?? "");
  const [phone, setPhone] = useState(state?.values?.phone ?? "");
  const selected = packs.find((p) => p.id === selectedId);
  const first = candidateName.split(" ")[0];

  if (packs.length === 0) {
    return <p className="rounded-lg bg-prune-50 p-4 text-encre-2">Les packs de votes ne sont pas encore disponibles.</p>;
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="contest_id" value={contestId} />
      <input type="hidden" name="candidate_id" value={candidateId} />

      <fieldset className="min-w-0">
        <legend className="mb-3 font-display text-xl font-semibold text-nuit">1. Choisissez votre pack</legend>
        <div className="space-y-2.5">
          {packs.map((p) => (
            <label key={p.id} className={OPTION}>
              <input
                type="radio"
                name="pack_id"
                value={p.id}
                checked={p.id === selectedId}
                onChange={() => setSelectedId(p.id)}
                className="h-4 w-4 shrink-0 accent-prune"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-nuit">
                  {nf.format(p.votes)} vote{p.votes > 1 ? "s" : ""}
                </span>
                <span className="block truncate text-sm text-encre-2">
                  {p.label} · {formatMoney(p.price / p.votes, currency)} le vote
                </span>
              </span>
              <span className="font-display text-xl font-semibold tabular-nums text-nuit">{formatMoney(p.price, currency)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="min-w-0">
        <legend className="mb-3 font-display text-xl font-semibold text-nuit">2. Votre Mobile Money</legend>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {OPERATORS.map((o) => (
            <label key={o.id} className={OPTION}>
              <input
                type="radio"
                name="provider"
                value={o.id}
                required
                checked={provider === o.id}
                onChange={() => setProvider(o.id)}
                className="h-4 w-4 shrink-0 accent-prune"
              />
              <span className="font-semibold text-nuit">{o.label}</span>
            </label>
          ))}
        </div>
        <div className="mt-4">
          <Field
            label="Numéro qui va payer"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="081 234 5678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            hint="Vous recevrez une demande de confirmation sur ce numéro."
          />
        </div>
      </fieldset>

      <FormAlert error={state?.error} />

      <ConsentCheckbox paid />
      <TurnstileField />

      <SubmitButton variant="gold" disabled={!selected}>
        {selected ? `Payer ${formatMoney(selected.price, currency)} et voter ${first}` : "Choisissez un pack"}
      </SubmitButton>
    </form>
  );
}
