// ==================================
// IDÉE GOURMANDE – Version 2
// Panier professionnel avec récapitulatif
// ==================================

function calculerTotal() {

    // Quantités
    const qFoieGras = parseInt(document.getElementById('foieGras').value) || 0;
    const foieGrasSaveur = document.getElementById('foieGrasSaveur').value;
    const qMagret = parseInt(document.getElementById('magret').value) || 0;
    const grammesSaumon = parseInt(document.getElementById('saumon').value) || 0;

    // Saveurs
    const magretSaveur = document.getElementById('magretSaveur').value;
    const saumonSaveur = document.getElementById('saumonSaveur').value;

    // Calculs
    const foieGras = qFoieGras * 35;
    const magret = qMagret * 25;
    const saumon = (grammesSaumon / 100) * 8;

    const total = foieGras + magret + saumon;

    // Affichage du total
    document.getElementById('total').innerText =
        total.toFixed(2) + ' CHF';

    // Récapitulatif
    let recap = '';

    if (qFoieGras > 0) {
    recap += `• Foie gras (${foieGrasSaveur}) × ${qFoieGras} — ${foieGras.toFixed(2)} CHF<br>`;
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
