import Image from "next/image";
import Link from "next/link";
import { legal, nav } from "@/content/site";
import { getContent } from "@/cms/content";
import { estUtile } from "@/lib/lien";

/* « self-start » : dans une colonne flex, un lien s'étire sur toute la largeur
   de la colonne, et le trait de survol — qui épouse la boîte du lien — courait
   donc bien au-delà du mot. La boîte se resserre sur le texte. */
const linkClass =
  "footer-link hit-area self-start text-[15px] text-[rgba(226,240,248,0.82)] hover:text-white";
const headingClass =
  "m-0 mb-1 font-sans text-[13px] uppercase tracking-[0.18em] text-mist";

export async function Footer() {
  const { footer, site } = await getContent();
  return (
    <footer className="bg-forest text-[rgba(226,240,248,0.72)]">
      <div className="shell pb-[34px] pt-[clamp(48px,6vw,80px)]">
        <div className="grid items-start gap-[clamp(32px,4vw,60px)] [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          <div>
            <Image
              src="/brand/kastell-logo-ice.png"
              alt="Kastell — Conseil & lobbying engagé"
              width={2500}
              height={737}
              sizes="149px"
              className="mb-[22px] block aspect-[2500/737] h-[44px] w-auto"
            />
            <p className="m-0 max-w-[30ch] text-[15px] leading-[1.7]">
              {footer.blurb}
            </p>
          </div>

          <div className="flex flex-col gap-[26px] min-[860px]:gap-[18px]">
            <p className={headingClass}>{footer.navHeading}</p>
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ))}
            {/* Page de référence, hors barre de navigation pour ne pas la
                charger, mais accessible depuis chaque page : une page sans
                lien entrant ne se classe pas. */}
            <Link href="/lobbying-territorial" className={linkClass}>
              Lobbying territorial
            </Link>
            <Link href="/contact" className={linkClass}>
              Contact
            </Link>
          </div>

          <div className="flex flex-col gap-[26px] min-[860px]:gap-[18px]">
            <p className={headingClass}>{footer.infoHeading}</p>
            {legal.filter((item) => estUtile(item.href)).map((item) => (
              <a key={item.label} href={item.href} className={linkClass}>
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-[26px] min-[860px]:gap-[18px]">
            <p className={headingClass}>{footer.contactHeading}</p>
            <a href={`mailto:${site.email}`} className={linkClass}>
              {site.email}
            </a>
            {/* Ville seule ici, à la demande du cabinet : l'adresse complète
                et le téléphone restent sur la page Contact, dans les mentions
                légales et dans les données structurées, où un moteur les
                cherche. Le pied de page n'a pas à les exposer à chaque page. */}
            <p className="m-0 text-[15px]">{site.city}</p>
          </div>
        </div>

        <div className="mt-[clamp(36px,4vw,56px)] flex flex-wrap justify-between gap-x-7 gap-y-3 border-t border-[rgba(226,240,248,0.16)] pt-[22px]">
          <p className="m-0 font-sans text-[13px] uppercase tracking-[0.12em] text-[rgba(226,240,248,0.55)]">
            {footer.copyright}
          </p>
          {site.hatvp ? (
            <a
              href={site.hatvp}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link hit-area m-0 font-sans text-[13px] uppercase tracking-[0.12em] text-[rgba(226,240,248,0.55)] hover:text-white"
            >
              {footer.mention}
              <span className="sr-only"> (nouvelle fenêtre)</span>
            </a>
          ) : (
            <p className="m-0 font-sans text-[13px] uppercase tracking-[0.12em] text-[rgba(226,240,248,0.55)]">
              {footer.mention}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
