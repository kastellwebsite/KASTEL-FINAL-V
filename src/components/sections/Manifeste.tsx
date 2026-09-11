import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { TelechargerManifeste } from "@/components/TelechargerManifeste";
import { getContent } from "@/cms/content";

/**
 * Bande de fin de page : le manifeste du RIT présenté comme un document, sa
 * couverture à gauche et son texte à droite.
 *
 * Tant qu'aucun visuel n'est téléversé, la couverture est composée dans le DOM
 * plutôt qu'importée en image : elle hérite ainsi des fontes du site, reste
 * nette à toute résolution et ne coûte aucun octet supplémentaire. Dès qu'un
 * vrai fichier arrive dans le studio, il prend sa place sans toucher au reste.
 */
export async function Manifeste() {
  const { manifesto } = await getContent();

  return (
    <section id="manifeste" className="hairline-top bg-accent-tint">
      <div className="shell band-md">
        <div className="grid items-center gap-[clamp(36px,6vw,88px)] [grid-template-columns:minmax(230px,0.62fr)_minmax(320px,1.38fr)] max-[860px]:[grid-template-columns:1fr]">
          <Reveal className="mx-auto w-full max-w-[min(74vw,352px)]">
            {manifesto.coverUrl ? (
              <Image
                src={manifesto.coverUrl}
                alt={`Couverture du manifeste ${manifesto.title}`}
                width={500}
                height={707}
                sizes="(max-width: 860px) 74vw, 352px"
                className="manifeste-couv block h-auto w-full"
              />
            ) : (
              /* Le titre est déjà porté par le <h2> voisin : la couverture
                 composée est décorative et masquée aux lecteurs d'écran. */
              <div className="manifeste-couv" aria-hidden>
                <div className="manifeste-couv-bloc">
                  <p className="manifeste-couv-titre">
                    {manifesto.cover.lines.map((ligne) => (
                      <span key={ligne} className="block">
                        {ligne}
                      </span>
                    ))}
                  </p>
                  <p className="manifeste-couv-sous">
                    {manifesto.cover.subtitle.split("\n").map((ligne) => (
                      <span key={ligne} className="block">
                        {ligne}
                      </span>
                    ))}
                  </p>
                </div>
                <div className="manifeste-couv-carte" />
                <p className="manifeste-couv-marque">{manifesto.cover.mark}</p>
              </div>
            )}
          </Reveal>

          <Reveal index={1}>
            <p className="eyebrow-rule mb-[clamp(18px,2vw,24px)]">{manifesto.eyebrow}</p>
            <h2 className="m-0 mb-[clamp(18px,2.2vw,26px)] font-serif text-[clamp(32px,4vw,54px)] font-normal leading-[1.12] text-forest">
              {manifesto.title}
            </h2>
            <p className="body-lg mb-[clamp(24px,3vw,34px)] max-w-[62ch]">{manifesto.intro}</p>

            {manifesto.tags.length ? (
              <ul className="m-0 mb-[clamp(24px,3vw,34px)] flex list-none flex-wrap gap-2.5 p-0">
                {manifesto.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-[rgba(53,117,43,0.28)] bg-bone px-4 py-2 font-sans text-[12px] font-medium uppercase tracking-[0.12em] text-sage"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}

            <p className="eyebrow-tight mb-[clamp(14px,1.6vw,20px)] text-[13px] tracking-[0.2em]">
              {manifesto.objectivesHeading}
            </p>
            <ol className="manifeste-liste m-0 mb-[clamp(28px,3.4vw,40px)] grid list-none gap-x-[clamp(24px,3vw,48px)] gap-y-[clamp(14px,1.8vw,22px)] p-0 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
              {manifesto.objectives.map((objectif) => (
                <li
                  key={objectif}
                  className="text-[clamp(15px,1.1vw,17px)] leading-[1.6] text-graphite"
                >
                  {objectif}
                </li>
              ))}
            </ol>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              {/* Le bouton de téléchargement n'existe que si le document
                  existe : sinon le lien LinkedIn reprend l'appel principal. */}
              {manifesto.download.fileUrl ? (
                <TelechargerManifeste textes={manifesto.download} />
              ) : null}
              <a
                href={manifesto.href}
                target="_blank"
                rel="noopener noreferrer"
                className={manifesto.download.fileUrl ? "pill pill-outline" : "pill pill-solid"}
              >
                {manifesto.cta}
                <span aria-hidden>↗</span>
                <span className="sr-only"> (nouvelle fenêtre)</span>
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
