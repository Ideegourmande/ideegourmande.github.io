// ==================================
// IDÉE GOURMANDE – Version 2
// Panier professionnel avec récapitulatif
// ==================================

function calculerTotal() {

    // Quantités
    const qFigues = parseInt(document.getElementById('foieFigues').value) || 0;
    const qPiment = parseInt(document.getElementById('foiePiment').value) || 0;
    const qMagret = parseInt(document.getElementById('magret').value) || 0;
    const grammesSaumon = parseInt(document.getElementById('saumon').value) || 0;

    // Saveurs
    const magretSaveur = document.getElementById('magretSaveur').value;
    const saumonSaveur = document.getElementById('saumonSaveur').value;

    // Calculs
    const foieFigues = qFigues * 35;
    const foiePiment = qPiment * 35;
    const magret = qMagret * 25;
    const saumon = (grammesSaumon / 100) * 8;

    const total = foieFigues + foiePiment + magret + saumon;

    // Affichage du total
    document.getElementById('total').innerText =
        total.toFixed(2) + ' CHF';

    // Récapitulatif
    let recap = '';

    if (qFigues > 0) {
        recap += `• Foie gras Figues × ${qFigues} — ${foieFigues.toFixed(2)} CHF<br>`;
    }

    if (qPiment > 0) {
        recap += `• Foie gras Piment & Porto × ${qPiment} — ${foiePiment.toFixed(2)} CHF<br>`;
    }

    if (qMagret > 0) {
        recap += `• Magret (${magretSaveur}) × ${qMagret} — ${magret.toFixed(2)} CHF<br>`;
    }

    if (grammesSaumon > 0) {
        recap += `• Saumon (${saumonSaveur}) — ${grammesSaumon} g — ${saumon.toFixed(2)} CHF<br>`;
    }

    if (recap === '') {
        recap = 'Aucun produit sélectionné.';
    }

    document.getElementById('recapCommande').innerHTML = recap;
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', calculerTotal);
