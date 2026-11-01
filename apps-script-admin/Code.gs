/**
 * IDEE GOURMANDE — Administration privée (projet Apps Script séparé)
 * Déploiement conseillé : exécuter en tant qu'utilisateur accédant ;
 * accès Web App : uniquement moi. Ne pas coller dans le script public des e-mails.
 */
const IG_CONFIG = Object.freeze({
  SPREADSHEET_ID: "1pPm4OIhNwxNNj7Qzrm2KJkh6rsMxXlNPSB7uXLKqUOs",
  ADMIN_EMAIL: "ideesgourmandesge@gmail.com",
  SHEETS: {
    ORDERS: "Commandes",
    ITEMS: "Détails commandes",
    TECH: "Données techniques",
    ARCHIVE: "Archives",
    STOCK: "Stock",
    MOVEMENTS: "Mouvements stock"
  }
});

const IG_HEADERS = {
  "Détails commandes": ["ID commande", "N° commande", "Article", "Quantité", "Unité", "Poids (g)", "Prix indiqué", "Prix confirmé", "Prix final", "N° ligne", "Données article (JSON)"],
  "Données techniques": ["ID commande", "Date sauvegarde", "Données reçues (JSON)"],
  "Archives": ["ID commande", "N° commande", "Date archivage", "Statut", "Données commande (JSON)"],
  "Stock": ["ID article", "Article", "Catégorie", "Unité", "Quantité en stock", "Stock minimum", "Emplacement", "Dernière mise à jour"],
  "Mouvements stock": ["ID mouvement", "Date", "ID article", "Article", "Type mouvement", "Quantité", "ID commande", "Commentaire"]
};

function doGet() {
  verifierAccesAdmin_();
  return HtmlService.createHtmlOutputFromFile("Index")
    .setTitle("Idée Gourmande — Administration centralisée")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

function verifierAccesAdmin_() {
  const email = String(Session.getActiveUser().getEmail() || "").trim().toLowerCase();
  if (email !== IG_CONFIG.ADMIN_EMAIL) {
    throw new Error("Accès refusé. Connecte-toi avec le compte Google autorisé.");
  }
}

function classeur_() {
  verifierAccesAdmin_();
  return SpreadsheetApp.openById(IG_CONFIG.SPREADSHEET_ID);
}

/** Initialise uniquement les onglets manquants/vides ; ne supprime aucune donnée. */
function initialiserStructureAdmin() {
  const ss = classeur_();
  const commandes = ss.getSheetByName(IG_CONFIG.SHEETS.ORDERS);
  if (!commandes) throw new Error("L'onglet Commandes existant est introuvable : aucune création de remplacement n'est effectuée.");
  Object.keys(IG_HEADERS).forEach(function(name) {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, IG_HEADERS[name].length).setValues([IG_HEADERS[name]]);
      sh.setFrozenRows(1);
    }
  });
  return {ok:true, tabs:ss.getSheets().map(s => s.getName())};
}

function obtenirTableauAdmin() {
  const ss = classeur_();
  const sh = ss.getSheetByName(IG_CONFIG.SHEETS.ORDERS);
  if (!sh || sh.getLastRow() < 2) return {commandes:[], onglets:ss.getSheets().map(s=>s.getName())};
  const values = sh.getDataRange().getValues();
  const headers = values.shift().map(String);
  const commandes = values.filter(row => row.some(v => v !== "" && v !== null)).map(function(row) {
    const o = {};
    headers.forEach((h,i) => o[h] = row[i] instanceof Date ? row[i].toISOString() : row[i]);
    try { o.produits = JSON.parse(o["Produits (JSON)"] || "[]"); } catch (_) { o.produits = []; }
    try { o.client = JSON.parse(o["Client (JSON)"] || "{}"); } catch (_) { o.client = {}; }
    return o;
  });
  commandes.reverse();
  return {commandes:commandes, onglets:ss.getSheets().map(s=>s.getName())};
}


/**
 * Diagnostic sans données personnelles : indique uniquement la forme des
 * lignes produits réellement enregistrées dans la feuille Commandes.
 * À exécuter depuis l'éditeur Apps Script après autorisation.
 */
function diagnostiquerFormatProduits() {
  const ss = classeur_();
  const sh = ss.getSheetByName(IG_CONFIG.SHEETS.ORDERS);
  if (!sh || sh.getLastRow() < 2) {
    return { commandesAnalysees: 0, message: "Aucune commande à analyser." };
  }
  const values = sh.getDataRange().getValues();
  const headers = values.shift().map(String);
  const idxProduits = headers.indexOf("Produits (JSON)");
  const idxId = headers.indexOf("ID commande");
  if (idxProduits < 0) {
    throw new Error("Colonne Produits (JSON) introuvable.");
  }
  let nbCommandes = 0;
  let nbLignesProduits = 0;
  let erreursJSON = 0;
  const formes = {};
  const exemples = [];
  values.forEach(function(row) {
    const raw = row[idxProduits];
    if (!raw) return;
    nbCommandes++;
    let produits;
    try {
      produits = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch (e) {
      erreursJSON++;
      return;
    }
    if (!Array.isArray(produits)) {
      formes["racine_non_tableau"] = (formes["racine_non_tableau"] || 0) + 1;
      return;
    }
    nbLignesProduits += produits.length;
    produits.forEach(function(p) {
      const type = p === null ? "null" : Array.isArray(p) ? "array" : typeof p;
      const keys = p && typeof p === "object" && !Array.isArray(p)
        ? Object.keys(p).sort().join(", ")
        : type;
      formes[keys] = (formes[keys] || 0) + 1;
      if (exemples.length < 5) {
        exemples.push({
          type: type,
          champs: p && typeof p === "object" && !Array.isArray(p) ? Object.keys(p).sort() : [],
          nom: p && (p.nom || p.nomProduit || p.article) ? String(p.nom || p.nomProduit || p.article) : "",
          reference: p && p.reference ? String(p.reference) : "",
          recette: p && p.recette ? String(p.recette) : "",
          unite: p && (p.unite || p.unité) ? String(p.unite || p.unité) : "",
          quantiteType: p && p.quantite != null ? typeof p.quantite : "absent",
          poidsType: p && p.poids != null ? typeof p.poids : "absent",
          poidsReelType: p && p.poidsReel != null ? typeof p.poidsReel : "absent",
          prixType: p && p.prix != null ? typeof p.prix : "absent"
        });
      }
    });
  });
  return {
    commandesAnalysees: nbCommandes,
    lignesProduitsAnalysees: nbLignesProduits,
    erreursJSON: erreursJSON,
    formesDeLignes: formes,
    exemplesSansDonneesClient: exemples
  };
}

/**
 * Simulation pure de deux lignes fictives de saumon.
 * Aucun accès à SpreadsheetApp, aucune écriture, aucun e-mail et aucune
 * modification de stock. Vérifie les règles de correspondance connues
 * du catalogue local ; ce n'est pas encore une validation du stock réel.
 */
function simulerCorrespondanceSaumonFictif() {
  function normaliser_(v) {
    return String(v || "").toLowerCase().normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").trim();
  }
  function simulerLigne_(ligne) {
    const recette = normaliser_(ligne.recette);
    let articleStock = "";
    if (["aneth", "a l'aneth"].indexOf(recette) >= 0) {
      articleStock = "saumon à l'aneth";
    } else if (["piment", "piments", "aux piment", "aux piments", "aux pimets"].indexOf(recette) >= 0) {
      articleStock = "saumon aux piments";
    }
    const poids = Number(String(ligne.poids).replace(",", "."));
    const valide = ligne.reference === "saumon-fume" &&
      articleStock !== "" && Number.isFinite(poids) && poids > 0;
    return {
      recetteSaisie: ligne.recette,
      articleStockAttendu: articleStock || null,
      poidsSaisi: ligne.poids,
      consommationSimulee: valide ? poids : null,
      uniteConsommation: "g",
      resultat: valide ? "OK" : "À vérifier"
    };
  }

  const cas = [
    { reference: "saumon-fume", recette: "aneth", poids: "125", quantite: 1 },
    { reference: "saumon-fume", recette: "piments", poids: "180", quantite: 1 }
  ];
  const resultats = cas.map(simulerLigne_);
  return {
    mode: "simulation sans écriture",
    source: "règles de correspondance saumon du catalogue local",
    aucuneModification: true,
    resultats: resultats,
    tousValides: resultats.every(r => r.resultat === "OK")
  };
}

/**
 * Construit un aperçu du transfert depuis Commandes vers les onglets
 * secondaires. Lecture seule : aucune cellule n'est modifiée.
 */
function preparerApercuTransfertDetails() {
  const ss = classeur_();
  const sh = ss.getSheetByName(IG_CONFIG.SHEETS.ORDERS);
  if (!sh || sh.getLastRow() < 2) {
    return {commandes:0, lignesArticles:0, erreurs:[], dejaTransferees:0};
  }
  const values = sh.getDataRange().getValues();
  const headers = values.shift().map(String);
  const idx = {};
  headers.forEach((h,i) => idx[h] = i);
  ["ID commande", "N° commande", "Produits (JSON)"].forEach(h => {
    if (idx[h] == null) throw new Error("Colonne obligatoire absente : " + h);
  });
  const details = ss.getSheetByName(IG_CONFIG.SHEETS.ITEMS);
  const tech = ss.getSheetByName(IG_CONFIG.SHEETS.TECH);
  if (!details || !tech) throw new Error("Exécute d'abord initialiserStructureAdmin().");
  const idsDetails = lireIdsDejaTransferes_(details, 1);
  const idsTech = lireIdsDejaTransferes_(tech, 1);
  let commandes = 0, lignesArticles = 0, dejaTransferees = 0;
  const erreurs = [];
  values.forEach((row, n) => {
    const id = String(row[idx["ID commande"]] || "").trim();
    if (!id) { erreurs.push("Ligne " + (n+2) + " : ID commande vide"); return; }
    let produits;
    try {
      produits = typeof row[idx["Produits (JSON)"]] === "string"
        ? JSON.parse(row[idx["Produits (JSON)"]] || "[]")
        : row[idx["Produits (JSON)"]];
    } catch (e) {
      erreurs.push(id + " : JSON produits illisible"); return;
    }
    if (!Array.isArray(produits)) {
      erreurs.push(id + " : les produits ne sont pas une liste"); return;
    }
    commandes++;
    if (idsDetails.has(id) || idsTech.has(id)) dejaTransferees++;
    else lignesArticles += produits.length;
  });
  return {commandes:commandes, lignesArticles:lignesArticles,
    erreurs:erreurs, dejaTransferees:dejaTransferees,
    mode:"aperçu en lecture seule"};
}

/**
 * Transfert manuel et idempotent vers les onglets secondaires uniquement.
 * N'altère pas Commandes, ne touche pas au stock et n'envoie aucun e-mail.
 * À lancer seulement après validation de preparerApercuTransfertDetails().
 */
function transfererDetailsCommandes() {
  const ss = classeur_();
  const sh = ss.getSheetByName(IG_CONFIG.SHEETS.ORDERS);
  const details = ss.getSheetByName(IG_CONFIG.SHEETS.ITEMS);
  const tech = ss.getSheetByName(IG_CONFIG.SHEETS.TECH);
  if (!sh || !details || !tech) throw new Error("Onglets requis manquants. Exécute initialiserStructureAdmin().");
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return {commandesTraitees:0, lignesAjoutees:0};
  const headers = values.shift().map(String);
  const idx = {};
  headers.forEach((h,i) => idx[h] = i);
  ["ID commande", "N° commande", "Produits (JSON)"].forEach(h => {
    if (idx[h] == null) throw new Error("Colonne obligatoire absente : " + h);
  });
  const idsDetails = lireIdsDejaTransferes_(details, 1);
  const idsTech = lireIdsDejaTransferes_(tech, 1);
  const detailRows = [], techRows = [];
  let commandesTraitees = 0;
  values.forEach(row => {
    const id = String(row[idx["ID commande"]] || "").trim();
    if (!id || (idsDetails.has(id) && idsTech.has(id))) return;
    let produits;
    try {
      produits = typeof row[idx["Produits (JSON)"]] === "string"
        ? JSON.parse(row[idx["Produits (JSON)"]] || "[]")
        : row[idx["Produits (JSON)"]];
    } catch (e) { throw new Error("JSON produits illisible pour " + id + ". Aucun transfert effectué."); }
    if (!Array.isArray(produits)) throw new Error("Produits invalides pour " + id + ". Aucun transfert effectué.");
    const numero = valeurColonne_(row, idx, "N° commande");
    if (!idsDetails.has(id)) produits.forEach((p, i) => {
      if (!p || typeof p !== "object" || Array.isArray(p)) {
        throw new Error("Article invalide pour " + id + ", ligne " + (i+1) + ". Aucun transfert effectué.");
      }
      const nom = p.nom || p.nomProduit || p.article || "";
      const quantite = p.quantite == null ? "" : p.quantite;
      const unite = p.unite || p.unité || "";
      const poids = p.poidsReel != null ? p.poidsReel : (p.poids != null ? p.poids : "");
      detailRows.push([
        id, numero, nom, quantite, unite, poids,
        p.prix == null ? "" : p.prix,
        p.prixConfirme == null ? "" : p.prixConfirme,
        p.prixFinal == null ? "" : p.prixFinal,
        i + 1, JSON.stringify(p)
      ]);
    });
    const objetBrut = {};
    headers.forEach((h,i) => {
      const v = row[i];
      objetBrut[h] = v instanceof Date ? v.toISOString() : v;
    });
    if (!idsTech.has(id)) techRows.push([id, new Date(), JSON.stringify(objetBrut)]);
    commandesTraitees++;
  });
  // Valider toutes les lignes avant toute écriture, puis écrire les deux lots.
  if (detailRows.length) {
    details.getRange(details.getLastRow()+1, 1, detailRows.length, detailRows[0].length).setValues(detailRows);
  }
  if (techRows.length) {
    tech.getRange(tech.getLastRow()+1, 1, techRows.length, techRows[0].length).setValues(techRows);
  }
  return {commandesTraitees:commandesTraitees, lignesAjoutees:detailRows.length,
    sauvegardesTechniques:techRows.length, stockModifie:false, emailsEnvoyes:false};
}

function lireIdsDejaTransferes_(sheet, colonneId) {
  const set = new Set();
  if (sheet.getLastRow() < 2) return set;
  sheet.getRange(2, colonneId, sheet.getLastRow()-1, 1).getValues().forEach(r => {
    const id = String(r[0] || "").trim();
    if (id) set.add(id);
  });
  return set;
}

function valeurColonne_(row, index, nom) {
  return index[nom] == null ? "" : row[index[nom]];
}
