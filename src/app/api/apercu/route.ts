import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Mode aperçu : lecture directe de WordPress, sans attendre la revalidation.
 *
 * Le site est servi en pages pré-rendues, rafraîchies chaque minute. C'est ce
 * qui le rend rapide et robuste, mais cela impose d'attendre pour constater
 * l'effet d'une modification. Cette route pose un cookie qui, pour ce
 * navigateur seulement, fait relire WordPress à chaque affichage.
 *
 * Le site public n'est pas affecté : les autres visiteurs continuent de
 * recevoir la version pré-rendue.
 */

function secretValide(recu: string | null, attendu: string) {
  if (!recu || recu.length !== attendu.length) return false;
  let diff = 0;
  for (let i = 0; i < attendu.length; i++) {
    diff |= recu.charCodeAt(i) ^ attendu.charCodeAt(i);
  }
  return diff === 0;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const brouillon = await draftMode();

  /* La sortie n'exige pas de secret : rester bloqué en aperçu serait pire que
     de laisser n'importe qui y mettre fin, ce qui ne fait que rendre à ce
     navigateur la version publique. */
  if (url.searchParams.has("stop")) {
    brouillon.disable();
    return NextResponse.redirect(new URL("/", url.origin));
  }

  const attendu = process.env.REVALIDATE_SECRET;
  if (!attendu) {
    return NextResponse.json(
      { message: "REVALIDATE_SECRET n'est pas configuré sur ce déploiement." },
      { status: 500 },
    );
  }
  if (!secretValide(url.searchParams.get("secret"), attendu)) {
    return NextResponse.json({ message: "Secret invalide." }, { status: 401 });
  }

  brouillon.enable();

  /* Destination limitée aux chemins internes : un paramètre d'URL ne doit pas
     pouvoir servir à rediriger ailleurs. */
  const vers = url.searchParams.get("vers") ?? "/";
  const chemin = vers.startsWith("/") && !vers.startsWith("//") ? vers : "/";
  return NextResponse.redirect(new URL(chemin, url.origin));
}
