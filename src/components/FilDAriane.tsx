import Link from "next/link";

/**
 * Fil d'Ariane.
 *
 * Il double le balisage `BreadcrumbList` : Google n'affiche le chemin dans ses
 * résultats que s'il le trouve aussi dans la page, et un visiteur arrivé
 * directement sur une page intérieure — c'est le cas de tout trafic venu d'un
 * moteur — n'a sinon aucun repère sur sa position dans le site.
 *
 * La dernière étape est la page courante : elle n'est pas un lien, et porte
 * `aria-current` pour que ce soit aussi vrai à l'oreille qu'à l'œil.
 */
export function FilDAriane({
  etapes,
  sombre = false,
}: {
  etapes: { nom: string; chemin: string }[];
  /** Sur une bande vert foncé, le contraste s'inverse. */
  sombre?: boolean;
}) {
  /*
   * La couleur est posée sur le lien lui-même, pas seulement héritée de la
   * liste : la règle générale des liens vaut #192924, soit exactement le fond
   * de la bande vert foncé. Hérité, « Accueil » y devenait invisible — non pas
   * peu lisible, mais d'un contraste de 1:1 avec son fond.
   */
  const couleur = sombre ? "text-[rgba(226,240,248,0.62)]" : "text-muted";
  const lien = sombre
    ? "text-[rgba(226,240,248,0.72)] hover:text-white"
    : "text-muted hover:text-forest";

  return (
    <nav aria-label="Fil d'Ariane" className="mb-[clamp(16px,2vw,24px)]">
      <ol
        className={`m-0 flex list-none flex-wrap items-center gap-x-2 gap-y-1 p-0 font-sans text-[12px] uppercase tracking-[0.14em] ${couleur}`}
      >
        {etapes.map((etape, i) => {
          const derniere = i === etapes.length - 1;
          return (
            <li key={etape.chemin} className="flex items-center gap-x-2">
              {derniere ? (
                <span aria-current="page">{etape.nom}</span>
              ) : (
                <>
                  <Link href={etape.chemin} className={`hit-area ${lien}`}>
                    {etape.nom}
                  </Link>
                  <span aria-hidden>/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
