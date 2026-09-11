import Link from "next/link";
import { FilDAriane } from "@/components/FilDAriane";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Reveal } from "@/components/Reveal";

/** Un paragraphe, ou une liste à puces quand les éléments s'énumèrent. */
export type LegalLine = string | string[];
export type LegalBlock = { heading: string; body: LegalLine[] };

/**
 * Gabarit commun aux pages légales. Le contenu réel relève de l'éditeur du
 * site : ce qui reste à compléter est marqué entre crochets plutôt que rempli
 * d'un texte inventé.
 */
export function LegalPage({
  title,
  chemin,
  intro,
  blocks,
}: {
  title: string;
  /** Adresse de la page, pour le fil d'Ariane. */
  chemin: string;
  intro: string;
  blocks: LegalBlock[];
}) {
  return (
    <div className="w-full overflow-x-clip">
      <Header />
      <main id="contenu">
        <section className="shell pb-[clamp(40px,6vw,72px)] pt-[clamp(48px,8vw,104px)]">
          <Reveal immediat className="max-w-[70ch]">
            <FilDAriane
              etapes={[
                { nom: "Accueil", chemin: "/" },
                { nom: title, chemin },
              ]}
            />
            <p className="eyebrow-tight mb-[clamp(18px,2.5vw,28px)]">
              Informations
            </p>
            <h1 className="h1">{title}</h1>
            <p className="body-lg mt-[clamp(22px,3vw,32px)]">{intro}</p>
          </Reveal>
        </section>

        <section className="hairline-top">
          <div className="shell band-md">
            <div className="flex max-w-[70ch] flex-col gap-[clamp(30px,4vw,46px)]">
              {blocks.map((block, i) => (
                <Reveal key={block.heading} index={i}>
                  <h2 className="m-0 mb-3 font-serif text-[clamp(22px,2.2vw,30px)] font-normal leading-[1.2] text-forest">
                    {block.heading}
                  </h2>
                  {block.body.map((line, j) =>
                    Array.isArray(line) ? (
                      <ul
                        key={j}
                        className="m-0 mb-3 flex list-disc flex-col gap-[6px] pl-[22px] last:mb-0 marker:text-sage"
                      >
                        {line.map((item) => (
                          <li key={item} className="body-lg">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p key={j} className="body-lg mb-3 last:mb-0">
                        {line}
                      </p>
                    ),
                  )}
                </Reveal>
              ))}
            </div>

            <div className="mt-[clamp(40px,5vw,64px)]">
              <Link href="/" className="pill pill-outline">
                Revenir à l&apos;accueil <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
