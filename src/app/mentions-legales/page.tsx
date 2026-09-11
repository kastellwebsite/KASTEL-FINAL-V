import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Mentions légales du site ${site.name}.`,
  alternates: { canonical: "/mentions-legales" },
  robots: { index: false },
};

/**
 * Texte repris du site précédent, à deux corrections près, signalées au client.
 *
 * L'hébergeur n'est plus Wix mais Vercel : nommer le précédent serait une
 * information fausse dans le document qui sert précisément à identifier qui
 * héberge le site.
 *
 * La section « cookies » annonçait des traceurs et une mesure d'audience. Ce
 * site n'en pose aucun — vérifié : ni cookie, ni stockage local, ni requête
 * vers un tiers sur l'accueil, les offres et le contact. Elle est réécrite
 * plutôt que reprise, et ne renvoie plus vers une politique de cookies
 * supprimée faute d'objet.
 */
export default function Page() {
  return (
    <LegalPage
      title="Mentions légales"
      chemin="/mentions-legales"
      intro="Informations relatives à l'éditeur, à l'hébergeur et aux conditions d'utilisation du site."
      blocks={[
        {
          heading: "Identification de l'entreprise",
          body: [
            [
              "Dénomination sociale : KASTELL",
              "Forme juridique : Entreprise Unipersonnelle à Responsabilité Limitée (EURL)",
              "Siège social : 35 rue Docteur Calmette, 22400 Lamballe-Armor",
              "Représentant légal : Léa de Lamotte, Associée Gérante",
              "Téléphone : +33 6 60 33 68 38",
              "E-mail : lea.delamotte@kastell-conseil.fr",
            ],
          ],
        },
        {
          heading: "Immatriculation et identification",
          body: [
            [
              "Numéro d'enregistrement au RCS : 989 630 819 R.C.S. Saint-Brieuc",
              "Numéro d'identification fiscale (SIRET) : 98963081900013",
            ],
          ],
        },
        {
          heading: "Hébergement du site web",
          body: [
            [
              "Hébergeur : Vercel Inc.",
              "Adresse : 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
              "Site : vercel.com",
            ],
          ],
        },
        {
          heading: "Représentation d'intérêts",
          body: [
            "Kastell Conseil est inscrit au répertoire des représentants d'intérêts tenu par la Haute Autorité pour la transparence de la vie publique (HATVP). La fiche du cabinet est consultable sur hatvp.fr.",
          ],
        },
        {
          heading: "Propriété intellectuelle",
          body: [
            "Sauf mention contraire, tous les éléments accessibles sur le site (textes, images, graphismes, logo, icônes, sons, logiciels, etc.) restent la propriété exclusive de leurs auteurs, en ce qui concerne les droits de propriété intellectuelle ou les droits d'usage. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de l'auteur.",
            "Toute exploitation non autorisée du site ou de l'un quelconque des éléments qu'il contient est considérée comme constitutive d'une contrefaçon et passible de poursuites. Les marques et logos reproduits sur le site sont déposés par les sociétés qui en sont propriétaires.",
          ],
        },
        {
          heading: "Protection des données personnelles",
          body: [
            "Conformément à la réglementation en vigueur, notamment le Règlement Général sur la Protection des Données (RGPD), KASTELL s'engage à protéger les données personnelles des utilisateurs du site. Pour plus d'informations, consultez notre politique de confidentialité.",
          ],
        },
        {
          heading: "Cookies et traceurs",
          body: [
            "Ce site ne dépose aucun cookie et n'utilise aucun outil de mesure d'audience, aucune régie publicitaire et aucun bouton de partage tiers. Aucun bandeau de consentement n'est donc nécessaire, et aucun réglage de navigateur n'est requis pour naviguer sans être suivi.",
            "L'ajout ultérieur d'un outil de mesure d'audience ou d'un contenu tiers modifierait ce constat : la présente mention serait alors mise à jour et un bandeau de consentement mis en place.",
          ],
        },
      ]}
    />
  );
}
