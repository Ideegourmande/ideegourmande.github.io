# Plan d'essais manuels du parcours de commande

**Statut : plan préparatoire — aucun essai navigateur n'a encore été exécuté.**
**Environnement obligatoire : préproduction/staging uniquement.** Ne pas utiliser le site public de production, le classeur réel, les vrais destinataires ou un compte client réel.

## Préconditions de sécurité

- URL de préproduction explicitement identifiée et servie depuis la branche candidate.
- Projet Apps Script de test séparé du projet déployé.
- Classeur Sheets de test séparé, avec données fictives.
- Envoi Gmail neutralisé par un faux service ou dirigé vers une boîte de test contrôlée ; aucun destinataire client réel.
- Sauvegarde/export du classeur de test avant les essais.
- Aucun changement du bloc tarifs ; comparer les valeurs avant/après.
- Utiliser des identifiants de commande de test uniques et clairement préfixés TEST.

Si une de ces conditions manque, ne pas soumettre le formulaire de commande.

## PC — Chrome, Firefox ou Safari desktop

1. Ouvrir la page de préproduction et vérifier que la page commande fonctionne sans charger `js/database.js`.
2. Vérifier affichage des produits, panier, frais, total, coordonnées et mode de livraison.
3. Soumettre une commande fictive valide ; vérifier une seule ligne dans la feuille de test et les deux statuts e-mail simulés.
4. Recharger avant confirmation ; vérifier que le même identifiant et numéro de commande sont réutilisés.
5. Simuler une réponse réseau perdue après transmission ; vérifier que le panier reste intact et qu'un message conseille de vérifier la commande avant tout nouvel envoi.
6. Modifier le panier après cette réponse incertaine ; vérifier que la nouvelle commande est bloquée jusqu'à réconciliation.
7. Double-cliquer rapidement sur le bouton d'envoi ; vérifier qu'une seule demande part.
8. Simuler un refus serveur ou une panne Sheets ; vérifier qu'aucun succès n'est affiché et que le panier n'est pas vidé.

## Safari iOS

1. Ouvrir l'URL de préproduction dans Safari iOS, sans navigateur intégré d'une autre application.
2. Vérifier défilement, champs, clavier, sélecteurs, boutons, panier et récapitulatif sans débordement horizontal.
3. Démarrer une commande fictive puis passer Safari en arrière-plan pendant l'attente.
4. Revenir dans Safari ; vérifier la reprise de la vérification du statut sans créer un nouvel identifiant.
5. Simuler un statut inconnu ou un délai dépassé ; vérifier que le panier reste présent et qu'aucune relance automatique n'est déclenchée.
6. Recharger la page ; vérifier la conservation de l'identifiant en attente et le blocage d'une commande modifiée non réconciliée.

## Récepteur Apps Script — intégration isolée

À exécuter seulement après déploiement dans un projet Apps Script de test relié à un classeur de test et à un service d'e-mail neutralisé.

- Payload invalide : zéro écriture Sheets, zéro e-mail.
- Même `idCommande` + même `idEnvoi` : aucune réécriture ni aucun nouvel e-mail.
- Même `idEnvoi` réutilisé pour une autre commande ou un autre type : rejet.
- Même `idCommande` avec nouvel `idEnvoi` : rejet ou reprise métier explicitement autorisée, jamais renvoi implicite.
- Entreprise envoyée puis client en échec : reprise du client seulement.
- État indéterminé : aucune relance sans réconciliation.
- Deux requêtes simultanées : une seule réservation et aucun double envoi.
- Échec d'écriture Sheets : aucun e-mail.
- Vérifier les réponses `status` et `mailStatus`, le nombre de lignes, les états de suivi et le nombre d'appels e-mail.
- Vérifier que les tarifs et leurs feuilles n'ont pas changé.

## Compte rendu requis pour chaque essai

Noter : appareil/navigateur/version, URL et commit de préproduction, scénario, résultat attendu, résultat obtenu, identifiant TEST, nombre de lignes créées/modifiées, appels e-mail simulés, capture/log expurgé et verdict PASS/FAIL.

**Important :** les tests Node/VM de GitHub Actions ne remplacent ni ces essais navigateur ni les tests du récepteur Apps Script.