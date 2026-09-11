"use client";

import { Children, useId, useState } from "react";

/**
 * Liste qui ne montre d'abord qu'un nombre d'éléments, puis se déplie.
 *
 * Tous les éléments sont rendus, les surnuméraires étant seulement masqués :
 * ils restent dans le balisage pour les moteurs, et une feuille de style les
 * rétablit quand JavaScript est indisponible — auquel cas le bouton ne ferait
 * rien et la moitié du contenu deviendrait inaccessible.
 */
export function ListeDepliable({
  children,
  seuil,
  plus,
  moins,
  className = "",
}: {
  children: React.ReactNode;
  seuil: number;
  plus: string;
  moins: string;
  className?: string;
}) {
  const elements = Children.toArray(children);
  const [deplie, setDeplie] = useState(false);
  const id = useId();
  const depassement = elements.length > seuil;

  return (
    <>
      <ul id={id} className={`m-0 list-none p-0 ${className}`}>
        {elements.map((element, i) => (
          <li key={i} className={depassement && !deplie && i >= seuil ? "au-dela" : undefined}>
            {element}
          </li>
        ))}
      </ul>

      {depassement ? (
        <button
          type="button"
          className="pill pill-depliable mt-[clamp(20px,2.4vw,28px)]"
          aria-expanded={deplie}
          aria-controls={id}
          onClick={() => setDeplie((v) => !v)}
        >
          {deplie ? moins : `${plus} (${elements.length})`}
          <span aria-hidden>{deplie ? "↑" : "↓"}</span>
        </button>
      ) : null}
    </>
  );
}
