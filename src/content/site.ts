import { urlSite } from "@/lib/seo";

export const site = {
  name: "Kastell Conseil",
  /**
   * Adresse canonique, définie une seule fois dans la configuration de
   * référencement : le sitemap, robots.txt, les balises canoniques et
   * l'Open Graph y puisent tous la même valeur.
   */
  url: urlSite,
  tagline: "Ancrage territorial, influence nationale",
  /** Fiche du cabinet au répertoire des représentants d'intérêts. */
  hatvp: "https://www.hatvp.fr/fiche-organisation/?organisation=989630819",
  /** Domaine au pluriel depuis le changement de nom de domaine. */
  email: "contact@kastell-conseils.fr",
  city: "Lamballe, Bretagne",
  /** Page entreprise. */
  linkedin: "#",
  /** Profil personnel : c'est lui qui alimente la section actualités. */
  linkedinProfile: "#",
  /** Sections toggled from the design canvas props. */
  showTestimonials: true,
  showNews: true,
} as const;

export const hero = {
  /** Le mot-symbole porte le nom : ce titre est la promesse seule. */
  promise:
    "Peser dans le débat public. Influencer les décisions. Où que vous soyez.",
  cta: "Découvrir nos offres",
} as const;

export const vision = {
  /**
   * Visuel de fond, chemin sous public/ SANS extension : findPublicAsset
   * résout le format réel du fichier. Vide = pas de fond, comme la maquette.
   * La carte sert désormais d'illustration au héros ; pour en remettre une ici,
   * indiquer "brand/manifeste-carte" ou "brand/photoorga".
   */
  backdrop: "",
  eyebrow: "Notre vision",
  title:
    "« L'interface entre les entreprises ancrées dans les territoires et les lieux de décisions »",
  paragraphs: [
    "L'économie française se construit dans les territoires. Les décisions structurantes qui en dessinent l'avenir se prennent ailleurs. Pendant longtemps, influencer la décision publique signifiait être à Paris ou à Bruxelles, héritage d'un modèle de décision centralisé.",
    "Mais l'influence publique ne s'arrête pas au périphérique. À mesure que les centres de décision se diversifient, l'influence doit se rapprocher du terrain. Depuis les Côtes-d'Armor, Kastell crée un dialogue entre les lieux où naissent les projets et les lieux où se prennent les décisions.",
    "Où que vous soyez, Kastell met sa connaissance des réalités locales, du monde économique et des institutions publiques au service de vos enjeux d'influence : lever des obstacles législatifs et réglementaires qui freinent votre activité, accroître votre visibilité sur votre territoire et au-delà, renforcer votre ancrage et votre dialogue avec vos parties prenantes, obtenir des financements publics pour développer vos projets.",
    "Parce que l'influence ne s'improvise pas, nous travaillons chaque enjeu avec méthode. Comprendre les agendas politiques, identifier les interlocuteurs clés, construire les bons arguments et inscrire un dialogue dans la durée : une approche exigeante, transparente et conforme aux règles applicables aux représentants d'intérêts.",
    "Comprendre au plus près, conseiller avec expertise, agir pour une influence utile et responsable : trois principes qui guident chacune de nos missions.",
  ],
  stats: [
    { value: "10 ans", label: "d'expérience institutionnelle" },
    { value: "Lamballe", label: "Paris · Bruxelles" },
  ],
} as const;

/**
 * Page pilier « lobbying territorial ».
 *
 * Le mot-clé principal du cabinet n'apparaissait nulle part sur le site. Cette
 * page lui donne une adresse propre, où le terme est défini, la méthode
 * exposée et les questions courantes traitées.
 *
 * Tout ce qui suit est tiré de ce que le cabinet dit déjà ailleurs — la
 * section Vision, les six offres, le manifeste — reformulé pour répondre
 * directement à une question. Aucun chiffre, aucun client, aucun délai n'a été
 * ajouté : ce qui manque est signalé au cabinet plutôt qu'inventé.
 */
export const lobbying = {
  eyebrow: "Page de référence",
  title: "Le lobbying territorial",
  /** Réponse directe sous le titre : c'est elle qu'un moteur cite. */
  chapo:
    "Le lobbying territorial consiste à défendre les intérêts d'une entreprise ou d'une organisation auprès des décideurs publics depuis son territoire d'implantation, plutôt que depuis les seuls centres de décision nationaux.",
  misAJour: "2026-09-11",
  sections: [
    {
      titre: "Qu'est-ce que le lobbying territorial ?",
      reponse:
        "C'est la représentation d'intérêts exercée au plus près du terrain : auprès des collectivités, des services déconcentrés de l'État et des parlementaires d'un territoire, en articulation avec le niveau national.",
      paragraphes: [
        "La représentation d'intérêts est une activité encadrée. En France, elle est inscrite au répertoire tenu par la Haute Autorité pour la transparence de la vie publique, qui rend publiques les actions menées auprès des responsables publics. Le lobbying territorial ne déroge pas à ce cadre : il en applique les règles à l'échelle régionale.",
        "Ce qui le distingue n'est donc pas la méthode, mais le point de départ. Un dossier industriel breton se comprend d'abord en Bretagne — auprès de ceux qui en mesurent les effets sur l'emploi, le foncier ou l'eau — avant de se plaider à Paris.",
      ],
    },
    {
      titre: "Pourquoi il ne se pratique plus seulement à Paris",
      reponse:
        "Parce que les centres de décision se sont diversifiés : régions, métropoles et agences publiques arbitrent aujourd'hui une part croissante de ce qui conditionne l'activité des entreprises.",
      paragraphes: [
        "L'économie française se construit dans les territoires, et les décisions qui en dessinent l'avenir se prenaient longtemps ailleurs. Influencer la décision publique signifiait être à Paris ou à Bruxelles, héritage d'un modèle centralisé.",
        "À mesure que la décision se déconcentre, l'influence doit se rapprocher du terrain. C'est la raison d'être d'un cabinet installé en Bretagne plutôt qu'une antenne régionale d'un cabinet parisien : la connaissance du territoire ne se délègue pas.",
      ],
    },
  ],
  faq: [
    {
      question: "Le lobbying territorial est-il légal ?",
      reponse:
        "Oui. La représentation d'intérêts est une activité encadrée par la loi. Kastell Conseil est inscrit au répertoire des représentants d'intérêts tenu par la Haute Autorité pour la transparence de la vie publique (HATVP), qui rend publiques les actions menées auprès des responsables publics.",
    },
    {
      question: "Quelle différence avec le lobbying classique ?",
      reponse:
        "La méthode est la même ; le point de départ change. Le lobbying territorial part du territoire où se trouve l'entreprise et remonte vers le niveau national, au lieu de partir de Paris pour redescendre. Il suppose de connaître les acteurs locaux — collectivités, services de l'État, parlementaires du territoire — autant que les circuits nationaux.",
    },
    {
      question: "Sur quels territoires Kastell Conseil intervient-il ?",
      reponse:
        "Le cabinet est installé à Lamballe-Armor, dans les Côtes-d'Armor, et intervient dans toute la Bretagne — Rennes, Saint-Brieuc, Brest, Vannes — ainsi qu'à Paris et Bruxelles lorsque le dossier l'exige.",
    },
    {
      question: "Faut-il être une grande entreprise pour y recourir ?",
      reponse:
        "Non. Les PME et ETI sont souvent les plus exposées à une décision publique et les moins outillées pour la suivre. Un cabinet installé en région leur donne accès à un accompagnement qui restait jusqu'ici réservé aux grands groupes parisiens.",
    },
    {
      question: "Comment se déroule un premier échange ?",
      reponse:
        "Un entretien de trente minutes suffit le plus souvent à cerner l'enjeu et à dire si une intervention a du sens. Il se demande par le formulaire de contact du site ou par courriel, et il est sans engagement.",
    },
  ],
  ctaOffres: "Voir les six terrains d'intervention",
  ctaContact: "Parler de votre dossier",
} as const;

export const nav = [
  { label: "Notre vision", href: "/#vision" },
  { label: "Offres", href: "/offres" },
  { label: "À propos", href: "/#apropos" },
  { label: "Références", href: "/#references" },
] as const;

export const offersSection = {
  eyebrow: "Offres",
  ctaAll: "Toutes nos offres",
  pageTitle: "Six terrains d'intervention.",
  pageIntro:
    "Chaque mission part du même point : comprendre où se prend la décision, à quel moment, et par qui. Le reste — argumentaire, interlocuteurs, calendrier — en découle.",
  backLabel: "Retour",
  backCta: "Revenir à l'accueil",
  /** Libellé et préfixe d'objet du courriel de prise de rendez-vous. */
  offreCta: "En savoir plus",
  bulletsHeading: "Ce que Kastell fait pour vous",
} as const;

/**
 * `caseStudy` reste vide tant qu'aucun cas pratique n'est publiable : le bloc
 * n'apparaît que s'il est renseigné, offre par offre.
 */
export const offers = [
  {
    index: "01",
    slug: "lobbying-institutionnel",
    title: "Lobbying institutionnel",
    summary:
      "Influencer les décisions publiques pour conquérir de nouveaux marchés et protéger vos activités.",
    bullets: [
      "Suivi de l'activité politique, législative et réglementaire",
      "Analyse et décryptage",
      "Mapping de l'environnement institutionnel",
      "Organisation de rendez-vous avec des décideurs politiques nationaux",
      "Rédaction et négociation d'amendements et de propositions de loi",
    ],
    caseStudy: null,
  },
  {
    index: "02",
    slug: "ancrage-territorial",
    title: "Ancrage territorial",
    summary:
      "Renforcer votre capacité d'influence au cœur des écosystèmes locaux.",
    bullets: [
      "Veille et intelligence territoriale",
      "Création de coalitions et animation de réseaux",
      "Mise en relation avec des décideurs locaux",
      "Organisation d'événements locaux",
    ],
    caseStudy: null,
  },
  {
    index: "03",
    slug: "aides-et-financements-publics",
    title: "Aides et financements publics",
    summary:
      "Vous orienter dans le millefeuille administratif et mobiliser des aides et financements publics pour développer vos projets.",
    bullets: [
      "Identification des aides et financements éligibles a priori pour votre projet",
      "Conseil stratégique : positionnement, rendez-vous décideurs, messages",
      "Préparation et dépôt des demandes auprès des organismes identifiés",
      "Sécurisation institutionnelle jusqu'à l'obtention des financements",
    ],
    caseStudy: null,
  },
  {
    index: "04",
    slug: "communication-d-influence",
    title: "Communication d'influence",
    summary:
      "Faire entendre votre voix et valoriser vos projets à impact dans une société exigeante à l'information abondante.",
    bullets: [
      "Analyse réputationnelle",
      "Animation et structuration de réseaux",
      "Négociation d'interviews dans les médias",
      "Recherche de partenariats d'influence",
      "Organisation d'événements",
    ],
    caseStudy: null,
  },
  {
    index: "05",
    slug: "audit-strategique",
    title: "Audit stratégique d'affaires publiques",
    summary:
      "Trouver des leviers de compétitivité grâce à une stratégie d'affaires publiques efficace.",
    bullets: [
      "Diagnostic interne et échange sur vos priorités",
      "Analyse de l'environnement économique, juridique et politique dans lequel agir",
      "Cartographie des parties prenantes et priorisation des publics",
      "Identification des messages clés",
      "Analyse des leviers d'action",
      "Construction d'une feuille de route opérationnelle",
    ],
    note: "Formation animée sur un module d'une journée.",
    caseStudy: null,
  },
  {
    index: "06",
    slug: "communication-de-crise",
    title: "Communication de crise",
    summary:
      "Protéger votre réputation dans un environnement crisogène où la perception compte souvent autant que la performance.",
    bullets: [
      "Veille sectorielle et détection des signaux faibles",
      "Organisation et animation d'une cellule de crise",
      "Mise en œuvre de la stratégie : matrices, procédures",
      "Élaboration des messages clés",
      "Gestion des relations presse de crise",
      "Media training",
    ],
    caseStudy: null,
  },
] as const;

export const clients = [
  { name: "Ville de Rennes", file: "brand/ville-de-rennes" },
  { name: "Région Bretagne", file: "brand/region-bretagne" },
  { name: "Breizh Cola", file: "brand/breizh-cola" },
  { name: "NDC", file: "brand/ndc" },
  { name: "Google", file: "brand/google" },
] as const;

export const founder = {
  name: "Léa de Lamotte",
  role: "Conseil en affaires publiques · Lamballe · Paris · Bruxelles",
  bio: [
    "Formée au croisement de la décision publique, du plaidoyer environnemental et du conseil aux entreprises, Léa de Lamotte fonde Kastell Conseil avec une conviction : l'influence publique ne doit pas être réservée aux acteurs implantés dans les centres de décision.",
    "Son parcours, de l'Assemblée nationale au conseil stratégique en passant par le milieu des ONG, lui permet de croiser plusieurs expertises : compréhension de la fabrique de la loi, communication d'influence, ancrage territorial et intelligence économique.",
    "À travers Kastell, elle met son expertise au service de l'influence des entreprises et des acteurs économiques, avec une attention particulière portée à celles et ceux qui font vivre les territoires et portent les transformations de demain.",
    "Elle intervient personnellement sur chaque mission, de la définition de la stratégie à la rencontre des décideurs.",
    "Implanté en Bretagne, Kastell revendique une autre manière de pratiquer les affaires publiques, depuis les régions : partir du terrain pour mieux comprendre les enjeux des acteurs économiques, tout en maîtrisant les lieux de pouvoir et les mécanismes de décision. Elle co-fonde en 2026 le réseau Influence & Territoires, premier réseau professionnel dédié aux professionnels des affaires publiques installés en régions.",
  ],
  quote:
    "« L'influence publique ne doit pas être réservée aux acteurs implantés dans les centres de décision. »",
  linkedinCta: "Me suivre sur LinkedIn",
  /** Déposer le portrait ici (4:5) — le placeholder du design s'affiche tant qu'il est absent. */
  photo: "/brand/fondatrice.png",
} as const;

/**
 * Retombées presse. Titres repris des URL sources ; les dates ne sont pas
 * renseignées faute d'avoir pu ouvrir les articles.
 *
 * `logo` est un chemin sous public/ SANS extension. Tant que le fichier manque,
 * le nom du média s'affiche en toutes lettres à la place.
 */
export const press = [
  {
    outlet: "Ouest-France",
    logo: "brand/press/ouest-france",
    title:
      "Elle crée le premier cabinet d'affaires publiques dans le pays de Lamballe",
    href: "https://www.ouest-france.fr/economie/entreprises/elle-cree-le-premier-cabinet-daffaires-publiques-dans-le-pays-de-lamballe-841a2d3a-a91d-11f0-a84e-0a4f72002724",
  },
  {
    outlet: "Bretagne Économique",
    logo: "brand/press/bretagne-economique",
    title:
      "Léa de Lamotte crée Kastell Conseil, spécialisé dans le lobbying engagé et les affaires publiques",
    href: "https://www.bretagne-economique.com/actualites/lea-de-lamotte-cree-kastell-conseil-specialise-dans-le-lobbying-engage-et-les-affaires-publiques/",
  },
  {
    outlet: "Femmes de Bretagne",
    logo: "brand/press/femmes-de-bretagne",
    title:
      "Léa de Lamotte, entrepreneure engagée au service des territoires bretons",
    href: "https://www.femmesdebretagne.fr/articles/197488-lea-de-lamotte-entrepreneure-engagee-au-service-des-territoires-bretons",
  },
] as const;

/**
 * Publications. Le premier billet est paru en presse écrite : il n'a pas de
 * version web, d'où le renvoi vers le post LinkedIn qui le présente.
 * TODO client : titre exact de la tribune, nom du média, description du RIT.
 */
export const publications = [
  {
    label: "Tribune",
    title: "[ Titre de la tribune ]",
    context: "Parue en presse écrite — [ média ], début 2026",
    href: "https://www.linkedin.com/feed/update/urn:li:activity:7427385529794527232/",
    cta: "Voir le post LinkedIn",
  },
] as const;

/* Le champ `destination` d'une publication, renseigné dans le CMS, renvoie vers
   une section du site plutôt que vers une adresse extérieure. */

/**
 * Le manifeste du RIT occupe sa propre bande en fin de page : le texte est trop
 * long pour la colonne « Nos publications », et le document mérite d'être
 * présenté comme tel, couverture à l'appui.
 *
 * `coverUrl` reste vide tant qu'aucun visuel n'est téléversé : la couverture est
 * alors composée dans la page à partir de `cover`, avec les fontes du site.
 */
export const manifesto = {
  eyebrow: "Manifeste",
  title: "Réseau Influence & Territoires",
  intro:
    "La décision publique reste très concentrée à Paris, créant une déconnexion avec les territoires où se déroule l'essentiel de l'activité économique et sociale. Plutôt que d'opposer Paris et les régions, le Réseau Influence & Territoires, collectif apartisan de consultants et de cabinets implantés en région, entend fluidifier le dialogue entre le niveau national et les réalités de terrain, pour rendre l'action publique plus efficace.",
  objectivesHeading: "Quatre objectifs",
  objectives: [
    "Valoriser l'expertise des professionnels des affaires publiques basés en territoires.",
    "Structurer la profession via le partage d'outils, de méthodes et de retours d'expérience.",
    "Rendre l'offre lisible pour les acteurs économiques locaux : PME, ETI, fédérations.",
    "Porter une voix collective pour faire remonter les enjeux territoriaux dans les processus de décision nationaux.",
  ],
  /* Repris mot pour mot du texte fourni : aucune mention ajoutée. */
  tags: ["Apartisan", "Consultants en région"],
  cta: "Suivre le RIT sur LinkedIn",
  /* URL publique : le lien fourni pointait vers l'espace d'administration. */
  href: "https://www.linkedin.com/company/115801577/",
  coverUrl: "",
  /**
   * Téléchargement contre adresse e-mail. Le bouton n'apparaît que si le
   * document existe : soit `public/documents/manifeste-rit.pdf` dans le dépôt,
   * soit un fichier téléversé depuis le studio, qui prend alors le dessus.
   */
  download: {
    cta: "Télécharger le manifeste",
    /* Chemin sous public/, sans extension. */
    file: "documents/manifeste-rit",
    fileUrl: "",
    modalTitle: "Recevoir le manifeste",
    modalIntro:
      "Indiquez votre adresse e-mail : le document se télécharge aussitôt et nous vous tiendrons informé des travaux du réseau.",
    emailLabel: "Adresse e-mail professionnelle",
    consent:
      "J'accepte que Kastell Conseil conserve mon adresse pour m'adresser ses publications. Je peux me désinscrire à tout moment.",
    submit: "Recevoir le document",
    submitting: "Envoi…",
    success: "Merci, le téléchargement démarre.",
    error: "L'envoi n'a pas abouti. Réessayez ou écrivez-nous directement.",
    privacyNote: "Vos données ne sont ni revendues ni transmises à des tiers.",
    privacyLink: "Politique de confidentialité",
  },
  cover: {
    lines: ["Réseau", "Influence", "& Territoires"],
    subtitle:
      "Collectif apartisan de consultants\nen affaires publiques implantés\nen région",
    mark: "RIT",
  },
} as const;

export const about = {
  eyebrow: "Présidente fondatrice",
  pressHeading: "Dans la presse",
  pressPlus: "Voir toutes les retombées",
  pressMoins: "Réduire",
  publicationsPlus: "Voir toutes les publications",
  publicationsMoins: "Réduire",
  publicationsHeading: "Nos publications",
  portraitPlaceholder: ["portrait — présidente fondatrice", "(photo professionnelle, format 4:5)"],
} as const;

export const references = {
  eyebrow: "Références",
  title: "Ils nous confient leurs enjeux publics",
  temoignageLire: "Lire le témoignage complet",
  temoignageReduire: "Réduire",
} as const;

export const news = {
  heading: "Sur LinkedIn",
  followCta: "Suivre Léa de Lamotte",
  postCta: "Voir le post",
  previewLabel: "aperçu du post (image)",
} as const;

export const contact = {
  eyebrow: "Contact",
  title: "Parlons de vos enjeux.",
  intro:
    "Un premier échange de trente minutes suffit souvent à clarifier une stratégie.",
  mailCta: "Nous contacter par mail",
  linkedinCta: "Nous contacter sur LinkedIn",
  /** Bande de fin de page d'accueil : une invitation, pas un formulaire. */
  bande: {
    title: "Un premier échange ?",
    intro:
      "Trente minutes suffisent souvent à y voir clair sur un dossier. Écrivez-nous, nous vous répondrons sous 48h.",
    cta: "Nous contacter",
  },
  /** En-tête de la page dédiée. */
  page: {
    eyebrow: "Contact",
    title: "Nous contacter",
    intro:
      "Décrivez votre situation en quelques lignes : nous revenons vers vous sous un jour ouvré pour convenir d'un premier échange.",
  },
  /** Libellés du formulaire. */
  form: {
    heading: "Écrire au cabinet",
    nom: "Nom et prénom",
    organisation: "Organisation",
    organisationAide: "Facultatif",
    email: "Adresse e-mail",
    telephone: "Téléphone",
    telephoneAide: "Facultatif",
    objet: "Votre sujet",
    objetDefaut: "Je ne sais pas encore",
    objetAutre: "Autre sujet",
    message: "Votre besoin en quelques lignes",
    consentement:
      "J'accepte que Kastell Conseil traite ces informations pour répondre à ma demande.",
    envoyer: "Envoyer le message",
    envoi: "Envoi…",
    succes:
      "Message reçu. Léa de Lamotte vous répond en général dans la journée ouvrée.",
    erreur:
      "L'envoi n'a pas abouti. Écrivez-nous directement, votre message est conservé ci-dessous.",
    indisponible:
      "Le formulaire n'est pas encore relié à une boîte de réception. Écrivez-nous directement — votre message est repris dans le courriel.",
    replierMail: "Ouvrir mon logiciel de messagerie",
    confidentialite: "Politique de confidentialité",
    obligatoire: "Champs obligatoires",
  },
} as const;

export const footer = {
  blurb:
    "Conseil en affaires publiques, lobbying et communication d'influence. Lamballe, Bretagne.",
  navHeading: "Navigation",
  infoHeading: "Informations",
  contactHeading: "Contact",
  copyright: "© 2026 Kastell Conseil",
  mention: "Représentant d'intérêts déclaré — HATVP",
} as const;

export const testimonials = [
  {
    quote:
      "« Un accompagnement précis, qui connaît les circuits de décision et sait quand intervenir. »",
    author: "Nom · fonction, organisation",
  },
  {
    quote:
      "« Une lecture du territoire breton que peu de cabinets parisiens peuvent offrir. »",
    author: "Nom · fonction, organisation",
  },
] as const;

export const posts = [
  {
    date: "12 août 2026",
    excerpt:
      "Loi d’accélération des énergies renouvelables : ce que change le dernier décret pour les porteurs de projets en Bretagne…",
    href: "#",
  },
  {
    date: "29 juillet 2026",
    excerpt:
      "Retour sur la table ronde « Eau et industrie agroalimentaire » organisée avec les acteurs du bassin rennais…",
    href: "#",
  },
  {
    date: "8 juillet 2026",
    excerpt:
      "Budget régional 2027 : trois arbitrages à suivre pour les filières de la mer et du littoral breton…",
    href: "#",
  },
] as const;

export const legal = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Politique de confidentialité", href: "/confidentialite" },
  { label: "LinkedIn", href: site.linkedin },
] as const;
