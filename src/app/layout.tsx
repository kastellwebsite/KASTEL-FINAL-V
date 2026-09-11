import type { Metadata } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import { BandeauApercu } from "@/components/BandeauApercu";
import {
  DESCRIPTION_ACCUEIL,
  TITRE_ACCUEIL,
  entite,
  estProduction,
  urlSite,
  verifications,
} from "@/lib/seo";
import "./globals.css";

/*
 * Sous-ensemble « latin » seul, sans « latin-ext ».
 *
 * Les deux étaient demandés, et next/font préchargeait donc six fichiers au
 * lieu de trois — 27,5 ko sur 87,6, réclamés en priorité haute avant même la
 * feuille de style. Or `latin-ext` couvre les lettres d'Europe centrale et du
 * vietnamien : relevé sur les sept pages du site, pas un seul caractère
 * affiché n'en relève. Ces trois fichiers étaient téléchargés pour rien, et
 * retardaient la feuille de style sur une connexion mobile.
 *
 * « latin » couvre tout le français, y compris œ, Œ, æ, Æ, les guillemets et
 * l'apostrophe typographique — vérifié caractère par caractère.
 *
 * Rien n'est perdu pour autant : les fichiers « latin-ext » restent déclarés
 * dans la feuille de style, avec leur plage de caractères. Si un contenu vient
 * un jour à porter un nom en alphabet latin étendu — Łódź, Škoda —, le
 * navigateur va chercher le fichier à ce moment-là et le rend dans la bonne
 * police. Vérifié en insérant ces mots dans la page : le quatrième fichier est
 * bien demandé. La seule chose qui change est qu'on ne le télécharge plus
 * d'avance, sur toutes les pages, pour rien.
 */
const sans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

/*
 * Le titre par défaut et le gabarit portent « Kastell Conseil », nom d'usage
 * du cabinet. La description reste sous 155 caractères, seuil au-delà duquel
 * Google la tronque en plein milieu.
 *
 * Aucune canonique ici, volontairement : posée à la racine, elle serait
 * héritée par toute page qui n'en déclare pas, et une page nouvelle se
 * présenterait alors comme un doublon de l'accueil. Chaque page déclare la
 * sienne.
 */
export const metadata: Metadata = {
  metadataBase: new URL(urlSite),
  title: {
    default: TITRE_ACCUEIL,
    template: "%s | Kastell Conseil",
  },
  description: DESCRIPTION_ACCUEIL,
  openGraph: {
    title: TITRE_ACCUEIL,
    description: DESCRIPTION_ACCUEIL,
    url: "/",
    siteName: entite.nom,
    locale: "fr_FR",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  /* Une balise portant une chaîne « TODO » vaudrait une vérification ratée :
     sans jeton, pas de balise. */
  ...(verifications.google || verifications.bing
    ? {
        verification: {
          ...(verifications.google ? { google: verifications.google } : {}),
          ...(verifications.bing ? { other: { "msvalidate.01": verifications.bing } } : {}),
        },
      }
    : {}),
  /* Hors production, aucun moteur ne doit retenir ces pages : une preview
     porte le même contenu que le site et en deviendrait un duplicata. */
  ...(estProduction ? {} : { robots: { index: false, follow: false } }),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${sans.variable} ${serif.variable}`}>
      <body className="font-sans">
        <a href="#contenu" className="skip-link">
          Aller au contenu
        </a>
        <BandeauApercu />
        {children}
      </body>
    </html>
  );
}
