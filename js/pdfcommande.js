const GOOGLE_APPS_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycby5o5V0dRb9fPpnhmUYCeWB1LxXjGRXfQK0kQ2Tzw2gHK58GQn8VmxlDI1DFWzogAhI/exec";

async function genererPDFCommande(commande) {

if (!window.jspdf || !window.jspdf.jsPDF) {
    throw new Error("jsPDF n'est pas chargé.");
}

const { jsPDF } = window.jspdf;
const doc = new jsPDF();


// ==============================
// INFORMATIONS
// ==============================

const fichier =
    "Commande_" + commande.id + ".pdf";

const client =
    commande.client || {};

const produits =
    Array.isArray(commande.produits)
        ? commande.produits
        : [];

const total =
    Number(commande.total || 0);


// ==============================
// TITRE
// ==============================

doc.setFontSize(20);

doc.setFont(
    "helvetica",
    "bold"
);

doc.text(
    "IDÉE GOURMANDE",
    20,
    20
);

doc.setFontSize(14);

doc.text(
    "Bon de commande",
    20,
    30
);

doc.setFontSize(10);

doc.setFont(
    "helvetica",
    "normal"
);

doc.text(
    "N° commande : " + commande.id,
    20,
    40
);

doc.text(
    "Date : " +
    new Date().toLocaleString("fr-CH"),
    20,
    47
);


// ==============================
// CLIENT
// ==============================

let y = 60;

doc.setFont(
    "helvetica",
    "bold"
);

doc.text(
    "CLIENT",
    20,
    y
);

doc.setFont(
    "helvetica",
    "normal"
);

y += 8;

doc.text(
    "Nom : " +
    (client.prenom || "") +
    " " +
    (client.nom || ""),
    20,
    y
);

y += 7;

doc.text(
    "Téléphone : " +
    (client.telephone || ""),
    20,
    y
);

y += 7;

doc.text(
    "E-mail : " +
    (client.email || ""),
    20,
    y
);

y += 7;

const adresse =
    String(client.adresse || "");

const adresseLignes =
    doc.splitTextToSize(
        "Adresse : " + adresse,
        170
    );

doc.text(
    adresseLignes,
    20,
    y
);

y +=
    adresseLignes.length * 6 +
    8;


// ==============================
// PRODUITS
// ==============================

doc.setFont(
    "helvetica",
    "bold"
);

doc.text(
    "PRODUITS COMMANDÉS",
    20,
    y
);

doc.setFont(
    "helvetica",
    "normal"
);

y += 10;

