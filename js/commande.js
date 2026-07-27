// ==================================
// IDÉE GOURMANDE
// Panier Version 6
// Calcul + validation + email
// ==================================


let recapTexte = "";



// ================================
// CALCUL DU TOTAL
// ================================

function calculerTotal() {


    // Foie gras

    const foieFigues =
        Number(document.getElementById("foieFigues").value) || 0;

    const foiePiment =
        Number(document.getElementById("foiePiment").value) || 0;



    // Magret

    const magretHerbes =
        Number(document.getElementById("magretHerbes").value) || 0;

    const magretPiment =
        Number(document.getElementById("magretPiment").value) || 0;



    // Saumon

    const saumonAneth =
        Number(document.getElementById("saumonAneth").value) || 0;

    const saumonPiment =
        Number(document.getElementById("saumonPiment").value) || 0;



    // Prix

    const prixFoieFigues = foieFigues * 35;
    const prixFoiePiment = foiePiment * 35;

    const prixMagretHerbes = magretHerbes * 25;
    const prixMagretPiment = magretPiment * 25;

    const prixSaumonAneth = (saumonAneth / 100) * 8;
    const prixSaumonPiment = (saumonPiment / 100) * 8;



    const total =
        prixFoieFigues +
        prixFoiePiment +
        prixMagretHerbes +
        prixMagretPiment +
        prixSaumonAneth +
        prixSaumonPiment;



    document.getElementById("total").innerHTML =
        total.toFixed(2) + " CHF";





    // ============================
    // CREATION DU PANIER
    // ============================

    let recapHTML = "";

    recapTexte = "";



    if (foieFigues > 0) {

        recapHTML +=
        "• Foie gras figues × " +
        foieFigues +
        " — " +
        prixFoieFigues.toFixed(2) +
        " CHF<br>";

        recapTexte +=
        "Foie gras figues × " +
        foieFigues +
        " : " +
        prixFoieFigues.toFixed(2) +
        " CHF\n";

    }



    if (foiePiment > 0) {

        recapHTML +=
        "• Foie gras Piment & Porto × " +
        foiePiment +
        " — " +
        prixFoiePiment.toFixed(2) +
        " CHF<br>";

        recapTexte +=
        "Foie gras Piment & Porto × " +
        foiePiment +
        " : " +
        prixFoiePiment.toFixed(2) +
        " CHF\n";

    }



    if (magretHerbes > 0) {

        recapHTML +=
        "• Magret Herbes de Provence × " +
        magretHerbes +
        " — " +
        prixMagretHerbes.toFixed(2) +
        " CHF<br>";

        recapTexte +=
        "Magret Herbes de Provence × " +
        magretHerbes +
        " : " +
        prixMagretHerbes.toFixed(2) +
        " CHF\n";

    }



    if (magretPiment > 0) {

        recapHTML +=
        "• Magret Piment d'Espelette × " +
        magretPiment +
        " — " +
        prixMagretPiment.toFixed(2) +
        " CHF<br>";

        recapTexte +=
        "Magret Piment d'Espelette × " +
        magretPiment +
        " : " +
        prixMagretPiment.toFixed(2) +
        " CHF\n";

    }



    if (saumonAneth > 0) {

        recapHTML +=
        "• Saumon Aneth " +
        saumonAneth +
        " g — " +
        prixSaumonAneth.toFixed(2) +
        " CHF<br>";

        recapTexte +=
        "Saumon Aneth " +
        saumonAneth +
        " g : " +
        prixSaumonAneth.toFixed(2) +
        " CHF\n";

    }



    if (saumonPiment > 0) {

        recapHTML +=
        "• Saumon Piment d'Espelette " +
        saumonPiment +
        " g — " +
        prixSaumonPiment.toFixed(2) +
        " CHF<br>";

        recapTexte +=
        "Saumon Piment d'Espelette " +
        saumonPiment +
        " g : " +
        prixSaumonPiment.toFixed(2) +
        " CHF\n";

    }



    if (recapHTML === "") {

        recapHTML =
        "Aucun produit sélectionné.";

    }


    document.getElementById("recapCommande").innerHTML =
        recapHTML;



    return total;

}






// ================================
// ENVOI COMMANDE
// ================================

function envoyerCommande(event) {


    event.preventDefault();



    const total =
        calculerTotal();



    // Panier vide

    if (total <= 0) {

        alert(
        "⚠️ Votre panier est vide.\nVeuillez sélectionner un produit."
        );

        return;

    }




    // Coordonnées

    const nom =
    document.getElementById("nom").value.trim();


    const telephone =
    document.getElementById("telephone").value.trim();


    const email =
    document.getElementById("email").value.trim();


    const adresse =
    document.getElementById("adresse").value.trim();


    const commentaire =
    document.getElementById("commentaire").value.trim();




    if (
        nom === "" ||
        email === "" ||
        adresse === ""
    ) {

        alert(
        "⚠️ Merci de compléter vos coordonnées."
        );

        return;

    }




    // TWINT

    const twint =
    document.querySelector('input[type="checkbox"]');


    if (!twint.checked) {

        alert(
        "⚠️ Merci de confirmer le paiement TWINT."
        );

        return;

    }






    // Création email

    const message =

`Nouvelle commande Idée Gourmande

Client :
${nom}

Téléphone :
${telephone}

Email :
${email}


Commande :

${recapTexte}


Total :
${total.toFixed(2)} CHF


Paiement :
TWINT confirmé


Adresse :
${adresse}


Commentaire :
${commentaire}
`;



    const sujet =
    "Nouvelle commande - Idée Gourmande";



    const mailto =

    "mailto:vkloetzli@bluewin.ch" +
    "?subject=" +
    encodeURIComponent(sujet) +
    "&body=" +
    encodeURIComponent(message);



    window.location.href = mailto;



    setTimeout(function(){

        window.location.href =
        "confirmation.html";

    },1500);


}






document.addEventListener(
"DOMContentLoaded",
calculerTotal
);
function viderPanier() {

    panier = [];

    localStorage.removeItem("panier");

    afficherPanier();

}
