# Revue technique de la copie Apps Script présente dans le dépôt

**Date de revue :** 23 novembre 2026  
**Fichier examiné :** apps-script/Code.gs sur la branche de travail  
**Avertissement :** cette copie du dépôt est ancienne et n'est pas une preuve du code actuellement déployé dans « Envois commandes Idee Gourmande ». Les constats ci-dessous ne doivent donc pas être présentés comme une vérification du serveur live.

## Constats vérifiables dans cette copie

### 1. Le suivi est initialisé après l'écriture Sheets

Dans la version du récepteur décrite par les éléments fournis précédemment, l'upsert Sheets est appelé avant l'initialisation du suivi. Cela laisse une fenêtre où une requête répétée peut réécrire la commande avant que le doublon de suivi soit détecté.

**Correction à porter dans la version live après vérification :** valider et réserver l'association d'idempotence avant toute mutation Sheets.

### 2. L'initialisation du suivi ne réserve que l'identifiant reçu

Dans cette copie, initialiserSuiviEmail_ utilise la propriété PREFIXE_SUIVI_EMAIL + id. Le contenu stocké inclut orderId, mais la recherche de doublon ne compare pas explicitement orderId ni typeEmail avant de retourner duplicate.

**Risque :** si un id de suivi est réutilisé avec une autre commande ou une autre opération, le serveur répond doublon sans vérifier l'association métier.

**Correction :** vérifier sous verrou l'association idEnvoi -> idCommande + typeEmail + empreinte métier et refuser les collisions.

### 3. La purge automatique peut supprimer des clés d'idempotence

Cette copie définit MAX_SUIVIS_EMAIL à 200 et supprime les suivis les plus anciens dès que la limite est dépassée.

**Risque :** une ancienne clé d'idempotence peut disparaître alors que le client ou un opérateur tente encore une reprise. La même requête peut alors être considérée comme nouvelle et provoquer une nouvelle écriture ou un nouvel envoi.

**Correction :** ne pas purger les suivis en cours ou indéterminés ; choisir une rétention supérieure à la fenêtre de reprise ; conserver un registre compact durable des identifiants déjà consommés. Toute stratégie de purge doit être testée et documentée.

### 4. typeEmail n'est pas validé par liste blanche dans cette copie

La copie applique une valeur par défaut si typeEmail est absent, puis distingue essentiellement confirmation-prix et nouvelle commande dans la génération du message.

**Risque :** une valeur arbitraire peut être traitée comme une nouvelle commande.

**Correction :** valider typeEmail avant mutation à partir des valeurs effectivement émises par le site et des opérations autorisées par le métier. La liste doit être confirmée sur le récepteur live.

### 5. Validation du contenu trop tardive

Dans cette copie, l'adresse client, le PDF et plusieurs éléments métier sont validés après l'initialisation du suivi. Dans la version décrite dans les éléments transmis, l'écriture Sheets intervient même avant ces contrôles.

**Risque :** un suivi ou une ligne de commande peut être créé pour une requête qui ne pourra pas aboutir.

**Correction :** faire les validations structurelles et métier non mutantes avant réservation, puis réserver, puis écrire Sheets, puis envoyer.

### 6. Confirmation de prix : opération métier à préserver

La copie distingue confirmation-prix et nouvelle commande pour le calcul et le contenu des e-mails. Cette opération ne doit pas être supprimée ni assimilée à un doublon de nouvelle commande.

**Correction :** la traiter comme un type d'opération distinct, avec validation explicite des champs de prix final, de l'état métier de la commande et de son propre identifiant de transmission. Aucun tarif de référence ne doit être modifié par le correctif.

## Architecture cible proposée

1. Parser et valider la requête sans effet de bord.
2. Vérifier typeEmail via une liste blanche confirmée.
3. Construire une empreinte métier canonique (clés triées, champs volatils exclus).
4. Sous un seul verrou, réserver idEnvoi et son association à idCommande + typeEmail ; vérifier les collisions et l'opération déjà réservée.
5. Relâcher le verrou.
6. Lire la commande existante ; refuser une mutation incompatible. Une commande identique déjà enregistrée ne doit pas être réécrite sans raison.
7. Enregistrer la nouvelle commande dans Sheets.
8. Effectuer les envois avec états séparés entreprise/client.
9. Marquer terminé uniquement après confirmation des deux envois.
10. En cas d'incertitude, préserver le suivi et empêcher tout renvoi automatique ; exiger un rapprochement opérateur.

Ne pas imbriquer des fonctions qui acquièrent toutes le même ScriptLock : Apps Script ne doit pas être supposé réentrant. Prévoir des helpers internes sans verrou ou une seule section critique.

## Tests requis avant toute mise en service

- collision idEnvoi entre deux commandes ;
- collision idEnvoi entre deux types d'opération ;
- même commande/opération avec un nouvel idEnvoi ;
- contenu différent pour une commande existante ;
- requêtes concurrentes identiques et incompatibles ;
- panne Sheets après réservation ;
- échec avant envoi ;
- envoi entreprise réussi et client en échec ;
- résultat d'envoi indéterminé ;
- rétention et purge des clés ;
- flux confirmation-prix ;
- vérification que les fonctions et valeurs de tarifs sont inchangées.

## Limites et prochaine condition

Cette revue identifie des risques dans la copie disponible et dans les extraits précédemment transmis. Elle ne prouve pas que la version live a exactement ces défauts. Avant d'écrire un remplacement de ReceptionAPI.gs, il faut disposer du contenu exact du récepteur déployé, ou d'un export récent de ce même projet. Il n'est pas nécessaire de renvoyer les documents déjà transmis ; il faut uniquement distinguer leur date/version de la version actuellement déployée.

Aucune modification du projet Apps Script live, du classeur réel, des tarifs, ni aucun envoi d'e-mail n'a été effectué.
