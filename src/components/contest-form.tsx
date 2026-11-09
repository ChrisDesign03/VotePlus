"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "@/app/actions/contests";
import type { Contest } from "@/lib/types";
import { usesFree } from "@/lib/contest-rules";
import { DateTimeField, Field, FormAlert, RadioGroup, SubmitButton, TextArea } from "./form-parts";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  contest?: Contest;
  submitLabel: string;
};

export function ContestForm({ action, contest, submitLabel }: Props) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, null);
  const v = state?.values;
  const currencyLocked = Boolean(contest && contest.status !== "draft");
  const modeLocked = currencyLocked;
  const [mode, setMode] = useState<string>(v?.vote_mode ?? contest?.vote_mode ?? "paid");

  return (
    <form action={formAction} className="space-y-6">
      <FormAlert error={state?.error} message={state?.message} />
      {contest ? <input type="hidden" name="id" value={contest.id} /> : null}

      <Field
        label="Titre du concours"
        name="title"
        placeholder="Ex. Miss Étoile de Kinshasa 2026"
        defaultValue={v?.title ?? contest?.title}
        maxLength={120}
        minLength={3}
      />

      <TextArea
        label="Description"
        name="description"
        optional
        rows={4}
        maxLength={2000}
        placeholder="Présentez le concours en quelques lignes : lieu, date de la finale, partenaires…"
        hint="Elle s'affichera en haut de la page publique du concours."
        defaultValue={v?.description ?? contest?.description ?? ""}
      />

      <TextArea
        label="Règlement"
        name="rules"
        optional
        rows={4}
        maxLength={4000}
        placeholder="Ex. Un paiement confirmé donne droit au nombre de votes du pack acheté. Les votes ne sont pas remboursables."
        defaultValue={v?.rules ?? contest?.rules ?? ""}
      />

      <RadioGroup
        legend="Devise des paiements"
        name="currency"
        defaultValue={v?.currency ?? contest?.currency ?? "USD"}
        disabled={currencyLocked}
        note={currencyLocked ? "La devise ne peut plus changer une fois le concours publié." : undefined}
        options={[
          { value: "USD", label: "Dollar américain", hint: "Prix en USD, avec centimes." },
          { value: "CDF", label: "Franc congolais", hint: "Prix en CDF, nombres entiers." },
        ]}
      />
      {/* Un groupe désactivé n'envoie pas sa valeur : on la transmet ici. */}
      {currencyLocked ? <input type="hidden" name="currency" value={contest?.currency} /> : null}

      <RadioGroup
        legend="Type de vote"
        name="vote_mode"
        value={mode}
        onChange={setMode}
        disabled={modeLocked}
        note={modeLocked ? "Le type de vote ne peut plus changer une fois le concours publié (équité pour les candidates)." : undefined}
        options={[
          { value: "paid", label: "Votes payants", hint: "Le public achète des packs de votes par Mobile Money." },
          { value: "free", label: "Vote gratuit", hint: "Un compte vérifié = un vote. Aucun paiement, aucune recette." },
          { value: "both", label: "Gratuit + payant", hint: "Un vote gratuit pour tous, et des packs pour aller plus loin." },
        ]}
      />
      {modeLocked ? <input type="hidden" name="vote_mode" value={contest?.vote_mode} /> : null}

      {usesFree(mode as "paid" | "free" | "both") ? (
        <>
          <RadioGroup
            legend="Fréquence du vote gratuit"
            name="free_vote_period"
            defaultValue={v?.free_vote_period ?? contest?.free_vote_period ?? "once"}
            disabled={modeLocked}
            options={[
              { value: "once", label: "Une seule fois", hint: "Chaque personne vote une fois pour tout le concours." },
              { value: "daily", label: "Une fois par jour", hint: "Chaque personne peut revoter chaque jour (heure de Kinshasa)." },
            ]}
          />
          {modeLocked ? <input type="hidden" name="free_vote_period" value={contest?.free_vote_period} /> : null}
        </>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <DateTimeField
          label="Début du concours"
          name="starts_at"
          defaultIso={v?.starts_at ?? contest?.starts_at}
        />
        <DateTimeField
          label="Fin du concours"
          name="ends_at"
          defaultIso={v?.ends_at ?? contest?.ends_at}
          hint="Passé cette date, les paiements ne comptent plus."
        />
      </div>

      <RadioGroup
        legend="Affichage du classement"
        name="ranking"
        defaultValue={v?.ranking ?? (contest ? (contest.show_live_ranking ? "live" : "hidden") : "live")}
        options={[
          { value: "live", label: "Visible en direct", hint: "Le public voit les votes évoluer." },
          { value: "hidden", label: "Masqué jusqu'à la clôture", hint: "Le suspense reste entier jusqu'à la fin." },
        ]}
      />

      <div className="sm:max-w-xs">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
