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

/**
 * Expéditeur : doit appartenir à un domaine authentifié chez le service.
 *
 * La valeur vient d'un champ de saisie chez l'hébergeur, souvent recopiée
 * depuis .env.example avec ses guillemets : on les retire de la valeur
 * entière, pas seulement du nom, sans quoi l'adresse hérite du guillemet de
 * fin et le service la refuse sans que rien ne le laisse voir.
 */
export function expediteur() {
  const brut = (process.env.MAIL_EXPEDITEUR ?? "").trim().replace(/^["']|["']$/g, "").trim();
  const forme = brut.match(/^(.*?)<([^<>]*)>\s*$/);
  const [nom, email] = forme
    ? [forme[1].trim().replace(/^["']|["']$/g, "").trim() || "Kastell Conseil", forme[2].trim()]
    : ["Kastell Conseil", brut];
  return { nom, email };
}

export function courrielConfigure() {
  const cle = process.env.BREVO_API_KEY ?? process.env.RESEND_API_KEY;
  return Boolean(cle && expediteur().email);
}

const EMAIL = /^[^\s@]+@[^\s@.]+\.[^\s@]{2,}$/;

/**
 * État de la configuration d'envoi, tel que le voit ce déploiement.
 *
 * Quand « rien ne part », la cause ne se voit ni depuis le site ni depuis
 * le tableau de bord du service : variable absente du déploiement, clé SMTP
 * confondue avec la clé d'API, adresse mal recopiée. Ce constat les rend
 * lisibles sans exposer les secrets — seule la forme de la clé est décrite.
 */
export function diagnostiquerCourriel() {
  const brevo = process.env.BREVO_API_KEY?.trim();
  const resend = process.env.RESEND_API_KEY?.trim();
  const de = expediteur();
  const anomalies: string[] = [];

  if (!brevo && !resend) {
    anomalies.push(
      "Aucune clé : ni BREVO_API_KEY ni RESEND_API_KEY n'est présente sur ce déploiement. Si vous venez de l'ajouter dans Vercel, il faut redéployer : une variable ajoutée ne s'applique pas au déploiement en cours.",
    );
  }
  if (brevo && brevo.startsWith("xsmtpsib-")) {
    anomalies.push(
      "BREVO_API_KEY est une clé SMTP (elle commence par xsmtpsib-). Le site utilise l'API : il faut une clé d'API, qui commence par xkeysib-. Brevo → nom du compte, en haut à droite → « SMTP & API » → onglet « Clés API » → « Générer une nouvelle clé API ».",
    );
  } else if (brevo && !brevo.startsWith("xkeysib-")) {
    anomalies.push(
      "BREVO_API_KEY n'a pas la forme attendue (une clé d'API Brevo commence par xkeysib-). Vérifiez qu'elle a été recopiée entière, sans espace ni guillemet.",
    );
  }
  if (!process.env.MAIL_EXPEDITEUR?.trim()) {
    anomalies.push(
      "MAIL_EXPEDITEUR est absente : sans adresse d'expédition, aucun envoi n'est tenté, même avec une clé valide.",
    );
  } else if (!EMAIL.test(de.email)) {
    anomalies.push(
      `MAIL_EXPEDITEUR ne donne pas une adresse lisible (« ${de.email} »). Forme attendue : Kastell Conseil <lea.delamotte@kastell-conseils.fr>, ou l'adresse seule.`,
    );
  }

  return {
    service: brevo ? "Brevo" : resend ? "Resend" : null,
    cle: brevo
      ? `présente (${brevo.slice(0, 8)}…, ${brevo.length} caractères)`
      : resend
        ? `présente (${resend.slice(0, 3)}…, ${resend.length} caractères)`
        : "absente",
    expediteur: de.email ? { nom: de.nom, email: de.email } : null,
    destinataire: process.env.CONTACT_DESTINATAIRE?.trim() || null,
    anomalies,
  };
}

/**
 * Traduit le refus du service en cause probable et en geste à faire.
 *
 * Les messages de Brevo sont en anglais et parlent de « SMTP account » même
 * pour l'API : sans traduction, on cherche au mauvais endroit.
 */
export function interpreterEchec(detail: string): string {
  const d = detail.toLowerCase();
  if (d.includes("not yet activated") || d.includes("not activated")) {
    return "Le compte Brevo n'est pas encore activé pour l'envoi de courriels transactionnels : c'est le cas de tout nouveau compte, indépendamment de la validation de l'expéditeur. Il faut demander l'activation à Brevo (bandeau en haut du tableau de bord, ou le support), en décrivant l'usage : formulaire de contact d'un site vitrine.";
  }
  if (d.includes("key not found") || d.startsWith("401")) {
    return "Brevo ne reconnaît pas la clé : clé recopiée incomplète, révoquée, ou clé SMTP à la place de la clé d'API (xkeysib-…).";
  }
  if (d.includes("sender")) {
    return "Brevo refuse l'adresse d'expédition : elle doit être exactement l'une des adresses validées dans « Expéditeurs, domaines et IP dédiées », ou appartenir à un domaine authentifié. Vérifiez aussi qu'aucun guillemet ni espace n'a été recopié avec elle.";
  }
  if (d.includes("permission_denied") || d.startsWith("403")) {
    return "Brevo refuse l'opération à cette clé : compte non activé pour l'envoi, ou clé limitée. Vérifiez l'état du compte dans le tableau de bord Brevo.";
  }
  if (d.includes("timeout") || d.includes("fetch failed") || d.includes("aborted")) {
    return "Le service n'a pas répondu : réseau ou panne côté service. Réessayez, puis consultez la page d'état du service.";
  }
  return "Refus non reconnu : le détail ci-contre est la réponse brute du service, à chercher dans sa documentation.";
}

export async function envoyerCourriel(message: Courriel): Promise<Resultat> {
  const de = expediteur();
  /* Une clé recopiée avec un espace ou un retour à la ligne serait refusée
     sans explication : on la nettoie ici plutôt que d'exiger une saisie parfaite. */
  const brevo = process.env.BREVO_API_KEY?.trim();
  const resend = process.env.RESEND_API_KEY?.trim();
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
