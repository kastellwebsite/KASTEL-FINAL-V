import { graphe } from "@/lib/schema";

/**
 * Injecte un graphe schema.org dans la page, côté serveur.
 *
 * Le composant est volontairement sans état ni interactivité : les robots qui
 * lisent ces données n'exécutent pas de JavaScript, le balisage doit donc être
 * présent dans le HTML de la réponse, pas ajouté après coup.
 *
 * `JSON.stringify` protège de l'injection : une chaîne venue de WordPress ne
 * peut pas refermer la balise, puisque les caractères `<` restent échappés par
 * la sérialisation qui suit.
 */
export function DonneesStructurees({ noeuds }: { noeuds: Record<string, unknown>[] }) {
  const json = JSON.stringify(graphe(noeuds)).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      // Le contenu est du JSON sérialisé, pas du balisage : aucune valeur
      // saisie dans le CMS ne peut s'en échapper.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
