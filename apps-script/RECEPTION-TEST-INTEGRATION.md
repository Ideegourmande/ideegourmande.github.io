# Intégration du récepteur Apps Script TEST

**Périmètre :** projet « Idée Gourmande — Réception TEST » uniquement.  
**Lecture seule côté production :** ne pas ouvrir, modifier ou redéployer le projet de réception de production.

## Fichiers préparés

- `Reception-TEST-Extensions.gs` : routes de prix, compteur isolé et e-mails de test.
- `js/commande.js` et `js/pdfcommande.js` : les URL de service seront toutes dirigées vers le récepteur TEST.

## 1. Ajouter le fichier d'extensions

Dans le projet Apps Script « Idée Gourmande — Réception TEST », créer un fichier script nommé `Reception-TEST-Extensions.gs` et y copier le contenu du fichier correspondant de ce dépôt.

Ne pas remplacer le `Code.gs` existant.

## 2. Ajouter le branchement dans doPost

Au tout début de la fonction `doPost(e)` existante, avant la lecture du payload de commande, ajouter :

```javascript
if (e && e.parameter && e.parameter.action === "sendEmail") {
  return testTraiterEnvoiEmail_(e);
}
```

Le reste de `doPost` (enregistrement de la commande dans les deux onglets TEST) doit rester inchangé.

## 3. Ajouter le branchement dans doGet

Au tout début de la fonction `doGet(e)` existante, après avoir accès à `e`, ajouter :

```javascript
const actionExtensionTEST = testTraiterGet_(e);
if (actionExtensionTEST) return actionExtensionTEST;
```

Conserver ensuite le traitement actuel de `action=status`, qui confirme l'enregistrement Sheets.

## 4. Configurer la boîte de réception de test

Dans **Paramètres du projet > Propriétés du script**, ajouter :

- Nom : `TEST_EMAIL_DESTINATION`
- Valeur : une adresse e-mail de test que tu contrôles.

Les deux messages de simulation (copie entreprise et simulation client) seront envoyés uniquement à cette adresse. Le code ne transmet jamais le PDF à l'adresse réelle du client.

Les prix utilisent les valeurs actuelles du site comme valeurs de secours (35, 25, 9, 4 et 8 CHF). Pour personnaliser les prix TEST, ajouter une propriété `TEST_PRIX_PRODUITS` contenant un objet JSON avec les cinq références et leurs montants numériques.

## 5. Vérifications avant tout déploiement

- Vérifier que `CONFIG.SPREADSHEET_ID` reste l'ID du classeur TEST.
- Vérifier que `FEUILLE_COMMANDES` et `FEUILLE_DETAILS` pointent sur les onglets TEST.
- Vérifier les trois routes GET : `getPrices`, `nextOrderNumber`, `status`, plus `mailStatus`.
- Vérifier le POST de commande et le POST `action=sendEmail`.
- Vérifier que `TEST_EMAIL_DESTINATION` est définie et que les e-mails sont routés vers cette seule adresse.
- Ne pas exécuter de commande de test tant que l'intégration et le déploiement TEST ne sont pas explicitement validés.

**Aucun déploiement Apps Script n'est effectué par ce guide.**
