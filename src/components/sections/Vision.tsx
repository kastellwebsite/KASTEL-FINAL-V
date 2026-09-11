import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { vision as reglages } from "@/content/site";
import { findPublicAsset } from "@/lib/asset";
import { getContent } from "@/cms/content";

/** Fond optionnel : réglage du dépôt, vide par défaut depuis que la carte sert au héros. */
const backdrop = reglages.backdrop ? findPublicAsset(reglages.backdrop) : null;

export async function Vision() {
  const { vision } = await getContent();
  return (
    <section
      id="vision"
      /* overflow-clip et non overflow-hidden : `hidden` fait de la section un
         conteneur de défilement, ce qui neutralise le positionnement collant de
         la colonne de gauche. `clip` rogne le visuel de fond sans cet effet. */
      className="relative overflow-clip border-t border-[rgba(53,117,43,0.2)] bg-accent-tint"
    >
      {backdrop ? (
        <div aria-hidden className="vision-bg">
          <Image
            src={backdrop}
            alt=""
            fill
            sizes="(max-width: 899px) 100vw, 62vw"
            unoptimized
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="shell band-lg relative">
        {/* Colonnes inégales : le titre tient en peu de lignes, le texte
            d'approche en occupe beaucoup. À largeurs égales, la gauche se
            vidait sur toute la hauteur du paragraphe. */}
        <div className="grid gap-x-[clamp(32px,6vw,88px)] gap-y-[clamp(34px,4vw,48px)] [grid-template-columns:minmax(280px,0.82fr)_minmax(340px,1.18fr)] max-[900px]:[grid-template-columns:1fr]">
          {/* Solidaire du défilement : plutôt que de laisser un blanc sous le
              titre, la colonne accompagne la lecture du texte. */}
          {/* Sur téléphone, le héros ne remplit pas l'écran : le haut de cette
              section est visible sans défiler, et son titre devient l'élément
              de plus grande peinture. Mesuré : il attendait l'hydratation et
              reportait le LCP de l'accueil à 3,29 s. */}
          <Reveal
            immediat
            className="min-[900px]:sticky min-[900px]:top-[calc(var(--header-h,75px)+44px)] min-[900px]:self-start"
          >
            <p className="eyebrow mb-[22px]">{vision.eyebrow}</p>
            <h2 className="h2 h2-pretty max-w-[20ch]">{vision.title}</h2>

            {/* Les chiffres tenaient sous le paragraphe, ce qui allongeait
                encore la colonne déjà la plus haute. */}
            <div className="mt-[clamp(30px,4vw,46px)] flex flex-wrap gap-x-[clamp(28px,4vw,56px)] gap-y-6 border-t border-[rgba(25,41,36,0.15)] pt-[26px]">
              {vision.stats.map((stat) => (
                <div key={stat.value} className="min-w-[120px]">
                  <p className="m-0 font-serif text-[clamp(28px,3vw,40px)] leading-[1.05] text-forest">
                    {stat.value}
                  </p>
                  <p className="m-0 mt-1.5 font-sans text-[14px] uppercase tracking-[0.14em] text-sage">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal index={1} className="max-w-[62ch]">
            {vision.paragraphs.map((paragraph, i) => (
              <p
                key={i}
                className={`body-lg ${
                  i === vision.paragraphs.length - 1 ? "" : "mb-5"
                }`}
              >
                {paragraph}
              </p>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
