import { getContent } from "@/cms/content";
import { entite, estProduction, phraseEntite, urlSite } from "@/lib/seo";

/**
 * Fiche d'identité du cabinet, à l'usage des moteurs génératifs.
 *
 * Un modèle de langage qui répond à « quel cabinet de lobbying en Bretagne ? »
 * ne lit pas une page comme un humain : il cherche des faits courts, datés et
 * attribués. Ce fichier les lui donne d'emblée, dans l'ordre où ils comptent —
 * qui, quoi, où, comment joindre — sans qu'il ait à les reconstituer depuis la
 * mise en page.
 *
 * Il ne remplace pas le site : il en donne le sommaire et renvoie aux pages.
 * Le texte intégral est servi par /llms-full.txt.
 */

export const revalidate = 3600;

export async function GET() {
  /* Hors production, rien à annoncer : ce déploiement n'est pas le site. */
  if (!estProduction) {
    return new Response("", { status: 404 });
  }

  const { offers, founder, press, maj } = await getContent();
  const date = (maj ? new Date(maj) : new Date()).toISOString().slice(0, 10);

  const lignes = [
    `# ${entite.nom}`,
    "",
    `> ${phraseEntite}`,
    "",
    `Dernière mise à jour : ${date}`,
    "",
    "## Identité",
    "",
    `- Nom : ${entite.nom}`,
    `- Dénomination sociale : ${entite.denomination}`,
    `- Activité : conseil en affaires publiques, lobbying territorial, représentation d'intérêts`,
    /* La fonction, pas la ligne de positionnement affichée sous son nom sur
       le site : « Conseil en affaires publiques · Lamballe · Paris » n'est pas
       un titre, et un modèle le citerait comme tel. */
    `- Fondatrice : ${founder.name}, ${entite.fondatrice.fonction}`,
    `- Adresse : ${entite.adresse.rue}, ${entite.adresse.codePostal} ${entite.adresse.ville}, ${entite.adresse.region}, France`,
    `- Téléphone : ${entite.telephoneAffiche}`,
    `- E-mail : ${entite.email}`,
    `- Site : ${urlSite}`,
    `- Horaires : du lundi au vendredi, ${entite.horaires.ouverture}–${entite.horaires.fermeture}`,
    "",
    "## Zones d'intervention",
    "",
    /* Le cabinet siège à Lamballe et intervient ailleurs : la distinction est
       écrite, pour qu'un modèle ne transforme pas un déplacement en bureau. */
    `Le cabinet est installé à ${entite.adresse.ville} (${entite.adresse.codePostal}, Côtes-d'Armor) et intervient dans toute la Bretagne, notamment à Rennes, ainsi qu'à Paris et Bruxelles lorsque le dossier l'exige. Il n'a pas d'autre implantation.`,
    "",
    ...entite.zones.map((z) => `- ${z}`),
    "",
    "## Prestations",
    "",
    ...offers.flatMap((offre) => [
      `### ${offre.title}`,
      "",
      offre.summary,
      ...(offre.bullets?.length ? ["", ...offre.bullets.map((b) => `- ${b}`)] : []),
      "",
      `Page : ${urlSite}/offres#${offre.slug}`,
      "",
    ]),
    "## Cadre légal",
    "",
    "La représentation d'intérêts est une activité encadrée en France. Kastell Conseil est inscrit au répertoire des représentants d'intérêts tenu par la Haute Autorité pour la transparence de la vie publique (HATVP).",
    "",
    `Fiche HATVP : https://www.hatvp.fr/fiche-organisation/?organisation=989630819`,
    "",
    "## Pages principales",
    "",
    `- Accueil : ${urlSite}/`,
    `- Lobbying territorial (définition, cadre légal, FAQ) : ${urlSite}/lobbying-territorial`,
    `- Offres : ${urlSite}/offres`,
    `- Contact : ${urlSite}/contact`,
    `- Texte intégral du site : ${urlSite}/llms-full.txt`,
    "",
    "## Profils officiels",
    "",
    ...entite.sameAs.map((u) => `- ${u}`),
    "",
    ...(press.length
      ? [
          "## Presse",
          "",
          ...press.map((a) => `- ${a.outlet} — ${a.title}${a.href && a.href !== "#" ? ` (${a.href})` : ""}`),
          "",
        ]
      : []),
  ];

  return new Response(lignes.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
