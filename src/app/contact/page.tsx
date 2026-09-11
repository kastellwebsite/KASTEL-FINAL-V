import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Contact } from "@/components/sections/Contact";
import { Reveal } from "@/components/Reveal";
import { contact, site } from "@/content/site";
import { IMAGE_OG } from "@/lib/seo";
import { DonneesStructurees } from "@/components/DonneesStructurees";
import { filDAriane } from "@/lib/schema";
import { FilDAriane } from "@/components/FilDAriane";

/* Voir src/app/page.tsx : une page construite sans le CMS ne comporte aucune
   requête, donc aucune période de revalidation, et resterait figée. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: contact.page.title,
  description:
    "Écrivez au cabinet Kastell Conseil : affaires publiques et lobbying territorial à Lamballe, Rennes et dans toute la Bretagne. Réponse sous 48 h.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `${contact.page.title} | ${site.name}`,
    description:
      "Affaires publiques et lobbying territorial à Lamballe, Rennes et dans toute la Bretagne.",
    url: "/contact",
    images: [IMAGE_OG],
  },
};

/*
 * Lire searchParams côté serveur faisait basculer cette page en rendu à la
 * demande : elle était la seule du site à ne pas être servie depuis le cache
 * de bordure, pour un confort — le sujet pré-choisi — qui ne vaut pas ce prix.
 * Le paramètre est désormais lu par le formulaire lui-même, après affichage.
 * Le champ se remplit une image après, ce qui ne se voit pas, et la page
 * redevient statique.
 */
export default function Page() {
  return (
    <div className="w-full overflow-x-clip">
      <DonneesStructurees
        noeuds={[
          filDAriane([
            { nom: "Accueil", chemin: "/" },
            { nom: contact.page.title, chemin: "/contact" },
          ]),
        ]}
      />
      <Header />
      {/* Page d'une seule teinte : l'en-tête clair et la bande sombre du
          formulaire se coupaient en deux au milieu de l'écran. */}
      <main id="contenu" className="band-dark">
        <section className="shell pb-[clamp(28px,3.5vw,44px)] pt-[clamp(44px,7vw,92px)]">
          <Reveal immediat className="max-w-[60ch]">
            <FilDAriane
              sombre
              etapes={[
                { nom: "Accueil", chemin: "/" },
                { nom: contact.page.title, chemin: "/contact" },
              ]}
            />
            <p className="eyebrow-dark mb-[clamp(16px,2vw,24px)] text-[13px] font-medium tracking-[0.22em]">
              {contact.page.eyebrow}
            </p>
            <h1 className="h1 text-white">{contact.page.title}</h1>
            <p className="body-dark mt-[clamp(20px,2.6vw,30px)]">{contact.page.intro}</p>
          </Reveal>
        </section>

        <Contact titre={false} />
      </main>
      <Footer />
    </div>
  );
}
