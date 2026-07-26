// ==================================
// IDÉE GOURMANDE
// Calcul automatique du panier
// ==================================


function calculerTotal() {


    let foieFigues = document.getElementById("foieFigues").value * 35;

    let foiePiment = document.getElementById("foiePiment").value * 35;

    let magret = document.getElementById("magret").value * 25;

    let saumon = document.getElementById("saumon").value * 8;



    let total = 
        foieFigues +
        foiePiment +
        magret +
        saumon;



    document.getElementById("total").innerHTML =
        "Total : " + total.toFixed(2) + " CHF";

}
