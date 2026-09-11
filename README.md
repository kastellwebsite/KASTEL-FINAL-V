# Kastell Conseil — site web

Site vitrine de **Kastell Conseil** (conseil en affaires publiques, lobbying et
communication d'influence — Rennes). Next.js 16 (App Router) + Tailwind CSS,
prêt à déployer sur Vercel.

La page d'accueil est une reproduction fidèle de la maquette Claude Design :
mêmes polices (Instrument Serif / Instrument Sans), mêmes couleurs, mêmes
rampes `clamp()`. Chaque section rend à la même hauteur au pixel près que
l'artboard source en 1440 px.

## Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # build de production
npm run lint     # ESLint
```

## Déploiement Vercel

Importer le dépôt dans Vercel : le framework est détecté automatiquement,
aucune variable d'environnement n'est requise. Build `npm run build`,
sortie `.next`.

## Structure

```
src/app/            routes (/, /offres, /contact) + layout et styles globaux
src/components/     Header, Footer, Reveal, modale de téléchargement
src/components/sections/   sections de la page d'accueil
src/content/site.ts textes de repli : tout le rédactionnel du site
src/cms/            lecture WordPress et fusion avec le contenu du dépôt
public/brand/       logos et marque
public/documents/   documents téléchargeables
wordpress/          extension WordPress : modèle de contenu et route REST
```

Les valeurs de la maquette (couleurs, `clamp()`, interlignages) sont
centralisées dans `tailwind.config.ts` et `src/app/globals.css`.

## Accessibilité, performance, animations

Un audit a été passé sur la page d'accueil (axe-core WCAG 2.1 AA, plus des
vérifications manuelles). État après corrections :

- **axe-core : 0 violation** en 1440 px et en 390 px (28 auparavant, toutes des
  contrastes insuffisants). Trois teintes de la charte ont été très légèrement
  assombries pour atteindre 4,5:1 — elles sont regroupées dans
  `tailwind.config.ts` si la marque préfère revenir aux valeurs d'origine :
  `sage` `#5E7E7E` → `#557272`, `dim` `#7C8582` → `#707876`,
  `muted` `#9AA3A0` → `#666F6C`.
- **Sans JavaScript, la page reste lisible.** Le voile d'apparition est
  conditionné à `@media (scripting: enabled)` : JS désactivé, rien n'est masqué.
- **Focus clavier visible** partout, avec une variante claire sur les bandeaux
  vert foncé, et un lien d'évitement en tête de page.
- **Cibles tactiles ≥ 24 px** (WCAG 2.2) sur les liens de navigation et de pied
  de page, élargies via `.hit-area` — un pseudo-élément, donc sans décaler la
  mise en page.
- **Poids des images et polices divisé par deux** (210 → 116 Ko) : le favicon
  pointait sur le PNG de la marque en pleine résolution (94 Ko), remplacé par
  `app/icon.png` en 64 px (3 Ko). La mesure ne couvre pas les bundles JS.
- `robots.txt` et `sitemap.xml` générés depuis `site.url`.

### Logos et bascule du header

Le héros affiche le mot-symbole complet en grand. Le header, lui, part de la
marque seule tant que le héros est à l'écran — inutile de répéter un logo déjà
visible — puis bascule sur le mot-symbole dès qu'on le quitte, et sur toute
autre page. La détection se fait par `IntersectionObserver` sur `#top` ; l'état
initial suit la route (`usePathname`) pour éviter un saut à l'hydratation.
Les deux faces se croisent en fondu et la largeur du conteneur s'anime.

### Illustration du héros

`public/brand/manifeste-carte.svg` est un motif cartographique **abstrait**
(courbes de niveau, graticule, trois places reliées) généré pour évoquer
l'ancrage territorial et la liaison vers Paris. Il n'affirme aucune géographie
réelle. Un masque en dégradé efface ses bords, sinon le graticule dessine un
rectangle net posé sur la page.

Il déborde volontairement à droite et dépasse en hauteur : la section le rogne
(`overflow-hidden`), d'où la coupe franche au bord. Seul son bord gauche reste
en fondu, pour qu'il ne vienne pas buter contre le texte. En dessous de 900 px
la colonne se resserre et le texte le recouvre, d'où une opacité réduite à ce
palier.

Le `.h1` porte un `margin-left: -0.018em` : le « P » a une chasse gauche que le
mot-symbole, détouré au ras du « K », n'a pas. Sans cette correction le titre
est décalé de 1,5 px vers la droite à 84 px de corps. Exprimée en em, elle tient
à toutes les tailles — vérifié à 1440, 1100 et 700 px, l'encre du logo, du titre
et du bouton démarre au même pixel.

### Visuel de fond du manifeste

Déposer une image dans `public/brand/manifeste.*` (jpg, png, webp, avif — le
composant résout l'extension tout seul). Elle se place derrière le titre et
s'efface en dégradé vers la colonne de texte ; sans fichier, la section reste
telle que dans la maquette.

`manifeste.backdrop` est **vide** : la section a retrouvé le bandeau sable nu de
la maquette, la carte servant désormais d'illustration au héros. Pour remettre
un fond, indiquer `brand/manifeste-carte` ou `brand/photoorga` (chemin **sans
extension** : le helper résout le format réel).

L'opacité se règle via `--manifeste-opacity` dans `globals.css` (0.20 en
desktop, 0.16 en mobile). **Attention au contraste** : l'accroche « Manifeste »
ne dispose que de 4,54:1 sur le fond sable, donc le moindre assombrissement la
fait passer sous le seuil AA — le dégradé vertical ne démarre volontairement
qu'en dessous d'elle (150 px en desktop, 95 px en mobile). Le grand titre, lui,
garde plus de 8:1. Vérifier ces deux valeurs si l'image ou les paddings changent.

La qualité JPEG/WebP est forcée à 55 pour ce visuel (invisible à 20 % d'opacité
derrière un masque, 144 → 112 Ko). Next 16 refusant toute qualité non déclarée,
elle est listée dans `images.qualities` de `next.config.mjs` ; sans cela le
`quality` est ignoré en silence.

### Palette et vert clair

Le vert pousse de la charte est décliné en trois rôles, chacun vérifié par la
mesure plutôt que choisi à l'œil :

| Jeton | Valeur | Rôle | Contraste |
| --- | --- | --- | --- |
| `accent` | `#73C167` | décoratif, et texte sur les bandeaux vert foncé | 6,90:1 sur `#192924` |
| `sage` | `#35752B` | texte d'accent sur fond clair | 5,35 sur bone, 4,91 sur sable, 5,17 sur la teinte |
| `accent-tint` | `#F1F7F0` | fond de bande | texte forêt à 13,93:1 |

La méthode compte autant que les valeurs : un vert plus vif est plus proche du
fond clair, la saturation coûte donc du contraste. On ne choisit pas une couleur
puis on espère — on pose la teinte et la saturation voulues, et on **cherche la
clarté** qui satisfait le seuil. C'est ce qui donne le vert le plus lumineux
possible sans descendre sous la limite de lisibilité.

Le vert apparaît sur la bande « Notre vision », les bandes alternées de la page
Offres, la bande du manifeste, les puces des prestations, les filets de section
et les survols. Le bandeau LinkedIn garde le sable, pour ne pas verdir toute la
page.

### Couverture du manifeste

La bande « Manifeste » en fin de page d'accueil affiche une couverture de
document. Tant qu'aucun fichier n'est fourni, elle est **composée dans la page**
à partir de `manifesto.cover` : bloc vert foncé, titre en Instrument Serif,
motif cartographique, marque « RIT ». Elle hérite donc des fontes du site, reste
nette à toute résolution et ne coûte aucun octet de plus.

Ses proportions sont pilotées par des unités de conteneur (`cqw`), pas par la
largeur de fenêtre : la couverture est identique dans la colonne du bureau et
une fois la grille repliée sur mobile. Attention si vous la retouchez — un
conteneur ne peut pas s'interroger lui-même, sa propre marge intérieure doit
donc rester en pourcentage (`padding: 5.5%`), sans quoi les `cqw` retombent sur
la fenêtre et divisent toutes les tailles filles.

Pour poser une vraie couverture : téléverser l'image dans WordPress (À propos →
« Manifeste — couverture »), ou renseigner `manifesto.coverUrl`.
Format conseillé : portrait, environ 1000 × 1414 px.

### Page de contact

Le formulaire vit sur `/contact`, pas en bas de la page d'accueil. En fin d'une
page déjà longue, il demandait un effort au moment où le visiteur en a le moins.
L'accueil et la page Offres se terminent sur une invitation courte —
`ContactBande` — qui mène à la page et laisse l'adresse en clair pour qui
préfère écrire directement.

`Contact` accepte `titre={false}` : sur la page dédiée, le `<h1>` porte déjà le
propos, et le répéter créerait deux titres pour une même chose.

### Formulaire de contact

`POST /api/contact` valide la saisie, exige le consentement, écarte les robots
par un champ leurre et limite le débit à quatre demandes par minute et par IP,
puis **envoie un courriel** au cabinet.

L'adresse du visiteur est placée en **champ de réponse** : le cabinet répond
depuis sa boîte sans rien recopier. C'est le détail qui compte à l'usage. Un
accusé de réception part au visiteur dans la foulée, au mieux — son échec ne
doit pas faire croire à une demande perdue, elle est déjà partie.

Deux services sont reconnus, choisis par la clé présente : `BREVO_API_KEY`
(français, hébergement européen) ou `RESEND_API_KEY`. Les prendre tous les deux
évite de figer le choix dans le code. `MAIL_EXPEDITEUR` doit appartenir à un
domaine **authentifié** chez le service, sinon l'envoi est refusé : un serveur
ne peut pas envoyer un courriel tout seul, sans quoi il part en indésirable.

`CONTACT_DESTINATAIRE` ne sert qu'à écrire ailleurs qu'à l'adresse de contact du
site : à ne pas créer autrement, Vercel refusant une valeur vide.

À défaut de clé, `CONTACT_WEBHOOK_URL` prend le relais pour qui préfère un
scénario Zapier ou Make. Charge utile :

```json
{ "nom": "…", "email": "…", "organisation": "…", "telephone": "…",
  "objet": "…", "message": "…", "date": "…", "source": "…" }
```

**Il n'y a ici aucun repli acceptable côté serveur** : contrairement au
téléchargement du manifeste, une demande perdue est un client perdu. Quand la
destination n'est pas configurée (501) ou que le relais échoue (502), la route
le dit franchement et le formulaire propose au visiteur d'**ouvrir son logiciel
de messagerie avec le message déjà rédigé**, saisie conservée à l'écran. Le
visiteur repart toujours avec un moyen d'aboutir, jamais avec l'illusion que
c'est parti.

La liste des sujets est alimentée par les intitulés des offres : un visiteur qui
vient de les lire retrouve les mêmes mots, et la demande arrive qualifiée.

### Visuels de la médiathèque

`remotePatterns` est déduit de `WORDPRESS_API_URL` : un seul réglage, pas deux à
tenir en accord. Certains hébergements servent pourtant la médiathèque depuis un
autre domaine — un CDN, un sous-domaine. `MEDIA_HOSTS` permet alors de les
déclarer, séparés par des virgules, sans repasser par le code. Sans cela
l'optimiseur refuse l'image et le visiteur voit une vignette cassée, sans
qu'aucune erreur n'apparaisse dans les journaux du site.

En développement, l'optimiseur refuse de toute façon les hôtes locaux
(`dangerouslyAllowLocalIP`, faux par défaut depuis Next 16) : une image servie
depuis `localhost` renvoie 400 même correctement déclarée. C'est une garde de
l'outil, pas un défaut de configuration.

### Publications : lien externe ou section du site

Une publication porte deux champs de destination. « …ou vers une section du
site » l'emporte sur l'adresse extérieure : c'est un choix explicite, là où le
champ d'adresse peut n'avoir jamais été vidé.

`estInterne()` (`src/lib/lien.ts`) décide du rendu. Une ancre ou un chemin
s'ouvrent dans le même onglet, par la navigation interne, avec une flèche vers
le bas ; une adresse extérieure s'ouvre à côté, flèche oblique et mention pour
les lecteurs d'écran. Confondre les deux donne soit un onglet de trop pour aller
à la section d'en dessous, soit un site quitté sans prévenir.

### Liens non renseignés

Les URL encore inconnues sont notées `#` dans le contenu. `estUtile()`
(`src/lib/lien.ts`) sert à ne pas les rendre : un bouton vers `#` ne fait rien
sinon remonter la page, et le visiteur croit à une panne.

Trois boutons LinkedIn et les cartes d'actualités en dépendaient. Ils
apparaissent dès que `site.linkedin`, `site.linkedinProfile` et les liens de
`posts` portent de vraies adresses — sans quoi la carte d'actualité reste une
carte, et le bouton n'existe pas.

### Téléchargement du manifeste contre adresse e-mail

Le bouton « Télécharger le manifeste » n'apparaît **que si le document
existe** : `public/documents/manifeste-rit.pdf` dans le dépôt, ou un fichier
téléversé depuis WordPress (À propos → « Manifeste — document à télécharger »),
qui prend alors le dessus. Sans document, la bande garde son seul lien LinkedIn
— mieux vaut pas de bouton qu'un bouton qui tombe sur un 404.

Le formulaire ouvre une `<dialog>` native : le navigateur y assure le piège à
focus, la touche Échap, l'inertie de l'arrière-plan et le retour du focus sur le
bouton d'ouverture, ce qu'une réimplémentation manuelle rate presque toujours.

`POST /api/manifeste` valide l'adresse, exige le consentement, écarte les robots
par un champ leurre, limite le débit par IP, puis relaie l'adresse vers
`MANIFESTE_WEBHOOK_URL` — n'importe quel service acceptant un POST JSON
(Zapier, Make, Brevo, n8n). Charge utile :

```json
{ "email": "…", "document": "Manifeste Réseau Influence & Territoires", "date": "…" }
```

Sans cette variable d'environnement, l'adresse est seulement journalisée et le
document est servi quand même : une intégration absente ne prive jamais un
visiteur du document, et le relais en panne non plus.

Le fichier est servi par `/api/manifeste/fichier`, jamais par l'adresse du CMS.
Deux raisons : l'attribut `download` est **ignoré dès que le fichier vient d'un
autre domaine** — le PDF s'ouvrirait alors dans un onglet au lieu de descendre
dans les téléchargements — et l'adresse du back-office n'a pas à s'afficher dans
la barre d'adresse. Le relais ajoute un `Content-Disposition: attachment`, que
le navigateur honore sans discuter.

**Ce que ce formulaire ne fait pas.** Le relais ne contrôle rien : une fois son
adresse connue, elle est publique et partageable. C'est le compromis habituel de
ce type de formulaire, et il est assumé — l'objectif est de qualifier des
contacts, pas de protéger un document par ailleurs diffusé. Pour un vrai verrou,
il faudrait un jeton signé à durée limitée.

La limitation de débit (5 demandes par minute et par IP) vit en mémoire de
l'instance : sur une plateforme sans état elle ne survit pas au recyclage. C'est
un garde-fou de première ligne, pas une protection anti-abus.

Le traitement est décrit dans la page « Politique de confidentialité »
(finalité, base légale — le consentement —, destinataires, durée). Ces
rubriques comportent encore des crochets à compléter : prestataire d'envoi
retenu et durées de conservation.

### Logos des médias (presse)

Même principe que les logos clients : chaque entrée de `press` porte un chemin
`logo` sous `public/` **sans extension**. Déposer les fichiers sous
`public/brand/press/ouest-france.*`, `bretagne-economique.*`,
`femmes-de-bretagne.*`. Tant qu'un fichier manque, le nom du média s'affiche
en toutes lettres dans la pastille.

### Pages légales

`/mentions-legales`, `/confidentialite` et `/cookies` partagent le gabarit
`src/components/LegalPage.tsx`. **Leur contenu est un squelette** : tout ce qui
relève de l'éditeur (forme juridique, SIREN, RCS, hébergeur, numéro HATVP,
durées de conservation) est laissé entre crochets, à compléter par le client ou
son conseil. Rien n'a été inventé. Les trois pages sont en `noindex` et hors
sitemap tant qu'elles ne sont pas remplies.

### Logos clients

La liste est dans `clients` (`src/content/site.ts`). Chaque entrée pointe un
chemin sous `public/` **sans extension** ; `findPublicAsset` résout le format,
en préférant le SVG. Les cinq fichiers actuels sont dans `public/brand/`.

Tant qu'un fichier manque, sa tuile affiche le nom du client à la place, donc
la section reste présentable même incomplète.

Les logos livrés sont des tracés monochromes : ils sont simplement atténués au
repos et reprennent du corps au survol. Ils sont servis en `unoptimized` —
l'optimiseur de Next refuse le SVG sans `dangerouslyAllowSVG`, et un vecteur
n'a de toute façon rien à y gagner.

`google.svg` est arrivé avec **un « o » manquant** — le jaune, le plus clair,
perdu au seuillage de la vectorisation : le logo se lisait « Go gle ». Réparé
en dupliquant le « o » restant, un cercle identique, recentré dans l'espace
laissé libre (écarts o→o et o→g mesurés à 11 px chacun).

`region-bretagne.svg` reste la version **en négatif** : un carré noir avec le
logo détouré en blanc. Elle fonctionne, mais pèse visuellement plus que les
quatre autres, qui sont sur fond transparent. Une version à fond transparent
l'alignerait sur le reste de la ligne.

### Retombées presse

Les trois articles sont dans `press` (`src/content/site.ts`). Les titres ont été
repris des URL sources : les trois domaines sont inaccessibles depuis
l'environnement de build, donc **les dates n'ont pas pu être relevées et ne sont
pas affichées** — les ajouter manuellement si besoin.

### Header collant

Le header est en `position: sticky`. Attention au conteneur qui l'entoure :
la maquette l'enveloppe dans un `overflow-x: hidden`, ce qui force
`overflow-y` à `auto` et en fait une zone de défilement — `sticky` s'y accroche
alors au lieu de s'accrocher à la fenêtre, et le header repart avec le contenu.
Le wrapper utilise donc `overflow-x: clip`, qui découpe sans créer de zone de
défilement. Ne pas le repasser à `hidden`.

Sa hauteur varie (75 px, 132 px quand la navigation passe sur deux lignes en
mobile) : le composant publie la valeur mesurée dans `--header-h` via un
`ResizeObserver`, et `globals.css` s'en sert pour le `scroll-margin-top` des
sections ancrées. La valeur en dur dans le CSS ne sert que d'amorce avant
hydratation.

Les animations sont exclusivement en `transform` / `opacity` — aucune ne décale
la mise en page, et la hauteur de chaque section reste identique à l'artboard.
`prefers-reduced-motion: reduce` les neutralise toutes, y compris la dérive du
filigrane du héros.

## CMS (WordPress headless)

WordPress ne sert **aucune page**. Il sert des données, que Next va chercher au
build et à la revalidation, puis rend en HTML statique sur Vercel. Google, les
crawlers d'IA et les visiteurs ne voient jamais WordPress.

```
WordPress (back-office)  ──▶  /wp-json/kastell/v1/contenu  ──▶  Next sur Vercel  ──▶  HTML
        ▲                                                            │
        └──────────── webhook /api/revalidate ◀──────────────────────┘
```

L'extension qui fait tout ce travail est dans `wordpress/kastell-contenu/` :
elle déclare le modèle de contenu, fabrique l'administration et expose une route
d'agrégation. Voir son `LISEZ-MOI.md` pour l'installation.

### Le contrat entre les deux moitiés

La route WordPress rend **exactement l'enveloppe** que produisait auparavant la
requête Sanity — `parametres`, `accueil`, `offres`, `apropos`, `piedDePage`,
avec les mêmes noms de champs. C'est ce qui a permis de changer de back sans
toucher une ligne des composants : seule la couche de lecture a changé, la
fusion (`src/cms/content.ts`) est restée identique.

Ce contrat est aussi ce qu'il faut respecter si le back change encore.

### Mise en route

1. **Installer WordPress** sur un hébergement mutualisé ou managé. Idéalement un
   sous-domaine discret : `admin.kastell-conseils.fr`.
2. **Déposer l'extension** — copier `wordpress/kastell-contenu/` dans
   `wp-content/plugins/`, puis l'activer. Aucune autre extension n'est requise :
   ni ACF, ni WPGraphQL.
3. **Renseigner la liaison** dans l'administration : *Contenu du site*, en bas
   de page, l'adresse du site public et le secret partagé (`openssl rand -hex
   32`, la même valeur que `REVALIDATE_SECRET` côté Vercel).

   Aucun fichier à modifier. Les constantes `KASTELL_SITE_URL` et
   `KASTELL_SECRET` de `wp-config.php` restent reconnues et gardent la
   priorité, pour un hébergement qui préfère sortir le secret de la base.

4. **Créer le compte de Léa** — rôle **Éditeur**, pas Administrateur.
5. **Côté Vercel** — ajouter `WORDPRESS_API_URL` (l'adresse WordPress, sans
   barre oblique finale) et `REVALIDATE_SECRET` (la même valeur que
   `KASTELL_SECRET`), puis redéployer.

Vérification : `https://<wordpress>/wp-json/kastell/v1/contenu` doit rendre du
JSON. Si oui, le site le lit.

### Ce que voit Léa

Un menu unique, **Contenu du site**, et rien d'autre. Articles, Pages,
Commentaires et Tableau de bord sont retirés pour tout le monde : cette
installation ne sert aucune page, et les laisser revient à offrir d'écrire un
article à côté d'« Actualités LinkedIn » sans qu'il apparaisse jamais.

La première page est une **vue d'ensemble** : une carte par rubrique, ce qu'elle
alimente sur le site, le nombre d'éléments pour les listes. C'est là qu'arrive
un compte Éditeur après connexion.

Les cinq rubriques uniques mènent droit à leur formulaire. Les listes se
réordonnent en **déplaçant les lignes** à la souris. Chaque écran porte un
rappel de ce qu'il alimente, et le champ titre porte le nom de ce qu'il contient
vraiment — « Nom du client », « Titre de l'article » — jamais le « Saisir le
titre » de WordPress.

Les listes de texte (paragraphes, prestations, objectifs) se saisissent **une
ligne par élément** : WordPress n'a pas de champ répétable sans extension
payante, et une ligne par élément se comprend sans explication.

### Récupérer les textes du site

Un back-office vide est indéchiffrable : on ne peut pas modifier un texte qu'on
ne voit pas. Le bouton **Récupérer les textes du site**, sur la vue d'ensemble,
verse dans WordPress tout ce que `src/content/site.ts` contient déjà.

Le fichier `wordpress/kastell-contenu/contenu-initial.json` est **généré**, pas
écrit à la main :

```bash
npx tsc src/content/site.ts --outDir .tmp-contenu --target es2022 \
  --module esnext --moduleResolution bundler
node outils/generer-contenu-initial.mjs .tmp-contenu/site.js
```

À relancer si les textes du dépôt changent avant la mise en route de WordPress.

L'import ne remplit qu'un champ vide et n'alimente qu'une liste vide : le
relancer ne peut rien écraser, et sert à compléter après coup.

Le modèle est déclaré une seule fois, dans `wordpress/kastell-contenu/inc/schema.php` :
l'administration, l'enregistrement et la route REST en dérivent tous. Ajouter un
champ là-bas suffit à le voir apparaître partout.

### Tant que rien n'est branché

`isWordPressConfigured` est faux sans `WORDPRESS_API_URL` : le site sert le
contenu de `src/content/site.ts`. **Rien ne casse avant la mise en route, et
rien ne casse non plus si WordPress devient injoignable** — `getContent()`
rattrape l'erreur, journalise et retombe sur le dépôt. Vérifié : WordPress
éteint, le build passe et la page répond 200 avec le contenu du dépôt.

La fusion se fait **champ par champ** : une fiche à moitié remplie ne vide
aucune rubrique. Vérifié aussi : avec un WordPress où un seul champ est
renseigné, ce champ est repris et tout le reste — les six offres, la biographie,
la presse, le manifeste, le pied de page — reste celui du dépôt.

### Voir une modification sans attendre

Le site est servi en pages pré-rendues, rafraîchies chaque minute. C'est ce qui
le rend rapide et robuste, mais cela impose d'attendre pour constater l'effet
d'une modification. Deux mécanismes s'en chargent :

**Le bouton « Mettre le site à jour »**, sur la vue d'ensemble et en haut de
chaque écran d'administration. Il est toujours affiché, désactivé et accompagné
du formulaire à remplir quand la liaison n'est pas renseignée ; la vue d'ensemble indique aussi la version de l'extension installée. Il purge le cache du site et attend la réponse,
ce qui en fait aussi le test de la liaison : un secret mal recopié ou une
adresse erronée s'y voient tout de suite, au lieu de se traduire par « le site
ne se met pas à jour ».

**Le webhook**, automatique. WordPress prévient Next à chaque publication, sans
attendre la réponse — l'enregistrement d'un article ne doit pas dépendre d'un
service tiers. Contrepartie : s'il échoue, personne ne le sait, d'où le bouton
ci-dessus. Sans les constantes de `wp-config.php`, le rafraîchissement
automatique d'une minute prend le relais.

**Le mode aperçu**, pour vérifier soi-même. Un bouton **Voir l'aperçu du site**
figure sur la vue d'ensemble et en haut de chaque écran d'administration. Il
pose un cookie qui, *pour ce navigateur seulement*, fait relire WordPress à
chaque affichage. Les autres visiteurs continuent de recevoir la version
pré-rendue.

Un bandeau le rappelle en bas de page, avec un lien pour en sortir. Sans lui on
oublie qu'on est dans un mode particulier : le site paraît se mettre à jour
instantanément pour tout le monde, et la première personne à qui on montre le
lien voit autre chose.

Le secret n'est pas écrit dans le HTML de l'administration : le bouton passe par
une redirection WordPress qui l'ajoute côté serveur.

La purge invalide l'étiquette du contenu **et** le cache de route. La seule
étiquette ne suffirait pas dans un cas : une page construite avant que le CMS ne
soit renseigné ne comporte aucune requête, donc aucune étiquette à purger — le
bouton répondrait « c'est fait » sans que rien ne change.

Aucun de ces mécanismes ne demande de redéploiement. **Un seul
redéploiement reste nécessaire**, celui qui suit l'ajout de
`WORDPRESS_API_URL` — voir le piège décrit plus bas.

### Quand une modification n'apparaît pas

Le repli sur le contenu du dépôt est **silencieux par conception** : c'est ce
qui garde le site debout quand WordPress tombe, mais cela rend le diagnostic
impossible à l'œil — une page qui affiche l'ancien texte ressemble en tout
point à une page qui affiche le bon.

Une seule URL répond :

```
https://kastell-conseils.fr/api/diagnostic?secret=<REVALIDATE_SECRET>
```

Elle dit si la variable est présente sur ce déploiement, si WordPress répond,
en combien de temps, et **combien d'éléments il voit dans chaque liste**. Il
suffit de comparer ces nombres à ce qu'affiche le site.

| Réponse | Ce que ça veut dire |
| --- | --- |
| `non configuré` | `WORDPRESS_API_URL` absente de ce déploiement — l'ajouter puis **redéployer** |
| `joignable: false`, statut 401/403 | WordPress refuse la lecture anonyme : protection du site ou extension de sécurité |
| `joignable: false`, `fetch failed` | adresse erronée ou site éteint |
| `joignable: true` mais les nombres ne collent pas | la page servie est antérieure : recharger deux fois |

Deux causes ne se voient pas ici et sont à écarter côté WordPress : la fiche
restée **en brouillon** (la route ne rend que le contenu publié), et le webhook
non configuré (la modification apparaît alors en moins d'une minute, pas
instantanément).

### Le piège du déploiement antérieur

Les pages de contenu déclarent `export const revalidate = 60`. Ce n'est pas
redondant avec la période portée par la requête au CMS : une page construite
alors que `WORDPRESS_API_URL` n'était pas encore renseignée **ne comporte
aucune requête**, donc aucune période de revalidation. Elle reste alors figée
pour toujours, et brancher le CMS ensuite ne change rien tant qu'on n'a pas
redéployé — WordPress répond correctement, le site ignore simplement qu'il doit
se relire.

C'est visible dans la sortie de `npm run build` : sans la déclaration explicite
et sans CMS, la colonne *Revalidate* de `/` était vide.

### Ce qu'il faut surveiller côté référencement

L'extension pose déjà trois garde-fous, parce que le piège classique du
WordPress headless est le contenu dupliqué :

- `noindex, nofollow` sur toutes les pages WordPress ;
- un `robots.txt` qui interdit tout sur le domaine du back-office ;
- une redirection des visiteurs non connectés vers le vrai site.

Restent deux points **à faire à la main** :

- **Désactiver le sitemap de Yoast** ou de Rank Math si vous les installez. Il
  listerait des URL WordPress qui n'existent pas sur le site public. Le sitemap
  qui fait foi est `src/app/sitemap.ts`.
- **Reporter les redirections dans `next.config.mjs`.** Les extensions de
  redirection WordPress ne s'exécutent jamais : leur code ne tourne pas sur le
  domaine public.

## Couche de contenu

**Aucun texte visible n'est écrit dans les composants.** Tout ce qui est
rédactionnel vit dans `src/content/site.ts`, groupé par section : `hero`,
`vision`, `offersSection`, `offers`, `about`, `founder`, `press`,
`publications`, `manifesto`, `references`, `clients`, `testimonials`, `news`,
`posts`, `contact`, `footer`, `legal`.

C'est le point d'entrée d'un CMS : brancher une source externe se fait à cet
endroit, sans toucher aux composants. Chaque groupe correspond à ce que serait
un document ou une collection côté CMS.

## À compléter

Ces éléments sont des emplacements réservés dans la maquette d'origine et
attendent le contenu réel :

| Élément | Où |
| --- | --- |
| Visuel de fond du manifeste | déposer `public/brand/manifeste.jpg` (ou .png/.webp) — voir ci-dessous |
| Dates des articles de presse | `press` dans `src/content/site.ts` |
| URL LinkedIn (page entreprise et profil de Léa) | `site.linkedin` / `site.linkedinProfile` — tant qu'elles valent `#`, les boutons LinkedIn ne s'affichent pas |
| Titre de la tribune et nom du média | `publications` dans `src/content/site.ts` |
| Couverture du manifeste RIT | `manifesto.coverUrl`, ou l'image « Manifeste — couverture » dans WordPress — voir ci-dessous |
| PDF du manifeste RIT | `public/documents/manifeste-rit.pdf`, ou le fichier téléversé dans WordPress — voir ci-dessous |
| Envoi des courriels de contact | `BREVO_API_KEY` ou `RESEND_API_KEY`, plus `MAIL_EXPEDITEUR` — **indispensable avant la mise en ligne** |
| Destination des adresses e-mail collectées | variable `MANIFESTE_WEBHOOK_URL` — voir ci-dessous |
| Logos des médias (presse) | `public/brand/press/…` — voir ci-dessous |
| Contenu des pages légales | `src/app/mentions-legales`, `confidentialite`, `cookies` |
| Logos clients | déposer dans `public/brand/clients/` — voir ci-dessous |
| Témoignages | `testimonials` dans `src/content/site.ts` |
| Posts LinkedIn | `posts` dans `src/content/site.ts` — à brancher sur un widget ou l'API LinkedIn |
| Mentions légales, confidentialité, cookies | `legal` dans `src/content/site.ts` |
| Domaine de production | `metadataBase` dans `src/app/layout.tsx` (actuellement `kastell-conseil.fr`) |

Les sections « témoignages » et « LinkedIn » peuvent être masquées via
`showTestimonials` / `showNews` dans `src/content/site.ts`, comme les props
correspondantes de la maquette.

## Page Missions

`/missions` reprend la charte de l'accueil et expose les ancres attendues
(`#affaires-publiques`, `#representation`, `#communication`, `#transition`),
mais n'a **pas** été reproduite depuis un artboard : seule la maquette
« Accueil » a été fournie. Elle est à remplacer dès que le design
`Missions.dc.html` est disponible.
