import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { getContent } from "@/cms/content";

/**
 * Fin de page d'accueil : une invitation, pas un formulaire.
 *
 * Le formulaire complet vit sur sa propre page. En bas d'une page d'accueil
 * déjà longue, il demandait un effort au moment où le visiteur en a le moins ;
 * une invitation courte le laisse décider, et l'adresse reste en clair pour qui
 * préfère écrire directement.
 */
export async function ContactBande() {
  const { contact, site } = await getContent();

  return (
    <section id="contact" className="band-dark">
      <div className="shell py-[clamp(56px,8vw,110px)]">
        <Reveal className="flex flex-col items-start gap-[clamp(22px,3vw,32px)]">
          <p className="m-0 font-sans text-[12px] font-medium uppercase tracking-[0.24em] text-mist">
            {contact.eyebrow}
          </p>
          <h2 className="h2-contact m-0">{contact.bande.title}</h2>
          <p className="m-0 max-w-[52ch] text-[clamp(16px,1.25vw,19px)] leading-[1.7] text-[rgba(226,240,248,0.78)]">
            {contact.bande.intro}
          </p>

          <div className="mt-[clamp(6px,1vw,10px)] flex flex-wrap items-center gap-x-[clamp(20px,3vw,34px)] gap-y-4">
            <Link href="/contact" className="pill bg-bone px-7 py-[15px] text-forest hover:bg-white hover:text-forest">
              {contact.bande.cta} <span aria-hidden>→</span>
            </Link>
            <a
              href={`mailto:${site.email}`}
              className="press-link hit-area text-[17px] text-[rgba(226,240,248,0.85)] hover:text-white"
            >
              {site.email}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
