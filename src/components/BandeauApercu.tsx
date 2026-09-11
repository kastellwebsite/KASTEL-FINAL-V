import { draftMode } from "next/headers";

/**
 * Rappel visible qu'on regarde le site en aperçu.
 *
 * Sans lui, on oublie qu'on est dans un mode particulier : le site paraît se
 * mettre à jour instantanément pour tout le monde, et la première personne à
 * qui on montre le lien voit autre chose. Le bandeau dit lequel des deux
 * régimes on regarde, et comment en sortir.
 */
export async function BandeauApercu() {
  if (!(await draftMode()).isEnabled) return null;

  return (
    <div className="bandeau-apercu">
      <span>
        <strong>Aperçu.</strong> Cette page est relue depuis WordPress à chaque
        affichage. Les visiteurs voient la version publique.
      </span>
      <a href="/api/apercu?stop=1">Quitter l’aperçu</a>
    </div>
  );
}
