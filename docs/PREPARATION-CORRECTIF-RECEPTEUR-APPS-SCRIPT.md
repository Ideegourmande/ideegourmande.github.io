# Préparation du correctif du récepteur Apps Script

**Statut : proposition technique non déployable — aucune modification du projet Apps Script live.**

Ce document s'appuie sur le code réel transmis le 23.11.2026 : le doPost(e) du récepteur, enregistrerCommandeDansGoogleSheets_(data) et le doGet (mailStatus, nextOrderNumber, status).

Le dépôt contient aussi une ancienne copie de apps-script/Code.gs. Elle n'est pas une preuve du code actuellement déployé et ne doit pas servir à remplacer le projet live.

## 1. Problème confirmé dans le flux actuel

Le récepteur écrit/upsert la commande dans Google Sheets avant :
- la validation complète de idEnvoi ;
- la validation du PDF et des données nécessaires aux e-mails ;
- la réservation/détection du doublon dans le suivi e-mail.

Conséquence : une commande peut être présente dans Sheets alors que la suite échoue et qu'aucun e-mail, ou un seul e-mail, n'est confirmé. Le navigateur doit donc continuer à conserver le panier et interdire une retransmission aveugle.

## 2. Ordre cible du traitement des commandes

Ne pas modifier le bloc savePrices, son token, ni les fonctions de lecture/écriture des tarifs.

Pour une action de commande, le futur doPost doit suivre ces phases :

1. **Parser sans effet de bord**
   - accepter les formes JSON/form-urlencoded déjà prises en charge ;
   - rejeter les corps absents, mal formés ou de type inattendu ;
   - ne jamais interpréter une erreur de parsing comme une commande vide.

2. **Valider entièrement l'enveloppe**
   - idCommande obligatoire et au format attendu IG-... ;
   - numeroCommande non vide ;
   - idEnvoi obligatoire, longueur 8–100, regex [A-Za-z0-9_-] ;
   - typeEmail autorisé explicitement (ne pas accepter une valeur arbitraire) ;
   - client, e-mail client, produits et montants conformes aux règles métier ;
   - PDF base64 présent, décodable et de taille maximale définie ;
   - vérifier les bornes de taille avant toute écriture Sheets.

3. **Réserver l'événement d'envoi de manière atomique**
   - sous ScriptLock, vérifier une clé durable d'idempotence ;
   - une réservation existante en cours/terminée ne doit jamais déclencher un second envoi ;
   - enregistrer l'association entre idCommande, typeEmail et idEnvoi afin qu'un nouvel idEnvoi ne contourne pas le doublon ;
   - libérer le verrou immédiatement après la réservation : ne pas le garder pendant les appels Sheets ou l'envoi Gmail ;
   - les collisions/conflits d'identifiants doivent produire un statut explicite, pas une nouvelle commande.

4. **Écrire/upsert la commande dans Sheets**
   - garder enregistrerCommandeDansGoogleSheets_(data) comme point d'écriture central et son verrou ;
   - conserver l'ID commande comme clé d'upsert ;
   - ne jamais créer une seconde ligne pour le même idCommande ;
   - ne pas modifier le statut de production existant lors d'une simple retransmission ;
   - si l'écriture échoue, enregistrer un état d'échec récupérable et ne pas envoyer d'e-mail.

5. **Envoyer et suivre les e-mails**
   - envoyer l'e-mail entreprise puis le client, comme actuellement ;
   - mettre à jour le suivi après chaque étape ;
   - états distincts : en_cours, termine, echec, indetermine ;
   - ne jamais convertir une erreur ou un timeout en succès ;
   - si l'entreprise a reçu son e-mail mais que le client échoue, conserver ce résultat partiel et ne pas renvoyer automatiquement l'e-mail entreprise lors d'une reprise.

6. **Réponse au navigateur**
   - ok:true seulement si les confirmations attendues sont réellement acquises ;
   - exposer séparément l'état Sheets et les deux états e-mail ;
   - un statut inconnu/en cours/partiel doit demander une vérification manuelle, sans encourager un nouvel envoi.

## 3. Idempotence : règle essentielle

Trois identifiants ont des rôles distincts :
- idCommande : identité métier de la commande et clé d'upsert Sheets ;
- numeroCommande : numéro lisible attribué une seule fois ;
- idEnvoi : identité technique d'un événement d'e-mail.

Le seul contrôle de idEnvoi ne suffit pas : un client modifié ou un nouveau code navigateur pourrait présenter le même idCommande avec un nouvel idEnvoi. Le récepteur doit donc maintenir une association durable par couple idCommande + typeEmail et refuser tout second événement incompatible.

Les suivis ne doivent pas être supprimés silencieusement au point de permettre qu'un ancien événement soit envoyé une seconde fois. Prévoir une rétention durable adaptée ou une archive d'idempotence séparée ; la suppression des détails de suivi ne doit pas supprimer la preuve du traitement.

## 4. Stock et réconciliation

- Le site public ne déduit jamais le stock.
- La commande Sheets centrale reste la source opérationnelle.
- Ce correctif ne doit pas inventer une nouvelle déduction de stock dans le récepteur.
- Toute reprise depuis un secours doit rapprocher les commandes par idCommande, détecter les doublons, puis recalculer/contrôler le stock selon le processus central existant.
- Ne pas fusionner automatiquement deux commandes qui ont des IDs différents, même si le client et le panier se ressemblent.

## 5. Tests requis avant toute mise en service

Utiliser un projet Apps Script de test et un classeur de test dédiés, avec une adresse e-mail de test contrôlée. Aucun test avec les vrais clients.

Cas minimum :
1. JSON valide et commande nouvelle ;
2. même idCommande retransmis avec même idEnvoi ;
3. même idCommande mais nouvel idEnvoi ;
4. même idCommande avec typeEmail différent et autorisé ;
5. idEnvoi absent/invalide ;
6. PDF absent, malformé ou trop volumineux ;
7. erreur Sheets avant envoi ;
8. échec e-mail entreprise ;
9. e-mail entreprise envoyé puis e-mail client échoué ;
10. timeout après remise au service e-mail ;
11. deux requêtes concurrentes ;
12. reprise d'une commande en état indéterminé ;
13. vérification qu'aucune double ligne ni double déduction stock n'apparaît ;
14. contrôle que le bloc tarifs et les tarifs restent inchangés.

## 6. Conditions avant d'écrire le patch exécutable

Le patch ne doit être écrit contre le code live qu'après comparaison du contenu actuel du projet Apps Script avec la copie transmise. Il faut notamment vérifier les implémentations live de :
- initialiserSuiviEmail_ ;
- mettreAJourSuiviEmail_ ;
- enregistrerCommandeDansGoogleSheets_ ;
- les constantes de suivi et règles de rétention ;
- la fonction exacte qui envoie les deux e-mails.

**Aucune fonction ci-dessus n'est modifiée ici. Aucun déploiement, aucune écriture dans le classeur réel, aucun e-mail réel.**
