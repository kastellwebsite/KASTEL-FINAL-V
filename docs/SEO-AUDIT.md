# Audit SEO & GEO — Kastell Conseil

État relevé le 11 septembre 2026, sur la branche `feat/seo-geo`, à partir du
HTML réellement servi par `next start` (et non du code source seul).

---

## 0. Stack réelle

| | |
|---|---|
| Framework | **Next.js 16.3.2**, App Router, React 19 |
| Rendu | 4 pages prérendues statiquement, `/contact` rendue à la demande |
| CMS | **WordPress headless**, extension maison `kastell-contenu` (REST, pas de WPGraphQL, **pas de Yoast ni RankMath**) |
| Hébergement | Vercel |
| Polices | `next/font` (Instrument Sans / Serif), auto-hébergées, `display: swap` |
| Images | `next/image`, `priority` sur le héros et le logo |

Cinq routes publiques : `/`, `/offres`, `/contact`, `/mentions-legales`,
`/confidentialite`. Trois routes API. Deux redirections 301 déjà en place
(`/missions` → `/offres`, `/cookies` → `/confidentialite`).

---

## 1. Le point bloquant : quel domaine ?

**Trois orthographes circulent dans le projet.** C'est le problème le plus
grave de cet audit, et aucune action SEO n'a de sens tant qu'il n'est pas
tranché.

| Où | Valeur |
|---|---|
| `src/content/site.ts` → `site.url` | `https://kastell-conseils.fr` — **sans www** |
| Brief de cette mission | `https://www.kastell-conseils.fr` — **avec www** |
| Mentions légales et politique de confidentialité (texte fourni par le cabinet) | `lea.delamotte@kastell-conseil.fr` — **conseil au singulier** |
| E-mail affiché sur le site | `contact@kastell-conseils.fr` — **conseils au pluriel** |

Conséquences mesurées aujourd'hui : la seule balise canonique du site pointe
vers `https://kastell-conseils.fr/contact`, c'est-à-dire **sans www**, donc en
contradiction avec le domaine canonique annoncé dans le brief. Le sitemap et
`robots.txt` héritent de la même valeur.

Si les deux variantes répondent sans redirection, Google voit deux sites
jumeaux et répartit l'autorité entre eux. Il faut donc :

1. **décider** quelle forme est canonique (avec ou sans `www`) ;
2. **savoir** si `kastell-conseil.fr` (singulier) est détenu par le cabinet ;
3. rediriger toutes les autres formes en 301 vers la forme retenue.

→ `TODO_KASTELL_DOMAINE_CANONIQUE`, `TODO_KASTELL_DOMAINE_SINGULIER_DETENU`

---

## 2. Metadata, page par page

Relevé sur le HTML servi.

| Page | `<title>` | Long. | Description | Canonique | OG image |
|---|---|---|---|---|---|
| `/` | Cabinet Kastell — Ancrage territorial, influence nationale | 58 | 169 car. | **absente** | **absente** |
| `/offres` | Offres — Cabinet Kastell | 24 | 169 car. | **absente** | **absente** |
| `/contact` | Nous contacter — Cabinet Kastell | 32 | 129 car. | présente (sans www) | **absente** |
| `/mentions-legales` | Mentions légales — Cabinet Kastell | 34 | 41 car. | **absente** | **absente** |
| `/confidentialite` | Politique de confidentialité — Cabinet Kastell | 46 | 64 car. | **absente** | **absente** |

Défauts relevés :

- **Aucune balise canonique** sauf sur `/contact`. Sur un site multi-domaines
  (www / sans www / preview Vercel), c'est le premier filet de sécurité, et il
  manque.
- **Aucune image Open Graph.** Tout partage LinkedIn, WhatsApp ou Slack affiche
  une carte sans visuel. Pour un cabinet dont le canal principal est LinkedIn,
  c'est un manque direct.
- **Descriptions à 169 caractères** sur `/` et `/offres` : Google tronque
  au-delà de ~155.
- Le gabarit de titre est `%s — Cabinet Kastell`. Le brief demande
  `%s | Kastell Conseil`. À arbitrer : « Cabinet Kastell » n'est pas la
  dénomination sociale (KASTELL) ni le nom d'usage du brief (Kastell Conseil).
- `metadataBase` est bien posé, mais sur la mauvaise valeur (voir § 1).

---

## 3. Ce qui va déjà bien

À ne pas casser en phase 1 :

- `<html lang="fr">` et `locale: fr_FR` — corrects.
- **Un seul `<h1>` par page**, hiérarchie Hn logique et sans saut, vérifié sur
  les cinq routes. La violation `heading-order` de `/contact` a été corrigée
  hier.
- `<main id="contenu">`, `<nav>`, `<footer>`, lien d'évitement — présents.
- **Le contenu est rendu côté serveur.** Vérifié en cherchant les termes clés
  dans le HTML brut, sans exécution de JavaScript : « affaires publiques » 24×,
  « Bretagne » 15×, « Lamballe » 13×, « Léa de Lamotte » 16×. C'est la
  condition d'entrée du GEO, et elle est remplie.
- Six composants seulement sont clients, tous périphériques (menu, formulaire,
  dépliages, animations). Aucun contenu n'en dépend pour exister.
- Le back-office WordPress est déjà en `noindex, nofollow` + `Disallow: /`.
- `next/font` auto-hébergé : aucune requête vers un tiers, aucun décalage de
  police.
- Aucun cookie, aucun traceur, aucune requête externe — mesuré hier.
- 404 : renvoie bien un code 404 (page par défaut de Next, non personnalisée).

---

## 4. Ce qui manque

### 4.1 Technique

| | Gravité |
|---|---|
| Aucune balise canonique (4 pages sur 5) | **haute** |
| Aucune image Open Graph | **haute** |
| **La preview Vercel n'est pas protégée** : `robots.ts` sert `allow: /` quel que soit l'environnement | **haute** |
| Aucune redirection non-www → www (ou l'inverse) | **haute** |
| Sitemap statique : trois URL codées en dur, aucun `lastModified` | moyenne |
| Pas de fil d'Ariane | moyenne |
| 404 non personnalisée (sort de la charte, aucun lien de reprise) | basse |

### 4.2 Données structurées

**Aucune. Zéro balise `application/ld+json` sur tout le site.** C'est le
chantier au meilleur rapport effort/résultat : sans `Organization` ni
`ProfessionalService`, ni Google ni les moteurs génératifs ne disposent d'une
description machine de l'entité, de son adresse ou de sa zone d'intervention.

### 4.3 GEO

| | |
|---|---|
| `robots.ts` n'autorise ni ne nomme aucun agent IA | GPTBot, ClaudeBot, PerplexityBot… ne sont ni autorisés explicitement ni bloqués — la règle `*` les couvre, mais rien n'est déclaré |
| `/llms.txt` et `/llms-full.txt` | absents |
| Phrase d'entité | **absente** — le site ne dit jamais, en une phrase, ce qu'est Kastell |
| « lobbying territorial » | **0 occurrence sur tout le site** alors que c'est un mot-clé principal |
| Blocs FAQ | aucun |
| Dates de mise à jour visibles | aucune |
| Signaux E-E-A-T | partiels : Léa de Lamotte est présentée et la fiche HATVP est liée (bon signal d'autorité), mais aucun `Person`, aucune date, aucun auteur déclaré |

### 4.4 Couverture des mots-clés — mesuré sur le HTML

| Mot-clé | Occurrences |
|---|---|
| Kastell | nombreuses |
| affaires publiques | 24 |
| Bretagne | 15 |
| Lamballe | 13 |
| **Rennes** | **3** |
| **lobbying territorial** | **0** |
| cabinet de conseil Rennes / Lamballe / Bretagne | 0 (aucune formulation ciblée) |

Le site parle beaucoup de Lamballe et de la Bretagne, très peu de Rennes, et
jamais de « lobbying territorial ». Or ce dernier est le mot-clé principal :
c'est un manque de fond, pas un réglage technique.

---

## 5. Performance

Pas de mesure Lighthouse dans cet audit (elle viendra en phase 5, sur le
déploiement réel — une mesure locale sans le CDN n'est pas représentative).
Constats structurels favorables : poids HTML de 32 à 89 Ko, polices
auto-hébergées, `priority` posé sur le LCP, aucun script tiers, décalage
cumulé mesuré hier à 0,03 (seuil « bon » : 0,1).

Un point à surveiller : la page d'accueil sert **89 Ko de HTML**. C'est le prix
du rendu serveur intégral — plutôt une bonne nouvelle pour le GEO.

---

## 6. Mapping mots-clés → pages

Un mot-clé principal par page, pas de cannibalisation.

| Page | Mot-clé principal | Secondaires |
|---|---|---|
| `/` | **Kastell Conseil** | cabinet affaires publiques Bretagne, lobbying |
| `/offres` | **lobbying territorial** *(à renforcer : 0 occurrence aujourd'hui)* | représentation d'intérêts, affaires publiques |
| `/lobbying-territorial` *(à créer)* | **lobbying territorial** (page pilier) | définition, méthode, cas d'usage, FAQ |
| `/contact` | cabinet de conseil Bretagne | Lamballe, Rennes |
| `/bretagne` *(à créer, à valider)* | **cabinet de conseil Bretagne** | Région Bretagne, acteurs régionaux |
| `/rennes` *(à créer, à valider)* | **cabinet de conseil Rennes** | Rennes Métropole, Ille-et-Vilaine |
| `/lamballe` *(à créer, à valider)* | **cabinet de conseil Lamballe** | Lamballe-Armor, Côtes-d'Armor |
| Pages légales | aucun — `noindex`, déjà le cas | — |

**Réserve sur les pages locales.** Trois pages « Rennes / Lamballe / Bretagne »
qui répéteraient le même argumentaire sont des *doorway pages* : Google les
sanctionne, et un moteur génératif n'en citera aucune. Elles n'ont de valeur
que si elles portent un contenu réellement différent — acteurs institutionnels
du territoire, enjeux régionaux, dossiers traités. C'est de la matière que
seule Léa détient. Je propose donc de les rédiger en phase 3 **sous forme de
brouillons soumis à validation**, et de ne publier que celles qu'elle peut
nourrir.

---

## 7. Plan proposé

Chaque phase = un commit atomique. Rien n'est appliqué avant votre accord.

**Phase 1 — technique** (aucun changement visible)
Config SEO centralisée · canoniques sur toutes les pages · image OG 1200×630 ·
descriptions ramenées sous 155 car. · sitemap dynamique avec `lastModified` ·
`noindex` hors production · redirection de domaine · 404 personnalisée · fil
d'Ariane.

**Phase 2 — données structurées**
`Organization` + `ProfessionalService`, `WebSite`, `Service` par offre,
`BreadcrumbList`, `Person` (Léa de Lamotte), `FAQPage` quand la FAQ existera.

**Phase 3 — contenu & local**
Page pilier « lobbying territorial » · brouillons des pages locales · NAP
unifié · `docs/SEO-CONTENT.md` avec titres et descriptions prêts à coller.

**Phase 4 — GEO**
Agents IA nommés dans `robots.ts` · `/llms.txt` et `/llms-full.txt` générés
depuis la config et WordPress · phrase d'entité · blocs extractibles, FAQ,
dates de mise à jour.

**Phase 5 — mesure**
Vérification Search Console et Bing par variables d'environnement · build ·
Lighthouse · validation JSON-LD · `docs/SEO-CHECKLIST.md`.

---

## 8. Données manquantes — `TODO_KASTELL_*`

Aucune ne sera inventée. Toutes seront centralisées dans un fichier unique en
phase 1.

| Clé | Ce qu'il faut | Bloquant pour |
|---|---|---|
| `TODO_KASTELL_DOMAINE_CANONIQUE` | www ou sans www ? | **tout** |
| `TODO_KASTELL_DOMAINE_SINGULIER_DETENU` | `kastell-conseil.fr` détenu ? | redirections |
| `TODO_KASTELL_ADRESSE_POSTALE` | 35 rue Docteur Calmette, 22400 Lamballe-Armor — **à confirmer comme adresse publiable** | JSON-LD, NAP |
| `TODO_KASTELL_TELEPHONE_PUBLIC` | +33 6 60 33 68 38 des mentions légales — publiable ? | JSON-LD, NAP |
| `TODO_KASTELL_EMAIL_CANONIQUE` | `contact@kastell-conseils.fr` ou `lea.delamotte@kastell-conseil.fr` ? | NAP, pages légales |
| `TODO_KASTELL_LINKEDIN_ENTREPRISE` | URL de la page entreprise (`site.linkedin` vaut `#`) | `sameAs` |
| `TODO_KASTELL_LINKEDIN_LEA` | URL du profil (`site.linkedinProfile` vaut `#`) | `sameAs`, `Person` |
| `TODO_KASTELL_GSC_VERIFICATION` | jeton Search Console | phase 5 |
| `TODO_KASTELL_BING_VERIFICATION` | jeton Bing Webmaster | phase 5 |
| `TODO_KASTELL_PRESENCE_RENNES` | Kastell a-t-il une adresse ou une présence à Rennes, ou seulement une zone d'intervention ? | page locale, `areaServed` |
| `TODO_KASTELL_HORAIRES` | horaires d'ouverture publiables | `openingHours` |

**Le point sur Rennes appelle une réponse avant toute rédaction.** Le site dit
aujourd'hui « Lamballe, Bretagne » ; le brief vise « cabinet de conseil
Rennes ». Annoncer une implantation rennaise qui n'existe pas serait faux, et
Google Business Profile refuse une adresse non réelle. Si Kastell intervient à
Rennes sans y être installé, la formulation juste est « intervient à Rennes et
dans toute la Bretagne », pas « cabinet de conseil à Rennes ».
