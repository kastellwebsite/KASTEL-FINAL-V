import { NextResponse, type NextRequest } from "next/server";
import { hotesRediriges, urlSite } from "@/lib/seo";

/**
 * Garde-fou d'indexation, au niveau de la requête.
 *
 * Deux dangers distincts, et un seul endroit d'où les traiter tous les deux :
 * la requête connaît l'hôte réellement demandé, ce que la construction ignore.
 *
 * 1. Les adresses de rechange. Le cabinet détient kastell-conseil.fr (au
 *    singulier) et la forme sans « www ». Servir le même site sous plusieurs
 *    adresses, c'est partager son autorité entre des jumeaux : elles
 *    renvoient donc en 301 vers l'adresse canonique, chemin et paramètres
 *    conservés.
 *
 * 2. Les déploiements de préqualification. Une preview Vercel porte le même
 *    contenu que la production ; indexée, elle en devient un duplicata
 *    intégral. On ne la redirige pas — elle doit rester consultable — mais on
 *    la déclare non indexable par en-tête, qui l'emporte sur tout le reste.
 *
 * La redirection est volontairement limitée à une liste fermée d'hôtes : tout
 * rediriger vers la production renverrait aussi les previews, qui n'auraient
 * alors plus aucune utilité.
 */

const hoteCanonique = new URL(urlSite).host;

export function middleware(requete: NextRequest) {
  const hote = requete.headers.get("host")?.toLowerCase() ?? "";

  if ((hotesRediriges as readonly string[]).includes(hote)) {
    const destination = new URL(requete.nextUrl.pathname + requete.nextUrl.search, urlSite);
    return NextResponse.redirect(destination, 301);
  }

  const reponse = NextResponse.next();
  if (hote && hote !== hoteCanonique && !hote.startsWith("localhost") && !hote.startsWith("127.0.0.1")) {
    reponse.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return reponse;
}

export const config = {
  /*
   * Tout sauf les fichiers déjà servis tels quels : les faire passer par le
   * middleware coûterait une invocation par image sans rien protéger.
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/|documents/).*)"],
};
