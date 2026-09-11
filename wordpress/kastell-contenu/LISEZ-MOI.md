# Kastell — contenu du site

Extension WordPress qui fournit le contenu du site Next.js. **WordPress ne sert
aucune page** : il sert des données, que Next va chercher et rend en HTML
statique sur Vercel.

## Installation

1. Copier le dossier `kastell-contenu/` dans `wp-content/plugins/`.
2. L'activer dans *Extensions*.
3. Ouvrir **Contenu du site** et renseigner, dans le formulaire en bas de page :
   l'**adresse du site public** et le **secret partagé** — la valeur de
   `REVALIDATE_SECRET` côté Vercel, recopiée à l'identique.

   Rien à modifier dans les fichiers. Un hébergement qui préfère sortir le
   secret de la base de données peut toujours définir `KASTELL_SITE_URL` et
   `KASTELL_SECRET` dans `wp-config.php` : les constantes gardent la priorité et
   le formulaire se masque alors.

Aucune autre extension n'est nécessaire : ni ACF, ni WPGraphQL. Le modèle de
contenu, l'administration et la route REST sont fournis ici.

Vérification : `https://<votre-wordpress>/wp-json/kastell/v1/contenu` doit rendre
du JSON.

4. **Récupérer les textes du site** — ouvrir *Contenu du site*, cliquer sur
   **Récupérer les textes du site**. Les rubriques se remplissent avec ce que le
   site affiche déjà : il ne reste qu'à modifier, au lieu de tout saisir.

   L'opération ne remplit que les champs vides et n'ajoute des fiches que dans
   les listes vides. La relancer ne peut rien écraser — elle sert d'ailleurs à
   compléter après coup ce qui serait resté vide.

## Ce que voit l'éditrice

Un menu unique, **Contenu du site**, et rien d'autre. Les rubriques natives —
Articles, Pages, Commentaires, Tableau de bord — sont retirées **pour tout le
monde** : cette installation ne sert aucune page, elles n'y produisent rien de
visible, et les laisser revient à offrir d'écrire un article à côté
d'« Actualités LinkedIn » sans qu'il apparaisse jamais. Un administrateur garde
l'accès par l'URL directe (`wp-admin/edit.php`) si le besoin s'en présentait ;
« Outils » ne disparaît que pour les éditeurs.

La première page est une **vue d'ensemble** : une carte par rubrique, avec ce
qu'elle alimente sur le site et, pour les listes, le nombre d'éléments. Après
connexion, un compte Éditeur y arrive directement.

| Rubrique | Nature |
| --- | --- |
| Paramètres | fiche unique |
| Accueil | fiche unique |
| Offres : présentation | fiche unique |
| À propos | fiche unique |
| Pied de page | fiche unique |
| Offres | liste ordonnable |
| Chiffres clés | liste ordonnable |
| Références clients | liste ordonnable |
| Témoignages | liste ordonnable |
| Actualités | liste ordonnable |
| Retombées presse | liste ordonnable |
| Publications | liste ordonnable |

Les rubriques uniques mènent droit à leur formulaire : pas de liste à parcourir,
pas de bouton « ajouter » à côté duquel se tromper.

Les listes se réordonnent en **déplaçant les lignes** à la souris : le nouvel
ordre est enregistré aussitôt. Le champ « ordre » de WordPress suppose de
comprendre qu'un nombre plus petit remonte, et de renuméroter à la main dès
qu'on insère un élément ; déplacer la ligne dit la même chose sans rien à
comprendre.

Chaque écran porte un **rappel de ce qu'il alimente** sur le site, et le champ
titre porte le nom de ce qu'il contient vraiment : « Nom du client », « Titre de
l'article », « Date affichée » — jamais le « Saisir le titre » de WordPress, qui
ne dit rien de ce qu'on attend.

Les listes de texte — paragraphes d'une biographie, prestations d'une offre,
objectifs du manifeste — se saisissent **une ligne par élément**. WordPress n'a
pas de champ répétable sans extension payante, et une ligne par élément se
comprend sans explication.

## Comment c'est construit

```
kastell-contenu.php    amorçage, noindex, redirection du front
inc/schema.php         le modèle de contenu, déclaré une seule fois
inc/types.php          types de contenu et menu d'administration
inc/metaboxes.php      moteur de formulaire générique
inc/admin.php          ergonomie : vue d'ensemble, colonnes, tri, nettoyage
inc/import.php         récupération des textes du site
inc/rest.php           route d'agrégation /wp-json/kastell/v1/contenu
inc/revalidation.php   webhook vers le site à chaque publication
contenu-initial.json   les textes du dépôt, pour l'import
```

`contenu-initial.json` est **généré**, pas écrit à la main :
`outils/generer-contenu-initial.mjs` le produit depuis `src/content/site.ts`.
Le modifier directement se perdrait à la prochaine génération.

**Tout part de `inc/schema.php`.** L'administration, l'enregistrement et la
réponse REST en dérivent : ajouter un champ là-bas suffit à le voir apparaître
partout. Ne pas dupliquer la liste des champs ailleurs.

## Si un bouton attendu n'apparaît pas

La vue d'ensemble affiche en bas le **numéro de version** de l'extension. C'est
le premier point à vérifier : sans lui, rien ne distingue une fonction absente
d'une version pas encore téléversée.

Les boutons « Mettre le site à jour » et « Voir l'aperçu » sont **toujours
affichés**, désactivés quand `KASTELL_SITE_URL` ou `KASTELL_SECRET` manquent
dans `wp-config.php`, avec le texte exact à coller. Les masquer laisserait
chercher une fonction qui existe pourtant, sans jamais dire ce qui lui manque.

## Le menu ne se construit qu'à un seul endroit

`register_post_type` avec un `show_in_menu` désignant un parent fait ajouter par
WordPress **sa propre entrée** pour chaque type, avec ses propres intitulés. Le
menu se retrouvait alors en double, une fois avec les libellés de WordPress, une
fois avec ceux de `kastell_menu()`.

Les types sont donc déclarés `show_in_menu => false` : ils gardent leurs écrans
d'édition, mais n'apparaissent pas d'eux-mêmes. La liste est construite une
seule fois, dans `kastell_menu()`, dans l'ordre du site.

Pour la même raison la première entrée est déclarée explicitement. WordPress en
fabrique une d'office qui reprend le nom du menu ; la renommer après coup, par
son rang, revenait à écraser la première rubrique — c'est ainsi que
« Paramètres » avait disparu au profit de « Vue d'ensemble ».

## Choix à connaître avant de modifier

**Une seule route, pas cinq.** Le site fait un appel et reçoit les cinq
rubriques. Cinq points d'entrée séparés multiplieraient les allers-retours et
les modes de panne partielle.

**L'enveloppe est un contrat.** Les noms de champs rendus par `inc/rest.php`
sont ceux qu'attend `src/cms/content.ts` côté site. Renommer un champ ici sans
le renommer là-bas fait silencieusement retomber la valeur sur le contenu du
dépôt — pas d'erreur, juste l'ancien texte qui persiste.

**Lecture publique assumée.** La route ne demande pas d'authentification : elle
rend exactement ce qu'affiche le site. Rien de plus sensible que la page
d'accueil elle-même.

**Une actualité peut porter son visuel.** Le champ « Visuel du post » remplace
l'aplat gris de la carte. Sans image, la carte reste une carte : elle ne se
replie pas et garde sa hauteur.

**Un lien de publication peut rester sur le site.** Le champ « …ou vers une
section du site » l'emporte sur l'adresse extérieure saisie au-dessus : c'est un
choix explicite, là où le champ d'adresse peut n'avoir jamais été vidé. Le site
ouvre alors le lien dans le même onglet, avec une flèche vers le bas — ouvrir
une fenêtre pour descendre plus bas dans la page n'aurait aucun sens.

**Les listes de choix n'acceptent que leurs valeurs.** À l'enregistrement, une
valeur absente des options est remise à vide : une liste ne doit jamais servir
de champ libre par une requête forgée.

**Le secret ne se réaffiche jamais.** Le champ du formulaire reste vide et ne
remplace la valeur enregistrée que s'il est rempli. Le réafficher le mettrait
dans le HTML de la page à chaque visite sans rien apporter : personne n'a besoin
de le relire, seulement de le remplacer.

**Le formulaire est réservé aux administrateurs.** C'est un réglage
d'installation, pas du contenu. Un compte Éditeur voit l'état de la liaison mais
ne peut pas la modifier.

**L'aperçu passe par une redirection.** Le bouton « Voir l'aperçu du site »
pointe sur `admin-post.php`, qui ajoute le secret côté serveur avant de
rediriger. Écrire le lien complet dans la page mettrait le secret dans le HTML
de chaque écran d'administration.

**Le webhook est non bloquant.** Enregistrer un article n'attend pas la réponse
du site et n'échoue pas si celui-ci est indisponible. Contrepartie : quand il
échoue, personne ne le sait. C'est la raison d'être du bouton « Mettre le site à
jour », qui fait le même appel en attendant le résultat et rapporte l'erreur —
secret mal recopié, adresse erronée, site éteint. Sans webhook ni bouton, les
modifications apparaissent en moins d'une minute au lieu d'immédiatement.

**WordPress est tenu hors des moteurs** : `noindex` sur toutes les pages,
`robots.txt` fermé, redirection des visiteurs non connectés vers le site. C'est
le piège classique du headless — le back-office indexé qui fait concurrence au
site public.

Si vous installez Yoast ou Rank Math pour leurs champs SEO, **désactivez leur
sitemap** : il listerait des URL WordPress qui n'existent pas publiquement.

**L'import ne peut rien écraser.** Il ne remplit qu'un champ vide et n'alimente
qu'une liste vide. C'est ce qui permet de le proposer sans avertissement anxieux
et de le relancer pour compléter après coup.

**Les logos ont un repli par le nom.** Un client ajouté dans WordPress sans
logo ne fait pas disparaître le fichier déjà présent dans le dépôt : le site le
retrouve à partir du nom (« Ville de Rennes » → `brand/ville-de-rennes.svg`).
Sans ce repli, alimenter la liste côté CMS remplacerait la liste du dépôt en
entier, logos compris.
