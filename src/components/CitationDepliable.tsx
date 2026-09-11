"use client";

import { useId, useState } from "react";

/**
 * Témoignage, tronqué au-delà d'une certaine longueur.
 *
 * Le texte complet est toujours rendu et seulement écrêté par la feuille de
 * style : les moteurs le lisent en entier, et sans JavaScript il s'affiche tel
 * quel plutôt que d'être amputé par un bouton inopérant.
 *
 * Le seuil dépend de la place : l'écrêtage se fait sur quatre lignes, et une
 * colonne pleine largeur en contient deux fois plus qu'une colonne sur trois.
 */
export function CitationDepliable({
  citation,
  auteur,
  lire,
  reduire,
  seuil = 180,
  seule = false,
}: {
  citation: string;
  auteur: string;
  lire: string;
  reduire: string;
  seuil?: number;
  seule?: boolean;
}) {
  const [ouvert, setOuvert] = useState(false);
  const id = useId();
  const longue = citation.length > seuil;

  return (
    /* Seule, la citation ne peut pas tenir une colonne sur deux sans laisser
       l'autre vide : elle se centre, comme la bande de logos au-dessus. */
    <div
      className={`border-t border-[rgba(25,41,36,0.2)] pt-6 ${
        seule ? "mx-auto max-w-[58ch] text-center" : ""
      }`}
    >
      <p
        id={id}
        className={`citation m-0 mb-[14px] font-serif italic leading-[1.5] text-forest ${
          seule ? "text-[clamp(20px,1.9vw,27px)]" : "text-[clamp(18px,1.5vw,22px)]"
        } ${longue && !ouvert ? "est-ecretee" : ""}`}
      >
        {citation}
      </p>

      {longue ? (
        <button
          type="button"
          className="citation-lien mb-[14px]"
          aria-expanded={ouvert}
          aria-controls={id}
          onClick={() => setOuvert((v) => !v)}
        >
          {ouvert ? reduire : lire}
        </button>
      ) : null}

      <p className="m-0 font-sans text-[14px] uppercase tracking-[0.14em] text-sage">
        {auteur}
      </p>
    </div>
  );
}
