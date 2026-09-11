import fs from "node:fs";
import path from "node:path";

const EXTENSIONS = ["svg", "jpg", "jpeg", "png", "webp", "avif"] as const;

/**
 * Résout un visuel optionnel de public/ sans présumer de son extension —
 * un fichier livré en .jpg peut très bien être un PNG. Renvoie null tant que
 * rien n'est déposé, ce qui laisse le composant retomber sur la maquette.
 */
export function findPublicAsset(base: string): string | null {
  for (const ext of EXTENSIONS) {
    const rel = `${base}.${ext}`;
    if (fs.existsSync(path.join(process.cwd(), "public", rel))) return `/${rel}`;
  }
  return null;
}

const EXTENSIONS_DOC = ["pdf"] as const;

/**
 * Même principe pour un document téléchargeable. Renvoyer null plutôt que de
 * présumer du fichier permet de masquer le bouton tant que rien n'est déposé :
 * mieux vaut pas de bouton qu'un bouton qui tombe sur un 404.
 */
export function findPublicDocument(base: string): string | null {
  for (const ext of EXTENSIONS_DOC) {
    const rel = `${base}.${ext}`;
    if (fs.existsSync(path.join(process.cwd(), "public", rel))) return `/${rel}`;
  }
  return null;
}
