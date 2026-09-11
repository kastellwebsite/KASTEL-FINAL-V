import type { MetadataRoute } from "next";
import { getContent } from "@/cms/content";
import { estProduction, urlSite } from "@/lib/seo";

/* Le sitemap suit le contenu : une offre ajoutée dans WordPress doit y
   apparaître sans redéploiement. */
export const revalidate = 3600;

/**
 * Plan du site.
 *
 * Hors production, il est servi vide : une preview qui annoncerait ses propres
 * adresses inviterait les moteurs à indexer un duplicata du site.
 *
 * Les pages légales sont en noindex et restent donc hors du plan : les y
 * inscrire enverrait aux moteurs deux instructions contraires.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!estProduction) return [];

  /* Date réelle de la dernière modification dans WordPress. À défaut — CMS
     injoignable, ou pas encore branché — la date de construction, qui reste
     vraie : c'est bien à ce moment-là que la page servie a été fabriquée. */
  const { maj } = await getContent();
  const modifie = maj ? new Date(maj) : new Date();

  /* Les six offres sont des ancres de la page Offres, pas des pages : elles
     n'ont pas d'adresse propre à déclarer. */
  return [
    { url: urlSite, lastModified: modifie, changeFrequency: "weekly", priority: 1 },
    { url: `${urlSite}/offres`, lastModified: modifie, changeFrequency: "monthly", priority: 0.9 },
    {
      url: `${urlSite}/lobbying-territorial`,
      lastModified: modifie,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    { url: `${urlSite}/contact`, lastModified: modifie, changeFrequency: "yearly", priority: 0.7 },
  ];
}
