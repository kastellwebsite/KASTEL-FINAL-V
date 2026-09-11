"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Apparition reprise de la maquette : fondu, montée de 16 px, 900 ms, décalée
 * par groupes de quatre, avec un filet de sécurité à 700 ms pour qu'aucun
 * contenu ne reste prisonnier de l'observateur.
 *
 * `immediat` sert le contenu visible d'emblée, en haut de page.
 *
 * Pourquoi il existe : la règle `.reveal` pose une opacité nulle, et un
 * navigateur ne compte pas comme peint un élément transparent. Le texte du haut
 * de page était donc dans le HTML dès la première milliseconde, mais la plus
 * grande peinture n'était enregistrée qu'après le chargement du JavaScript,
 * l'hydratation et le déclenchement de l'observateur — 1162 ms de retard
 * mesurés sur la page Offres.
 *
 * Or ce contenu est visible par définition : il n'a rien à attendre d'un
 * observateur. Avec `immediat`, l'animation est jouée par une règle CSS dès le
 * premier rendu, aux mêmes durée, courbe et décalage. Rien ne change à l'œil ;
 * le JavaScript n'est simplement plus sur le chemin critique.
 */
export function Reveal({
  children,
  index = 0,
  className = "",
  as: Tag = "div",
  immediat = false,
  ...rest
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
  as?: "div" | "section" | "figure";
  /** Contenu visible sans défilement : animé par CSS, sans observateur. */
  immediat?: boolean;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    /* Rien à observer : l'animation est déjà jouée par la feuille de style. */
    if (immediat) return;

    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const fallback = window.setTimeout(() => setVisible(true), 700);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          window.clearTimeout(fallback);
          setVisible(true);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    io.observe(node);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, [immediat]);

  const decalage = `${Math.min(index % 4, 3) * 90}ms`;

  return (
    <Tag
      // @ts-expect-error -- single ref shared across the allowed tag union
      ref={ref}
      className={`reveal ${immediat ? "reveal-immediat" : visible ? "is-visible" : ""} ${className}`}
      style={immediat ? { animationDelay: decalage } : { transitionDelay: decalage }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
