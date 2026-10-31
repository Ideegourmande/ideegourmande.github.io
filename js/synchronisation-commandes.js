/* ============================================================
   Idée Gourmande — Synchronisation manuelle des commandes
   Transfert JSON par OneDrive, sans remplacer la base locale.
   ============================================================ */
"use strict";

(function () {
  const FORMAT = "idee-gourmande-commandes";
  const VERSION = 1;

  function dateModificationCommande(cmd) {
    if (!cmd || typeof cmd !== "object") return 0;
    const champs = [
      "updatedAt", "dateModification", "modifiedAt", "modified_at",
      "dateConfirmationPrix", "dateArchivage"
    ];
    for (const champ of champs) {
      const valeur = cmd[champ];
      if (typeof valeur !== "string" && typeof valeur !== "number") continue;
      const temps = typeof valeur === "number" ? valeur : Date.parse(valeur);
      if (Number.isFinite(temps) && temps > 0) return temps;
    }
    return 0;
  }

  function identifiant(cmd) {
    if (!cmd || typeof cmd !== "object") return "";
    const valeur = cmd.id || cmd.uuid || cmd._id ||
      cmd.numeroCommande || cmd.numero || cmd.reference;
    return valeur == null ? "" : String(valeur).trim();
  }

  function fusionnerCommandes(locales, importees) {
    const resultat = [];
    const positions = new Map();

    function ajouterOuFusionner(cmd, origine) {
      if (!cmd || typeof cmd !== "object" || Array.isArray(cmd)) return;
      const id = identifiant(cmd);
      if (!id) {
        const signature = JSON.stringify(cmd);
        if (!resultat.some(x => JSON.stringify(x) === signature)) resultat.push(cmd);
        return;
      }

      if (!positions.has(id)) {
        positions.set(id, resultat.length);
        resultat.push(cmd);
        return;
      }

      const index = positions.get(id);
      const existante = resultat[index];
      const dateExistante = dateModificationCommande(existante);
      const dateEntrante = dateModificationCommande(cmd);

      // Sans date fiable, ne jamais écraser silencieusement la version déjà présente.
      if (dateEntrante > dateExistante) resultat[index] = cmd;
    }

    (Array.isArray(locales) ? locales : []).forEach(x => ajouterOuFusionner(x, "local"));
    (Array.isArray(importees) ? importees : []).forEach(x => ajouterOuFusionner(x, "import"));

    return resultat;
  }

  function telechargerFichier(nom, contenu) {
    const blob = new Blob([JSON.stringify(contenu, null, 2)], {
      type: "application/json;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = nom;
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function exporterCommandesSynchronisation() {
    if (typeof sauvegarderDB !== "function" || !sauvegarderDB()) {
      alert("Impossible d'enregistrer les dernières modifications avant l'exportation.");
      return;
    }

    const base = typeof obtenirDB === "function" ? obtenirDB() : window.db;
    if (!base || !Array.isArray(base.commandes)) {
      alert("La base de commandes est introuvable. Aucun fichier n'a été créé.");
      return;
    }

    const maintenant = new Date();
    const date = maintenant.toISOString().slice(0, 10);
    const heure = maintenant.toTimeString().slice(0, 8).replace(/:/g, "-");
    const fichier = {
      format: FORMAT,
      version: VERSION,
      exporteLe: maintenant.toISOString(),
      commandes: base.commandes,
      archives: Array.isArray(base.archives) ? base.archives : []
    };

    try {
      telechargerFichier("synchronisation-commandes-" + date + "-" + heure + ".json", fichier);
      alert(
        "Fichier de synchronisation créé.\n\n" +
        "Enregistre-le dans ton dossier OneDrive. Sur l'autre appareil, " +
        "ouvre la synchronisation et importe ce même fichier."
      );
    } catch (erreur) {
      console.error("Export des commandes impossible :", erreur);
      alert("Le fichier de synchronisation n'a pas pu être créé.");
    }
  }

  function importerCommandesSynchronisation(fichier) {
    if (!fichier) return;
    const lecteur = new FileReader();

    lecteur.onload = function () {
      let importee;
      try {
        importee = JSON.parse(String(lecteur.result || ""));
      } catch (erreur) {
        alert("Le fichier sélectionné n'est pas un JSON valide. Aucune donnée n'a été modifiée.");
        return;
      }

      // Accepte le format dédié et les sauvegardes complètes de la gestion du stock.
      if (!importee || typeof importee !== "object" || Array.isArray(importee) ||
          !Array.isArray(importee.commandes) ||
          (importee.format !== FORMAT && !Array.isArray(importee.articles))) {
        alert("Ce fichier ne contient pas une sauvegarde reconnue des commandes Idée Gourmande.");
        return;
      }

      const base = typeof obtenirDB === "function" ? obtenirDB() : window.db;
      if (!base) {
        alert("La base locale est introuvable. Aucune donnée n'a été modifiée.");
        return;
      }

      const commandesFusionnees = fusionnerCommandes(
        base.commandes,
        importee.commandes
      );
      const archivesFusionnees = fusionnerCommandes(
        base.archives,
        importee.archives
      );

      // Une commande archivée doit rester dans les archives, pas réapparaître en cours.
      const idsArchives = new Set(archivesFusionnees.map(identifiant).filter(Boolean));
      const commandesFinales = commandesFusionnees.filter(cmd => !idsArchives.has(identifiant(cmd)));

      const ajoutsActifs = commandesFinales.length -
        (Array.isArray(base.commandes) ? base.commandes.length : 0);
      const confirmation =
        "La fusion va réunir les commandes et les archives sans remplacer les autres données.\n\n" +
        "Commandes actives après fusion : " + commandesFinales.length + "\n" +
        "Commandes archivées après fusion : " + archivesFusionnees.length + "\n\n" +
        "Les versions ayant une date de modification plus récente seront conservées. " +
        "Sans date fiable, la version déjà présente sur cet appareil sera prioritaire.\n\n" +
        "Les suppressions ne sont pas propagées par cette synchronisation.\n\nContinuer ?";
      if (!confirm(confirmation)) return;

      try {
        const ancienneBase = localStorage.getItem("ideeGourmandeDB");
        if (ancienneBase) {
          localStorage.setItem("ideeGourmandeDB_avant_sync_commandes", ancienneBase);
          localStorage.setItem("ideeGourmandeDB_avant_sync_commandes_date", new Date().toISOString());
        }

        base.commandes = commandesFinales;
        base.archives = archivesFusionnees;
        if (!sauvegarderDB()) throw new Error("Écriture locale impossible");

        alert(
          "Synchronisation terminée.\n\n" +
          "Commandes actives : " + commandesFinales.length + "\n" +
          "Archives : " + archivesFusionnees.length + "\n\n" +
          "La page va se recharger pour afficher les données fusionnées."
        );
        window.location.reload();
      } catch (erreur) {
        console.error("Fusion des commandes impossible :", erreur);
        alert("La fusion n'a pas pu être enregistrée. Vérifie l'espace disponible sur cet appareil.");
      }
    };

    lecteur.onerror = function () {
      alert("Impossible de lire le fichier sélectionné.");
    };
    lecteur.readAsText(fichier);
  }

  function ouvrirImportSynchronisation() {
    const champ = document.getElementById("fichierSynchronisationCommandes");
    if (champ) {
      champ.value = "";
      champ.click();
    }
  }

  window.exporterCommandesSynchronisation = exporterCommandesSynchronisation;
  window.importerCommandesSynchronisation = importerCommandesSynchronisation;
  window.ouvrirImportSynchronisation = ouvrirImportSynchronisation;
})();
