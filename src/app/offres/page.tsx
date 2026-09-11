import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ContactBande } from "@/components/sections/ContactBande";
import { Reveal } from "@/components/Reveal";
import { getContent } from "@/cms/content";
import { IMAGE_OG } from "@/lib/seo";
import { DonneesStructurees } from "@/components/DonneesStructurees";
import { filDAriane, service } from "@/lib/schema";
import { FilDAriane } from "@/components/FilDAriane";

/**
 * Période de revalidation déclarée sur la page elle-même, et pas seulement
 * héritée de la requête au CMS.
 *
 * Sans cela, une page construite alors que WORDPRESS_API_URL n'était pas encore
 * renseignée ne comporte aucune requête, donc aucune période de revalidation :
 * elle reste figée pour toujours, et brancher le CMS ensuite ne change rien
 * tant qu'on n'a pas redéployé. Le symptôme est trompeur — WordPress répond
 * correctement, le site ignore simplement qu'il doit se relire.
 */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Lobbying territorial et affaires publiques",
  description:
    "Lobbying territorial, représentation d'intérêts, aides publiques, communication d'influence : les six terrains d'intervention de Kastell Conseil.",
  alternates: { canonical: "/offres" },
  openGraph: {
    title: "Lobbying territorial et affaires publiques | Kastell Conseil",
    description:
      "Les six terrains d'intervention du cabinet, de la représentation d'intérêts à la communication de crise.",
    url: "/offres",
    images: [IMAGE_OG],
  },
};

export default async function OffresPage() {
  const { offers, offersSection } = await getContent();
  return (
    <div className="w-full overflow-x-clip">
      {/* Chaque offre est décrite comme une prestation distincte, rattachée au
          même cabinet : c'est ce qui permet à un moteur de répondre « qui fait
          du lobbying territorial en Bretagne ? » par une offre précise. */}
      <DonneesStructurees
        noeuds={[
          ...offers.map((offre) => service(offre.title, offre.summary, offre.slug)),
          filDAriane([
            { nom: "Accueil", chemin: "/" },
            { nom: offersSection.pageTitle, chemin: "/offres" },
          ]),
        ]}
      />
      <Header />
      <main id="contenu">
        <section className="shell pb-[clamp(40px,6vw,72px)] pt-[clamp(56px,9vw,120px)]">
          <Reveal immediat className="flex max-w-[min(900px,92%)] flex-col items-start">
            <FilDAriane
              etapes={[
                { nom: "Accueil", chemin: "/" },
                { nom: "Offres", chemin: "/offres" },
              ]}
            />
            {/* Le fil d'Ariane se termine déjà par « Offres » : répéter le
                même mot juste en dessous n'apprend rien et se voit. L'intitulé
                reparaît dès que l'éditeur en choisit un autre. */}
            {offersSection.eyebrow.trim().toLowerCase() === "offres" ? null : (
              <p className="eyebrow-tight mb-[clamp(20px,3vw,32px)]">
                {offersSection.eyebrow}
              </p>
            )}
            <h1 className="h1">{offersSection.pageTitle}</h1>
            <p className="body-lg mt-[clamp(24px,3vw,36px)] max-w-[56ch]">
{offersSection.pageIntro}
            </p>
          </Reveal>
        </section>

        {offers.map((offer, i) => (
          <section
            key={offer.slug}
            id={offer.slug}
            className={`hairline-top ${
              i % 2 === 1 ? "bg-accent-tint" : ""
            }`}
          >
            <div className="shell band-md">
              {/* La première offre entre dans le premier écran en téléphone :
                  son résumé y devenait l'élément de plus grande peinture, et
                  attendait l'hydratation. Mesuré à 2,25 s. */}
              <Reveal
                immediat={i === 0}
                index={i}
                className="grid-auto items-start gap-[clamp(32px,6vw,90px)]"
              >
                <div>
                  <p className="offer-index mb-[18px] block">
                    {offer.index}
                  </p>
                  <h2 className="h2 max-w-[16ch]">{offer.title}</h2>
                </div>
                <div className="max-w-[60ch]">
                  <p className="body-lg">{offer.summary}</p>

                  {/* Un lien « mailto » ne fait rien chez qui n'a pas de
                      logiciel de messagerie configuré — c'est-à-dire chez la
                      plupart des visiteurs sur navigateur. Le bouton mène
                      désormais au formulaire, en emportant l'offre lue : la
                      demande arrive déjà qualifiée. */}
                  <Link
                    href={`/contact?objet=${encodeURIComponent(offer.title)}#contact`}
                    className="pill pill-outline mt-[clamp(22px,2.6vw,30px)]"
                  >
                    {offersSection.offreCta} <span aria-hidden>→</span>
                  </Link>

                  {offer.bullets && offer.bullets.length > 0 ? (
                    <div className="mt-[clamp(28px,3.4vw,40px)] border-t border-accent-line pt-[22px]">
                      <p className="eyebrow-tight mb-[16px]">
                        {offersSection.bulletsHeading}
                      </p>
                      <ul className="m-0 flex list-none flex-col gap-[10px] p-0">
                        {offer.bullets.map((item) => (
                          <li key={item} className="offer-bullet">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {offer.note ? (
                    <p className="mt-[18px] font-sans text-[14px] italic text-sage">
                      {offer.note}
                    </p>
                  ) : null}

                  {offer.caseStudy ? (
                    <div className="mt-[clamp(24px,3vw,34px)] rounded-[12px] border border-accent-line bg-accent-tint p-[clamp(18px,2.2vw,26px)]">
                      <p className="eyebrow-tight mb-2">Cas pratique</p>
                      <p className="m-0 font-serif text-[clamp(19px,1.7vw,23px)] leading-[1.3] text-forest">
                        {offer.caseStudy.title}
                      </p>
                      <p className="body-lg mt-2 text-[16px]">
                        {offer.caseStudy.body}
                      </p>
                    </div>
                  ) : null}
                </div>
              </Reveal>
            </div>
          </section>
        ))}

        <section className="hairline-top">
          <div className="shell band-md">
            <Reveal className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-5">
              <p className="eyebrow-tight">{offersSection.backLabel}</p>
              <Link href="/" className="pill pill-outline">
                {offersSection.backCta} <span aria-hidden>→</span>
              </Link>
            </Reveal>
          </div>
        </section>

        <ContactBande />
      </main>
      <Footer />
    </div>
  );
}
