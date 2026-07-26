// ==================================
// IDÉE GOURMANDE
// Panier Version 3
// Gestion des variantes produits
// ==================================


function calculerTotal() {


    // =========================
    // FOIE GRAS
    // =========================

    const foieFigues =
        parseInt(document.getElementById("foieFigues").value) || 0;

    const foiePiment =
        parseInt(document.getElementById("foiePiment").value) || 0;


    const prixFoieFigues = foieFigues * 35;
    const prixFoiePiment = foiePiment * 35;



    // =========================
    // MAGRET
    // =========================

    const magretHerbes =
        parseInt(document.getElementById("magretHerbes").value) || 0;

    const magretPiment =
        parseInt(document.getElementById("magretPiment").value) || 0;


    const prixMagretHerbes = magretHerbes * 25;
    const prixMagretPiment = magretPiment * 25;



    // =========================
    // SAUMON
    // =========================

    const saumonAneth =
        parseInt(document.getElementById("saumonAneth").value) || 0;

    const saumonPiment =
        parseInt(document.getElementById("saumonPiment").value) || 0;


    const prixSaumonAneth =
        (saumonAneth / 100) * 8;

    const prixSaumonPiment =
        (saumonPiment / 100) * 8;




    // =========================
    // TOTAL GENERAL
    // =========================

    const total =
        prixFoieFigues +
        prixFoiePiment +
        prixMagretHerbes +
        prixMagretPiment +
        prixSaumonAneth +
        prixSaumonPiment;



    document.getElementById("total").innerHTML =
        total.toFixed(2) + " CHF";





    // =========================
    // RECAPITULATIF PANIER
    // =========================

    let recap = "";



    if (foieFigues > 0) {

        recap +=
        "• Foie gras - Gelée de figues au vin de messe × "
        + foieFigues
        + " — "
        + prixFoieFigues.toFixed(2)
        + " CHF<br>";

    }



    if (foiePiment > 0) {

        recap +=
        "• Foie gras - Piment d'Espelette & Porto Calem × "
        + foiePiment
        + " — "
        + prixFoiePiment.toFixed(2)
        + " CHF<br>";

    }





    if (magretHerbes > 0) {

        recap +=
        "• Magret fumé - Herbes de Provence × "
        + magretHerbes
        + " — "
        + prixMagretHerbes.toFixed(2)
        + " CHF<br>";

    }





    if (magretPiment > 0) {

        recap +=
        "• Magret fumé - Piment d'Espelette × "
        + magretPiment
        + " — "
        + prixMagretPiment.toFixed(2)
        + " CHF<br>";

    }






    if (saumonAneth > 0) {

        recap +=
        "• Cœur de saumon fumé - Aneth "
        + saumonAneth
        + " g — "
        + prixSaumonAneth.toFixed(2)
        + " CHF<br>";

    }





    if (saumonPiment > 0) {

        recap +=
        "• Cœur de saumon fumé - Piment d'Espelette "
        + saumonPiment
        + " g — "
        + prixSaumonPiment.toFixed(2)
        + " CHF<br>";

    }





    if (recap === "") {

        recap = "Aucun produit sélectionné.";

    }



    document.getElementById("recapCommande").innerHTML = recap;


}





// Calcul automatique au chargement

document.addEventListener(
    "DOMContentLoaded",
    calculerTotal
);
