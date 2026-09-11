import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { getContent } from "@/cms/content";
import { estUtile } from "@/lib/lien";

export async function News() {
  const { founder, news, posts, site } = await getContent();
  const profil = estUtile(site.linkedinProfile) ? site.linkedinProfile : null;
  return (
    <section className="hairline-top bg-sand">
      <div className="shell band-md">
        <Reveal className="mb-[clamp(28px,3.5vw,44px)] flex flex-wrap items-center justify-between gap-x-10 gap-y-[18px]">
          <div className="flex items-center gap-[14px]">
            <span
              aria-hidden
              className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-forest font-sans text-[14px] font-semibold text-bone"
            >
              in
            </span>
            <h2 className="m-0 font-serif text-[clamp(26px,2.8vw,38px)] font-normal leading-[1.1] text-forest">
              {news.heading}
            </h2>
          </div>
          {profil ? (
            <a
              href={profil}
              target="_blank"
              rel="noopener noreferrer"
              className="pill pill-outline px-[22px] py-[13px] text-[12px]"
            >
              {news.followCta} <span aria-hidden>↗</span>
              <span className="sr-only"> (nouvelle fenêtre)</span>
            </a>
          ) : null}
        </Reveal>

        {/* Grille imbriquée : sans elle, chaque carte plaçait son visuel et
            son lien à une hauteur différente, au gré de la longueur du texte.
            Les quatre bandes — auteur, texte, visuel, lien — sont désormais
            alignées d'une carte à l'autre. */}
        <Reveal
          index={1}
          className="news-grille grid gap-[clamp(18px,2vw,28px)] [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))]"
        >
          {/* La date ne fait pas une clé : deux posts publiés le même jour la
              partagent, et React confondrait alors les deux cartes. */}
          {posts.map((post, i) => {
            /* Sans lien vers le post, la carte reste une carte : la rendre
               cliquable n'aboutirait qu'à faire remonter la page. */
            const lien = estUtile(post.href) ? post.href : null;
            const Boite = lien ? "a" : "div";
            return (
            <Boite
              key={`${post.date}-${i}`}
              {...(lien
                ? { href: lien, target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className={`news-card rounded-[14px] border border-[rgba(25,41,36,0.14)] bg-white p-[clamp(18px,2vw,23px)] ${
                lien ? "hover:border-sage" : ""
              }`}
            >
              <div className="mb-[17px] flex items-center gap-3">
                <Image
                  src={founder.photoUrl ?? founder.photo}
                  alt=""
                  aria-hidden
                  width={798}
                  height={1200}
                  sizes="42px"
                  className="h-[42px] w-[42px] shrink-0 rounded-full bg-sand object-cover"
                />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-sans text-[15px] font-semibold text-forest">
                    {founder.name}
                  </span>
                  <span className="font-sans text-[13px] text-dim">
                    {post.date}
                  </span>
                </div>
                <span
                  aria-hidden
                  className="ml-auto font-sans text-[14px] font-semibold tracking-[0.04em] text-sage"
                >
                  in
                </span>
              </div>

              <p className="m-0 mb-[17px] text-[16px] leading-[1.55] text-graphite">
                {post.excerpt}
              </p>

              {/* Visuel et lien voyagent ensemble dans la même rangée : le
                  lien colle au bas du visuel au lieu d'être renvoyé en pied de
                  carte, et le jeu qui reste — les visuels n'ont pas tous la
                  même hauteur — se range sous le lien, là où il ne troue rien. */}
              <div className="news-bas">
                {/* Le visuel du post quand il existe, l'aplat sinon : une carte
                    sans image reste une carte, elle ne se replie pas. */}
                {post.image ? (
                  /* Aucune bande d'accueil : c'est le visuel qui donne sa
                     hauteur, si bien qu'aucun format ne peut creuser un vide
                     sous lui. Une une de magazine est verticale, une coupure
                     de presse presque carrée : seul un plafond les empêche de
                     dévorer la carte. Le filet, lui, détache une coupure à
                     fond blanc de la carte, blanche elle aussi.
                     Balise native : le format du fichier téléversé dans
                     WordPress n'est pas connu au rendu. */
                  <span className="news-visuel flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.image}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      decoding="async"
                      className="block w-auto max-w-full rounded-[10px] border border-[rgba(25,41,36,0.12)]"
                    />
                  </span>
                ) : (
                  <span className="news-visuel flex aspect-[4/3] items-end rounded-[9px] border border-[rgba(25,41,36,0.1)] bg-sand p-3 font-mono text-[11px] text-muted">
                    {news.previewLabel}
                  </span>
                )}

                {lien ? (
                  <span className="mt-[17px] block font-sans text-[13px] font-medium uppercase tracking-[0.1em] text-forest">
                    {news.postCta} <span aria-hidden>→</span>
                    <span className="sr-only"> (nouvelle fenêtre)</span>
                  </span>
                ) : null}
              </div>
            </Boite>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
