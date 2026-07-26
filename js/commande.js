// ==================================
// IDÉE GOURMANDE
// Panier Version 4
// Produits indépendants
// ==================================


function calculerTotal() {


    // =========================
    // FOIE GRAS
    // =========================

    const foieFigues =
        Number(document.getElementById("foieFigues").value) || 0;

    const foiePiment =
        Number(document.getElementById("foiePiment").value) || 0;


    const prixFoieFigues =
        foieFigues * 35;

    const prixFoiePiment =
        foiePiment * 35;




    // =========================
    // MAGRET
    // =========================

    const magretHerbes =
        Number(document.getElementById("magretHerbes").value) || 0;

    const magretPiment =
        Number(document.getElementById("magretPiment").value) || 0;


    const prixMagretHerbes =
        magretHerbes * 25;

    const prixMagretPiment =
        magretPiment * 25;




    // =========================
    // SAUMON
    // =========================

    const saumonAneth =
        Number(document.getElementById("saumonAneth").value) || 0;

    const saumonPiment =
        Number(document.getElementById("saumonPiment").value) || 0;


    const prixSaumonAneth =
        (saumonAneth / 100) * 8;

    const prixSaumonPiment =
        (saumonPiment / 100) * 8;





    // =========================
    // TOTAL
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
    // PANIER
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





// Calcul dès l'ouverture de la page

document.addEventListener(
    "DOMContentLoaded",
    calculerTotal
);
