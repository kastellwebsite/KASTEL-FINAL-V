import Image from "next/image";
import { CitationDepliable } from "@/components/CitationDepliable";
import { Reveal } from "@/components/Reveal";
import { site } from "@/content/site";
import { getContent } from "@/cms/content";

/** Trois crans de marge, du plus aéré au plus serré. */
const MARGES: Record<string, string> = {
  normale: "px-5 py-3",
  grande: "px-3.5 py-2",
  "tres-grande": "px-2 py-1",
};

export async function References() {
  const { clients: logos, references, testimonials } = await getContent();
  const seul = testimonials.length === 1;
  return (
    <section id="references" className="shell band-refs">
      <Reveal>
        <p className="eyebrow mb-[18px]">{references.eyebrow}</p>
        <h2 className="h2 mb-[clamp(32px,4vw,54px)] max-w-[26ch]">
          {references.title}
        </h2>
      </Reveal>

      {/* Rangée souple plutôt que grille : une grille laisse le reliquat
          collé à gauche — six logos sur cinq colonnes, et le sixième reste
          seul dans le coin. Ici la dernière rangée se centre d'elle-même,
          quel que soit le nombre de clients. */}
      <Reveal
        index={1}
        className="flex flex-wrap justify-center gap-[clamp(12px,1.4vw,20px)]"
      >
        {logos.map((client) => (
          <div
            key={client.name}
            className="client-tile relative flex aspect-[11/5] w-full max-w-[176px] grow basis-[clamp(148px,12.2vw,176px)] items-center justify-center overflow-hidden rounded-[12px] border border-[rgba(25,41,36,0.16)] bg-bone"
          >
            {client.logoUrl ? (
              <Image
                src={client.logoUrl}
                alt={client.name}
                fill
                sizes="240px"
                unoptimized
                /* La marge autour du logo est réglable client par client :
                   certains fichiers embarquent déjà une marge vide, et le
                   dessin s'y perd sans qu'on puisse retoucher le fichier
                   depuis l'administration. */
                className={`client-logo object-contain ${MARGES[client.logoSize] ?? MARGES.normale}`}
              />
            ) : (
              <span className="px-2 text-center font-mono text-[11px] text-muted">
                {client.name}
              </span>
            )}
          </div>
        ))}
      </Reveal>

      {/* L'emplacement libre de la maquette ne s'affiche plus dès qu'un vrai
          témoignage existe : « emplacement disponible » n'est pas une phrase
          qu'un visiteur doit lire. Sans aucun témoignage, le bloc entier
          disparaît plutôt que d'annoncer son propre vide. */}
      {site.showTestimonials && testimonials.length > 0 ? (
        <Reveal
          index={2}
          className={`mt-[clamp(40px,5vw,64px)] ${
            seul
              ? ""
              : "grid gap-[clamp(28px,3vw,44px)] [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]"
          }`}
        >
          {testimonials.map((item) => (
            <CitationDepliable
              key={item.quote}
              citation={item.quote}
              auteur={item.author}
              lire={references.temoignageLire}
              reduire={references.temoignageReduire}
              seuil={seul ? 400 : 180}
              seule={seul}
            />
          ))}
        </Reveal>
      ) : null}
    </section>
  );
}
