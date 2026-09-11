import { NextResponse } from "next/server";
import { getContent } from "@/cms/content";

/**
 * Téléchargement du manifeste contre adresse e-mail.
 *
 * L'adresse est relayée vers MANIFESTE_WEBHOOK_URL (Zapier, Make, Brevo, n8n :
 * tout service acceptant un POST JSON). Si la variable n'est pas configurée,
 * l'adresse est journalisée et le document est servi quand même — une
 * intégration manquante ne doit pas priver un visiteur du document.
 *
 * Le fichier lui-même est servi par /api/manifeste/fichier, sans contrôle :
 * l'adresse une fois connue, elle est publique. C'est le compromis habituel de
 * ce type de formulaire, et il est assumé — le but est de qualifier des
 * contacts, pas de protéger un document par ailleurs diffusé publiquement.
 */

/* Volontairement permissif : rejeter les adresses valides coûte plus cher que
   laisser passer quelques saisies fantaisistes, que le webhook filtrera. */
const EMAIL = /^[^\s@]+@[^\s@.]+\.[^\s@]{2,}$/;

/* Garde-fou de première ligne, par instance : sur une plateforme sans état, ce
   compteur ne survit pas au recyclage de l'instance et n'a pas vocation à
   remplacer une protection en amont. */
const FENETRE_MS = 60_000;
const MAX_PAR_FENETRE = 5;
const compteur = new Map<string, { n: number; debut: number }>();

function tropDeRequetes(ip: string) {
  const maintenant = Date.now();
  const suivi = compteur.get(ip);
  if (!suivi || maintenant - suivi.debut > FENETRE_MS) {
    compteur.set(ip, { n: 1, debut: maintenant });
    return false;
  }
  suivi.n += 1;
  return suivi.n > MAX_PAR_FENETRE;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "inconnu";
  if (tropDeRequetes(ip)) {
    return NextResponse.json({ message: "Trop de demandes." }, { status: 429 });
  }

  let corps: unknown;
  try {
    corps = await request.json();
  } catch {
    return NextResponse.json({ message: "Requête illisible." }, { status: 400 });
  }

  const { email, consent, societe } = (corps ?? {}) as {
    email?: unknown;
    consent?: unknown;
    societe?: unknown;
  };

  /* Champ leurre : invisible à l'écran, seul un robot le remplit. On répond
     comme si tout allait bien, sans rien enregistrer. */
  if (typeof societe === "string" && societe.length > 0) {
    return NextResponse.json({ url: null });
  }

  if (typeof email !== "string" || email.length > 254 || !EMAIL.test(email)) {
    return NextResponse.json({ message: "Adresse e-mail invalide." }, { status: 400 });
  }
  if (consent !== true) {
    return NextResponse.json({ message: "Consentement requis." }, { status: 400 });
  }

  const { manifesto } = await getContent();
  if (!manifesto.download.fileUrl) {
    return NextResponse.json({ message: "Document indisponible." }, { status: 404 });
  }
  /* On rend l'adresse du relais, jamais celle du CMS : de même origine, elle
     permet au navigateur d'honorer le téléchargement. */
  const url = "/api/manifeste/fichier";

  const webhook = process.env.MANIFESTE_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          document: "Manifeste Réseau Influence & Territoires",
          date: new Date().toISOString(),
        }),
      });
    } catch (erreur) {
      // Le visiteur a fait sa part : il repart avec le document même si le
      // service en aval est indisponible.
      console.error("[manifeste] relais impossible", erreur);
    }
  } else {
    console.info("[manifeste] demande de", email.trim().toLowerCase());
  }

  return NextResponse.json({ url });
}
