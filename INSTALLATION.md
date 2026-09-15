# Activation de l’envoi automatique des commandes

Le site GitHub Pages ne peut pas envoyer directement un e-mail depuis votre compte Gmail. Cette solution utilise Google Apps Script, autorisé avec le compte **ideesgourmandesge@gmail.com**.

## 1. Créer le service

1. Connectez-vous à Google avec `ideesgourmandesge@gmail.com`.
2. Ouvrez Google Apps Script : https://script.google.com/
3. Créez un nouveau projet.
4. Copiez le contenu de `Code.gs` dans l’éditeur.
5. Enregistrez.

## 2. Déployer

1. Cliquez **Déployer → Nouveau déploiement**.
2. Type : **Application Web**.
3. Exécuter en tant que : **Moi**.
4. Accès : **Tout le monde**.
5. Déployez et autorisez l’accès à Gmail.
6. Copiez l’URL de l’application Web (elle finit généralement par `/exec`).

## 3. Relier le site

Dans `js/commande.js`, remplacez :

`COLLER_ICI_URL_GOOGLE_APPS_SCRIPT`

par l’URL `/exec` obtenue à l’étape précédente.

## Fonctionnement

Lors de la validation d’une commande :
- le PDF est généré et téléchargé comme auparavant ;
- l’adresse e-mail du bulletin est utilisée comme destinataire ;
- le message est envoyé automatiquement ;
- le PDF est joint ;
- l’envoi est effectué par le compte Google Apps Script connecté, qui doit être `ideesgourmandesge@gmail.com`.

Aucune fenêtre Gmail et aucun clic sur « Envoyer » ne sont nécessaires.
