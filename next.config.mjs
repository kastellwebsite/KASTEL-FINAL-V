/**
 * L'hôte de la médiathèque se déduit de WORDPRESS_API_URL : sans cela, il
 * faudrait tenir deux réglages en accord, et l'optimiseur d'images refuserait
 * silencieusement les visuels le jour où l'un des deux dérive.
 */
const hoteWordPress = process.env.WORDPRESS_API_URL
  ? new URL(process.env.WORDPRESS_API_URL)
  : null;

/**
 * Hôtes supplémentaires pour les visuels, séparés par des virgules.
 *
 * Certains hébergements servent la médiathèque depuis un autre domaine qu'eux —
 * un CDN, un sous-domaine. L'optimiseur refuse alors l'image sans rien dire au
 * journal : le visiteur voit une vignette cassée. Cette variable permet de les
 * déclarer sans repasser par le code.
 */
const hotesMedias = (process.env.MEDIA_HOSTS ?? "")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean)
  .map((h) => {
    const avecProtocole = h.includes("://") ? h : `https://${h}`;
    const u = new URL(avecProtocole);
    return {
      protocol: u.protocol.replace(":", ""),
      hostname: u.hostname,
      ...(u.port ? { port: u.port } : {}),
    };
  });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    // La section « Missions » est devenue « Offres » ; on ne casse pas les liens
    // déjà partagés.
    return [
      { source: "/missions", destination: "/offres", permanent: true },
      // Le site ne dépose aucun traceur — mesuré : ni cookie, ni stockage
      // local, ni requête vers un tiers. La page de politique de cookies n'a
      // donc plus d'objet ; le lien déjà partagé mène à la page qui traite
      // désormais du sujet plutôt qu'à une erreur.
      { source: "/cookies", destination: "/confidentialite", permanent: true },
    ];
  },
  // Le dossier public/ n'est pas embarqué par défaut dans les fonctions
  // serveur : sans cela, la route du manifeste ne verrait pas le PDF à
  // l'exécution et refuserait un document pourtant bien servi par le CDN.
  outputFileTracingIncludes: {
    "/api/manifeste": ["./public/documents/**"],
    "/api/manifeste/fichier": ["./public/documents/**"],
  },
  images: {
    // Visuels servis par la médiathèque WordPress. L'hôte est déduit de la même
    // variable que l'API : une seule valeur à renseigner, pas deux à accorder.
    remotePatterns: [
      ...(hoteWordPress
        ? [
            {
              protocol: hoteWordPress.protocol.replace(":", ""),
              hostname: hoteWordPress.hostname,
              ...(hoteWordPress.port ? { port: hoteWordPress.port } : {}),
            },
          ]
        : []),
      ...hotesMedias,
    ],
    // AVIF d'abord, WebP en repli. Next négocie avec l'en-tête « Accept » du
    // navigateur : celui qui ne comprend pas l'AVIF reçoit le WebP, celui qui
    // ne comprend ni l'un ni l'autre reçoit le fichier d'origine. Aucun
    // visiteur n'est laissé de côté, et le rendu est identique — vérifié pixel
    // à pixel sur le portrait et les deux logotypes.
    formats: ["image/avif", "image/webp"],
    // Next 16 rejette toute qualité non déclarée. 55 sert aux visuels de fond :
    // masqués et à faible opacité, la compression y est invisible.
    qualities: [55, 75],
  },
};

export default nextConfig;
