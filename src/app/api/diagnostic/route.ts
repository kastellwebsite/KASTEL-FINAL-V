import { NextResponse } from "next/server";
import { isWordPressConfigured, wordpressUrl } from "@/cms/env";

/**
 * État de la liaison avec WordPress, en une seule URL.
 *
 * Quand le site n'affiche pas une modification, la cause est presque toujours
 * l'une de quatre, et aucune ne se voit depuis le site : la variable
 * d'environnement absente, le déploiement antérieur à son ajout, WordPress
 * injoignable, ou la fiche restée en brouillon. Le repli sur le contenu du
 * dépôt est silencieux par conception — c'est ce qui garde le site debout —
 * mais il rend le diagnostic impossible à l'œil. Cette route le rend lisible.
 *
 * Protégée par le même secret que la revalidation : elle révèle l'adresse du
 * back-office, qui n'a pas à être publique.
 */

function secretValide(recu: string | null, attendu: string) {
  if (!recu || recu.length !== attendu.length) return false;
  let diff = 0;
  for (let i = 0; i < attendu.length; i++) {
    diff |= recu.charCodeAt(i) ^ attendu.charCodeAt(i);
  }
  return diff === 0;
}

/** Nombre d'éléments d'une liste, sans présumer de sa présence. */
const compter = (valeur: unknown) => (Array.isArray(valeur) ? valeur.length : 0);

export async function GET(request: Request) {
  const attendu = process.env.REVALIDATE_SECRET;
  if (!attendu) {
    return NextResponse.json(
      { message: "REVALIDATE_SECRET n'est pas configuré sur ce déploiement." },
      { status: 500 },
    );
  }

  const recu =
    request.headers.get("x-kastell-secret") ??
    new URL(request.url).searchParams.get("secret");
  if (!secretValide(recu, attendu)) {
    return NextResponse.json({ message: "Secret invalide." }, { status: 401 });
  }

  if (!isWordPressConfigured) {
    return NextResponse.json({
      wordpress: "non configuré",
      diagnostic:
        "WORDPRESS_API_URL est absente de ce déploiement : le site sert le contenu du dépôt. Ajoutez-la dans Vercel, puis redéployez.",
    });
  }

  const debut = Date.now();
  try {
    /* Lecture directe, sans cache : on veut l'état de WordPress maintenant,
       pas celui que le site a mémorisé. */
    const reponse = await fetch(`${wordpressUrl}/wp-json/kastell/v1/contenu`, {
      cache: "no-store",
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    const duree = Date.now() - debut;

    if (!reponse.ok) {
      return NextResponse.json({
        wordpress: wordpressUrl,
        joignable: false,
        statut: reponse.status,
        dureeMs: duree,
        diagnostic:
          reponse.status === 401 || reponse.status === 403
            ? "WordPress refuse la lecture anonyme. Levez la protection du site, ou l'extension de sécurité qui ferme l'API REST."
            : "WordPress répond, mais pas la route de l'extension. Vérifiez qu'elle est bien activée.",
      });
    }

    const contenu = (await reponse.json()) as Record<string, Record<string, unknown>>;
    const accueil = contenu.accueil ?? {};
    const apropos = contenu.apropos ?? {};

    return NextResponse.json({
      wordpress: wordpressUrl,
      joignable: true,
      dureeMs: duree,
      elements: {
        presse: compter(apropos.presse),
        publications: compter(apropos.publications),
        offres: compter(contenu.offres?.liste),
        clients: compter(accueil.clients),
        actualites: compter(accueil.posts),
        temoignages: compter(accueil.temoignages),
        chiffres: compter(accueil.visionChiffres),
      },
      diagnostic:
        "WordPress est lu correctement. Si le site n'affiche pas ces nombres, la page servie date d'avant : rechargez deux fois, ou redéployez si le décalage persiste.",
    });
  } catch (erreur) {
    return NextResponse.json({
      wordpress: wordpressUrl,
      joignable: false,
      dureeMs: Date.now() - debut,
      erreur: erreur instanceof Error ? erreur.message : String(erreur),
      diagnostic:
        "WordPress est injoignable depuis le site. Adresse erronée, site éteint, ou accès protégé. Le site sert le contenu du dépôt en attendant.",
    });
  }
}
