# Cartographie du stock existant — préparation de la centralisation

Analyse des fichiers actuels `js/database.js` (3.3.4) et `js/stock.js` (2.6.0) sur la branche de travail.

## Structure métier actuellement utilisée dans le navigateur

La base locale `ideeGourmandeDB` contient :
- `commandes`
- `articles` (stock courant)
- `piecesEmballees`
- `emplacements`
- `mouvements`
- `achats`
- `sessions`
- `archives`
- `clients`
- `statistiques` et `parametres`

Le stock article utilise notamment `id`, `nom`, `categorie`, `unite`, `stock`, `minimum`, `emplacement`. Les pièces emballées sont distinctes et utilisent `id`, `produit`, `numero`, `poids`, `dateAjout`.

## Règles de calcul à préserver

Le code actuel ne déduit pas toujours la quantité commandée directement :
- références `viande-sechee` et `lard-sec` : quantité consommée = `poidsReel` ; si le poids réel manque, la ligne est mise en attente ;
- référence `saumon-fume` : quantité consommée = `poids` ;
- foie gras : quantité × 200 ;
- magret : quantité ;
- autres articles : quantité.

La résolution de l'article stock passe par des correspondances référence/recette puis par le nom normalisé. Les recettes particulières (foie gras, magret, saumon) ont des correspondances spécifiques à préserver.

Lors d'une commande, le moteur actuel :
1. prévalide toutes les lignes et vérifie que les articles existent ;
2. calcule consommation et manque ;
3. ramène le stock à zéro au maximum (pas de stock négatif) ;
4. crée un mouvement « Commande client » pour la quantité réellement consommée ;
5. crée ou complète un achat automatique pour le manque ;
6. marque chaque index de ligne dans `stockLignesTraitees` pour éviter une double déduction.

Les achats automatiques utilisent les champs `id`, `numero`, `date`, `fournisseur`, `articles`, `total`, `statut`, `dateReception`, `automatique`, `origine`.

## Écart critique avec la règle validée

Dans la version actuelle du navigateur, `ajouterCommande()` appelle immédiatement `traiterStockCommande()`. De plus, `finaliserPoidsReelCommande()` appelle aussi le traitement du stock. Enfin, `retraiterAnciennesCommandesEnErreur()` relance les commandes en erreur au chargement.

Ces trois chemins doivent être neutralisés dans le parcours centralisé avant que la centralisation soit mise en service. Sinon une commande entrante ou un ancien état local pourrait déduire le stock trop tôt.

## Règle cible validée

La déduction centrale doit se produire uniquement lors du passage du statut à **En préparation**.

Exigences de sécurité :
- les commandes entrantes restent sans effet sur le stock ;
- un passage répété à « En préparation » ne déduit jamais deux fois ;
- une commande annulée/refusée avant « En préparation » ne déduit rien ;
- la prévalidation de toutes les lignes précède toute écriture ;
- les poids réels requis doivent être confirmés avant de traiter les lignes concernées ;
- stock, mouvement, achat automatique éventuel et indicateur de traitement doivent être enregistrés sous verrou Apps Script ;
- une erreur doit empêcher un statut « En préparation » présenté comme réussi ;
- l'archive et la suppression doivent être des opérations centrales cohérentes avec les lignes de détails et données techniques.

## Plan de migration sans perte

1. Conserver l'onglet historique `Commandes` tel quel.
2. Créer les onglets secondaires sans écraser aucune ligne existante.
3. Construire et valider l'extraction des articles à partir de `Produits (JSON)` pour une commande réelle et une commande avec poids réel.
4. Copier les données dans le nouveau modèle uniquement après comparaison des totaux et du nombre de lignes.
5. Faire un test de commande fictive et vérifier qu'aucun stock ne change à la réception.
6. Tester le passage à « En préparation » une seule fois, puis répéter l'action pour confirmer l'idempotence.
7. Tester annulation avant préparation et suppression d'une commande test.
8. Ne retirer les outils OneDrive qu'après validation de bout en bout.

## Décision de conception

Ne pas réécrire maintenant la logique stock à partir d'un exemple simplifié. La fonction existante contient des correspondances produits, conversions d'unités, poids réels et achats automatiques. Le transfert central doit reprendre ces règles explicitement et être testé avant de remplacer l'usage local.
