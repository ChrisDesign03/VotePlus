"use client";

import { useId, useState, useSyncExternalStore } from "react";
import { useFormStatus } from "react-dom";
import { EyeIcon, EyeOffIcon } from "./icons";
import { buttonClass } from "./ui";

const INPUT =
  "block min-h-12 w-full rounded-lg border border-trait bg-white px-4 py-3 text-base text-encre " +
  "placeholder:text-[#8a7f99] transition-colors hover:border-prune/40 " +
  "focus:border-prune focus:outline-none focus:ring-4 focus:ring-prune/15";

const LABEL = "mb-1.5 block text-sm font-semibold text-nuit";

function Label({ htmlFor, children, optional }: { htmlFor: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className={LABEL}>
      {children}
      {optional ? <span className="ml-1.5 font-normal text-encre-2">(facultatif)</span> : null}
    </label>
  );
}

function Hint({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-1.5 text-sm text-encre-2">
      {children}
    </p>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
  value?: string; // champ contrôlé (facultatif)
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  hint?: string;
  minLength?: number;
  maxLength?: number;
  optional?: boolean;
  readOnly?: boolean;
  inputMode?: "numeric" | "decimal" | "text";
  min?: number;
  max?: number;
  step?: number | string;
};

export function Field({
  label,
  name,
  type = "text",
  autoComplete,
  defaultValue,
  value,
  onChange,
  placeholder,
  hint,
  minLength,
  maxLength,
  optional,
  readOnly,
  inputMode,
  min,
  max,
  step,
}: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div>
      <Label htmlFor={id} optional={optional}>
        {label}
      </Label>
      <input
        id={id}
        name={name}
        type={type}
        required={!optional}
        readOnly={readOnly}
        autoComplete={autoComplete}
        defaultValue={value === undefined ? defaultValue : undefined}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        minLength={minLength}
        maxLength={maxLength}
        inputMode={inputMode}
        min={min}
        max={max}
        step={step}
        aria-describedby={hint ? hintId : undefined}
        className={readOnly ? `${INPUT} bg-papier text-encre-2` : INPUT}
      />
      {hint ? <Hint id={hintId}>{hint}</Hint> : null}
    </div>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  placeholder,
  hint,
  maxLength,
  optional,
  rows = 4,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  hint?: string;
  maxLength?: number;
  optional?: boolean;
  rows?: number;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div>
      <Label htmlFor={id} optional={optional}>
        {label}
      </Label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        required={!optional}
        defaultValue={defaultValue}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-describedby={hint ? hintId : undefined}
        className={`${INPUT} resize-y leading-relaxed`}
      />
      {hint ? <Hint id={hintId}>{hint}</Hint> : null}
    </div>
  );
}

/** Choix unique présenté sous forme de grandes cases à cocher faciles à toucher */
export function RadioGroup({
  legend,
  name,
  options,
  defaultValue,
  value,
  onChange,
  disabled,
  note,
}: {
  legend: string;
  name: string;
  options: { value: string; label: string; hint?: string }[];
  defaultValue?: string;
  value?: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  note?: string;
}) {
  return (
    <fieldset disabled={disabled}>
      <legend className={LABEL}>{legend}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((o) => (
          <label
            key={o.value}
            className="flex cursor-pointer gap-3 rounded-lg border border-trait bg-white p-4 transition-colors hover:border-prune/40 has-[:checked]:border-prune has-[:checked]:bg-prune-50 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-70"
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              {...(value !== undefined ? { checked: o.value === value, onChange: () => onChange?.(o.value) } : { defaultChecked: o.value === defaultValue })}
              className="mt-1 h-4 w-4 shrink-0 accent-prune" />
            <span>
              <span className="block font-semibold text-nuit">{o.label}</span>
              {o.hint ? <span className="mt-0.5 block text-sm text-encre-2">{o.hint}</span> : null}
            </span>
          </label>
        ))}
      </div>
      {note ? <p className="mt-2 text-sm text-encre-2">{note}</p> : null}
    </fieldset>
  );
}

// Vrai seulement dans le navigateur (jamais pendant le rendu sur le serveur)
const subscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/**
 * Date et heure du concours. La personne saisit l'heure de SON appareil ;
 * le champ caché envoie la date exacte (UTC) au serveur. Ainsi, un organisateur
 * à Kinshasa ou à Lubumbashi obtient l'heure qu'il a réellement choisie.
 */
export function DateTimeField({
  label,
  name,
  defaultIso,
  hint,
}: {
  label: string;
  name: string;
  defaultIso?: string | null;
  hint?: string;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const isClient = useIsClient();
  const [typed, setTyped] = useState<string | null>(null);

  const value = typed ?? (isClient ? toLocalInput(defaultIso) : "");
  const iso = value ? new Date(value).toISOString() : "";

  return (
    <div>
      <Label htmlFor={id} optional>
        {label}
      </Label>
      {isClient ? (
        <input
          id={id}
          type="datetime-local"
          value={value}
          onChange={(e) => setTyped(e.target.value)}
          aria-describedby={hint ? hintId : undefined}
          className={INPUT}
        />
      ) : (
        <div className={`${INPUT} text-encre-2`} aria-hidden="true">
          &nbsp;
        </div>
      )}
      <input type="hidden" name={name} value={iso} />
      {hint ? <Hint id={hintId}>{hint}</Hint> : null}
    </div>
  );
}

export function PasswordField({
  label,
  name,
  autoComplete,
  hint,
  minLength,
}: {
  label: string;
  name: string;
  autoComplete: string;
  hint?: string;
  minLength?: number;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required
          autoComplete={autoComplete}
          minLength={minLength}
          aria-describedby={hint ? hintId : undefined}
          className={`${INPUT} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-encre-2 transition-colors hover:text-prune"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {hint ? <Hint id={hintId}>{hint}</Hint> : null}
    </div>
  );
}

export function SubmitButton({
  children,
  disabled,
  variant = "primary",
  full = true,
  size = "lg",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  variant?: "primary" | "gold" | "outline";
  full?: boolean;
  size?: "md" | "lg";
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={buttonClass({ variant, size, full })}
    >
      {pending ? "Veuillez patienter…" : children}
    </button>
  );
}

export function FormAlert({ error, message }: { error?: string; message?: string }) {
  if (error) {
    return (
      <p
        role="alert"
        className="rounded-lg border-l-4 border-erreur bg-erreur-50 px-4 py-3 text-sm font-medium text-erreur"
      >
        {error}
      </p>
    );
  }
  if (message) {
    return (
      <p
        role="status"
        className="rounded-lg border-l-4 border-succes bg-succes-50 px-4 py-3 text-sm font-medium text-succes"
      >
        {message}
      </p>
    );
  }
  return null;
}
