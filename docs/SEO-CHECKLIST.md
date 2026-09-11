# Checklist SEO — ce qui reste à faire hors du code

Le site est prêt. Ce qui suit ne peut pas être fait depuis le dépôt : ce sont
des comptes à créer, des domaines à configurer et des informations que seul le
cabinet détient.

Rangé du plus urgent au moins urgent.

---

## 1. Avant la mise en ligne — bloquant

### Domaines

Le site déclare `https://www.kastell-conseils.fr` comme adresse unique. Trois
autres formes existent et doivent toutes y mener, sans quoi Google verra
plusieurs sites jumeaux et partagera l'autorité entre eux.

- [ ] `kastell-conseils.fr` → 301 vers `www.kastell-conseils.fr`
- [ ] `kastell-conseil.fr` (singulier) → 301 vers `www.kastell-conseils.fr`
- [ ] `www.kastell-conseil.fr` → 301 vers `www.kastell-conseils.fr`

À faire dans **Vercel → projet → Settings → Domains**, en ajoutant chaque
domaine et en le marquant *Redirect to* le domaine principal. Vercel le fait à
l'entrée du réseau, ce qui est plus rapide qu'une redirection applicative. Le
middleware du site assure le même rôle en second rideau.

### Variables d'environnement Vercel

- [ ] `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` — jeton Search Console
- [ ] `NEXT_PUBLIC_BING_SITE_VERIFICATION` — jeton Bing Webmaster

Sans jeton, aucune balise n'est produite — c'est voulu : une balise portant un
jeton vide vaut une vérification ratée.

### WordPress

- [ ] Installer l'extension **1.10.0**. Elle expose la date de dernière
      modification, que le plan du site annonce aux moteurs. Sans elle, le plan
      annonce la date de construction.

---

## 2. La semaine de la mise en ligne

### Google Search Console — `search.google.com/search-console`

- [ ] Ajouter la propriété `https://www.kastell-conseils.fr` (type *Préfixe
      d'URL*)
- [ ] Vérifier par la balise HTML → coller le jeton dans la variable
      d'environnement ci-dessus, redéployer, puis valider
- [ ] Soumettre le plan du site : `https://www.kastell-conseils.fr/sitemap.xml`
- [ ] Demander l'indexation de l'accueil et de `/lobbying-territorial`
- [ ] **Vérifier qu'aucune adresse en `.vercel.app` n'est indexée.** Rechercher
      `site:kastell-conseil-website.vercel.app` dans Google. Le site s'en
      protège par quatre verrous, mais une adresse indexée avant cette mise à
      jour doit être retirée à la main, via l'outil *Suppressions*.

### Bing Webmaster Tools — `bing.com/webmasters`

- [ ] Ajouter le site, vérifier par balise, soumettre le plan du site

Bing compte double : c'est lui qui alimente les résultats de ChatGPT.

### Google Business Profile — `business.google.com`

C'est le levier le plus fort du référencement local, et il est entièrement hors
du site.

- [ ] Créer la fiche à l'adresse de **Lamballe-Armor** — la seule où le cabinet
      est implanté
- [ ] Catégorie principale suggérée : *Cabinet de conseil* ou *Service de
      conseil aux entreprises*
- [ ] Reprendre le NAP **à l'identique** (voir `SEO-CONTENT.md`, § 4)
- [ ] Zone desservie : Bretagne, Ille-et-Vilaine, Côtes-d'Armor — c'est ce champ
      qui permet d'apparaître sur « cabinet de conseil Rennes » sans y déclarer
      d'adresse
- [ ] Horaires : lundi-vendredi, 9 h - 18 h
- [ ] Site web : `https://www.kastell-conseils.fr`

> **Ne pas créer de fiche à Rennes.** Le cabinet n'y est pas implanté. Une
> adresse non réelle fait rejeter la fiche et expose à une pénalité. La zone
> desservie est la bonne manière d'y être visible, et elle est déjà déclarée
> dans les données structurées du site.

---

## 3. Le mois suivant

### Cohérence du NAP sur les annuaires

Le même bloc, à la virgule près, partout. Une divergence — une abréviation, un
code postal oublié — et l'algorithme local tient l'établissement pour incertain.

- [ ] LinkedIn, page entreprise : adresse, site, description reprenant la
      phrase d'entité
- [ ] Pappers / Societe.com : vérifier que les données publiques sont à jour
- [ ] CCI des Côtes-d'Armor — annuaire des entreprises
- [ ] Annuaires professionnels bretons (Bretagne Développement Innovation,
      clubs d'entreprises du pays de Lamballe)
- [ ] Répertoire HATVP : vérifier que l'adresse du site y figure

### Liens entrants

Les plus crédibles pour ce métier viennent de la presse et des institutions,
pas des annuaires.

- [ ] Demander aux médias qui ont couvert le cabinet (Ouest-France, Bretagne
      Économique, Femmes de Bretagne) que leur article contienne un lien vers
      le site — beaucoup citent le nom sans lier
- [ ] Réseau Influence & Territoires : lien réciproque entre le site du réseau
      et la page manifeste
- [ ] Clients dont les logos figurent en références : demander la réciproque
      quand c'est possible

---

## 4. Contenus à décider

Détaillés dans `SEO-CONTENT.md`. Rien n'est publié tant que Léa n'a pas tranché.

- [ ] **Relire la page `/lobbying-territorial`.** Tout son texte est tiré de ce
      que le site dit déjà, reformulé. Elle parle au nom du cabinet.
- [ ] Pages locales Bretagne / Rennes / Lamballe : décider lesquelles ont assez
      de matière pour exister. Trois pages qui répéteraient le même
      argumentaire seraient sanctionnées par Google.
- [ ] **Rennes** : le cabinet y tient-il des rendez-vous, y a-t-il une
      domiciliation ? La réponse change ce que la page peut affirmer.
- [ ] Description de l'accueil : la formulation actuelle ne contient aucun mot
      local. Une variante avec l'ancrage est proposée dans `SEO-CONTENT.md`.
- [ ] Téléphone : le numéro publié est un mobile. Le retirer du site est
      possible d'un seul geste.

---

## 5. Mesures relevées avant livraison

Sur le site construit, servi en local. Lighthouse, profil mobile, médiane de
trois passages.

| | |
|---|---|
| SEO | **100** |
| Accessibilité | **100** |
| Bonnes pratiques | **96** |
| Performance | **94** (passages : 92, 94, 94) |
| Décalage cumulé (CLS) | **0** |

Autres contrôles :

- 114 combinaisons de page et de largeur, de 320 à 1920 px : **aucune violation
  d'accessibilité, aucun débordement horizontal**
- JSON-LD analysable sur toutes les pages qui en portent
- `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, image de partage :
  tous accessibles et du bon type
- Preview vérifiée avec `VERCEL_ENV=preview` : `robots.txt` refuse tout, la
  balise porte `noindex`, le plan du site est vide, `llms.txt` répond 404

### Deux points à connaître

**La performance mesurée ici n'est pas celle de la production.** Un serveur
local n'a ni CDN, ni compression Brotli à l'entrée. Sur trois séries de
passages, les scores allaient de 85 à 94 selon la charge de la machine — la
médiane de 94 est la valeur défendable, mais **la mesure de référence est à
refaire sur le site déployé**, une fois le domaine branché.

**Les 96 en bonnes pratiques viennent d'un avertissement qui n'en est pas un.**
Lighthouse signale une image au mauvais rapport de forme : c'est le logo caché
de l'en-tête. Les deux logos — le symbole et le mot-symbole — se croisent en
fondu au défilement et partagent la même boîte ; celui qui est invisible est
donc mesuré avec les dimensions de l'autre. Aucun visiteur ne voit de
déformation, vérifié en relevant les dimensions rendues au repos. Corriger
l'avertissement demanderait de défaire l'animation de l'en-tête, pour rien.
