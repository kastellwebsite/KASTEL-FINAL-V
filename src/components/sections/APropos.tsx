import Image from "next/image";
import { ListeDepliable } from "@/components/ListeDepliable";
import { Reveal } from "@/components/Reveal";
import { site } from "@/content/site";
import { getContent } from "@/cms/content";
import Link from "next/link";
import { estInterne, estUtile } from "@/lib/lien";

export async function APropos() {
  const { about, founder, press, publications } = await getContent();
  const portrait = founder.photoUrl;
  const profil = estUtile(site.linkedinProfile) ? site.linkedinProfile : null;
  return (
    <section id="apropos" className="band-dark">
      <div className="shell band-lg">
        <div className="grid items-start gap-[clamp(32px,5vw,80px)] [grid-template-columns:minmax(220px,0.72fr)_minmax(280px,1.28fr)] max-[820px]:[grid-template-columns:1fr]">
          {/* Solidaire du défilement : la biographie est bien plus haute que le
              portrait et sa citation, qui laissaient sinon un creux de plusieurs
              centaines de pixels. */}
          <div className="apropos-colonne flex flex-col min-[821px]:sticky min-[821px]:top-[calc(var(--header-h,75px)+40px)] min-[821px]:self-start">
            <Reveal
              as="figure"
              className="relative m-0 flex min-h-[clamp(300px,30vw,430px)] items-end overflow-hidden border border-[rgba(226,240,248,0.14)] bg-[rgba(226,240,248,0.06)] p-6 [background-image:repeating-linear-gradient(135deg,rgba(226,240,248,0.06)_0_2px,transparent_2px_12px)]"
          >
            {portrait ? (
              <Image
                src={portrait}
                alt={`Portrait de ${founder.name}, présidente fondatrice de Kastell Conseil`}
                fill
                sizes="(max-width: 820px) 100vw, 30vw"
                className="portrait-img object-cover"
              />
            ) : (
              <figcaption className="m-0 font-mono text-[12px] leading-[1.6] text-[rgba(226,240,248,0.6)]">
                {about.portraitPlaceholder[0]}
                <br />
                {about.portraitPlaceholder[1]}
              </figcaption>
            )}
            </Reveal>

            <Reveal
              index={2}
              className="apropos-citation mt-[clamp(26px,3vw,38px)]"
            >
              <blockquote className="m-0 border-l-2 border-accent pl-[clamp(18px,2vw,26px)]">
                <p className="m-0 font-serif text-[clamp(19px,1.7vw,25px)] font-normal italic leading-[1.42] text-white">
                  {founder.quote}
                </p>
              </blockquote>

              {profil ? (
                <a
                  href={profil}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press-link mt-[clamp(20px,2.4vw,28px)] inline-flex items-center gap-2 rounded-full border border-[rgba(226,240,248,0.4)] px-6 py-3 font-sans text-[13px] font-medium uppercase tracking-[0.1em] text-white hover:border-white hover:bg-[rgba(226,240,248,0.1)]"
                >
                  {founder.linkedinCta}
                  <span className="inline-block" aria-hidden>
                    ↗
                  </span>
                  <span className="sr-only"> (nouvelle fenêtre)</span>
                </a>
              ) : null}
            </Reveal>
          </div>

          <Reveal index={1}>
            <p className="eyebrow-dark mb-[22px]">{about.eyebrow}</p>
            <h2 className="m-0 mb-2 font-serif text-[clamp(33px,3.8vw,52px)] font-normal leading-[1.14] text-white">
              {founder.name}
            </h2>
            <p className="m-0 mb-[clamp(28px,3.5vw,40px)] font-sans text-[16px] uppercase tracking-[0.1em] text-frost">
              {founder.role}
            </p>

            {founder.bio.map((paragraph, i) => (
              <p
                key={i}
                className={`body-dark max-w-[56ch] ${
                  i === founder.bio.length - 1
                    ? "mb-[clamp(30px,4vw,44px)]"
                    : "mb-5"
                }`}
              >
                {paragraph}
              </p>
            ))}
          </Reveal>
        </div>

        {/* Deux bandes pleine largeur plutôt que deux colonnes côte à côte :
            les listes n'ont pas le même nombre d'entrées, et les mettre en
            regard laissait un vide sous la plus courte. */}
        <div className="mt-[clamp(48px,6vw,80px)] border-t border-[rgba(226,240,248,0.2)] pt-[22px]">
          <p className="eyebrow-dark mb-[20px] text-[12px] font-medium tracking-[0.22em]">
            {about.pressHeading}
          </p>
          <ListeDepliable
            seuil={3}
            plus={about.pressPlus}
            moins={about.pressMoins}
            className="grid gap-[clamp(16px,2vw,26px)] [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]"
          >
            {press.map((article) => (
              <a
                key={article.href}
                href={article.href}
                target="_blank"
                rel="noopener noreferrer"
                className="press-link flex h-full flex-col gap-[14px] text-[15px] leading-[1.5] text-[rgba(226,240,248,0.82)] hover:text-white"
              >
                {article.logoUrl ? (
                  /* Hauteur imposée, largeur libre : les logos de presse vont
                     du bandeau très large au carré, et un cadre unique
                     réduisait les seconds à une vignette perdue dans du blanc.
                     Balise native parce que la taille réelle du fichier,
                     téléversé dans WordPress, n'est pas connue au rendu. */
                  <span className="press-logo flex h-[64px] w-fit min-w-[64px] max-w-[168px] shrink-0 self-start items-center justify-center overflow-hidden rounded-[8px] bg-bone px-3.5 py-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.logoUrl}
                      alt={article.outlet}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-auto max-w-full object-contain"
                    />
                  </span>
                ) : (
                  <span className="flex h-[64px] w-fit min-w-[64px] max-w-[168px] shrink-0 self-start items-center justify-center rounded-[8px] border border-[rgba(115,193,103,0.35)] bg-[rgba(115,193,103,0.12)] px-3 text-center font-sans text-[11px] uppercase leading-[1.2] tracking-[0.06em] text-accent">
                    {article.outlet}
                  </span>
                )}
                <span>
                  {article.title}{" "}
                  <span className="inline-block" aria-hidden>
                    ↗
                  </span>
                  <span className="sr-only"> (nouvelle fenêtre)</span>
                </span>
              </a>
            ))}
          </ListeDepliable>
        </div>

        <div className="mt-[clamp(40px,5vw,64px)] border-t border-[rgba(226,240,248,0.2)] pt-[22px]">
          <p className="eyebrow-dark mb-[20px] text-[12px] font-medium tracking-[0.22em]">
            {about.publicationsHeading}
          </p>
          <ListeDepliable
            seuil={3}
            plus={about.publicationsPlus}
            moins={about.publicationsMoins}
            className="grid gap-[clamp(22px,3vw,40px)] [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]"
          >
            {publications.map((item) => (
              <div
                key={item.href}
                className="publication flex h-full flex-col items-start"
              >
                <p className="m-0 mb-1.5 font-sans text-[11px] uppercase tracking-[0.18em] text-frost">
                  {item.label}
                </p>
                <p className="m-0 mb-1.5 font-serif text-[clamp(19px,1.7vw,24px)] leading-[1.25] text-white">
                  {item.title}
                </p>
                <p className="m-0 mb-2.5 max-w-[46ch] text-[15px] leading-[1.6] text-[rgba(226,240,248,0.72)]">
                  {item.context}
                </p>
                {item.objectives?.length ? (
                  <ol className="m-0 mb-2.5 flex max-w-[46ch] list-decimal flex-col gap-1.5 pl-[18px] text-[15px] leading-[1.55] text-[rgba(226,240,248,0.72)] marker:text-frost">
                    {item.objectives.map((objectif) => (
                      <li key={objectif}>{objectif}</li>
                    ))}
                  </ol>
                ) : null}
                {/* Le visuel, quand il existe : la photo de l'article paru en
                    presse écrite, la couverture du média. Il garde ses
                    proportions — un journal photographié n'a pas le format
                    d'une couverture — et son plafond se mesure sur la carte.
                    Balise native : le format du fichier téléversé dans
                    WordPress n'est pas connu au rendu. */}
                {item.image ? (
                  <span className="publication-visuel mb-3.5 flex">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      decoding="async"
                      className="block w-auto max-w-full rounded-[10px] border border-[rgba(226,240,248,0.18)]"
                    />
                  </span>
                ) : null}

                {/* Une section du site reste dans l'onglet : ouvrir une fenêtre
                    pour descendre plus bas dans la page n'aurait aucun sens, et
                    la flèche doit dire où l'on va. */}
                {estInterne(item.href) ? (
                  <Link
                    href={item.href}
                    className="press-link hit-area mt-auto inline-block pt-1 font-sans text-[13px] font-medium uppercase tracking-[0.1em] text-[rgba(226,240,248,0.9)] hover:text-white"
                  >
                    {item.cta}{" "}
                    <span className="inline-block" aria-hidden>
                      ↓
                    </span>
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="press-link hit-area mt-auto inline-block pt-1 font-sans text-[13px] font-medium uppercase tracking-[0.1em] text-[rgba(226,240,248,0.9)] hover:text-white"
                  >
                    {item.cta}{" "}
                    <span className="inline-block" aria-hidden>
                      ↗
                    </span>
                    <span className="sr-only"> (nouvelle fenêtre)</span>
                  </a>
                )}
              </div>
            ))}
          </ListeDepliable>
        </div>
      </div>
    </section>
  );
}
