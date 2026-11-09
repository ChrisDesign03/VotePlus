import { Brand } from "./brand";

// Cadre commun aux pages d'inscription et de connexion.
// Ordinateur : panneau de marque à gauche, formulaire à droite.
// Mobile : le formulaire occupe tout l'écran.
export function AuthShell({
  title,
  subtitle,
  panelTitle,
  panelText,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  panelTitle: string;
  panelText: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[5fr_6fr]">
      <aside className="relative isolate hidden overflow-hidden bg-nuit p-12 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: "radial-gradient(70% 55% at 90% 0%, rgba(240,185,58,0.18), transparent 70%)",
          }}
        />
        <Brand tone="light" />

        <div>
          <h2 className="max-w-md text-balance font-display text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
            {panelTitle}
          </h2>
          <p className="mt-5 max-w-sm text-lg leading-relaxed text-lavande">{panelText}</p>
        </div>

        {/* Le numéro de l'écharpe, signe de la plateforme */}
        <p
          aria-hidden="true"
          className="select-none font-display text-[11rem] font-semibold leading-[0.8] tracking-tighter text-nuit-3"
        >
          07
        </p>
      </aside>

      <main id="contenu" className="flex flex-col">
        <div className="flex h-20 items-center px-5 sm:px-8 lg:hidden">
          <Brand />
        </div>

        <div className="flex flex-1 items-start justify-center px-5 pb-12 pt-4 sm:px-8 lg:items-center lg:py-12">
          <div className="w-full max-w-md">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-nuit sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 text-encre-2">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-8 border-t border-trait pt-6 text-sm text-encre-2">{footer}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
