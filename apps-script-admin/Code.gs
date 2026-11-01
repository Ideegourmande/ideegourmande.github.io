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
  "Détails commandes": ["ID commande", "N° commande", "Article", "Quantité", "Unité", "Poids réel (g)", "Prix unitaire", "Total ligne", "Données article (JSON)"],
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
