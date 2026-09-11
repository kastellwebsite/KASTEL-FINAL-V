import { getContent } from "@/cms/content";
import { lobbying } from "@/content/site";
import { entite, estProduction, phraseEntite, urlSite } from "@/lib/seo";

/**
 * Texte intégral du site, en une seule page sans mise en forme.
 *
 * Un moteur génératif qui veut citer Kastell doit sinon parcourir cinq pages
 * et en extraire le texte de la mise en page. Ici, tout est déjà là, dans
 * l'ordre de lecture, sans navigation ni décor — ce qui réduit aussi le risque
 * qu'il cite un intitulé de bouton en croyant citer une position du cabinet.
 *
 * Le fichier se régénère depuis WordPress : il ne peut pas diverger du site.
 */

export const revalidate = 3600;

/** Enchaîne des blocs en écartant les vides, pour ne jamais laisser de trous. */
const bloc = (...morceaux: (string | false | null | undefined)[]) =>
  morceaux.filter(Boolean).join("\n");

export async function GET() {
  if (!estProduction) {
    return new Response("", { status: 404 });
  }

  const contenu = await getContent();
  const { vision, offers, founder, references, manifesto, press, publications, contact, maj } =
    contenu;
  const date = (maj ? new Date(maj) : new Date()).toISOString().slice(0, 10);

  const lignes: string[] = [
    `# ${entite.nom} — texte intégral du site`,
    "",
    `> ${phraseEntite}`,
    "",
    `Source : ${urlSite} · Dernière mise à jour : ${date}`,
    "",
    "---",
    "",
    "## Vision",
    "",
    vision.title.replace(/^«\s*|\s*»$/g, ""),
    "",
    ...vision.paragraphs,
    "",
    "## Offres",
    "",
    ...offers.flatMap((o) => [
      `### ${o.title}`,
      "",
      o.summary,
      ...(o.bullets?.length ? ["", ...o.bullets.map((b) => `- ${b}`)] : []),
      ...(o.note ? ["", o.note] : []),
      "",
    ]),
    "## Lobbying territorial",
    "",
    lobbying.chapo,
    "",
    ...lobbying.sections.flatMap((s) => [
      `### ${s.titre}`,
      "",
      s.reponse,
      ...(s.paragraphes.length ? ["", ...s.paragraphes] : []),
      "",
    ]),
    "### Questions fréquentes",
    "",
    ...lobbying.faq.flatMap((f) => [`**${f.question}**`, "", f.reponse, ""]),
    "## Le cabinet",
    "",
    `${founder.name} — ${entite.fondatrice.fonction}`,
    founder.role,
    "",
    ...founder.bio,
    "",
    `« ${founder.quote.replace(/^«\s*|\s*»$/g, "")} »`,
    "",
    ...(press.length
      ? ["### Revue de presse", "", ...press.map((a) => `- ${a.outlet} — ${a.title}`), ""]
      : []),
    ...(publications.length
      ? [
          "### Publications",
          "",
          ...publications.flatMap((p) => [
            `**${p.label} — ${p.title}**`,
            "",
            p.context,
            ...(p.objectives?.length ? ["", ...p.objectives.map((o) => `- ${o}`)] : []),
            "",
          ]),
        ]
      : []),
    "## Manifeste — Réseau Influence & Territoires",
    "",
    manifesto.intro,
    ...(manifesto.objectives?.length
      ? ["", manifesto.objectivesHeading, "", ...manifesto.objectives.map((o) => `- ${o}`)]
      : []),
    "",
    "## Références",
    "",
    references.title,
    "",
    ...(contenu.clients.length ? contenu.clients.map((c) => `- ${c.name}`) : []),
    "",
    "## Contact",
    "",
    contact.intro,
    "",
    `- Adresse : ${entite.adresse.rue}, ${entite.adresse.codePostal} ${entite.adresse.ville}`,
    `- Téléphone : ${entite.telephoneAffiche}`,
    `- E-mail : ${entite.email}`,
    `- Formulaire : ${urlSite}/contact`,
    "",
    "## Mentions",
    "",
    bloc(
      `${entite.denomination}, EURL, siège social ${entite.adresse.rue}, ${entite.adresse.codePostal} ${entite.adresse.ville}.`,
      "RCS 989 630 819 Saint-Brieuc. SIRET 98963081900013.",
      "Inscrit au répertoire des représentants d'intérêts de la HATVP.",
      "Ce site ne dépose aucun cookie et n'utilise aucun outil de mesure d'audience.",
    ),
    "",
  ];

  return new Response(lignes.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
