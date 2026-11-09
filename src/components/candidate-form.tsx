"use client";

import { useActionState, useState } from "react";
import { addCandidateAction, updateCandidateAction, type ActionState } from "@/app/actions/contests";
import type { Candidate } from "@/lib/types";
import { Field, FormAlert, SubmitButton, TextArea } from "./form-parts";
import { PhotoUploader } from "./photo-uploader";

// Sert à AJOUTER une candidate, ou à la MODIFIER quand `candidate` est fourni.
export function CandidateForm({
  contestId,
  userId,
  nextNumber,
  candidate,
  lockNumber = false,
}: {
  contestId: string;
  userId: string;
  nextNumber?: number;
  candidate?: Candidate;
  /** concours publié : le numéro ne change plus (liens et affiches restent valables) */
  lockNumber?: boolean;
}) {
  const editing = Boolean(candidate);
  const [state, action] = useActionState<ActionState, FormData>(
    editing ? updateCandidateAction : addCandidateAction,
    null,
  );
  const [uploading, setUploading] = useState(false);
  const v = state?.values;

  // Ajout : `key` change à chaque réussite, le formulaire repart à zéro. Modification : il reste tel quel.
  return (
    <form key={editing ? candidate!.id : (state?.nonce ?? "initial")} action={action} className="space-y-5">
      <FormAlert error={state?.error} message={state?.message} />
      <input type="hidden" name="contest_id" value={contestId} />
      {candidate ? <input type="hidden" name="candidate_id" value={candidate.id} /> : null}

      <div className="grid gap-5 sm:grid-cols-[8rem_1fr]">
        <Field
          label="Numéro"
          name="number"
          type="number"
          inputMode="numeric"
          min={1}
          max={999}
          readOnly={lockNumber}
          defaultValue={v?.number ?? (candidate ? String(candidate.number) : String(nextNumber ?? 1))}
        />
        <Field
          label="Nom de la candidate"
          name="name"
          placeholder="Ex. Amandine Kabeya"
          maxLength={80}
          defaultValue={v?.name ?? candidate?.name}
        />
      </div>
      {lockNumber ? (
        <p className="-mt-2 text-sm text-encre-2">Le numéro ne change plus une fois le concours publié.</p>
      ) : null}

      <TextArea
        label="Présentation"
        name="bio"
        optional
        rows={3}
        maxLength={1000}
        placeholder="Âge, profession, passion, message au public…"
        defaultValue={v?.bio ?? candidate?.bio ?? undefined}
      />

      <PhotoUploader userId={userId} onBusyChange={setUploading} initialUrl={candidate?.photo_url ?? ""} />

      <div className="sm:max-w-xs">
        <SubmitButton disabled={uploading}>
          {uploading ? "Envoi de la photo…" : editing ? "Enregistrer" : "Ajouter la candidate"}
        </SubmitButton>
      </div>
    </form>
  );
}
