import { draftMode } from "next/headers";
import { DELAI_MS, isWordPressConfigured, wordpressUrl } from "./env";

/**
 * Un seul appel : l'extension WordPress expose une route d'agrégation qui rend
 * les cinq rubriques d'un coup. Interroger cinq points d'entrée séparés
 * multiplierait les allers-retours et les modes de panne partielle.
 */
const ROUTE = "/wp-json/kastell/v1/contenu";

export async function lireContenuWordPress<T>(): Promise<T | null> {
  if (!isWordPressConfigured) return null;

  /* En aperçu, on relit WordPress à chaque affichage : c'est tout l'intérêt.
     Hors aperçu, la lecture est mise en cache et rafraîchie chaque minute, ou
     immédiatement quand WordPress signale une publication. */
  const apercu = (await draftMode()).isEnabled;

  const reponse = await fetch(`${wordpressUrl}${ROUTE}`, {
    signal: AbortSignal.timeout(DELAI_MS),
    headers: { accept: "application/json" },
    ...(apercu
      ? { cache: "no-store" as const }
      : { next: { revalidate: 60, tags: ["contenu"] } }),
  });

  if (!reponse.ok) {
    throw new Error(`WordPress a répondu ${reponse.status}`);
  }
  return (await reponse.json()) as T;
}
