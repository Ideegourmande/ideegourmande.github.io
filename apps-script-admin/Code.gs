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
