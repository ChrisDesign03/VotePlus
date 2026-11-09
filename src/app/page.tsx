import Link from "next/link";
import { Suspense } from "react";
import { Brand, SITE_NAME } from "@/components/brand";
import { ChartIcon, EyeSlashRankIcon, PhoneIcon, ShieldIcon } from "@/components/icons";
import { OpenContests } from "@/components/open-contests";
import { MobileMenu } from "@/components/mobile-menu";
import { ButtonLink, Container, buttonClass } from "@/components/ui";

const NAV = [
  { href: "#fonctionnement", label: "Comment voter" },
  { href: "#organisateurs", label: "Organisateurs" },
];

const STEPS = [
  {
    title: "Choisissez votre candidate",
    text: "Parcourez les fiches avec photos et numéros, puis ouvrez celle que vous soutenez.",
  },
  {
    title: "Votez gratuitement ou par Mobile Money",
    text: "Selon le concours : un vote gratuit avec votre compte, ou un pack de votes payé depuis votre téléphone.",
  },
  {
    title: "Voyez votre vote compter",
    text: "Votre vote est ajouté dès qu'il est validé (compte vérifié ou paiement confirmé) et le classement se met à jour.",
  },
];

const FEATURES = [
  {
    icon: PhoneIcon,
    title: "Vote gratuit, payant ou les deux",
    text: "Un vote gratuit par personne (ou par jour), des packs payants en dollars ou en francs congolais, ou un mélange des deux.",
  },
  {
    icon: ShieldIcon,
    title: "Des résultats que l'on peut défendre",
    text: "Un compte vérifié = un vote gratuit, anti-robots, votes suspects annulables, et chaque vote payant rattaché à son paiement confirmé.",
  },
  {
    icon: EyeSlashRankIcon,
    title: "Un classement visible ou masqué",
    text: "Affichez le classement en direct, ou gardez le suspense jusqu'à la clôture du concours.",
  },
  {
    icon: ChartIcon,
    title: "Vos chiffres au même endroit",
    text: "Suivez les votes, les paiements et vos revenus depuis un seul tableau de bord.",
  },
];

export default function Home() {
  return (
    <>
      <header className="absolute inset-x-0 top-0 z-30">
        <Container className="flex h-20 items-center justify-between">
          <Brand tone="light" />

          <nav aria-label="Menu principal" className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-lavande transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ))}
            <Link href="/connexion" className={buttonClass({ variant: "ghost-light" })}>
              Connexion
            </Link>
            <Link href="/inscription" className={buttonClass({ variant: "gold" })}>
              Créer un compte
            </Link>
          </nav>

          <MobileMenu items={NAV} />
        </Container>
      </header>

      <main id="contenu">
        {/* ─── Héros : la scène ─────────────────────────────────────────── */}
        <section className="relative isolate overflow-hidden bg-nuit pb-16 pt-28 sm:pt-32 lg:pb-24">
          {/* Un projecteur de scène, discret, en haut à droite */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(55% 60% at 80% 0%, rgba(240,185,58,0.17), transparent 70%)",
            }}
          />
          <Container>
            <div>
              <h1 className="max-w-xl text-balance font-display text-[2.55rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[4.1rem]">
                Faites voter votre public, résultat en direct.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-lavande">
                Présentez vos candidates, laissez le public voter gratuitement ou acheter ses votes par Mobile Money,
                et regardez le classement se mettre à jour en direct.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/inscription" variant="gold" size="lg">
                  Créer mon concours
                </ButtonLink>
                <a
                  href="#fonctionnement"
                  className={`${buttonClass({ variant: "ghost-light", size: "lg" })} border border-white/20`}
                >
                  Voir comment ça marche
                </a>
              </div>
              <p className="mt-6 max-w-md text-sm text-lavande/80">
                Pas d&apos;abonnement : {SITE_NAME} prélève une commission uniquement sur les votes payants. Le vote gratuit est sans frais.
              </p>
            </div>
          </Container>
        </section>

        {/* ─── Comment voter : une vraie suite d'étapes ─────────────────── */}
        <Suspense fallback={null}>
          <OpenContests />
        </Suspense>

        <section id="fonctionnement" className="scroll-mt-6 bg-white py-20 sm:py-24">
          <Container>
            <h2 className="max-w-2xl text-balance font-display text-3xl font-semibold tracking-tight text-nuit sm:text-4xl">
              Voter en trois étapes, depuis votre téléphone
            </h2>
            <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {STEPS.map((s, i) => (
                <li
                  key={s.title}
                  className="border-l-2 border-prune pl-6 md:border-l-0 md:border-t-2 md:pl-0 md:pt-6"
                >
                  <span className="font-display text-5xl font-semibold leading-none text-prune">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-nuit">{s.title}</h3>
                  <p className="mt-2 max-w-xs leading-relaxed text-encre-2">{s.text}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* ─── Organisateurs ────────────────────────────────────────────── */}
        <section id="organisateurs" className="scroll-mt-6 py-20 sm:py-24">
          <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-12">
                <h2 className="text-balance font-display text-3xl font-semibold tracking-tight text-nuit sm:text-4xl">
                  Un concours que vous contrôlez de bout en bout
                </h2>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-encre-2">
                  Créez votre concours, publiez-le, et laissez la plateforme compter les votes pendant que vous
                  vous concentrez sur l&apos;événement.
                </p>
                <div className="mt-8">
                  <ButtonLink href="/inscription" variant="primary" size="lg">
                    Créer mon compte organisateur
                  </ButtonLink>
                </div>
              </div>
            </div>

            <ul className="divide-y divide-trait border-y border-trait lg:col-span-7">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-5 py-7">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-prune-50 text-prune">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-nuit">{title}</h3>
                    <p className="mt-1 max-w-lg leading-relaxed text-encre-2">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      </main>

      <footer className="mt-auto bg-nuit py-12">
        <Container className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Brand tone="light" />
            <p className="mt-3 max-w-sm text-sm text-lavande">
              Le vote en ligne pour les concours de Miss, de talents et d&apos;élections.
            </p>
          </div>
          <nav aria-label="Accès rapide" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/connexion" className="text-lavande hover:text-white">
              Connexion
            </Link>
            <Link href="/inscription" className="text-lavande hover:text-white">
              Créer un compte
            </Link>
            <Link href="/aide" className="text-lavande hover:text-white">Aide</Link>
            <Link href="/conditions" className="text-lavande hover:text-white">Conditions</Link>
            <Link href="/confidentialite" className="text-lavande hover:text-white">Confidentialité</Link>
            <Link href="/remboursement" className="text-lavande hover:text-white">Remboursement</Link>
            <Link href="/mentions-legales" className="text-lavande hover:text-white">Mentions légales</Link>
          </nav>
        </Container>
      </footer>
    </>
  );
}
