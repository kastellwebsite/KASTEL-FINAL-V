import { NextResponse } from "next/server";
import { getContent } from "@/cms/content";
import { site } from "@/content/site";
import { courrielConfigure, envoyerCourriel } from "@/lib/courriel";

/**
 * Téléchargement du manifeste contre adresse e-mail.
 *
 * Chaque adresse est signalée au cabinet par courriel, dès qu'un service
 * d'envoi est configuré : « untel@… a téléchargé le manifeste ». Elle peut
 * aussi être relayée vers MANIFESTE_WEBHOOK_URL (Zapier, Make, n8n : tout
 * service acceptant un POST JSON), pour qui veut la ranger dans un tableur ou
 * une liste. Sans l'un ni l'autre, l'adresse est journalisée et le document
 * est servi quand même — une intégration manquante ne doit pas priver un
 * visiteur du document, et son échec non plus.
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

  const adresse = email.trim().toLowerCase();
  const document = "Manifeste Réseau Influence & Territoires";
  const date = new Date();

  /* Le visiteur a fait sa part : il repart avec le document même si le
     courriel ou le service en aval échouent. D'où le try par relais, et la
     réponse rendue quoi qu'il arrive. */
  let signale = false;

  if (courrielConfigure()) {
    const envoi = await envoyerCourriel({
      destinataire: process.env.CONTACT_DESTINATAIRE || site.email,
      sujet: `${adresse} a téléchargé le manifeste`,
      /* L'adresse du visiteur en réponse : un clic suffit pour engager la
         conversation avec quelqu'un qui vient de lire le manifeste. */
      repondreA: { email: adresse },
      texte: [
        `${adresse} vient de télécharger le manifeste présent sur le site.`,
        "",
        `Document : ${document}`,
        `Date : ${date.toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}`,
        "",
        "—",
        "Envoyé depuis le formulaire de téléchargement du manifeste.",
      ].join("\n"),
    });
    if (envoi.etat === "envoye") signale = true;
    else if (envoi.etat === "echec") console.error("[manifeste] courriel non envoyé", envoi.detail);
  }

  const webhook = process.env.MANIFESTE_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: adresse, document, date: date.toISOString() }),
        signal: AbortSignal.timeout(10_000),
      });
      signale = true;
    } catch (erreur) {
      console.error("[manifeste] relais impossible", erreur);
    }
  }

  if (!signale) console.info("[manifeste] demande de", adresse);

  return NextResponse.json({ url });
}
