import type { Metadata } from "next";
import Link from "next/link";
import { DonneesStructurees } from "@/components/DonneesStructurees";
import { FilDAriane } from "@/components/FilDAriane";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Reveal } from "@/components/Reveal";
import { lobbying } from "@/content/site";
import { faq, filDAriane } from "@/lib/schema";
import { IMAGE_OG } from "@/lib/seo";

/*
 * Titre complet plutôt que gabarité : « | Kastell Conseil » ajouté au titre de
 * page portait l'ensemble à 75 caractères, soit quinze de trop. Celui-ci en
 * fait 50, mot-clé d'abord, territoire ensuite.
 */
const TITRE = "Lobbying territorial en Bretagne | Kastell Conseil";

export const metadata: Metadata = {
  title: { absolute: TITRE },
  description:
    "Qu'est-ce que le lobbying territorial ? Définition, cadre légal et raisons de le pratiquer depuis son territoire, par un cabinet installé en Bretagne.",
  alternates: { canonical: "/lobbying-territorial" },
  openGraph: {
    title: TITRE,
    description:
      "Définition, cadre légal et raisons de pratiquer le lobbying territorial depuis son territoire, par un cabinet installé en Bretagne.",
    url: "/lobbying-territorial",
    images: [IMAGE_OG],
  },
};

/**
 * Page de référence sur le mot-clé principal du cabinet.
 *
 * Sa structure sert deux lecteurs à la fois. Un visiteur y trouve une
 * définition et le cadre légal de la pratique. Un moteur — de recherche ou
 * génératif — y trouve des réponses directement citables : sous chaque titre,
 * une phrase qui répond à la question posée par ce titre, avant tout
 * développement. C'est cette phrase qu'un aperçu génératif reprend.
 *
 * La date de mise à jour est affichée : elle pèse dans le choix qu'un moteur
 * fait entre deux sources qui disent la même chose.
 */
export default function Page() {
  const dateLisible = new Date(lobbying.misAJour).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full overflow-x-clip">
      <DonneesStructurees
        noeuds={[
          faq(lobbying.faq.map((e) => ({ question: e.question, reponse: e.reponse }))),
          filDAriane([
            { nom: "Accueil", chemin: "/" },
            { nom: lobbying.title, chemin: "/lobbying-territorial" },
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
                { nom: lobbying.title, chemin: "/lobbying-territorial" },
              ]}
            />
            <p className="eyebrow-tight mb-[clamp(20px,3vw,32px)]">{lobbying.eyebrow}</p>
            <h1 className="h1">{lobbying.title}</h1>
            <p className="body-lg mt-[clamp(24px,3vw,36px)] max-w-[62ch]">
              {lobbying.chapo}
            </p>
            <p className="m-0 mt-[clamp(20px,2.4vw,28px)] font-sans text-[13px] uppercase tracking-[0.14em] text-muted">
              Mise à jour le{" "}
              <time dateTime={lobbying.misAJour}>{dateLisible}</time>
            </p>
          </Reveal>
        </section>

        {lobbying.sections.map((section, i) => (
          <section
            key={section.titre}
            className={`hairline-top ${i % 2 === 1 ? "bg-accent-tint" : ""}`}
          >
            <div className="shell band-md">
              <Reveal immediat={i === 0} index={i} className="max-w-[68ch]">
                <h2 className="h2 mb-[clamp(16px,2vw,22px)] max-w-[22ch]">
                  {section.titre}
                </h2>
                {/* Réponse directe, avant tout développement. */}
                <p className="body-lg mb-[clamp(20px,2.4vw,28px)] font-medium text-forest">
                  {section.reponse}
                </p>
                {section.paragraphes.map((p) => (
                  <p key={p} className="body-lg mb-[clamp(14px,1.6vw,20px)]">
                    {p}
                  </p>
                ))}
              </Reveal>
            </div>
          </section>
        ))}

        <section className="hairline-top">
          <div className="shell band-md">
            <Reveal className="max-w-[68ch]">
              <h2 className="h2 mb-[clamp(26px,3vw,38px)]">Questions fréquentes</h2>
              <dl className="m-0 flex flex-col gap-[clamp(24px,3vw,36px)]">
                {lobbying.faq.map((entree) => (
                  <div key={entree.question} className="border-t border-accent-line pt-[20px]">
                    <dt className="m-0 mb-[10px] font-serif text-[clamp(19px,1.8vw,25px)] leading-[1.25] text-forest">
                      {entree.question}
                    </dt>
                    <dd className="body-lg m-0">{entree.reponse}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-[clamp(38px,4.5vw,60px)] flex flex-wrap gap-[14px]">
                <Link href="/offres" className="pill pill-outline">
                  {lobbying.ctaOffres} <span aria-hidden>→</span>
                </Link>
                <Link href="/contact" className="pill pill-solid">
                  {lobbying.ctaContact} <span aria-hidden>→</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
