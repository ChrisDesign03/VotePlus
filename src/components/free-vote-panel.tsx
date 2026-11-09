"use client";

import Link from "next/link";
import { useActionState } from "react";
import { castFreeVoteAction, type FreeVoteState } from "@/app/actions/free-vote";
import { ConsentCheckbox } from "./consent-checkbox";
import { FormAlert, SubmitButton } from "./form-parts";
import { TurnstileField } from "./turnstile-field";
import { buttonClass } from "./ui";

export type FreeVoteInfo =
  | { kind: "anonymous"; loginHref: string }
  | { kind: "own_contest" }
  | { kind: "ready"; voterName: string }
  | { kind: "voted"; periodDaily: boolean; candidateName: string | null };

// Bloc « Voter gratuitement » : connexion, case de consentement, anti-robots, puis vote.
export function FreeVotePanel({
  contestId,
  candidateId,
  candidateName,
  slug,
  periodDaily,
  info,
}: {
  contestId: string;
  candidateId: string;
  candidateName: string;
  slug: string;
  periodDaily: boolean;
  info: FreeVoteInfo;
}) {
  const [state, action] = useActionState<FreeVoteState, FormData>(castFreeVoteAction, null);
  const first = candidateName.split(" ")[0];

  if (state?.done) {
    return (
      <div role="status" className="rounded-lg bg-prune-50 p-4">
        <p className="font-display text-xl font-semibold text-nuit">Merci, votre vote pour {first} est enregistré !</p>
        <p className="mt-1 text-encre-2">
          {periodDaily ? "Vous pourrez voter à nouveau demain." : "Chaque personne vote une seule fois dans ce concours."} Partagez la fiche pour aider {first}.
        </p>
      </div>
    );
  }

  if (info.kind === "own_contest") {
    return <p className="text-encre-2">Vous organisez ce concours : vous ne pouvez pas y voter.</p>;
  }

  if (info.kind === "voted") {
    return (
      <div className="rounded-lg bg-prune-50 p-4">
        <p className="font-semibold text-nuit">
          {periodDaily ? "Vous avez déjà voté aujourd'hui" : "Vous avez déjà voté dans ce concours"}
          {info.candidateName ? ` (pour ${info.candidateName})` : ""}.
        </p>
        <p className="mt-1 text-sm text-encre-2">{periodDaily ? "Revenez demain pour voter à nouveau." : "Merci pour votre participation."}</p>
      </div>
    );
  }

  if (info.kind === "anonymous") {
    return (
      <div className="space-y-3">
        <p className="text-encre-2">
          {periodDaily ? "Un vote gratuit par jour et par personne." : "Un vote gratuit par personne."} Connectez-vous pour voter : c&apos;est rapide et sans mot de passe.
        </p>
        <Link href={info.loginHref} className={buttonClass({ variant: "gold", size: "lg", full: true })}>
          Me connecter pour voter {first}
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="contest_id" value={contestId} />
      <input type="hidden" name="candidate_id" value={candidateId} />
      <input type="hidden" name="slug" value={slug} />
      <p className="text-sm text-encre-2">Connecté en tant que {info.voterName}. {periodDaily ? "1 vote gratuit par jour." : "1 vote gratuit, une seule fois."}</p>
      <FormAlert error={state?.error} />
      <ConsentCheckbox />
      <TurnstileField />
      <SubmitButton variant="gold">Voter gratuitement pour {first}</SubmitButton>
    </form>
  );
}
