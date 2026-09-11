/**
 * Source unique de l'identité du cabinet pour le référencement.
 *
 * Tout ce qui décrit Kastell à une machine — moteur de recherche, réseau
 * social, moteur génératif — part d'ici : l'adresse canonique, le NAP (nom,
 * adresse, téléphone), les profils officiels, la phrase d'entité. Un seul
 * endroit à corriger le jour où l'un de ces éléments change, et aucune
 * divergence possible entre le pied de page, les données structurées et
 * `llms.txt`.
 *
 * Les valeurs encore inconnues sont nommées `TODO_KASTELL_*` : elles
 * traversent le code telles quelles, de sorte qu'une recherche sur ce
 * préfixe donne à tout moment la liste de ce qui reste à fournir. Rien
 * n'est inventé.
 */

/** Marqueur des données que seul le cabinet peut fournir. */
export const TODO = {
  /** Jeton de vérification Google Search Console. */
  GSC: "TODO_KASTELL_GSC_VERIFICATION",
  /** Jeton de vérification Bing Webmaster Tools. */
  BING: "TODO_KASTELL_BING_VERIFICATION",
} as const;

/** Retient une valeur d'environnement seulement si elle est renseignée. */
const env = (nom: string, defaut: string): string => {
  const v = process.env[nom];
  return v && v.trim() !== "" ? v.trim() : defaut;
};

/**
 * Adresse canonique, avec « www » et « conseils » au pluriel.
 *
 * Le cabinet détient aussi kastell-conseil.fr (au singulier) et la forme sans
 * « www » : toutes deux redirigent en 301 vers celle-ci. Une seule adresse
 * indexable, donc une seule autorité.
 */
export const urlSite = "https://www.kastell-conseils.fr";

/** Hôtes qui appartiennent au cabinet mais ne doivent pas être indexés. */
export const hotesRediriges = [
  "kastell-conseils.fr",
  "kastell-conseil.fr",
  "www.kastell-conseil.fr",
] as const;

/**
 * Phrase d'entité.
 *
 * La même, mot pour mot, en haut de l'accueil, dans les données structurées
 * et dans llms.txt. Un moteur génératif qui rencontre trois fois la même
 * définition la reprend ; trois formulations voisines le laissent choisir.
 */
export const phraseEntite =
  "Kastell Conseil est un cabinet de conseil en affaires publiques et lobbying territorial basé en Bretagne, à Lamballe, et intervenant à Rennes et dans toute la région.";

/**
 * Titre et description de l'accueil, tels qu'ils s'affichent dans les résultats
 * de recherche. Formulation arrêtée par le cabinet.
 *
 * Le titre tient en 58 caractères, la description en 88 : Google tronque
 * au-delà de 60 et 155 environ.
 */
export const TITRE_ACCUEIL =
  "Kastell Conseil - Ancrage territorial, influence nationale.";

export const DESCRIPTION_ACCUEIL =
  "L'interface entre les entreprises ancrées dans les territoires et les lieux de décisions.";

export const entite = {
  /** Nom d'usage, celui qui sert de marque. */
  nom: "Kastell Conseil",
  /** Dénomination sociale au RCS. */
  denomination: "KASTELL",
  /** Formes alternatives reconnues comme désignant la même entité. */
  alias: ["Kastell", "Cabinet Kastell", "KASTELL"],
  url: urlSite,
  logo: `${urlSite}/brand/kastell-logo-forest.png`,
  description: phraseEntite,

  /* NAP — identique au pied de page, aux mentions légales et au JSON-LD.
     Toute divergence entre ces trois endroits coûte en référencement local. */
  adresse: {
    rue: "35 rue Docteur Calmette",
    codePostal: "22400",
    ville: "Lamballe-Armor",
    region: "Bretagne",
    pays: "FR",
  },
  telephone: "+33660336838",
  telephoneAffiche: "+33 6 60 33 68 38",
  /** Adresse générale du cabinet. */
  email: "contact@kastell-conseils.fr",
  /** Adresse de la gérante, celle que citent les mentions légales. */
  emailDirection: "lea.delamotte@kastell-conseil.fr",

  /* Le cabinet est installé à Lamballe et intervient sur toute la Bretagne.
     Ces zones décrivent donc un rayon d'action, jamais une implantation :
     aucune adresse rennaise n'est déclarée nulle part. */
  zones: [
    "Bretagne",
    "Rennes",
    "Lamballe-Armor",
    "Ille-et-Vilaine",
    "Côtes-d'Armor",
    "Morbihan",
    "Finistère",
  ],

  /* Du lundi au vendredi, 9 h - 18 h. */
  horaires: { jours: ["Mo", "Tu", "We", "Th", "Fr"], ouverture: "09:00", fermeture: "18:00" },

  /** Profils officiels : ce sont eux qui relient l'entité à ses traces. */
  sameAs: [
    "https://www.linkedin.com/company/kastell-conseils/",
    "https://www.linkedin.com/in/l%C3%A9a-de-lamotte-24b16676/",
    "https://www.hatvp.fr/fiche-organisation/?organisation=989630819",
  ],

  fondatrice: {
    nom: "Léa de Lamotte",
    fonction: "Présidente fondatrice",
    linkedin: "https://www.linkedin.com/in/l%C3%A9a-de-lamotte-24b16676/",
  },
} as const;

/**
 * Jetons de vérification, fournis par variable d'environnement.
 *
 * Un jeton absent ne produit aucune balise : mieux vaut rien qu'une balise
 * portant la chaîne « TODO », qu'un moteur prendrait pour une vérification
 * ratée.
 */
export const verifications = {
  google: env("NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION", ""),
  bing: env("NEXT_PUBLIC_BING_SITE_VERIFICATION", ""),
};

/**
 * Le déploiement sert-il le site public ?
 *
 * Une preview Vercel porte le même contenu que la production : indexée, elle
 * devient un duplicata intégral. Tout ce qui n'est pas la production est donc
 * tenu hors des moteurs.
 */
export const estProduction = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === "production"
  : process.env.NODE_ENV === "production";

/**
 * Carte de partage, 1200 x 630.
 *
 * Next joint ce fichier de lui-même aux pages qui ne déclarent pas leur propre
 * bloc Open Graph. Celles qui en déclarent un le remplacent entièrement, image
 * comprise : elles doivent donc la redemander explicitement, sans quoi leur
 * partage sur LinkedIn s'affiche sans visuel.
 */
export const IMAGE_OG = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "Kastell Conseil — affaires publiques et lobbying territorial en Bretagne",
} as const;

/** Construit une adresse absolue à partir d'un chemin du site. */
export const absolu = (chemin: string): string =>
  new URL(chemin, urlSite).toString();
