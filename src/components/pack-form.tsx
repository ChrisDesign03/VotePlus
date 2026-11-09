"use client";

import { useActionState } from "react";
import { addPackAction, updatePackAction, type ActionState } from "@/app/actions/contests";
import type { Currency, VotePack } from "@/lib/types";
import { Field, FormAlert, SubmitButton } from "./form-parts";

// Sert à AJOUTER un pack, ou à le MODIFIER quand `pack` est fourni.
export function PackForm({
  contestId,
  currency,
  pack,
}: {
  contestId: string;
  currency: Currency;
  pack?: VotePack;
}) {
  const editing = Boolean(pack);
  const [state, action] = useActionState<ActionState, FormData>(editing ? updatePackAction : addPackAction, null);
  const v = state?.values;

  return (
    <form key={editing ? pack!.id : (state?.nonce ?? "initial")} action={action} className="space-y-5">
      <FormAlert error={state?.error} message={state?.message} />
      <input type="hidden" name="contest_id" value={contestId} />
      {pack ? <input type="hidden" name="pack_id" value={pack.id} /> : null}

      <Field
        label="Nom du pack"
        name="label"
        placeholder="Ex. Pack soutien"
        maxLength={60}
        defaultValue={v?.label ?? pack?.label}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Nombre de votes"
          name="votes"
          type="number"
          inputMode="numeric"
          min={1}
          max={100000}
          placeholder="10"
          defaultValue={v?.votes ?? (pack ? String(pack.votes) : undefined)}
        />
        <Field
          label={`Prix (${currency === "USD" ? "dollars" : "francs congolais"})`}
          name="price"
          type="number"
          inputMode="decimal"
          min={currency === "USD" ? 0.01 : 1}
          step={currency === "USD" ? "0.01" : "1"}
          placeholder={currency === "USD" ? "8" : "20000"}
          defaultValue={v?.price ?? (pack ? String(Number(pack.price)) : undefined)}
        />
      </div>

      <div className="sm:max-w-xs">
        <SubmitButton>{editing ? "Enregistrer" : "Ajouter le pack"}</SubmitButton>
      </div>
    </form>
  );
}
