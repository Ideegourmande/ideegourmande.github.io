# Dossier d'implémentation et de recette du récepteur

**Branche :** `audit-centralisation-commandes-2026-11-23`  
**État :** préparation uniquement ; aucun code Apps Script live modifié, aucun déploiement.  
**Référence :** `ReceptionAPI.gs` transmis par l'utilisateur, confirmé inchangé au 23.11.2026.  
**Attention :** le dépôt ne contient pas ce fichier sous ce nom. La copie `apps-script/Code.gs` est historique et ne doit pas être utilisée comme substitut.

## 1. Décision d'implémentation

Le correctif doit être intégré dans le récepteur existant par modification ciblée, et non par remplacement complet du projet. Les routes `savePrices`, `getPrices`, `nextOrderNumber`, `status`, les fonctions d'administration et les fonctions de tarifs restent hors périmètre.

L'opération `confirmation-prix` reste un flux métier distinct. Ses règles actuelles de validation et d'envoi doivent être reprises explicitement dans les tests de non-régression.

## 2. Ordre d'intégration à respecter

### Étape A — validations sans effet de bord

Dans `doPost(e)`, parser la requête et vérifier avant toute écriture :
- action autorisée et structure JSON ;
- présence et format de `idCommande` et `idEnvoi` ;
- `typeEmail` appartenant aux valeurs réellement émises par la version du site et autorisées par le métier ;
- champs client, produits, quantités, montants, livraison et document nécessaires à l'opération demandée ;
- cohérence entre le type d'opération et les champs fournis.

Aucune fonction de tarif ne doit être appelée, aucun montant ne doit être recalculé, corrigé ou remplacé dans le cadre de ce correctif.

### Étape B — réservation idempotente unique

Créer un helper interne sans verrou, appelé depuis une seule section critique. Sous un unique `LockService.getScriptLock()` :
1. charger l'association enregistrée pour `idEnvoi` ;
2. si elle existe, comparer `idCommande`, `typeEmail` et l'empreinte métier ;
3. si une valeur diffère, retourner un conflit sans mutation ;
4. charger l'index inverse `idCommande + typeEmail` ;
5. refuser un second `idEnvoi` pour la même opération, sauf règle métier expressément prévue et testée ;
6. enregistrer l'association et l'état initial de réservation ;
7. libérer le verrou.

Ne pas appeler depuis cette section les helpers historiques qui acquièrent eux-mêmes le même ScriptLock. Les helpers bas niveau de lecture/écriture des propriétés doivent être sans verrou.

### Étape C — contrôle de la commande Sheets

Après réservation :
- rechercher la ligne par `idCommande` ;
- si absente, effectuer l'insertion ;
- si présente, calculer l'empreinte métier des données enregistrées ;
- si identique, traiter comme répétition sans réécriture ;
- si différente, arrêter en conflit et préserver la ligne existante.

Préserver la date de réception initiale et le statut de traitement existant. Une mise à jour métier autorisée doit avoir une route et une validation propres ; elle ne doit pas être confondue avec une nouvelle transmission.

### Étape D — envois et état final

Conserver les statuts séparés de l'entreprise et du client. Ne marquer le traitement global comme terminé que si les deux résultats sont confirmés. En cas d'interruption après le début possible d'un envoi, conserver un état indéterminé et interdire la relance automatique. Le rapprochement humain doit vérifier les messages réellement envoyés avant toute reprise.

## 3. Compatibilité avec les suivis existants

Avant migration, inventorier le format réel des propriétés déjà utilisées par le récepteur. Le nouveau mécanisme doit reconnaître les anciens suivis existants et ne jamais les interpréter comme une autorisation de renvoi.

Ne pas purger une clé d'idempotence en état `en_cours` ou `indetermine`. Une limite fixe de nombre de suivis ne doit pas entraîner la suppression silencieuse des clés qui protègent encore une commande contre un nouvel envoi. Toute rétention doit être définie et testée avant activation.

## 4. Matrice de recette isolée

| ID | Scénario | Vérification attendue |
|---|---|---|
| R01 | Première transmission valide | Une réservation, une ligne Sheets, un envoi par destinataire |
| R02 | Rejeu strictement identique | Réponse doublon ; aucun nouvel upsert ni e-mail |
| R03 | Même idEnvoi, autre idCommande | Conflit ; aucune écriture |
| R04 | Même idEnvoi, autre typeEmail | Conflit ; aucune écriture |
| R05 | Même idCommande/typeEmail, nouvel idEnvoi | Refus selon règle d'idempotence ; aucun renvoi |
| R06 | Même idCommande, panier ou coordonnées modifiés | Conflit ; ligne d'origine intacte |
| R07 | Deux requêtes identiques simultanées | Une seule réservation gagnante et un seul traitement |
| R08 | Deux requêtes incompatibles simultanées | Une seule acceptée ; l'autre en conflit |
| R09 | Erreur Sheets après réservation | Réservation conservée ; reprise contrôlée sans double envoi |
| R10 | Échec certain avant le premier e-mail | Échec explicite ; reprise uniquement selon règle contrôlée |
| R11 | E-mail entreprise envoyé, client en échec | Statuts distincts ; jamais de succès global |
| R12 | Interruption pendant l'envoi | État indéterminé ; aucune relance automatique |
| R13 | Confirmation du prix final | Opération distincte fonctionnelle ; aucune modification des tarifs de référence |
| R14 | Suivi ancien déjà présent | Compatibilité ; aucun renvoi dû à une migration |
| R15 | Dépassement de la rétention | Aucune clé active/indéterminée supprimée |
| R16 | Actions tarifs et lecture publique | Comportement inchangé ; aucun test n'écrit de tarif |

## 5. Conditions de test et critères d'arrêt

La recette doit se dérouler dans un projet Apps Script de test et un classeur séparé, avec service d'e-mail neutralisé ou remplacé par un faux contrôlable. Utiliser uniquement des identifiants et données fictifs.

Arrêter immédiatement si :
- l'ID du classeur correspond à la production ;
- un service d'e-mail réel peut être déclenché ;
- une fonction de test réécrit les tarifs ;
- une route de production ou un déploiement est appelé ;
- l'empreinte calculée ne distingue pas les champs métier immuables des champs techniques.

Aucun essai ne doit appeler `testerAcceptationAPI_Tarifs()`, qui resauvegarde les prix.

## 6. Critères de sortie avant mise en service

- revue du diff ciblé du récepteur ;
- tests R01 à R16 réussis dans l'environnement isolé ;
- preuve que les fonctions de tarifs sont inchangées ;
- tests du parcours public PC et Safari iOS ;
- vérification de la lecture de statut par le site ;
- procédure documentée de rapprochement des états indéterminés ;
- validation explicite de l'utilisateur avant toute action sur le projet live ou déploiement.

## 7. Limite d'accès et traçabilité

La confirmation que le fichier transmis est inchangé permet de le considérer comme référence fonctionnelle. Elle ne fournit pas une session d'accès au projet Apps Script. Les opérations effectuées dans ce dépôt ne modifient que la branche GitHub de travail. Aucun changement du classeur réel, des tarifs, des e-mails ou du déploiement n'a été effectué.
