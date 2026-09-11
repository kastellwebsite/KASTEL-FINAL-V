import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { getContent } from "@/cms/content";

export async function OffresPreview() {
  const { offers, offersSection } = await getContent();
  return (
    <section id="offres" className="hairline-top">
      <div className="shell band-md">
        <Reveal className="mb-[clamp(30px,4vw,56px)] flex flex-wrap items-baseline justify-between gap-x-10 gap-y-5">
          <p className="eyebrow-tight">{offersSection.eyebrow}</p>
          <Link href="/offres" className="pill pill-outline">
            {offersSection.ctaAll} <span aria-hidden>→</span>
          </Link>
        </Reveal>

        <Reveal index={1} className="grid-auto gap-[clamp(24px,3vw,48px)]">
          {offers.map((offer) => (
            <Link
              key={offer.slug}
              href={`/offres#${offer.slug}`}
              className="offer-card"
            >
              <span className="offer-index">{offer.index}</span>
              <span className="offer-title">{offer.title}</span>
              <span className="max-w-[34ch] text-[16px] leading-[1.65] text-stone">
                {offer.summary}
              </span>
            </Link>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
