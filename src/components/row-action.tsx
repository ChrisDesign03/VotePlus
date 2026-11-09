"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/actions/contests";

// Petit bouton d'action sur une ligne (retirer, rétablir…) qui affiche son erreur s'il y en a une.
export function RowAction({
  action,
  fields,
  label,
  ariaLabel,
  confirm,
  tone = "neutral",
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  fields: Record<string, string>;
  label: string;
  ariaLabel: string;
  confirm?: string;
  tone?: "neutral" | "danger";
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, null);
  return (
    <form action={formAction} className="min-w-0">
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button
        type="submit"
        aria-label={ariaLabel}
        onClick={(e) => {
          if (confirm && !window.confirm(confirm)) e.preventDefault();
        }}
        className={`min-h-11 text-sm font-semibold hover:underline ${tone === "danger" ? "text-erreur" : "text-prune"}`}
      >
        {label}
      </button>
      {state?.error ? (
        <p role="alert" className="text-sm font-medium text-erreur">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
