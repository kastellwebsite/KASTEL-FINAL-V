import { absolu, entite, phraseEntite, urlSite } from "@/lib/seo";

/**
 * Données structurées schema.org.
 *
 * Elles décrivent le cabinet à une machine : ce que Google affiche dans son
 * panneau de connaissance, et ce qu'un moteur génératif reprend quand on lui
 * demande « quel cabinet de lobbying en Bretagne ? ». Le site répond déjà à
 * ces questions en français ; ici, il y répond en clair.
 *
 * Toutes les entités partagent un graphe et se citent par `@id` plutôt que de
 * se recopier. Un moteur comprend alors qu'il s'agit d'une seule organisation
 * vue sous plusieurs angles, et non de trois fiches concurrentes.
 */

/** Identifiants stables. Ils ne changent jamais : ce sont des clés, pas des liens. */
export const ID = {
  organisation: `${urlSite}/#organisation`,
  siteWeb: `${urlSite}/#site`,
  fondatrice: `${urlSite}/#lea-de-lamotte`,
} as const;

type Noeud = Record<string, unknown>;

/** Adresse postale, au format attendu par schema.org. */
const adressePostale = (): Noeud => ({
  "@type": "PostalAddress",
  streetAddress: entite.adresse.rue,
  postalCode: entite.adresse.codePostal,
  addressLocality: entite.adresse.ville,
  addressRegion: entite.adresse.region,
  addressCountry: entite.adresse.pays,
});

/**
 * Zones d'intervention.
 *
 * `areaServed` décrit un rayon d'action, jamais une implantation. C'est la
 * distinction qui permet de viser Rennes sans y déclarer d'adresse : le
 * cabinet siège à Lamballe et intervient à Rennes, ce que ces deux champs
 * disent séparément et sans ambiguïté.
 */
const zonesServies = (): Noeud[] =>
  entite.zones.map((nom) => ({ "@type": "AdministrativeArea", name: nom }));

/**
 * L'organisation.
 *
 * Deux types à la fois : `Organization` la décrit comme entité, et
 * `ProfessionalService` comme prestataire local — c'est ce second qui ouvre le
 * référencement local, avec adresse, horaires et zone.
 */
export const organisation = (): Noeud => ({
  "@type": ["Organization", "ProfessionalService"],
  "@id": ID.organisation,
  name: entite.nom,
  alternateName: [...entite.alias],
  legalName: entite.denomination,
  url: entite.url,
  logo: { "@type": "ImageObject", url: entite.logo },
  image: absolu("/opengraph-image.png"),
  description: phraseEntite,
  slogan: "Ancrage territorial, influence nationale",
  email: entite.email,
  telephone: entite.telephone,
  address: adressePostale(),
  areaServed: zonesServies(),
  founder: { "@id": ID.fondatrice },
  employee: { "@id": ID.fondatrice },
  knowsAbout: [
    "affaires publiques",
    "lobbying territorial",
    "représentation d'intérêts",
    "communication d'influence",
    "aides et financements publics",
    "transition écologique",
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [...entite.horaires.jours],
      opens: entite.horaires.ouverture,
      closes: entite.horaires.fermeture,
    },
  ],
  sameAs: [...entite.sameAs],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    email: entite.email,
    telephone: entite.telephone,
    areaServed: "FR",
    availableLanguage: ["fr"],
  },
});

/** La fondatrice : c'est elle qui porte l'expertise, et donc l'autorité. */
export const personneFondatrice = (): Noeud => ({
  "@type": "Person",
  "@id": ID.fondatrice,
  name: entite.fondatrice.nom,
  jobTitle: entite.fondatrice.fonction,
  worksFor: { "@id": ID.organisation },
  url: absolu("/#apropos"),
  sameAs: [entite.fondatrice.linkedin],
  knowsAbout: ["affaires publiques", "lobbying territorial", "Bretagne"],
});

/** Le site lui-même, rattaché à son éditeur. */
export const siteWeb = (): Noeud => ({
  "@type": "WebSite",
  "@id": ID.siteWeb,
  url: urlSite,
  name: entite.nom,
  inLanguage: "fr-FR",
  publisher: { "@id": ID.organisation },
});

/** Une prestation du cabinet. */
export const service = (titre: string, description: string, ancre: string): Noeud => ({
  "@type": "Service",
  name: titre,
  description,
  url: absolu(`/offres#${ancre}`),
  provider: { "@id": ID.organisation },
  areaServed: zonesServies(),
  serviceType: titre,
});

/** Fil d'Ariane, dans l'ordre où le visiteur a parcouru le site. */
export const filDAriane = (etapes: { nom: string; chemin: string }[]): Noeud => ({
  "@type": "BreadcrumbList",
  itemListElement: etapes.map((etape, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: etape.nom,
    item: absolu(etape.chemin),
  })),
});

/** Questions fréquentes, quand la page en porte. */
export const faq = (entrees: { question: string; reponse: string }[]): Noeud => ({
  "@type": "FAQPage",
  mainEntity: entrees.map((e) => ({
    "@type": "Question",
    name: e.question,
    acceptedAnswer: { "@type": "Answer", text: e.reponse },
  })),
});

/** Assemble un graphe complet, prêt à être sérialisé. */
export const graphe = (noeuds: Noeud[]): Noeud => ({
  "@context": "https://schema.org",
  "@graph": noeuds,
});
