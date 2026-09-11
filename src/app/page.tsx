import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { APropos } from "@/components/sections/APropos";
import { ContactBande } from "@/components/sections/ContactBande";
import { Hero } from "@/components/sections/Hero";
import { Manifeste } from "@/components/sections/Manifeste";
import { Vision } from "@/components/sections/Vision";
import { OffresPreview } from "@/components/sections/OffresPreview";
import { News } from "@/components/sections/News";
import { References } from "@/components/sections/References";
import { site } from "@/content/site";
import type { Metadata } from "next";
import { DonneesStructurees } from "@/components/DonneesStructurees";
import { organisation, personneFondatrice, siteWeb } from "@/lib/schema";

/* Titre et description viennent de la racine ; seule la canonique est propre
   à cette page. */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * Période de revalidation déclarée sur la page elle-même, et pas seulement
 * héritée de la requête au CMS.
 *
 * Sans cela, une page construite alors que WORDPRESS_API_URL n'était pas encore
 * renseignée ne comporte aucune requête, donc aucune période de revalidation :
 * elle reste figée pour toujours, et brancher le CMS ensuite ne change rien
 * tant qu'on n'a pas redéployé. Le symptôme est trompeur — WordPress répond
 * correctement, le site ignore simplement qu'il doit se relire.
 */
export const revalidate = 60;

export default function Home() {
  return (
    <div className="w-full overflow-x-clip">
      {/* L'identité du cabinet, en clair pour les machines. */}
      <DonneesStructurees
        noeuds={[organisation(), siteWeb(), personneFondatrice()]}
      />
      <Header />
      <main id="contenu">
        <Hero />
        <Vision />
        <OffresPreview />
        <APropos />
        <References />
        {site.showNews ? <News /> : null}
        <Manifeste />
        <ContactBande />
      </main>
      <Footer />
    </div>
  );
}
