import { cache } from "react";
import * as fichier from "@/content/site";
import { findPublicAsset, findPublicDocument } from "@/lib/asset";
import { lireContenuWordPress } from "./client";
import { isWordPressConfigured } from "./env";

/**
 * Contenu du site, WordPress par-dessus les valeurs du dépôt.
 *
 * La fusion se fait champ par champ : une fiche à moitié remplie dans
 * l'administration ne vide jamais une rubrique, et si WordPress est injoignable
 * le site sert ce qu'il a. C'est ce qui permet de brancher le CMS
 * progressivement — et ce qui garantit qu'une panne du back-office ne met pas
 * le site public à terre.
 *
 * L'extension WordPress rend délibérément la même enveloppe que l'ancienne
 * requête Sanity : les noms de champs ci-dessous sont le contrat entre les deux
 * moitiés, et cette fonction n'a pas eu à changer lors de la bascule.
 */

/** Retient la valeur du CMS seulement si elle est réellement renseignée. */
const ou = <T,>(cms: T | null | undefined, repli: T): T => {
  if (cms === null || cms === undefined) return repli;
  if (typeof cms === "string" && cms.trim() === "") return repli;
  if (Array.isArray(cms) && cms.length === 0) return repli;
  return cms;
};

type Doc = Record<string, unknown>;
type Donnees = {
  /** Date ISO de la fiche modifiée le plus récemment, toutes rubriques confondues. */
  maj?: string;
  parametres?: Doc;
  accueil?: Doc;
  offres?: Doc;
  apropos?: Doc;
  piedDePage?: Doc;
};

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function assembler(d: Donnees) {
  const p = (d.parametres ?? {}) as Doc;
  const a = (d.accueil ?? {}) as Doc;
  const o = (d.offres ?? {}) as Doc;
  const ap = (d.apropos ?? {}) as Doc;
  const f = (d.piedDePage ?? {}) as Doc;

  type Offre = {
    index: string;
    slug: string;
    title: string;
    summary: string;
    bullets?: readonly string[];
    note?: string;
    caseStudy?: { title: string; body: string } | null;
  };
  type Publication = {
    label: string;
    title: string;
    context: string;
    href: string;
    cta: string;
    /** Liste numérotée facultative, utilisée par le manifeste du RIT. */
    objectives?: readonly string[];
    /** Photo de l'article, couverture du média, capture du post. */
    image?: string | null;
  };
  const offresListe: Offre[] | undefined = (o.liste as Doc[] | undefined)?.map((item, i) => ({
    index: String(i + 1).padStart(2, "0"),
    slug: (item.ancre as string) || slug((item.titre as string) ?? `offre-${i + 1}`),
    title: (item.titre as string) ?? "",
    summary: (item.resume as string) ?? "",
    bullets: (item.prestations as string[]) ?? [],
    note: (item.note as string) ?? undefined,
    caseStudy: (item.casPratique as { title: string; body: string } | null) ?? null,
  }));

  /** Les visuels arrivent de WordPress en URL absolues : rien à construire. */
  const visuel = (valeur: unknown): string | null =>
    typeof valeur === "string" && valeur.length > 0 ? valeur : null;

  /**
   * Logo d'un client ou d'un média, avec repli sur le dépôt.
   *
   * La fusion se fait par liste : dès qu'une liste existe côté CMS, elle
   * remplace celle du dépôt en entier. Sans ce repli, ajouter un client dans
   * WordPress sans téléverser son logo ferait disparaître le fichier déjà
   * présent dans le dépôt, et le nom s'afficherait en toutes lettres à sa
   * place. On rattrape donc le fichier par le nom.
   */
  const logo = (nom: string, fourni: unknown, dossier: string): string | null =>
    visuel(fourni) ?? findPublicAsset(`${dossier}/${slug(nom)}`);

  const presse = (ap.presse as Doc[] | undefined)?.map((item) => ({
    outlet: (item.media as string) ?? "",
    title: (item.titre as string) ?? "",
    href: (item.lien as string) ?? "#",
    logoUrl: logo((item.media as string) ?? "", item.logo, "brand/press"),
  }));

  return {
    /* Date de la dernière modification côté WordPress, quand elle est connue :
       c'est elle que le plan du site annonce aux moteurs. */
    maj: typeof d.maj === "string" && d.maj ? d.maj : null,
    site: {
      ...fichier.site,
      name: ou(p.nom as string, fichier.site.name),
      url: ou(p.url as string, fichier.site.url),
      email: ou(p.email as string, fichier.site.email),
      city: ou(p.ville as string, fichier.site.city),
      linkedin: ou(p.linkedin as string, fichier.site.linkedin),
      linkedinProfile: ou(p.linkedinProfil as string, fichier.site.linkedinProfile),
      hatvp: ou(p.hatvp as string, fichier.site.hatvp),
    },
    hero: {
      promise: ou(a.promesse as string, fichier.hero.promise),
      cta: ou(a.herosCta as string, fichier.hero.cta),
      illustration:
        visuel(a.herosVisuel) ?? "/brand/manifeste-carte.svg",
    },
    vision: {
      eyebrow: ou(a.visionIntitule as string, fichier.vision.eyebrow),
      title: ou(a.visionTitre as string, fichier.vision.title),
      paragraphs: ou(
        a.visionParagraphes as string[],
        fichier.vision.paragraphs as readonly string[] as string[],
      ),
      stats: ou(
        (a.visionChiffres as Doc[] | undefined)?.map((s) => ({
          value: (s.valeur as string) ?? "",
          label: (s.libelle as string) ?? "",
        })),
        fichier.vision.stats as readonly { value: string; label: string }[] as {
          value: string;
          label: string;
        }[],
      ),
    },
    offersSection: {
      ...fichier.offersSection,
      eyebrow: ou(o.intitule as string, fichier.offersSection.eyebrow),
      pageTitle: ou(o.titrePage as string, fichier.offersSection.pageTitle),
      pageIntro: ou(o.introPage as string, fichier.offersSection.pageIntro),
    },
    offers: ou<Offre[]>(offresListe, fichier.offers as readonly Offre[] as Offre[]),
    about: {
      ...fichier.about,
      eyebrow: ou(ap.intitule as string, fichier.about.eyebrow),
      pressHeading: ou(ap.presseIntitule as string, fichier.about.pressHeading),
      publicationsHeading: ou(
        ap.publicationsIntitule as string,
        fichier.about.publicationsHeading,
      ),
    },
    founder: {
      ...fichier.founder,
      name: ou(ap.nom as string, fichier.founder.name),
      role: ou(ap.role as string, fichier.founder.role),
      bio: ou(ap.biographie as string[], fichier.founder.bio as readonly string[] as string[]),
      quote: ou(ap.citation as string, fichier.founder.quote),
      photoUrl: visuel(ap.portrait) ?? findPublicAsset("brand/fondatrice"),
    },
    press: ou(
      presse,
      fichier.press.map((item) => ({
        outlet: item.outlet,
        title: item.title,
        href: item.href,
        logoUrl: findPublicAsset(item.logo),
      })),
    ),
    publications: ou<Publication[]>(
      (ap.publications as Doc[] | undefined)?.map((item) => ({
        label: (item.categorie as string) ?? "",
        title: (item.titre as string) ?? "",
        context: (item.contexte as string) ?? "",
        /* Une section choisie l'emporte : c'est un choix explicite, là où le
           champ d'adresse peut n'avoir jamais été vidé. */
        href: ((item.destination as string) || (item.lien as string) || "#"),
        cta: (item.cta as string) ?? "En savoir plus",
        objectives: (item.objectifs as string[]) ?? undefined,
        image: visuel(item.visuel),
      })),
      fichier.publications as readonly Publication[] as Publication[],
    ),
    manifesto: {
      ...fichier.manifesto,
      eyebrow: ou(ap.manifesteIntitule as string, fichier.manifesto.eyebrow),
      title: ou(ap.manifesteTitre as string, fichier.manifesto.title),
      intro: ou(ap.manifesteIntro as string, fichier.manifesto.intro),
      objectivesHeading: ou(
        ap.manifesteObjectifsTitre as string,
        fichier.manifesto.objectivesHeading,
      ),
      objectives: ou(
        ap.manifesteObjectifs as string[],
        fichier.manifesto.objectives as readonly string[] as string[],
      ),
      tags: ou(
        ap.manifesteEtiquettes as string[],
        fichier.manifesto.tags as readonly string[] as string[],
      ),
      cta: ou(ap.manifesteCta as string, fichier.manifesto.cta),
      href: ou(ap.manifesteLien as string, fichier.manifesto.href),
      coverUrl: visuel(ap.manifesteCouverture) ?? fichier.manifesto.coverUrl,
      download: {
        ...fichier.manifesto.download,
        cta: ou(ap.manifesteTelechargerCta as string, fichier.manifesto.download.cta),
        /* Le fichier du studio prime sur celui du dépôt ; sans l'un ni l'autre,
           la chaîne reste vide et le bouton ne s'affiche pas. */
        fileUrl:
          ou(ap.manifesteFichier as string, "") ||
          findPublicDocument(fichier.manifesto.download.file) ||
          "",
      },
    },
    references: {
      ...fichier.references,
      eyebrow: ou(a.referencesIntitule as string, fichier.references.eyebrow),
      title: ou(a.referencesTitre as string, fichier.references.title),
    },
    clients: ou(
      (a.clients as Doc[] | undefined)?.map((c) => ({
        name: (c.nom as string) ?? "",
        logoUrl: logo((c.nom as string) ?? "", c.logo, "brand"),
        /* Le cran de marge est réglé fiche par fiche ; sans réglage, la
           marge normale. */
        logoSize: ((c.taille as string) || "normale") as string,
      })),
      fichier.clients.map((c) => ({
        name: c.name,
        logoUrl: findPublicAsset(c.file),
        logoSize: "normale",
      })),
    ),
    testimonials: ou(
      (a.temoignages as Doc[] | undefined)?.map((t) => ({
        quote: (t.citation as string) ?? "",
        author: (t.auteur as string) ?? "",
      })),
      fichier.testimonials as readonly unknown[] as { quote: string; author: string }[],
    ),
    news: {
      ...fichier.news,
      heading: ou(a.actualitesTitre as string, fichier.news.heading),
      followCta: ou(a.actualitesCta as string, fichier.news.followCta),
    },
    posts: ou(
      (a.posts as Doc[] | undefined)?.map((post) => ({
        date: (post.date as string) ?? "",
        excerpt: (post.extrait as string) ?? "",
        href: (post.lien as string) ?? "#",
        image: visuel(post.visuel),
      })),
      fichier.posts.map((post) => ({
        date: post.date,
        excerpt: post.excerpt,
        href: post.href,
        /* Le dépôt ne porte pas de visuel : la carte retombe sur son aplat. */
        image: null as string | null,
      })),
    ),
    contact: {
      ...fichier.contact,
      eyebrow: ou(a.contactIntitule as string, fichier.contact.eyebrow),
      title: ou(a.contactTitre as string, fichier.contact.title),
      intro: ou(a.contactIntro as string, fichier.contact.intro),
    },
    footer: {
      ...fichier.footer,
      blurb: ou(f.accroche as string, fichier.footer.blurb),
      copyright: ou(f.copyright as string, fichier.footer.copyright),
      mention: ou(f.mention as string, fichier.footer.mention),
    },
  };
}

export type Contenu = ReturnType<typeof assembler>;

export const getContent = cache(async (): Promise<Contenu> => {
  if (!isWordPressConfigured) return assembler({});
  try {
    const donnees = await lireContenuWordPress<Donnees>();
    return assembler(donnees ?? {});
  } catch (erreur) {
    // Le site reste debout si le CMS tombe : on sert le contenu du dépôt.
    console.error("[wordpress] lecture impossible, repli sur le contenu du dépôt", erreur);
    return assembler({});
  }
});
