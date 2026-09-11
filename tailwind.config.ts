import type { Config } from "tailwindcss";

/** Tokens lifted verbatim from the Kastell design canvas. */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bone: "#FAF9F6",
        sand: "#F2EFEA",
        forest: "#192924",
        "forest-deep": "#0F1A17",
        ink: "#1A1E1C",
        graphite: "#2F3835",
        slate: "#2B322F",
        stone: "#4A5350",
        sage: "#35752B",
        mist: "#8FAFAE",
        frost: "#B8CFCE",
        ice: "#E2F0F8",
        /*
         * Vert pousse. Trois rôles distincts, chacun vérifié :
         *  accent      décoratif, et lisible sur le vert foncé (6,90:1)
         *  sage        vert de texte, ≥ 4,91:1 sur les trois fonds clairs
         *  accent-tint fond de bande, texte forêt à 13,93:1
         *
         * La teinte et la saturation sont posées, la clarté est cherchée :
         * un vert plus vif est plus proche du fond clair, et la saturation
         * coûte donc du contraste. Chercher la clarté plutôt que la choisir
         * donne le vert le plus lumineux qui tienne encore le seuil.
         */
        accent: "#73C167",
        "accent-tint": "#F1F7F0",
        "accent-line": "rgba(115,193,103,0.5)",
        muted: "#666F6C",
        dim: "#707876",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Instrument Serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Instrument Sans", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SF Mono", "Menlo", "monospace"],
      },
      maxWidth: {
        shell: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
