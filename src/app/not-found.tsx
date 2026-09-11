import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Reveal } from "@/components/Reveal";
import { nav } from "@/content/site";

export const metadata: Metadata = {
  title: "Page introuvable",
  description: "Cette adresse ne correspond à aucune page du site Kastell Conseil.",
  robots: { index: false, follow: true },
};

/**
 * Page servie sur une adresse inexistante.
 *
 * Elle garde l'en-tête et le pied de page : une 404 nue interrompt la visite,
 * alors que la même page dans la charte, avec les chemins vers les rubriques,
 * la prolonge. Le code de réponse reste bien 404 — Next s'en charge — sans
 * quoi les moteurs indexeraient une page d'erreur comme un contenu valide.
 *
 * `follow` reste vrai : la page n'a pas à être indexée, mais les liens
 * qu'elle propose doivent être suivis.
 */
export default function NotFound() {
  return (
    <div className="w-full overflow-x-clip">
      <Header />
      <main id="contenu">
        <section className="shell pb-[clamp(48px,7vw,88px)] pt-[clamp(56px,9vw,120px)]">
          <Reveal immediat className="max-w-[60ch]">
            <p className="eyebrow-tight mb-[clamp(18px,2.5vw,28px)]">Erreur 404</p>
            <h1 className="h1">Cette page n&apos;existe pas.</h1>
            <p className="body-lg mt-[clamp(22px,3vw,32px)]">
              L&apos;adresse demandée ne correspond à aucune page du site. Elle a
              peut-être changé, ou comporte une faute de frappe.
            </p>
          </Reveal>
        </section>

        <section className="hairline-top">
          <div className="shell band-md">
            <Reveal>
              <p className="eyebrow-tight mb-[clamp(20px,2.5vw,28px)]">
                Reprendre la visite
              </p>
              <ul className="m-0 flex list-none flex-col gap-[clamp(14px,1.8vw,20px)] p-0">
                {[...nav, { label: "Contact", href: "/contact" }].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="press-link hit-area inline-block font-serif text-[clamp(21px,2vw,28px)] leading-[1.2] text-forest hover:text-sage"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-[clamp(34px,4vw,52px)]">
                <Link href="/" className="pill pill-solid">
                  Revenir à l&apos;accueil <span aria-hidden>→</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
