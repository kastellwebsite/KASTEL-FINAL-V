import { NextResponse } from "next/server";
import { site } from "@/content/site";
import { courrielConfigure, envoyerCourriel } from "@/lib/courriel";

/**
 * Réception des demandes du formulaire de contact.
 *
 * Le message part par courriel dès qu'un service d'envoi est configuré, avec
 * l'adresse du visiteur en champ de réponse : le cabinet répond depuis sa boîte
 * sans rien recopier. À défaut, il est relayé vers CONTACT_WEBHOOK_URL, pour
 * qui préfère un scénario Zapier ou Make. À la différence du téléchargement du
 * manifeste, il n'y a ici aucun repli acceptable côté serveur : une demande
 * perdue est un client perdu. Si la destination n'est pas configurée, ou si le
 * relais échoue, la route le dit franchement — le formulaire propose alors au
 * visiteur d'ouvrir son logiciel de messagerie avec le message déjà rédigé,
 * plutôt que de lui laisser croire que c'est parti.
 */

const EMAIL = /^[^\s@]+@[^\s@.]+\.[^\s@]{2,}$/;

/* Garde-fou de première ligne, par instance : sur une plateforme sans état, ce
   compteur ne survit pas au recyclage et ne remplace pas une protection amont. */
const FENETRE_MS = 60_000;
const MAX_PAR_FENETRE = 4;
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

/** Coupe une saisie trop longue sans rejeter la demande pour autant. */
const borne = (valeur: unknown, max: number) =>
  typeof valeur === "string" ? valeur.trim().slice(0, max) : "";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "inconnu";
  if (tropDeRequetes(ip)) {
    return NextResponse.json({ code: "debit" }, { status: 429 });
  }

  let corps: unknown;
  try {
    corps = await request.json();
  } catch {
    return NextResponse.json({ code: "illisible" }, { status: 400 });
  }

  const c = (corps ?? {}) as Record<string, unknown>;

  /* Champ leurre : hors écran et exclu de la tabulation, seul un robot le
     remplit. On répond comme si tout allait bien, sans rien relayer. */
  if (borne(c.societe, 80).length > 0) {
    return NextResponse.json({ code: "ok" });
  }

  const nom = borne(c.nom, 120);
  const email = borne(c.email, 254);
  const message = borne(c.message, 4000);

  if (!nom || !EMAIL.test(email) || message.length < 10) {
    return NextResponse.json({ code: "champs" }, { status: 400 });
  }
  if (c.consentement !== true) {
    return NextResponse.json({ code: "consentement" }, { status: 400 });
  }

  const organisation = borne(c.organisation, 160);
  const telephone = borne(c.telephone, 40);
  const objet = borne(c.objet, 160);

  if (courrielConfigure()) {
    const destinataire = process.env.CONTACT_DESTINATAIRE || site.email;
    const envoi = await envoyerCourriel({
      destinataire,
      sujet: objet ? `Nouvelle demande — ${objet}` : "Nouvelle demande de contact",
      /* L'adresse du visiteur en réponse : c'est ce qui permet de répondre
         d'un clic depuis la boîte, sans recopier quoi que ce soit. */
      repondreA: { email, nom },
      /* Les champs absents valent null et disparaissent ; les chaînes vides
         sont des séparations voulues et doivent survivre au filtre. */
      texte: [
        `Nom : ${nom}`,
        organisation ? `Organisation : ${organisation}` : null,
        `E-mail : ${email}`,
        telephone ? `Téléphone : ${telephone}` : null,
        objet ? `Sujet : ${objet}` : null,
        "",
        message,
        "",
        "—",
        "Envoyé depuis le formulaire de contact du site.",
      ]
        .filter((ligne) => ligne !== null)
        .join("\n"),
    });

    if (envoi.etat === "echec") {
      console.error("[contact] envoi impossible", envoi.detail);
      return NextResponse.json({ code: "relais" }, { status: 502 });
    }

    /* Accusé de réception, au mieux : son échec ne doit pas faire croire au
       visiteur que sa demande s'est perdue, elle est déjà partie. */
    if (envoi.etat === "envoye") {
      const accuse = await envoyerCourriel({
        destinataire: email,
        sujet: `Votre message à ${site.name}`,
        texte: [
          `Bonjour ${nom},`,
          "",
          "Votre message est bien arrivé. Nous revenons vers vous sous un jour ouvré.",
          "",
          "Pour mémoire, voici ce que vous nous avez écrit :",
          "",
          message,
          "",
          "—",
          site.name,
          site.email,
        ].join("\n"),
      });
      if (accuse.etat === "echec") {
        console.error("[contact] accusé de réception non envoyé", accuse.detail);
      }
      return NextResponse.json({ code: "ok" });
    }
  }

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (!webhook) {
    /* 501 et non 500 : ce n'est pas une panne, c'est une configuration
       absente. La distinction guide le message affiché au visiteur. */
    console.warn("[contact] aucun service d'envoi ni webhook, demande non relayée");
    return NextResponse.json({ code: "non-configure" }, { status: 501 });
  }

  try {
    const reponse = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        nom,
        email,
        organisation,
        telephone,
        objet,
        message,
        date: new Date().toISOString(),
        source: "Formulaire de contact du site",
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!reponse.ok) throw new Error(`le service a répondu ${reponse.status}`);
  } catch (erreur) {
    console.error("[contact] relais impossible", erreur);
    return NextResponse.json({ code: "relais" }, { status: 502 });
  }

  return NextResponse.json({ code: "ok" });
}
