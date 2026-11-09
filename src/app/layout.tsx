import type { Metadata, Viewport } from "next";
// Polices auto-hébergées : rien n'est téléchargé depuis Google, le site reste rapide et fiable.
import "@fontsource-variable/fraunces/wght.css";
import "@fontsource-variable/hanken-grotesk/wght.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: { siteName: "VotePlus", locale: "fr_CD", type: "website" },
  title: {
    default: "VotePlus · Le vote en ligne pour vos concours",
    template: "%s · VotePlus",
  },
  description:
    "VotePlus : organisez votre concours de Miss ou de talents et laissez le public voter par Mobile Money, avec un classement transparent.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e0a2e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning : certaines extensions de navigateur (traducteur,
    // correcteur, gestionnaire de téléchargements) ajoutent des attributs à <html> et <body>
    // avant le chargement de la page, ce qui déclenchait de faux avertissements « Issues ».
    <html lang="fr" suppressHydrationWarning data-scroll-behavior="smooth" className="h-full">
      <body suppressHydrationWarning className="flex min-h-full flex-col">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-or focus:px-4 focus:py-2 focus:font-semibold focus:text-nuit"
        >
          Aller au contenu
        </a>
        {children}
      </body>
    </html>
  );
}
