import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { simulatePaymentAction } from "@/app/actions/payments";
import { PaymentWatcher } from "@/components/payment-watcher";
import { PublicFooter, PublicHeader } from "@/components/public-header";
import { ShareButtons } from "@/components/share-buttons";
import { buttonClass, Container } from "@/components/ui";
import { formatMoney, UUID_RE } from "@/lib/contest-rules";
import { getPaymentMode, isStalePending, maskPhone, operatorLabel } from "@/lib/payments";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Currency } from "@/lib/types";
import { nf } from "@/lib/voting";

export const metadata: Metadata = { title: "Votre paiement", robots: { index: false, follow: false } };

export default function PaymentPage({ params }: PageProps<"/paiement/[id]">) {
  return (
    <div className="flex min-h-screen flex-col bg-papier">
      <PublicHeader />
      <main id="contenu" className="flex-1">
        <Container className="max-w-2xl py-10 sm:py-14">
          <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-prune-50" aria-hidden="true" />}>
            <PaymentContent params={params} />
          </Suspense>
        </Container>
      </main>
      <PublicFooter />
    </div>
  );
}

async function PaymentContent({ params }: { params: PageProps<"/paiement/[id]">["params"] }) {
  await connection();
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const sb = createAdminClient();
  const { data: pay, error } = await sb
    .from("payments")
    .select("id, status, votes_count, amount, currency, provider, provider_ref, payer_phone, created_at, contest_id, candidate_id")
    .eq("id", id)
    .maybeSingle();
  if (error) console.error("[VotePlus] lecture du paiement :", error.code, error.message);
  if (!pay) notFound();

  // Un paiement en attente depuis trop longtemps expire
  let status = pay.status as string;
  if (status === "pending" && isStalePending(pay.created_at)) {
    await sb.rpc("fail_payment", { p_provider_ref: pay.provider_ref, p_status: "expired" });
    status = "expired";
  }

  const [{ data: contest }, { data: cand }] = await Promise.all([
    sb.from("contests").select("slug, title").eq("id", pay.contest_id).maybeSingle(),
    sb.from("candidates").select("number, name").eq("id", pay.candidate_id).maybeSingle(),
  ]);
  const slug = contest?.slug ?? "";
  const back = cand ? `/concours/${slug}/${cand.number}` : `/concours/${slug}`;
  const amount = formatMoney(pay.amount, pay.currency as Currency);
  const simulation = getPaymentMode() === "simulation";

  const card = "rounded-2xl border border-trait bg-white p-6 sm:p-8";

  if (status === "succeeded") {
    return (
      <section className={card} aria-live="polite">
        <p className="inline-flex rounded-full bg-succes-50 px-3 py-1 text-sm font-semibold text-succes">Paiement confirmé</p>
        <h1 className="mt-4 text-balance font-display text-3xl font-semibold tracking-tight text-nuit sm:text-4xl">
          Merci ! {nf.format(pay.votes_count)} vote{pay.votes_count > 1 ? "s" : ""} pour {cand?.name ?? "votre candidate"}.
        </h1>
        <p className="mt-3 text-encre-2">
          Votre paiement de {amount} a bien été reçu. Vos votes sont comptés.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/concours/${slug}`} className={buttonClass({ variant: "primary", size: "lg" })}>
            Voir le classement
          </Link>
          <Link href={back} className={buttonClass({ variant: "outline", size: "lg" })}>
            Voter encore
          </Link>
        </div>
        {cand ? (
          <div className="mt-8 border-t border-trait pt-6">
            <h2 className="mb-3 font-semibold text-nuit">Aidez {cand.name.split(" ")[0]} à gagner</h2>
            <ShareButtons
              title={`${cand.name} · ${contest?.title ?? ""}`}
              text={`Votez pour ${cand.name} (n°${cand.number}) : ${contest?.title ?? ""}`}
              url={`/concours/${slug}/${cand.number}`}
            />
          </div>
        ) : null}
      </section>
    );
  }

  if (status === "failed" || status === "expired") {
    return (
      <section className={card} aria-live="polite">
        <p className="inline-flex rounded-full bg-erreur-50 px-3 py-1 text-sm font-semibold text-erreur">
          {status === "expired" ? "Délai dépassé" : "Paiement non abouti"}
        </p>
        <h1 className="mt-4 text-balance font-display text-3xl font-semibold tracking-tight text-nuit sm:text-4xl">
          {status === "expired" ? "Nous n'avons pas reçu votre confirmation." : "Le paiement n'a pas abouti."}
        </h1>
        <p className="mt-3 text-encre-2">
          Aucun vote n&apos;a été ajouté. Si de l&apos;argent a été débité de votre compte, gardez cette référence et
          contactez l&apos;organisateur : <span className="font-semibold text-nuit">{pay.id.slice(0, 8).toUpperCase()}</span>.
        </p>
        <Link href={back} className={`${buttonClass({ variant: "primary", size: "lg" })} mt-6`}>
          Réessayer
        </Link>
      </section>
    );
  }

  return (
    <section className={card} aria-live="polite">
      <PaymentWatcher />
      <p className="inline-flex items-center gap-2 rounded-full bg-prune-50 px-3 py-1 text-sm font-semibold text-prune">
        <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-prune" />
        En attente de votre confirmation
      </p>
      <h1 className="mt-4 text-balance font-display text-3xl font-semibold tracking-tight text-nuit sm:text-4xl">
        Validez le paiement sur votre téléphone.
      </h1>
      <p className="mt-3 text-encre-2">
        {operatorLabel(pay.provider)} va afficher une demande de {amount} sur {maskPhone(pay.payer_phone)}. Saisissez votre
        code secret pour confirmer. Cette page se met à jour toute seule.
      </p>
      <dl className="mt-6 grid gap-3 rounded-xl bg-papier p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-encre-2">Candidate</dt>
          <dd className="font-semibold text-nuit">
            {cand ? `${cand.name} (n°${cand.number})` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-encre-2">Votes</dt>
          <dd className="font-semibold text-nuit">{nf.format(pay.votes_count)}</dd>
        </div>
      </dl>

      {simulation ? (
        <form action={simulatePaymentAction} className="mt-8 rounded-xl border-2 border-dashed border-or p-4">
          <input type="hidden" name="payment_id" value={pay.id} />
          <p className="text-sm font-semibold text-nuit">Mode test : aucun argent réel n&apos;est utilisé.</p>
          <p className="mt-1 text-sm text-encre-2">Jouez le rôle de l&apos;opérateur :</p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            <button name="outcome" value="success" className={buttonClass({ variant: "gold" })}>
              J&apos;ai validé sur mon téléphone
            </button>
            <button name="outcome" value="failure" className={buttonClass({ variant: "outline" })}>
              Simuler un refus
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
