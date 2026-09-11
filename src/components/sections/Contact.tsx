import { FormulaireContact } from "@/components/FormulaireContact";
import { Reveal } from "@/components/Reveal";
import { getContent } from "@/cms/content";
import { entite } from "@/lib/seo";
import { estUtile } from "@/lib/lien";

export async function Contact({ titre = true }: { titre?: boolean } = {}) {
  const { contact, site, offers } = await getContent();
  const linkedin = estUtile(site.linkedin) ? site.linkedin : null;
  /* Les intitulés d'offres alimentent la liste des sujets : un visiteur qui
     vient de les lire retrouve les mêmes mots, et la demande arrive qualifiée. */
  const sujets = offers.map((offre) => offre.title);

  return (
    <section id="contact" className="band-dark">
      {/* Sur la page dédiée, l'en-tête est juste au-dessus : la réserve
          habituelle du haut y creuserait un vide de plus de cent pixels. */}
      <div
        className={`shell pb-[clamp(60px,9vw,130px)] ${
          titre ? "pt-[clamp(60px,9vw,130px)]" : "pt-[clamp(4px,1vw,16px)]"
        }`}
      >
        <div className="grid items-start gap-[clamp(38px,5vw,80px)] [grid-template-columns:minmax(300px,0.9fr)_minmax(340px,1.1fr)] max-[900px]:[grid-template-columns:1fr]">
          <Reveal immediat={!titre} className="flex flex-col items-start">
            {/* Sur la page dédiée, le titre est déjà porté par le <h1> : le
                répéter ici créerait deux titres pour un même propos. */}
            {titre ? (
              <>
                <p className="m-0 mb-[clamp(24px,3vw,40px)] font-sans text-[12px] font-medium uppercase tracking-[0.24em] text-mist">
                  {contact.eyebrow}
                </p>
                <h2 className="h2-contact">{contact.title}</h2>
                <p className="mb-[clamp(28px,3.5vw,40px)] mt-[26px] max-w-[42ch] text-[clamp(16px,1.25vw,19px)] leading-[1.7] text-[rgba(226,240,248,0.78)]">
                  {contact.intro}
                </p>
              </>
            ) : null}

            {/* Le courriel reste écrit en clair : certains préfèrent copier une
                adresse plutôt que remplir un formulaire. */}
            <dl className={`m-0 flex w-full flex-col gap-[18px] ${
              titre ? "border-t border-[rgba(226,240,248,0.2)] pt-[26px]" : ""
            }`}>
              <div>
                <dt className="m-0 mb-1 font-sans text-[11px] uppercase tracking-[0.18em] text-mist">
                  E-mail
                </dt>
                <dd className="m-0">
                  <a
                    href={`mailto:${site.email}`}
                    className="press-link hit-area text-[17px] text-[rgba(226,240,248,0.9)] hover:text-white"
                  >
                    {site.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="m-0 mb-1 font-sans text-[11px] uppercase tracking-[0.18em] text-mist">
                  Téléphone
                </dt>
                <dd className="m-0">
                  <a
                    href={`tel:${entite.telephone}`}
                    className="press-link hit-area text-[17px] text-[rgba(226,240,248,0.9)] hover:text-white"
                  >
                    {entite.telephoneAffiche}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="m-0 mb-1 font-sans text-[11px] uppercase tracking-[0.18em] text-mist">
                  Bureau
                </dt>
                {/* Ville et code postal seuls, à la demande du cabinet : la rue
                    ne figure plus ici ni au pied de page. Elle reste dans les
                    mentions légales, où la loi l'impose, et dans les données
                    structurées, que les moteurs lisent pour le référencement
                    local — les deux sources doivent rester identiques au
                    caractère près. */}
                <dd className="m-0 text-[17px] text-[rgba(226,240,248,0.78)]">
                  <span className="block">
                    {entite.adresse.codePostal} {entite.adresse.ville}
                  </span>
                </dd>
              </div>
            </dl>

            {/* Rendu seulement si l'adresse existe : un bouton vers « # » ne
                fait rien, sinon remonter la page. */}
            {linkedin ? (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="pill mt-[clamp(26px,3vw,34px)] border border-[rgba(226,240,248,0.4)] px-7 py-[15px] text-white hover:border-white hover:bg-[rgba(226,240,248,0.1)] hover:text-white"
              >
                {contact.linkedinCta}
                <span aria-hidden>↗</span>
                <span className="sr-only"> (nouvelle fenêtre)</span>
              </a>
            ) : null}
          </Reveal>

          <Reveal index={1} className="w-full">
            <FormulaireContact
              textes={contact.form}
              sujets={sujets}
              email={site.email}
              niveauTitre={titre ? 3 : 2}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
