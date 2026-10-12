# Envoi automatique des commandes

## Déploiement du service e-mail

1. Dans le compte Google qui exécute le projet Apps Script, vérifier que
   `ideesgourmandesge@gmail.com` est configurée et vérifiée comme adresse
   d'expédition/alias Gmail. Apps Script ne peut utiliser cette adresse dans
   le champ `from` que si elle est autorisée comme alias du compte.
2. Dans Google Apps Script, remplacer le contenu de `Code.gs` par la version
   du dépôt GitHub et enregistrer.
3. Ouvrir **Déployer > Gérer les déploiements**.
4. Modifier le déploiement existant et choisir une nouvelle version.
5. Conserver :
   - **Exécuter en tant que :** Moi
   - **Qui a accès :** Tout le monde
6. Conserver la même URL `/exec`, utilisée dans `js/pdfcommande.js`.
7. Tester une commande et vérifier l'adresse d'expédition dans le message reçu.

Le dépôt GitHub ne déploie pas automatiquement le projet Google Apps Script.
Cette étape de déploiement est donc nécessaire pour que les modifications de
`Code.gs` soient actives. Le navigateur transmet le PDF dans le paramètre
`payload` en `application/x-www-form-urlencoded`; Apps Script décode le PDF
et l'ajoute en pièce jointe aux deux e-mails.
