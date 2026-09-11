"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

type Textes = {
  cta: string;
  modalTitle: string;
  modalIntro: string;
  emailLabel: string;
  consent: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
  privacyNote: string;
  privacyLink: string;
};

type Etat = "repos" | "envoi" | "succes" | "erreur";

/**
 * Bouton de téléchargement et sa boîte de dialogue.
 *
 * On s'appuie sur <dialog> natif : le navigateur prend en charge le piège à
 * focus, la touche Échap, l'inertie de l'arrière-plan et le retour du focus sur
 * le bouton à la fermeture — autant de choses qu'une réimplémentation manuelle
 * rate presque toujours.
 */
export function TelechargerManifeste({ textes }: { textes: Textes }) {
  const dialogue = useRef<HTMLDialogElement>(null);
  const [etat, setEtat] = useState<Etat>("repos");
  const [message, setMessage] = useState("");
  const idTitre = useId();
  const idDescription = useId();

  // La page derrière ne doit pas défiler pendant que la boîte est ouverte.
  useEffect(() => {
    const noeud = dialogue.current;
    if (!noeud) return;
    const surFermeture = () => {
      document.body.style.overflow = "";
      setEtat("repos");
      setMessage("");
    };
    noeud.addEventListener("close", surFermeture);
    return () => noeud.removeEventListener("close", surFermeture);
  }, []);

  const ouvrir = () => {
    document.body.style.overflow = "hidden";
    dialogue.current?.showModal();
  };

  /*
   * Clic sur le fond : <dialog> reçoit l'événement pour tout ce qui l'entoure,
   * la cible étant alors la boîte elle-même et non l'un de ses enfants. C'est
   * la seule façon de distinguer le fond du contenu sans ajouter d'élément.
   */
  const surClic = (evenement: React.MouseEvent<HTMLDialogElement>) => {
    if (evenement.target === dialogue.current) dialogue.current?.close();
  };

  const envoyer = async (evenement: React.FormEvent<HTMLFormElement>) => {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);
    setEtat("envoi");
    setMessage("");

    try {
      const reponse = await fetch("/api/manifeste", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: String(donnees.get("email") ?? ""),
          consent: donnees.get("consent") === "on",
          societe: String(donnees.get("societe") ?? ""),
        }),
      });
      const resultat = (await reponse.json()) as { url?: string | null; message?: string };
      if (!reponse.ok) throw new Error(resultat.message ?? textes.error);

      setEtat("succes");
      setMessage(textes.success);

      if (resultat.url) {
        /* L'adresse rendue est celle du relais du site : de même origine, elle
           permet au navigateur d'honorer `download` et de ranger le fichier
           dans les téléchargements au lieu de l'ouvrir. */
        const lien = document.createElement("a");
        lien.href = resultat.url;
        lien.download = "";
        document.body.appendChild(lien);
        lien.click();
        lien.remove();
      }
    } catch (erreur) {
      setEtat("erreur");
      setMessage(erreur instanceof Error ? erreur.message : textes.error);
    }
  };

  return (
    <>
      <button type="button" onClick={ouvrir} className="pill pill-solid">
        {textes.cta}
        <span aria-hidden>↓</span>
      </button>

      <dialog
        ref={dialogue}
        aria-labelledby={idTitre}
        aria-describedby={idDescription}
        onClick={surClic}
        className="modale"
      >
        <form method="dialog" className="modale-fermer-zone">
          <button type="submit" className="modale-fermer" aria-label="Fermer">
            <span aria-hidden>×</span>
          </button>
        </form>

        <h2 id={idTitre} className="modale-titre">
          {textes.modalTitle}
        </h2>
        <p id={idDescription} className="modale-intro">
          {textes.modalIntro}
        </p>

        <form onSubmit={envoyer} noValidate={false}>
          <label htmlFor="manifeste-email" className="modale-label">
            {textes.emailLabel}
          </label>
          <input
            id="manifeste-email"
            name="email"
            type="email"
            required
            /* Sans cela, <dialog> place le focus sur le premier élément
               focalisable — ici le bouton de fermeture. */
            autoFocus
            autoComplete="email"
            maxLength={254}
            className="modale-champ"
          />

          {/* Leurre : hors écran et exclu de la tabulation, seul un robot le
              remplit. `hidden` ne conviendrait pas, certains robots l'ignorent
              justement parce qu'il est trop visible dans le balisage. */}
          <div className="sr-only" aria-hidden>
            <label htmlFor="manifeste-societe">Ne pas remplir</label>
            <input id="manifeste-societe" name="societe" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <label className="modale-consentement">
            <input type="checkbox" name="consent" required />
            <span>{textes.consent}</span>
          </label>

          <button type="submit" className="pill pill-solid modale-envoyer" disabled={etat === "envoi"}>
            {etat === "envoi" ? textes.submitting : textes.submit}
          </button>

          <p aria-live="polite" className={`modale-message ${etat === "erreur" ? "est-erreur" : ""}`}>
            {message}
          </p>
        </form>

        <p className="modale-note">
          {textes.privacyNote}{" "}
          <Link href="/confidentialite" className="modale-lien">
            {textes.privacyLink}
          </Link>
        </p>
      </dialog>
    </>
  );
}
