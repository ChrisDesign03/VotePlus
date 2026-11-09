"use client";

import { useActionState } from "react";
import { setStatusAction, type ActionState } from "@/app/actions/contests";
import type { ContestStatus } from "@/lib/types";
import { FormAlert, SubmitButton } from "./form-parts";

// Boutons de publication, de retour en brouillon et de clôture
export function StatusPanel({
  contestId,
  status,
  canPublish,
  hasPayments,
}: {
  contestId: string;
  status: ContestStatus;
  canPublish: boolean;
  hasPayments: boolean;
}) {
  const [state, action] = useActionState<ActionState, FormData>(setStatusAction, null);
  if (status === "closed") return null;

  const confirmClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!window.confirm("Clôturer le concours ? Les votes seront fermés définitivement.")) e.preventDefault();
  };

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="contest_id" value={contestId} />
      <FormAlert error={state?.error} message={state?.message} />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {status === "draft" ? (
          <PublishButton disabled={!canPublish} />
        ) : (
          <>
            <button
              type="submit"
              name="to"
              value="closed"
              onClick={confirmClose}
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-nuit px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-nuit-2"
            >
              Clôturer le concours
            </button>
            {!hasPayments ? (
              <button
                type="submit"
                name="to"
                value="draft"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-trait bg-white px-6 py-3 text-base font-semibold text-encre transition-colors hover:border-prune hover:text-prune"
              >
                Repasser en brouillon
              </button>
            ) : null}
          </>
        )}
      </div>
    </form>
  );
}

function PublishButton({ disabled }: { disabled: boolean }) {
  return (
    <div className="sm:min-w-56">
      <PublishSubmit disabled={disabled} />
    </div>
  );
}

function PublishSubmit({ disabled }: { disabled: boolean }) {
  // Le bouton doit envoyer « to=open » : on passe par un champ caché pour garder
  // l'indicateur « Veuillez patienter… » de SubmitButton.
  return (
    <>
      <input type="hidden" name="to" value="open" />
      <SubmitButton variant="gold" disabled={disabled}>
        Publier le concours
      </SubmitButton>
    </>
  );
}
