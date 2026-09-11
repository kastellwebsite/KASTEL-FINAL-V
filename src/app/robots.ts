import type { MetadataRoute } from "next";
import { estProduction, urlSite } from "@/lib/seo";

/**
 * Agents des moteurs génératifs, nommés un par un.
 *
 * La règle générique « * » les couvrirait déjà, mais les nommer lève toute
 * ambiguïté : certains éditeurs ne suivent leur propre agent que s'il est cité
 * explicitement, et un robots.txt muet sur leur nom est parfois traité comme
 * un refus par prudence. Kastell a tout intérêt à être cité par ces moteurs.
 */
const AGENTS_IA = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  /* Hors production, tout est refusé : une preview porte le même contenu que
     le site et en deviendrait un duplicata intégral aux yeux des moteurs. */
  if (!estProduction) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        /* Routes techniques : elles ne produisent aucune page à lire. */
        disallow: ["/api/"],
      },
      ...AGENTS_IA.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${urlSite}/sitemap.xml`,
    host: urlSite,
  };
}
