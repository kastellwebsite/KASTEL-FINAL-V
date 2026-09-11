"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { nav } from "@/content/site";

/** Hauteur commune aux deux logos ; la largeur suit leur rapport d'origine. */
const LOGO_H = 38;
const MARK_W = Math.round((LOGO_H * 2500) / 2407);
const WORDMARK_W = Math.round((LOGO_H * 2500) / 737);

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  /**
   * Le héros porte déjà le mot-symbole en grand : tant qu'il est à l'écran, le
   * header se contente de la marque. Dès qu'on le quitte — ou sur toute autre
   * page — le mot-symbole complet prend le relais.
   *
   * Seul l'observateur écrit `heroVisible` ; la route est combinée au rendu.
   * Un état unique remis à jour depuis l'effet resterait bloqué sur la marque
   * après une navigation côté client, le Header n'étant pas remonté.
   */
  const [heroVisible, setHeroVisible] = useState(true);
  const pastHero = !isHome || !heroVisible;
  const ref = useRef<HTMLElement>(null);

  /**
   * Menu repliable en petit écran.
   *
   * La navigation en ligne se repliait sur trois rangs sous 500 px : le header
   * occupait alors 132 px en permanence — près d'un cinquième d'un écran de
   * téléphone — pour des liens de 15 px de haut, très en deçà de ce qu'un
   * pouce peut viser.
   */
  /*
   * On retient la route sur laquelle le menu a été ouvert, plutôt qu'un simple
   * booléen : l'état se déduit alors au rendu et un changement de route referme
   * le panneau sans effet de bord. Le remettre à zéro depuis un effet
   * laisserait, le temps d'un rendu, un panneau ouvert par-dessus la page
   * suivante. Les ancres de la page courante, elles, sont refermées par le
   * gestionnaire de clic des liens.
   */
  const [ouvertSur, setOuvertSur] = useState<string | null>(null);
  const menuOuvert = ouvertSur === pathname;
  const idMenu = useId();
  const bouton = useRef<HTMLButtonElement>(null);

  const fermer = useCallback(() => setOuvertSur(null), []);

  useEffect(() => {
    if (!menuOuvert) return;
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOuvertSur(null);
        bouton.current?.focus();
      }
    };
    const surClic = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOuvertSur(null);
    };
    document.addEventListener("keydown", surTouche);
    document.addEventListener("pointerdown", surClic);
    /* La page derrière ne défile pas pendant que le panneau est ouvert. */
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", surTouche);
      document.removeEventListener("pointerdown", surClic);
      document.body.style.overflow = "";
    };
  }, [menuOuvert]);

  useEffect(() => {
    if (!isHome || typeof IntersectionObserver === "undefined") return;
    const hero = document.getElementById("top");
    if (!hero) return;
    const io = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { rootMargin: `-${LOGO_H + 40}px 0px 0px 0px`, threshold: 0 },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, [isHome]);

  /**
   * Publie la hauteur réelle du header : la navigation se replie sur deux
   * lignes en mobile, un point de rupture figé dériverait.
   */
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const publish = () =>
      document.documentElement.style.setProperty(
        "--header-h",
        `${Math.round(node.getBoundingClientRect().height)}px`,
      );
    publish();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(publish);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        frame = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      ref={ref}
      data-scrolled={scrolled}
      className="site-header sticky top-0 z-50 relative border-b border-[rgba(25,41,36,0.10)] bg-[rgba(250,249,246,0.92)] backdrop-blur-[10px]"
    >
      {/* Moins de marge verticale en petit écran : le bouton de menu est plus
          haut que le logo et fixait la hauteur du bandeau, qui reste affiché en
          permanence. */}
      <div className="shell flex items-center justify-between gap-8 py-[13px] min-[860px]:py-[18px]">
        <Link
          href="/#top"
          aria-label="Kastell — Conseil & lobbying engagé, retour à l'accueil"
          className="logo-swap hit-area relative block shrink-0"
          style={{
            height: LOGO_H,
            width: pastHero ? WORDMARK_W : MARK_W,
          }}
        >
          {/* Des deux faces, une seule est visible au premier rendu : la marque
              sur l'accueil, le mot-symbole partout ailleurs. Seule celle-là est
              préchargée. L'autre reste dans le document — le fondu croisé en a
              besoin — mais elle n'a plus à disputer la bande passante au texte
              et à la feuille de style pendant la seconde qui compte. */}
          <Image
            src="/brand/kastell-mark.png"
            alt=""
            aria-hidden
            width={2500}
            height={2407}
            priority={isHome}
            sizes="40px"
            className="logo-swap-face aspect-[2500/2407] h-full w-auto"
            style={{ opacity: pastHero ? 0 : 1 }}
          />
          <Image
            src="/brand/kastell-logo-forest.png"
            alt=""
            aria-hidden
            width={2500}
            height={737}
            priority={!isHome}
            sizes="129px"
            className="logo-swap-face aspect-[2500/737] h-full w-auto"
            style={{ opacity: pastHero ? 1 : 0 }}
          />
        </Link>

        <nav className="hidden items-center justify-end gap-[clamp(16px,2.2vw,34px)] min-[860px]:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link hit-area"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/contact" className="nav-cta">
            Échanger avec nous
          </Link>
        </nav>

        <button
          ref={bouton}
          type="button"
          className="menu-bouton min-[860px]:hidden"
          aria-expanded={menuOuvert}
          aria-controls={idMenu}
          onClick={() => setOuvertSur(menuOuvert ? null : pathname)}
        >
          <span className="menu-barres" data-ouvert={menuOuvert} aria-hidden>
            <span />
            <span />
          </span>
          <span className="sr-only">{menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}</span>
        </button>
      </div>

      {/* Positionné hors du flux : le panneau ne doit pas changer la hauteur
          du header, qui sert de décalage aux ancres. */}
      <div
        id={idMenu}
        className="menu-panneau min-[860px]:hidden"
        data-ouvert={menuOuvert}
        hidden={!menuOuvert}
      >
        <nav className="shell flex flex-col py-2">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="menu-lien" onClick={fermer}>
              {item.label}
            </Link>
          ))}
          <Link href="/contact" className="menu-cta" onClick={fermer}>
            Échanger avec nous
            <span aria-hidden>→</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
