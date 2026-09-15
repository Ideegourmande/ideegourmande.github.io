# Envoi automatique des commandes

1. Remplacer `Code.gs` dans Google Apps Script par celui-ci.
2. Enregistrer.
3. Déployer > Gérer les déploiements.
4. Modifier le déploiement existant et choisir une nouvelle version.
5. Conserver :
   - Exécuter en tant que : Moi
   - Qui a accès : Tout le monde
6. Conserver la même URL `/exec`.
7. Mettre à jour le dépôt GitHub avec les fichiers du site.
8. Tester une commande.

Le navigateur envoie maintenant le PDF dans le paramètre `payload` en
`application/x-www-form-urlencoded`. Apps Script lit ce paramètre, décode
le PDF, crée un Blob PDF et l'ajoute à GmailApp.sendEmail() comme pièce jointe.
