import Link from "next/link";
import { AppShell } from "./app-shell";
import { formatMoney } from "@/lib/contest-rules";
import { ButtonLink, StatusBadge } from "./ui";

export type ContestRow = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  votes?: number;
  net?: number;
  currency?: "USD" | "CDF";
};

const STEPS = [
  { title: "Créez le concours", text: "Donnez-lui un titre, des dates et des règles." },
  { title: "Ajoutez vos candidates", text: "Une photo, un numéro et une présentation pour chacune." },
  { title: "Fixez vos packs de votes", text: "Choisissez le nombre de votes et le prix de chaque pack." },
  { title: "Publiez et partagez le lien", text: "Le public peut voter dès l'ouverture du concours." },
];

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function DashboardView({
  name,
  isAdmin = false,
  contests,
  loadError,
}: {
  name: string;
  isAdmin?: boolean;
  contests: ContestRow[];
  loadError?: boolean;
}) {
  const firstName = name.trim().split(/\s+/)[0] || "Organisateur";
  const open = contests.filter((c) => c.status === "open").length;
  const drafts = contests.filter((c) => c.status === "draft").length;

  return (
    <AppShell name={name} isAdmin={isAdmin}>
      <h1 className="text-balance font-display text-3xl font-semibold tracking-tight text-nuit sm:text-5xl">
        Bonjour, {firstName}
      </h1>
      <p className="mt-2 text-lg text-encre-2">Voici l&apos;état de vos concours.</p>

      {/* Chiffres clés */}
      <dl className="mt-8 grid grid-cols-3 divide-x divide-trait overflow-hidden rounded-xl border border-trait bg-white">
        {[
          { label: "Concours", value: contests.length },
          { label: "Ouverts au vote", short: "Ouverts", value: open },
          { label: "Brouillons", value: drafts },
        ].map((s) => (
          <div key={s.label} className="px-4 py-5 sm:px-8 sm:py-7">
            <dt className="text-xs font-medium text-encre-2 sm:text-sm">
              {"short" in s ? (
                <>
                  <span className="sm:hidden">{s.short}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </>
              ) : (
                s.label
              )}
            </dt>
            <dd className="mt-1 font-display text-4xl font-semibold tabular-nums text-nuit sm:text-5xl">{s.value}</dd>
          </div>
        ))}
      </dl>

      {/* Mes concours */}
      <section className="mt-12" aria-labelledby="titre-concours">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="titre-concours" className="font-display text-2xl font-semibold text-nuit sm:text-3xl">
            Mes concours
          </h2>
          <ButtonLink href="/tableau-de-bord/concours/nouveau" variant="primary">
            Créer un concours
          </ButtonLink>
        </div>

        {loadError ? (
          <p
            role="alert"
            className="mt-5 rounded-lg border-l-4 border-erreur bg-erreur-50 px-4 py-3 text-sm font-medium text-erreur"
          >
            Vos concours ne se sont pas chargés. Rechargez la page pour réessayer.
          </p>
        ) : contests.length === 0 ? (
          <div className="mt-5 rounded-xl border border-trait bg-white p-6 sm:p-10">
            <h3 className="max-w-md text-balance font-display text-2xl font-semibold text-nuit">
              Lancez votre premier concours en quatre étapes
            </h3>
            <ol className="mt-8 grid gap-x-10 gap-y-7 md:grid-cols-2">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-lg font-semibold tabular-nums ${
                      i === 0 ? "bg-prune text-white" : "border border-trait bg-papier text-encre-2"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-nuit">{s.title}</p>
                    <p className="mt-0.5 text-encre-2">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-9">
              <ButtonLink href="/tableau-de-bord/concours/nouveau" variant="gold" size="lg">
                Créer mon premier concours
              </ButtonLink>
            </div>
          </div>
        ) : (
          <ul className="mt-5 divide-y divide-trait overflow-hidden rounded-xl border border-trait bg-white">
            {contests.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/tableau-de-bord/concours/${c.id}`}
                  className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-prune-50 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5"
                >
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-lg font-semibold text-nuit">{c.title}</p>
                    <p className="text-sm text-encre-2">
                      Créé le {dateFormat.format(new Date(c.created_at))}
                      {c.status !== "draft" && c.votes !== undefined && c.currency ? (
                        <>
                          {" "}
                          · <span className="tabular-nums">{new Intl.NumberFormat("fr-FR").format(c.votes)} vote{c.votes > 1 ? "s" : ""}</span>
                          {" "}· net <span className="tabular-nums">{formatMoney(c.net ?? 0, c.currency)}</span>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <StatusBadge status={c.status} />
                    <span aria-hidden="true" className="hidden text-lg text-prune sm:inline">
                      →
                    </span>
                    <span className="sr-only">Gérer ce concours</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
