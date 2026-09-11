import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getContent } from "@/cms/content";

/**
 * Sert le manifeste depuis le site lui-même.
 *
 * Le document peut vivre sur WordPress. Renvoyer le visiteur vers cette URL
 * pose deux problèmes : l'attribut `download` est ignoré dès que le fichier
 * vient d'un autre domaine — le PDF s'ouvre alors dans un onglet au lieu de
 * descendre dans les téléchargements — et l'adresse du back-office s'affiche
 * dans la barre d'adresse, ce qu'on s'emploie par ailleurs à éviter.
 *
 * En relayant le fichier, il devient de même origine et part avec un
 * Content-Disposition explicite : le navigateur le range sans discuter.
 */

const NOM = "manifeste-reseau-influence-territoires.pdf";

/** En-têtes communs aux deux provenances. */
function enTetes(taille?: number) {
  const h: Record<string, string> = {
    "content-type": "application/pdf",
    "content-disposition": `attachment; filename="${NOM}"`,
    /* Le document change rarement, mais il n'a pas d'empreinte dans son URL :
       une heure suffit à soulager le serveur sans figer une mise à jour. */
    "cache-control": "public, max-age=3600",
  };
  if (taille !== undefined) h["content-length"] = String(taille);
  return h;
}

export async function GET() {
  const { manifesto } = await getContent();
  const source = manifesto.download.fileUrl;

  if (!source) {
    return NextResponse.json({ message: "Document indisponible." }, { status: 404 });
  }

  /* Fichier du dépôt : lu sur le disque de la fonction, que le traçage inclut. */
  if (source.startsWith("/")) {
    try {
      const contenu = await fs.readFile(path.join(process.cwd(), "public", source));
      return new NextResponse(new Uint8Array(contenu), { headers: enTetes(contenu.byteLength) });
    } catch (erreur) {
      console.error("[manifeste] lecture du fichier impossible", erreur);
      return NextResponse.json({ message: "Document indisponible." }, { status: 404 });
    }
  }

  /* Fichier du CMS : relayé en flux, sans le charger entièrement en mémoire. */
  try {
    const amont = await fetch(source, { signal: AbortSignal.timeout(15_000) });
    if (!amont.ok || !amont.body) throw new Error(`amont ${amont.status}`);
    const taille = amont.headers.get("content-length");
    return new NextResponse(amont.body, {
      headers: enTetes(taille ? Number(taille) : undefined),
    });
  } catch (erreur) {
    console.error("[manifeste] relais du fichier impossible", erreur);
    return NextResponse.json({ message: "Document indisponible." }, { status: 502 });
  }
}
