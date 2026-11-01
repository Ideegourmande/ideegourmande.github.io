# Administration privée — Idée Gourmande

Ce dossier est un **projet Apps Script séparé** du script public qui reçoit les commandes et envoie les e-mails.

## Fichiers
- `Code.gs` : vérification de l'utilisateur Google, lecture des commandes et rattachement des lignes de `Détails commandes` par identifiant.
- `Index.html` : tableau de consultation avec recherche, filtre par statut et affichage des articles. Aucune modification des commandes.

## Installation manuelle dans Google Apps Script
1. Avec le compte Google autorisé, crée un **nouveau projet Apps Script autonome**.
2. Remplace le contenu de `Code.gs` par le fichier de ce dossier.
3. Ajoute un fichier HTML nommé exactement `Index` et colle le contenu de `Index.html`.
4. Enregistre le projet.
5. Déploie comme application Web : **Exécuter en tant que : utilisateur accédant à l'application** et **Qui a accès : moi uniquement**.
6. Ouvre l'URL de déploiement avec le compte Google autorisé et accepte les autorisations Google.
7. Une fois l'accès confirmé, exécute `initialiserStructureAdmin()` depuis l'éditeur si tu souhaites créer les onglets secondaires.

## Sécurité et précautions
- Ne copie pas ce code dans le projet Apps Script public qui envoie les e-mails.
- Ne rends pas l'application accessible à toute personne disposant du lien.
- L'initialisation conserve l'onglet `Commandes` et ses lignes. Elle crée uniquement les onglets secondaires manquants ou initialise ceux qui sont vides.
- Cette première version est volontairement **en lecture seule** : aucune modification de statut, suppression de commande ou déduction de stock n'est encore activée.
- Avant d'ajouter ces actions, il faudra tester l'identité renvoyée par Google et confirmer la structure réelle des données produit et des articles en stock.
