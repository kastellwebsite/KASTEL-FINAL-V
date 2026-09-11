# Documents téléchargeables

Déposer ici le manifeste du Réseau Influence & Territoires, sous ce nom exact :

    manifeste-rit.pdf

Tant que le fichier est absent, le bouton « Télécharger le manifeste » **ne
s'affiche pas** : mieux vaut pas de bouton qu'un bouton qui tombe sur un 404.
Le reste de la bande (texte, objectifs, lien LinkedIn) reste inchangé.

Une fois WordPress branché, le document se téléverse depuis l'administration,
rubrique « À propos » → « Manifeste — document à télécharger ». Le fichier de
WordPress prend alors le pas sur celui du dépôt.

## Où partent les adresses e-mail

Le formulaire poste sur `/api/manifeste`, qui relaie l'adresse vers l'URL
configurée dans la variable d'environnement `MANIFESTE_WEBHOOK_URL` (Zapier,
Make, Brevo, n8n — n'importe quel service acceptant un POST JSON). Sans cette
variable, l'adresse est seulement écrite dans les journaux du serveur et le
document est tout de même servi : le formulaire ne bloque jamais un visiteur
parce qu'une intégration manque.
