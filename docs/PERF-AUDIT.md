# Audit de performance — Kastell Conseil

Mesures de référence relevées le 11 septembre 2026 sur la branche
`perf/optimisation`, avant toute modification.

**Conditions.** Site construit en production, servi localement, mesuré avec
Lighthouse en profil mobile (4G simulée, ralentissement processeur ×4). Chaque
chiffre est la **médiane de trois passages**, sur une machine dont les serveurs
de test concurrents ont été arrêtés au préalable — ce point n'est pas un détail :
sur une machine chargée, le même site mesurait 85 au lieu de 94.

---

## 0. Stack

| | |
|---|---|
| Next.js | **16.3.2** (App Router, Turbopack) |
| React | 19.2.8 |
| Dépendances de production | **`next`, `react`, `react-dom`. Rien d'autre.** |
| CMS | WordPress headless, REST |
| Hébergement | Vercel |

La sémantique de cache de Next 16 s'applique : `fetch` n'est plus mis en cache
par défaut depuis Next 15, et le cache se pilote par `revalidate` et
`revalidateTag`. Le site utilise déjà ces deux mécanismes.

**Aucune librairie lourde à alléger.** Pas de framer-motion, pas de bibliothèque
d'icônes, pas de librairie de dates. `depcheck` ne signale aucune dépendance de
production inutilisée. Les trois signalements sur les dépendances de
développement (`autoprefixer`, `postcss`, `@types/react-dom`) sont des faux
positifs : elles sont utilisées par la chaîne PostCSS et par TypeScript, que
depcheck ne sait pas lire. Le signalement d'un `sanity` manquant en est un
autre : le terme n'apparaît nulle part dans le dépôt.

---

## 1. Lighthouse — référence

Profil mobile, médiane de trois passages.

| Page | Perf | LCP | TBT | CLS | Speed Index |
|---|---|---|---|---|---|
| Accueil | **97** | 2,51 s | 78 ms | 0,000 | 0,93 s |
| Offres | **93** | 3,03 s | 132 ms | 0,000 | 0,77 s |
| Contact | **95** | 2,99 s | 64 ms | 0,000 | 0,89 s |

Face aux objectifs :

| Objectif | État |
|---|---|
| Performance ≥ 95 | accueil ✓ · contact ✓ · **offres ✗ (93)** |
| LCP < 2 s | **✗ sur les trois pages** |
| CLS < 0,05 | ✓ — mesuré à **0** partout |
| TTFB < 200 ms | ✓ — 8 à 26 ms |
| JS < 120 ko par route | **✗ — 144,5 ko** |

---

## 2. Le problème principal : le LCP attend le JavaScript

C'est le constat central de cet audit, et il explique à lui seul l'écart sur
les trois pages.

Lighthouse décompose le LCP de `/offres` ainsi :

```
Temps de réponse serveur        16 ms
Délai de rendu de l'élément   1162 ms   ← ici
```

Même chose sur `/contact` : 1152 ms. Le serveur répond en 16 ms, puis
**l'élément reste invisible pendant plus d'une seconde**.

La cause est dans `Reveal`, le composant d'apparition au défilement :

```css
.reveal { opacity: 0; transform: translateY(16px); }
.reveal.is-visible { opacity: 1; transform: none; }
```

La classe `is-visible` est posée par JavaScript, après hydratation, quand un
`IntersectionObserver` détecte l'élément. Or un navigateur ne compte pas comme
« peint » un élément d'opacité nulle. Le texte du haut de page est donc dans le
HTML dès la première milliseconde, mais le LCP n'est enregistré qu'une fois le
JavaScript chargé, exécuté, hydraté, l'observateur déclenché et la transition
entamée.

**Le contenu au-dessus de la ligne de flottaison n'a aucune raison d'attendre
l'observateur** : il est visible d'emblée, par définition. L'animation peut être
jouée par CSS dès le premier rendu, à l'identique — mêmes durée, courbe et
décalage — sans rien devoir au JavaScript.

Sur l'accueil, l'élément de plus grande peinture est l'illustration
cartographique du héros, déjà optimisée (69,7 → 36,3 ko, rendu comparé pixel à
pixel). Son délai de rendu n'est que de 102 ms : c'est bien l'attente du
JavaScript, et non le poids de l'image, qui coûte.

---

## 3. Poids transféré par route

Octets réellement transmis (compressés), relevés par l'API Performance du
navigateur.

| Route | JS | CSS | Images | HTML | Total | Requêtes | TTFB |
|---|---|---|---|---|---|---|---|
| `/` | 144,5 ko | 10,4 | 49,5 | 19,7 | 330,7 ko | 25 | 20 ms |
| `/offres` | 144,5 ko | 10,4 | 13,1 | 10,4 | 287,6 ko | 26 | 8 ms |
| `/lobbying-territorial` | 144,5 ko | 10,4 | 13,1 | 9,7 | 278,1 ko | 21 | 9 ms |
| `/contact` | 146,4 ko | 10,4 | 21,3 | 9,0 | 287,5 ko | 23 | 26 ms |
| `/mentions-legales` | 144,5 ko | 10,4 | 13,1 | 8,0 | 276,4 ko | 21 | 9 ms |

### Décomposition du JavaScript

| Fragment | Transféré | Contenu |
|---|---|---|
| `11pxbv…` | **70,2 ko** | react, react-dom, scheduler |
| `1z99ml…` | **46,3 ko** | routeur applicatif de Next |
| `3qg-bw…` | 10,5 ko | `next/image` + code du site |
| `22emux…` | 7,5 ko | react (complément) |
| 3 autres | 10,0 ko | runtime Turbopack, fragments de page |

**116,5 des 144,5 ko sont le socle React + Next**, identique sur toute
application App Router et non réductible sans renoncer à la navigation côté
client. Le code propre au site représente au plus 28 ko, et l'écart entre la
route la plus légère et la plus lourde est de 1,9 ko — tout est mutualisé.

> **L'objectif « JS < 120 ko par route » n'est pas atteignable sur cette
> stack.** Il faudrait descendre sous le socle du framework. Ce qui est
> atteignable, c'est de réduire la part applicative et de retarder ce qui n'est
> pas nécessaire au premier rendu. Le chiffre honnête à viser est donc le poids
> applicatif, pas le total.

---

## 4. Mode de rendu par route

| Route | Mode | Remarque |
|---|---|---|
| `/` | ○ statique | ISR 1 min |
| `/offres` | ○ statique | ISR 1 min |
| `/lobbying-territorial` | ○ statique | |
| `/contact` | **ƒ dynamique** | **régression** |
| `/mentions-legales`, `/confidentialite` | ○ statique | |
| `/llms.txt`, `/llms-full.txt`, `/sitemap.xml` | ○ statique | ISR 1 h |
| `/robots.txt`, icônes, image de partage | ○ statique | |

`/contact` est rendue à la demande parce qu'elle lit `searchParams` — c'est le
paramètre `?objet=` qui pré-remplit le sujet quand on arrive depuis une offre.
**C'est une régression introduite lors du chantier SEO**, et elle est la seule
page du site à ne pas être servie depuis le cache de bordure. La lecture peut
se faire côté client sans rien perdre du comportement.

---

## 5. Ce qui est déjà bon

À ne pas défaire :

- **CLS mesuré à 0** sur les trois pages. Les images portent toutes leurs
  dimensions, les polices sont auto-hébergées par `next/font` avec
  `display: swap`, aucune bannière ni encart n'est injecté après coup.
- **TTFB de 8 à 26 ms** sur les pages statiques.
- **Aucune requête vers un tiers** : ni police distante, ni script d'analyse, ni
  contenu intégré. Vérifié en relevant les hôtes contactés.
- **Aucune dépendance de production superflue** : trois paquets en tout.
- Les six SVG de la marque sont déjà recompressés, rendu comparé pixel à pixel.

---

## 6. Plan

| Phase | Action | Gain attendu |
|---|---|---|
| 1 | Animation d'apparition jouée par CSS au-dessus de la ligne de flottaison | **LCP, le gros morceau** |
| 1 | `/contact` repasse en statique, le sujet se lit côté client | TTFB, cache de bordure |
| 2 | AVIF ajouté aux formats, `deviceSizes` resserrés | poids des images |
| 3 | `next/dynamic` sur la modale du manifeste | quelques ko de JS |
| 3 | Analyseur de paquets câblé derrière `ANALYZE=true` | outillage |
| 4 | Rien à faire : polices et CLS déjà conformes | — |
| 5 | Région des fonctions à Paris, en-têtes de cache, mesure réelle | TTFB, suivi |

Chaque phase est mesurée avant et après. Ce qui ne produit pas de gain mesuré
n'est pas retenu.

---

# Phase 2 — visuels

## Ce qui a été fait

**AVIF ajouté aux formats servis.** Next négocie avec l'en-tête `Accept` du
navigateur : celui qui comprend l'AVIF le reçoit, sinon il reçoit le WebP,
sinon le fichier d'origine. Aucun visiteur n'est laissé de côté.

**Un seul des deux logotypes de l'en-tête est préchargé.** L'en-tête porte deux
faces qui se croisent en fondu : la marque seule tant que le héros est à
l'écran, le mot-symbole complet ensuite — donc d'emblée sur toute page autre que
l'accueil. Les deux étaient préchargées en priorité haute, dont une invisible.
Elle reste dans le document, le fondu en a besoin, mais elle ne dispute plus la
bande passante à la feuille de style pendant la seconde qui compte.

## Poids des images, avant et après

Octets transférés, page parcourue de haut en bas, profil mobile 390 px à deux
pixels par point et bureau 1440 px.

| Page | Avant | Après | Gain |
|---|---|---|---|
| Accueil, mobile | 192,6 ko | **119,4 ko** | −38 % |
| Accueil, bureau | 140,2 ko | **93,7 ko** | −33 % |
| Offres, bureau | 21,3 ko | **14,7 ko** | −31 % |
| Contact, bureau | 21,3 ko | **14,7 ko** | −31 % |

Fichier par fichier, à largeur identique :

| Visuel | WebP | AVIF | Gain |
|---|---|---|---|
| Portrait, 828 px | 102,1 ko | 52,8 ko | −48 % |
| Portrait, 640 px | 70,9 ko | 32,7 ko | −54 % |
| Mot-symbole, 640 px | 22,4 ko | 11,5 ko | −49 % |
| Mot-symbole, 384 px | 12,0 ko | 5,7 ko | −52 % |
| Logotype clair, 384 px | 12,7 ko | 7,5 ko | −40 % |
| Marque, 96 px | 3,2 ko | 1,9 ko | −41 % |

## Le rendu est-il le même ?

Question légitime : l'AVIF compresse plus fort, et à qualité égale il s'écarte
davantage de l'original que le WebP. Mesuré fichier par fichier, l'écart moyen
à l'original passe de 0,7–1,2 à 0,9–2,4 sur une échelle de 0 à 255.

Mais un fichier n'est jamais regardé à sa taille de téléchargement : le
logotype du pied de page est servi en 384 px et affiché sur 149. **La seule
comparaison qui compte est celle de la page rendue**, faite en chargeant deux
fois la même page et en ne changeant que l'en-tête `Accept` :

| Vue | Écart moyen | Écart max | Pixels à plus de 20 |
|---|---|---|---|
| Accueil, mobile | 0,006 | 29 | 0,000 % |
| Accueil, bureau | 0,052 | 38 | 0,003 % |
| Accueil, bureau ×2 | 0,048 | 51 | 0,002 % |

Les écarts se concentrent dans le portrait — une photographie, où un pixel qui
diffère de 30 sur 255 est invisible. Sur le mot-symbole du héros, 851 pixels
diffèrent sur plus d'un million, tous sur le contour des lettres.

## Ce qui a été mesuré puis écarté

**Resserrer `deviceSizes` et `imageSizes`.** L'idée était de raccourcir les
listes `srcset`. Mesuré en supprimant *tous* les `srcset` de la page : 425
octets compressés gagnés sur l'accueil, 148 sur contact. Un resserrement
partiel en gagnerait moins de la moitié, au prix d'un risque réel — un écran à
forte densité recevrait une image plus large que nécessaire. **Non retenu.**

`photoorga.png` (6,3 Mo) et `fondatrice.png` (1,1 Mo) sont dans `public/` ;
seule la seconde est utilisée, et via l'optimiseur, donc jamais servie telle
quelle. La première n'est référencée nulle part. Aucune des deux ne pèse sur ce
qu'un visiteur télécharge : signalées, pas supprimées.

---

# Phase 4 — polices

Prise avant la phase 3 : les mesures de la phase 2 ont montré que c'était là
que se jouait le premier rendu, et non dans le JavaScript.

## Le constat

Six fichiers de police étaient préchargés sur chaque page, 87,6 ko réclamés en
priorité haute avant même la feuille de style. Sur une connexion mobile à
1,6 Mbit/s, cela représente près d'une demi-seconde de bande passante prise à ce
qui, lui, est nécessaire pour peindre la page.

Ces six fichiers sont trois polices × deux sous-ensembles de caractères :

| Sous-ensemble | Fichiers | Poids |
|---|---|---|
| `latin` | sans, serif, serif italique | 60,1 ko |
| `latin-ext` | sans, serif, serif italique | **27,5 ko** |

`latin-ext` couvre les lettres d'Europe centrale et du vietnamien. Les sept
pages du site ont été parcourues et leurs **102 caractères distincts** relevés
un à un : **aucun** n'en relève. Ces 27,5 ko étaient téléchargés pour rien, sur
chaque page, avant tout le reste.

Le français tient entier dans `latin`, œ et Œ compris — ils sont à U+0152-0153,
explicitement dans la plage. Seules les flèches → et ↗ n'y sont pas, mais elles
ne sont dans `latin-ext` non plus : elles étaient déjà rendues par la police du
système, et le restent.

## Ce qui a été fait

`subsets: ["latin"]` au lieu de `["latin", "latin-ext"]`.

**Rien n'est perdu.** Next continue de déclarer les fichiers `latin-ext` dans la
feuille de style avec leur plage de caractères ; il cesse seulement de les
précharger. Le jour où un contenu portera un nom en alphabet latin étendu, le
navigateur ira chercher le fichier à ce moment-là. Vérifié en insérant
« Łódź Škoda Ğ » dans une page servie : le quatrième fichier est bien demandé.

Contrôle de non-régression : 493 nœuds de texte parcourus sur six pages,
**zéro** rendu par une police de repli.

## Mesures

Profil mobile, réseau à 1,6 Mbit/s, processeur ralenti ×4, médiane de neuf
passages.

| Page | LCP avant phase 4 | LCP après | FCP après |
|---|---|---|---|
| Offres | 2,11 s | **1,06 s** | 0,92 s |
| Contact | ~1,0 s | **1,03 s** | 0,89 s |
| Accueil | 2,17 s | 2,17 s | 1,19 s |

Le gain sur Offres est net, mais le chiffre le plus parlant est ailleurs : la
mesure **cesse d'osciller**. Avant, le LCP d'Offres tombait tantôt à 1,04 s
tantôt à 2,15 s, d'un passage à l'autre, sur le même code — 8 passages sur 9 du
côté lent. Après, les neuf passages tiennent entre 1,02 et 1,09 s.

C'était une course : selon que la feuille de style arrivait avant ou après le
premier rendu, le texte du haut de page était peint tout de suite ou une
seconde plus tard. Désencombrer la fenêtre critique a tranché la course du bon
côté, définitivement.

## Poids transféré, référence → maintenant

| Route | Avant | Maintenant | Gain |
|---|---|---|---|
| `/` | 330,7 ko | **288,2 ko** | −13 % |
| `/offres` | 287,6 ko | **260,8 ko** | −9 % |
| `/lobbying-territorial` | 278,1 ko | **246,7 ko** | −11 % |
| `/contact` | 287,5 ko | **252,2 ko** | −12 % |
| `/mentions-legales` | 276,4 ko | **244,9 ko** | −11 % |

## Ce qui a été mesuré puis écarté

**Ne plus précharger l'illustration du héros.** Le motif cartographique est
décoratif, tramé à 0,22 d'opacité en petit écran, et ses 13,7 ko passaient
devant la feuille de style. L'hypothèse était bonne ; la mesure ne l'a pas
suivie : LCP de l'accueil à 2,17 s avec le préchargement, 2,17 s sans.
**Non retenu.**

## L'accueil, et ce qu'il reste à comprendre

L'accueil ne bouge pas : 2,17 s, sur les neuf passages. Son élément de plus
grande peinture est le titre de la section « Notre vision », qui affleure en bas
de l'écran à 722 px sur les 844 d'un téléphone.

Trois pistes ont été écartées par la mesure, ce qui vaut d'être noté :

- **Ce n'est pas le fondu d'apparition.** Ramené de 900 ms à 1 ms dans une
  construction d'essai, le LCP de l'accueil reste à 2,21 s. Le travail de la
  phase 1 est donc intact, et l'animation n'est pas en cause.
- **Ce n'est pas le format des images.** Même page, même serveur, seul
  l'en-tête `Accept` change : AVIF et WebP donnent le même résultat.
- **Ce n'est pas un décalage de mise en page.** Aucun décalage relevé sur
  l'accueil, et le titre est à 722 px du premier rendu à la fin.

En instrumentant image par image, le titre est **entièrement opaque à 1,29 s**
— et le navigateur n'enregistre sa peinture qu'à 2,30 s. Une seconde pendant
laquelle l'élément est visible sans être compté. Ce délai coïncide avec
l'hydratation, qui occupe le fil principal au même moment. C'est la piste de la
phase 3.
