/**
 * Produit le contenu initial destiné à WordPress, à partir des textes du dépôt.
 *
 * Sans cela, l'éditrice ouvre un back-office aux champs vides : elle ne peut
 * rien « modifier », seulement tout retaper. L'import remplit WordPress avec ce
 * qu'affiche déjà le site, ce qui rend la première prise en main possible.
 *
 * Usage :
 *   npx tsc src/content/site.ts --outDir .tmp-contenu --target es2022 \
 *     --module esnext --moduleResolution bundler
 *   node outils/generer-contenu-initial.mjs .tmp-contenu/site.js
 *
 * La sortie va dans wordpress/kastell-contenu/contenu-initial.json.
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const source = process.argv[2];
if (!source) {
  console.error("Chemin du module compilé attendu en argument.");
  process.exit(1);
}
const c = await import(resolve(source));

/** Les champs « lignes » voyagent en texte, une ligne par élément. */
const lignes = (tableau) => (tableau ?? []).join("\n");

const contenu = {
  parametres: {
    nom: c.site.name,
    url: c.site.url,
    email: c.site.email,
    ville: c.site.city,
    linkedin: c.site.linkedin,
    linkedinProfil: c.site.linkedinProfile,
    hatvp: c.site.hatvp,
  },
  accueil: {
    promesse: c.hero.promise,
    herosCta: c.hero.cta,
    visionIntitule: c.vision.eyebrow,
    visionTitre: c.vision.title,
    visionParagraphes: lignes(c.vision.paragraphs),
    referencesIntitule: c.references.eyebrow,
    referencesTitre: c.references.title,
    actualitesTitre: c.news.heading,
    actualitesCta: c.news.followCta,
    contactIntitule: c.contact.eyebrow,
    contactTitre: c.contact.title,
    contactIntro: c.contact.intro,
  },
  offres: {
    intitule: c.offersSection.eyebrow,
    titrePage: c.offersSection.pageTitle,
    introPage: c.offersSection.pageIntro,
  },
  apropos: {
    intitule: c.about.eyebrow,
    nom: c.founder.name,
    role: c.founder.role,
    biographie: lignes(c.founder.bio),
    citation: c.founder.quote,
    presseIntitule: c.about.pressHeading,
    publicationsIntitule: c.about.publicationsHeading,
    manifesteIntitule: c.manifesto.eyebrow,
    manifesteTitre: c.manifesto.title,
    manifesteIntro: c.manifesto.intro,
    manifesteObjectifsTitre: c.manifesto.objectivesHeading,
    manifesteObjectifs: lignes(c.manifesto.objectives),
    manifesteEtiquettes: lignes(c.manifesto.tags),
    manifesteCta: c.manifesto.cta,
    manifesteLien: c.manifesto.href,
    manifesteTelechargerCta: c.manifesto.download.cta,
  },
  piedDePage: {
    accroche: c.footer.blurb,
    copyright: c.footer.copyright,
    mention: c.footer.mention,
  },

  /* Les listes : `titre` alimente le titre WordPress de la fiche. */
  k_offre: c.offers.map((o) => ({
    titre: o.title,
    resume: o.summary,
    ancre: o.slug,
    prestations: lignes(o.bullets),
    note: o.note ?? "",
    casPratiqueTitre: o.caseStudy?.title ?? "",
    casPratiqueRecit: o.caseStudy?.body ?? "",
  })),
  k_chiffre: c.vision.stats.map((s) => ({ valeur: s.value, libelle: s.label })),
  k_client: c.clients.map((x) => ({ nom: x.name })),
  k_temoignage: c.testimonials.map((t) => ({ auteur: t.author, citation: t.quote })),
  k_post: c.posts.map((p) => ({ date: p.date, extrait: p.excerpt, lien: p.href })),
  k_presse: c.press.map((a) => ({ titre: a.title, media: a.outlet, lien: a.href })),
  k_publication: c.publications.map((p) => ({
    titre: p.title,
    categorie: p.label,
    contexte: p.context,
    lien: p.href,
    cta: p.cta,
    objectifs: lignes(p.objectives),
  })),
};

const cible = "wordpress/kastell-contenu/contenu-initial.json";
writeFileSync(cible, JSON.stringify(contenu, null, 2) + "\n", "utf8");
console.log(`${cible} écrit.`);
