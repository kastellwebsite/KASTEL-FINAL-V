/**
 * Adresse de l'API WordPress, côté serveur uniquement.
 *
 * Pas de préfixe NEXT_PUBLIC_ : le domaine du back-office n'a rien à faire dans
 * le bundle envoyé au navigateur. Les pages sont rendues sur le serveur, seul
 * lui a besoin de connaître WordPress.
 */
const lire = (cle: string): string | undefined => {
  if (typeof process === "undefined") return undefined;
  return process.env?.[cle];
};

/** Sans barre oblique finale, pour composer les URL sans doublon. */
export const wordpressUrl = (lire("WORDPRESS_API_URL") ?? "").replace(/\/+$/, "");

/**
 * Tant qu'aucune adresse n'est renseignée, le site sert le contenu de
 * src/content/site.ts. Rien ne casse avant que WordPress soit branché, et rien
 * ne casse non plus s'il devient injoignable.
 */
export const isWordPressConfigured = wordpressUrl.length > 0;

/** Coupe court si WordPress rame : mieux vaut le contenu du dépôt qu'une page qui ne vient jamais. */
export const DELAI_MS = 8000;
