# Spécification du correctif du récepteur Apps Script

**Statut :** spécification préparatoire, non déployée et non exécutée sur le projet Apps Script réel.  
**Périmètre :** réception des commandes et suivi des e-mails uniquement.  
**Hors périmètre :** tarifs, savePrices, administration des tarifs, classeur de production, déploiement.

## 1. Objectifs et invariants

1. Une transmission est identifiée par le triplet idCommande + typeEmail + idEnvoi.
2. Un idEnvoi ne peut jamais être associé à une autre commande ou à une autre opération.
3. La réservation du suivi précède toute écriture de commande dans Sheets.
4. Une répétition identique ne réécrit pas la commande et ne renvoie aucun e-mail.
5. Une commande déjà enregistrée ne peut pas être remplacée par un contenu différent par une simple répétition de transmission.
6. Une issue incertaine n'est jamais transformée automatiquement en nouvel envoi.
7. Les tarifs et leurs fonctions ne sont ni modifiés ni appelés par les tests.

## 2. Validation préalable dans doPost(e)

Avant toute écriture dans Sheets ou envoi :
- analyser le JSON et rejeter les charges utiles invalides ;
- valider le format et la longueur de idCommande ;
- valider idEnvoi avec la règle existante (8 à 100 caractères alphanumériques, tiret ou souligné) ;
- valider typeEmail avec une liste blanche explicite correspondant aux opérations réellement utilisées par le site ;
- vérifier la présence et le type des champs obligatoires ;
- valider la cohérence des montants et des lignes produits sans recalculer ni modifier les tarifs ;
- refuser les données incohérentes avant toute mutation.

La liste blanche de typeEmail doit être établie à partir des valeurs réellement envoyées par le site et du code Apps Script live. Ne pas inventer de nouvelles valeurs.

## 3. Réservation atomique

Créer une fonction dédiée, conceptuellement reserverSuiviTransmission_(data, empreinte).

Sous un unique LockService.getScriptLock() :
1. relire la propriété associée à idEnvoi ;
2. si elle existe, vérifier que commande, type d'opération et empreinte correspondent ;
3. si l'association diffère, répondre « conflit » sans écrire dans Sheets ;
4. relire l'index de l'opération idCommande + typeEmail ;
5. si cette opération possède déjà un autre idEnvoi, refuser la nouvelle transmission, sauf flux métier explicitement autorisé ;
6. sinon, enregistrer l'association et l'état initial reserve ;
7. libérer le verrou avant de poursuivre.

Les associations doivent être enregistrées dans les propriétés du script ou dans un registre persistant dédié, avec une clé d'index inverse permettant de détecter la réutilisation d'un identifiant. Le choix définitif doit tenir compte des limites de taille et de nombre des propriétés Apps Script.

**Attention à l'implémentation :** ne pas appeler sous ce verrou une fonction existante qui reprend elle-même le même verrou. Réunir les opérations de lecture/écriture des propriétés dans des fonctions internes sans verrou imbriqué, ou concevoir une seule section critique.

## 4. Empreinte et immutabilité de la commande

Construire une empreinte déterministe à partir des champs métier qui doivent rester immuables : identifiant de commande, client, produits, quantités, montants transmis, mode de livraison et données nécessaires au document de commande.

- Exclure les champs volatils : horodatages, état du suivi, identifiant de tentative et données techniques.
- Normaliser l'ordre des propriétés et les valeurs avant calcul.
- Ne jamais considérer un JSON brut dont l'ordre des clés varie comme une modification métier.
- Comparer l'empreinte au contenu déjà enregistré avant tout upsert.

Une opération métier distincte telle que la confirmation du prix final doit disposer de son propre type d'opération et de règles de validation explicites. Elle ne doit pas être autorisée comme effet secondaire d'une nouvelle transmission de commande.

## 5. Ordre de traitement après réservation

1. Vérifier l'existence d'une commande Sheets portant le même idCommande.
2. Si elle existe, comparer son empreinte métier avec celle de la demande.
3. Si le contenu diffère, bloquer et signaler un conflit ; ne pas écraser la ligne.
4. Si le contenu est identique, ne pas refaire l'upsert sans raison métier documentée.
5. Si la commande est nouvelle, l'enregistrer dans Sheets.
6. Marquer le suivi enregistre.
7. Exécuter les envois selon le flux existant, en enregistrant séparément les résultats entreprise et client.
8. Ne publier termine que lorsque les deux envois sont confirmés.

L'upsert existant conserve actuellement la date de réception initiale et le statut métier de la colonne 13. Ces comportements doivent être préservés.

## 6. Gestion des erreurs et reprises

États recommandés :
- reserve : identifiants réservés, traitement non encore confirmé ;
- enregistre : commande enregistrée dans Sheets ;
- en_cours : envoi d'e-mail en cours ;
- termine : entreprise et client confirmés envoyés ;
- echec : échec confirmé avant tout envoi ou échec certain ;
- indetermine : interruption ou résultat d'envoi impossible à établir ;
- conflit : identifiant ou contenu incompatible.

Règles :
- ne pas libérer automatiquement une réservation après une exception ;
- si une exception survient après le début possible d'un envoi, conserver indetermine ;
- ne pas renvoyer automatiquement un e-mail dont l'issue est indéterminée ;
- fournir une procédure de rapprochement opérateur : vérifier le suivi et les messages réellement envoyés avant toute reprise ;
- conserver les clés d'idempotence pendant une durée supérieure à la fenêtre de nouvelle tentative du site ; documenter toute purge et ne jamais purger un suivi encore indéterminé.

## 7. Réponses API attendues

Les réponses doivent être explicites et stables :
- succès complet : ok true, enregistree true, suivi terminé ;
- répétition identique déjà traitée : ok true, duplicate true, sans nouvel envoi ;
- conflit d'identifiant ou de contenu : ok false, code stable de conflit ;
- erreur de validation : ok false, code stable de validation ;
- résultat incertain : statut indetermine, consigne de vérification avant nouvelle tentative.

Le client ne doit vider le panier que sur confirmation serveur complète, conformément aux garde-fous déjà ajoutés au site.

## 8. Plan de tests isolés

Les tests doivent utiliser un projet Apps Script et un classeur dédiés, ou des doubles/mocks isolés. Aucun test ne doit appeler le projet de production, envoyer un vrai e-mail ou modifier les tarifs.

| Cas | Résultat attendu |
|---|---|
| Même demande répétée avec mêmes identifiants et même contenu | Doublon, aucun upsert ni e-mail supplémentaire |
| Même idEnvoi, autre commande | Conflit, aucune écriture |
| Même idEnvoi, autre type d'opération | Conflit, aucune écriture |
| Même commande/opération, nouvel idEnvoi | Refus sauf exception métier documentée |
| Même commande, contenu différent | Conflit, ligne Sheets inchangée |
| Deux requêtes concurrentes identiques | Une seule réservation et un seul traitement |
| Deux requêtes concurrentes incompatibles | Une seule acceptée, l'autre en conflit |
| Panne Sheets après réservation | Suivi conservé, aucune perte d'idempotence |
| Échec certain avant envoi | Échec traçable, reprise contrôlée |
| Résultat d'envoi ambigu | indetermine, aucun renvoi automatique |
| Entreprise envoyée, client en échec | États distincts, pas de faux succès global |
| Confirmation prix final autorisée | Flux séparé, validation métier spécifique |
| Lecture du statut après chaque état | Réponse cohérente avec le registre |

## 9. Points à confirmer dans le code Apps Script live avant un patch

Cette spécification ne constitue pas un patch prêt à déployer. Avant toute modification du récepteur réel, il faut vérifier dans sa version exacte :
- les valeurs de typeEmail émises par le site ;
- la structure et la limite des propriétés de suivi existantes ;
- les fonctions qui prennent déjà un ScriptLock ;
- le comportement réel de initialiserSuiviEmail_ et mettreAJourSuiviEmail_ ;
- le mécanisme de confirmation de prix final ;
- les possibilités de test du service d'e-mail sans envoi réel.

Aucun changement du projet Apps Script live, du classeur de production ou du déploiement n'est autorisé par cette spécification.
