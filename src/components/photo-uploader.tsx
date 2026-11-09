"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buttonClass } from "./ui";

const MAX_SIDE = 1200; // pixels : largement suffisant pour un écran de téléphone
const MAX_INPUT_BYTES = 20 * 1024 * 1024;

// Réduit la photo dans le navigateur : une photo de téléphone de 5 Mo devient ~200 Ko.
async function resizeToJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.fillStyle = "#ffffff"; // fond blanc pour les PNG transparents
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("blob"))), "image/jpeg", 0.85),
  );
}

export function PhotoUploader({
  userId,
  name = "photo_url",
  initialUrl = "",
  onBusyChange,
}: {
  userId: string;
  name?: string;
  initialUrl?: string;
  onBusyChange?: (busy: boolean) => void;
}) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [publicUrl, setPublicUrl] = useState(initialUrl);
  const [preview, setPreview] = useState(initialUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Libère l'aperçu temporaire quand il change ou quand le composant disparaît
  useEffect(() => () => { if (preview.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);

  const setBusyBoth = (v: boolean) => {
    setBusy(v);
    onBusyChange?.(v);
  };

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    if (!file.type.startsWith("image/")) return setError("Choisissez une image (JPG, PNG ou WebP).");
    if (file.size > MAX_INPUT_BYTES) return setError("Cette image est trop lourde (20 Mo maximum).");

    setBusyBoth(true);
    try {
      const blob = await resizeToJpeg(file);
      setPreview(URL.createObjectURL(blob));

      const supabase = createClient();
      const path = `${userId}/${crypto.randomUUID()}.jpg`;
      const { error: upError } = await supabase.storage
        .from("contest-media")
        .upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
      if (upError) throw upError;

      const { data } = supabase.storage.from("contest-media").getPublicUrl(path);
      setPublicUrl(data.publicUrl);
    } catch {
      setPreview("");
      setPublicUrl("");
      setError("La photo n'a pas pu être envoyée. Vérifiez votre connexion, puis réessayez.");
    } finally {
      setBusyBoth(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function remove() {
    setPublicUrl("");
    setPreview("");
    setError("");
  }

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-nuit">
        Photo <span className="font-normal text-encre-2">(facultatif)</span>
      </label>

      <div className="flex items-center gap-4">
        <div
          className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-trait bg-papier text-encre-2"
          aria-hidden="true"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs">Aperçu</span>
          )}
        </div>

        <div className="min-w-0">
          <input
            ref={fileRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onPick}
            disabled={busy}
            className="sr-only"
          />
          <div className="flex flex-wrap gap-2">
            <label
              htmlFor={inputId}
              className={`${buttonClass({ variant: "outline" })} cursor-pointer ${busy ? "pointer-events-none opacity-60" : ""}`}
            >
              {busy ? "Envoi en cours…" : publicUrl ? "Changer la photo" : "Choisir une photo"}
            </label>
            {publicUrl && !busy ? (
              <button type="button" onClick={remove} className={buttonClass({ variant: "ghost" })}>
                Retirer
              </button>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-encre-2">
            {publicUrl && !busy ? "Photo prête. Elle est réduite automatiquement." : "Une photo de portrait, de préférence verticale."}
          </p>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-sm font-medium text-erreur">
          {error}
        </p>
      ) : null}

      <input type="hidden" name={name} value={publicUrl} />
    </div>
  );
}
