import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: `Traitement des données personnelles sur le site ${site.name}.`,
  alternates: { canonical: "/confidentialite" },
  robots: { index: false },
};

/**
 * Texte repris du site précédent, à une correction près, signalée au client.
 *
 * Les « données de navigation » — adresse IP, pages consultées, durée de
 * visite, navigateur — et le consentement aux cookies décrivaient une mesure
 * d'audience que ce site ne pratique pas. Annoncer une collecte qui n'a pas
 * lieu est aussi inexact que d'en taire une : la rubrique dit désormais ce que
 * le site fait réellement de l'adresse IP, c'est-à-dire l'oublier aussitôt.
 */
export default function Page() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      chemin="/confidentialite"
      intro="Cette page décrit les données personnelles traitées à l'occasion de votre visite et les droits dont vous disposez."
      blocks={[
        {
          heading: "Introduction",
          body: [
            "KASTELL, cabinet de conseil en affaires publiques pour les entreprises engagées dans la transition écologique, s'engage à protéger la vie privée et les données personnelles de ses clients, partenaires et visiteurs du site internet. Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et protégeons les données personnelles que vous nous confiez.",
          ],
        },
        {
          heading: "Données personnelles collectées",
          body: [
            "Nous pouvons collecter les données suivantes :",
            [
              "Données d'identification : nom, prénom, adresse e-mail, numéro de téléphone, fonction, nom de l'entreprise.",
              "Données de contact : messages envoyés via les formulaires de contact.",
            ],
            "Ce site ne mesure pas son audience : il ne dépose aucun cookie, n'enregistre ni les pages consultées, ni la durée de votre visite, ni votre navigateur. Votre adresse IP est lue le temps de l'envoi d'un formulaire, pour limiter les envois automatisés, et n'est pas conservée.",
          ],
        },
        {
          heading: "Finalités de la collecte",
          body: [
            "Les données sont collectées pour :",
            [
              "Répondre à vos demandes d'information ou de contact.",
              "Vous fournir nos services de conseil.",
              "Améliorer notre site web et nos services.",
              "Respecter nos obligations légales.",
            ],
          ],
        },
        {
          heading: "Base légale du traitement",
          body: [
            "Le traitement de vos données repose sur :",
            [
              "Votre consentement, lorsque vous remplissez un formulaire.",
              "L'exécution d'un contrat ou de mesures précontractuelles.",
              "Le respect d'une obligation légale.",
            ],
          ],
        },
        {
          heading: "Destinataires des données",
          body: [
            "Vos données sont destinées :",
            [
              "Aux services internes de KASTELL.",
              "À nos sous-traitants (hébergeur, outils de communication, etc.) sous contrat de confidentialité.",
              "Aux autorités compétentes, si la loi l'exige.",
            ],
          ],
        },
        {
          heading: "Durée de conservation",
          body: [
            "Les données sont conservées pour la durée nécessaire à la réalisation des finalités pour lesquelles elles ont été collectées, dans le respect des obligations légales.",
          ],
        },
        {
          heading: "Vos droits",
          body: [
            "Conformément au RGPD, vous disposez des droits suivants :",
            [
              "Droit d'accès, de rectification, d'effacement.",
              "Droit à la limitation du traitement.",
              "Droit à la portabilité des données.",
              "Droit d'opposition.",
              "Droit de retirer votre consentement à tout moment.",
            ],
            "Pour exercer ces droits, contactez-nous à l'adresse suivante : lea.delamotte@kastell-conseil.fr",
          ],
        },
        {
          heading: "Sécurité des données",
          body: [
            "Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données contre toute perte, altération ou accès non autorisé.",
          ],
        },
        {
          heading: "Modification de la politique de confidentialité",
          body: [
            "Cette politique peut être mise à jour. Nous vous invitons à la consulter régulièrement.",
          ],
        },
      ]}
    />
  );
}
