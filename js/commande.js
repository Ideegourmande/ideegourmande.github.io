// ==================================
// IDÉE GOURMANDE
// Panier Version 2
// ==================================

function calculerTotal() {

    // ----- Foie gras -----
    const qFoieGras = parseInt(document.getElementById("foieGras").value) || 0;
    const foieGrasSaveur = document.getElementById("foieGrasSaveur").value;

    // ----- Magret -----
    const qMagret = parseInt(document.getElementById("magret").value) || 0;
    const magretSaveur = document.getElementById("magretSaveur").value;

    // ----- Saumon -----
    const grammesSaumon = parseInt(document.getElementById("saumon").value) || 0;
    const saumonSaveur = document.getElementById("saumonSaveur").value;

    // ----- Calcul des prix -----
    const foieGras = qFoieGras * 35;
    const magret = qMagret * 25;
    const saumon = (grammesSaumon / 100) * 8;

    const total = foieGras + magret + saumon;

    // ----- Affichage du total -----
    document.getElementById("total").innerHTML =
        total.toFixed(2) + " CHF";

    // ----- Récapitulatif -----
    let recap = "";

    if (qFoieGras > 0) {
        recap +=
            "• Foie gras (" +
            foieGrasSaveur +
            ") × " +
            qFoieGras +
            " — " +
            foieGras.toFixed(2) +
            " CHF<br>";
    }

    if (qMagret > 0) {
        recap +=
            "• Magret (" +
            magretSaveur +
            ") × " +
            qMagret +
            " — " +
            magret.toFixed(2) +
            " CHF<br>";
    }

    if (grammesSaumon > 0) {
        recap +=
            "• Cœur de saumon (" +
            saumonSaveur +
            ") — " +
            grammesSaumon +
            " g — " +
            saumon.toFixed(2) +
            " CHF<br>";
    }

    if (recap === "") {
        recap = "Aucun produit sélectionné.";
    }

    document.getElementById("recapCommande").innerHTML = recap;
}

// Lancement automatique au chargement de la page
document.addEventListener("DOMContentLoaded", calculerTotal);
