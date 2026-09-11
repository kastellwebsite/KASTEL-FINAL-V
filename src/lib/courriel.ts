/**
 * Envoi d'un courriel par un service transactionnel.
 *
 * Deux services sont reconnus, choisis par la clé présente dans
 * l'environnement : Brevo (français, hébergement européen) ou Resend. Les
 * prendre tous les deux évite de figer le choix dans le code — le jour où le
 * prestataire change, il n'y a qu'une variable à remplacer.
 *
 * Un serveur ne peut pas « envoyer un mail » tout seul : sans service dédié et
 * sans domaine authentifié, le message part en indésirable ou n'arrive pas.
 * D'où ce détour, et d'où l'exigence d'une adresse d'expédition vérifiée.
 */

export type Courriel = {
  destinataire: string;
  sujet: string;
  texte: string;
  /** Adresse de réponse : celle du visiteur, pour répondre sans copier-coller. */
  repondreA?: { email: string; nom?: string };
};

export type Resultat =
  | { etat: "envoye" }
  | { etat: "non-configure" }
  | { etat: "echec"; detail: string };

/** Expéditeur : doit appartenir à un domaine authentifié chez le service. */
function expediteur() {
  const brut = process.env.MAIL_EXPEDITEUR ?? "";
  const [nom, email] = brut.includes("<")
    ? [brut.split("<")[0].trim().replace(/^"|"$/g, ""), brut.split("<")[1].replace(">", "").trim()]
    : ["Kastell Conseil", brut.trim()];
  return { nom, email };
}

export function courrielConfigure() {
  const cle = process.env.BREVO_API_KEY ?? process.env.RESEND_API_KEY;
  return Boolean(cle && expediteur().email);
}

export async function envoyerCourriel(message: Courriel): Promise<Resultat> {
  const de = expediteur();
  const brevo = process.env.BREVO_API_KEY;
  const resend = process.env.RESEND_API_KEY;
  if ((!brevo && !resend) || !de.email) return { etat: "non-configure" };

  /* Surchargeable pour la recette : sans cela, aucun moyen d'éprouver le
     chemin d'envoi sans écrire à un vrai service. */
  const base = process.env.MAIL_API_BASE ?? "";

  const requete: { url: string; entetes: Record<string, string>; corps: unknown } = brevo
    ? {
        url: `${base || "https://api.brevo.com"}/v3/smtp/email`,
        entetes: { "api-key": brevo, "content-type": "application/json", accept: "application/json" },
        corps: {
          sender: { name: de.nom, email: de.email },
          to: [{ email: message.destinataire }],
          subject: message.sujet,
          textContent: message.texte,
          ...(message.repondreA
            ? { replyTo: { email: message.repondreA.email, name: message.repondreA.nom } }
            : {}),
        },
      }
    : {
        url: `${base || "https://api.resend.com"}/emails`,
        entetes: { authorization: `Bearer ${resend}`, "content-type": "application/json" },
        corps: {
          from: `${de.nom} <${de.email}>`,
          to: [message.destinataire],
          subject: message.sujet,
          text: message.texte,
          ...(message.repondreA ? { reply_to: message.repondreA.email } : {}),
        },
      };

  try {
    const reponse = await fetch(requete.url, {
      method: "POST",
      headers: requete.entetes,
      body: JSON.stringify(requete.corps),
      signal: AbortSignal.timeout(10_000),
    });
    if (!reponse.ok) {
      const detail = (await reponse.text()).slice(0, 300);
      return { etat: "echec", detail: `${reponse.status} ${detail}` };
    }
    return { etat: "envoye" };
  } catch (erreur) {
    return { etat: "echec", detail: erreur instanceof Error ? erreur.message : String(erreur) };
  }
}
