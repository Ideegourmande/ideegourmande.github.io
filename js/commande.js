// ==================================
// IDÉE GOURMANDE
// Panier Version 5
// Calcul + envoi e-mail
// ==================================


let recapTexte = "";




// ================================
// CALCUL DU PANIER
// ================================

function calculerTotal() {


    // ---------- FOIE GRAS ----------

    const foieFigues =
        Number(document.getElementById("foieFigues").value) || 0;

    const foiePiment =
        Number(document.getElementById("foiePiment").value) || 0;


    const prixFoieFigues =
        foieFigues * 35;

    const prixFoiePiment =
        foiePiment * 35;




    // ---------- MAGRET ----------

    const magretHerbes =
        Number(document.getElementById("magretHerbes").value) || 0;

    const magretPiment =
        Number(document.getElementById("magretPiment").value) || 0;


    const prixMagretHerbes =
        magretHerbes * 25;

    const prixMagretPiment =
        magretPiment * 25;




    // ---------- SAUMON ----------

    const saumonAneth =
        Number(document.getElementById("saumonAneth").value) || 0;

    const saumonPiment =
        Number(document.getElementById("saumonPiment").value) || 0;


    const prixSaumonAneth =
        (saumonAneth / 100) * 8;

    const prixSaumonPiment =
        (saumonPiment / 100) * 8;





    // ---------- TOTAL ----------

    const total =

        prixFoieFigues +
        prixFoiePiment +
        prixMagretHerbes +
        prixMagretPiment +
        prixSaumonAneth +
        prixSaumonPiment;



    document.getElementById("total").innerHTML =
        total.toFixed(2) + " CHF";





    // ---------- RECAP ----------

    let recapHTML = "";
    recapTexte = "";



    if (foieFigues > 0) {

        recapHTML +=
        "• Foie gras - Gelée de figues au vin de messe × "
        + foieFigues
        + " — "
        + prixFoieFigues.toFixed(2)
        + " CHF<br>";


        recapTexte +=
        "- Foie gras Gelée de figues au vin de messe × "
        + foieFigues
        + " : "
        + prixFoieFigues.toFixed(2)
        + " CHF\n";

    }




    if (foiePiment > 0) {

        recapHTML +=
        "• Foie gras - Piment d'Espelette & Porto Calem × "
        + foiePiment
        + " — "
        + prixFoiePiment.toFixed(2)
        + " CHF<br>";


        recapTexte +=
        "- Foie gras Piment d'Espelette & Porto Calem × "
        + foiePiment
        + " : "
        + prixFoiePiment.toFixed(2)
        + " CHF\n";

    }




    if (magretHerbes > 0) {

        recapHTML +=
        "• Magret fumé - Herbes de Provence × "
        + magretHerbes
        + " — "
        + prixMagretHerbes.toFixed(2)
        + " CHF<br>";


        recapTexte +=
        "- Magret Herbes de Provence × "
        + magretHerbes
        + " : "
        + prixMagretHerbes.toFixed(2)
        + " CHF\n";

    }




    if (magretPiment > 0) {

        recapHTML +=
        "• Magret fumé - Piment d'Espelette × "
        + magretPiment
        + " — "
        + prixMagretPiment.toFixed(2)
        + " CHF<br>";


        recapTexte +=
        "- Magret Piment d'Espelette × "
        + magretPiment
        + " : "
        + prixMagretPiment.toFixed(2)
        + " CHF\n";

    }





    if (saumonAneth > 0) {

        recapHTML +=
        "• Cœur de saumon fumé - Aneth "
        + saumonAneth
        + " g — "
        + prixSaumonAneth.toFixed(2)
        + " CHF<br>";


        recapTexte +=
        "- Saumon fumé Aneth "
        + saumonAneth
        + " g : "
        + prixSaumonAneth.toFixed(2)
        + " CHF\n";

    }





    if (saumonPiment > 0) {

        recapHTML +=
        "• Cœur de saumon fumé - Piment d'Espelette "
        + saumonPiment
        + " g — "
        + prixSaumonPiment.toFixed(2)
        + " CHF<br>";


        recapTexte +=
        "- Saumon fumé Piment d'Espelette "
        + saumonPiment
        + " g : "
        + prixSaumonPiment.toFixed(2)
        + " CHF\n";

    }





    if (recapHTML === "") {

        recapHTML =
        "Aucun produit sélectionné.";

        recapTexte =
        "Aucun produit sélectionné.";

    }



    document.getElementById("recapCommande").innerHTML =
        recapHTML;



    return total;

}









// ================================
// ENVOI DE COMMANDE PAR EMAIL
// ================================


function envoyerCommande(event) {


    event.preventDefault();



    const total =
        calculerTotal();




    const nom =
        document.getElementById("nom").value;


    const telephone =
        document.getElementById("telephone").value;


    const email =
        document.getElementById("email").value;


    const adresse =
        document.getElementById("adresse").value;


    const commentaire =
        document.getElementById("commentaire").value;




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
TWINT


Adresse :
${adresse}


Commentaire :
${commentaire}
`;





    const sujet =
        "Nouvelle commande - Idée Gourmande";



    const mailto =

        "mailto:vkloetzli@bluewin.ch"
        +
        "?subject="
        +
        encodeURIComponent(sujet)
        +
        "&body="
        +
        encodeURIComponent(message);




    window.location.href = mailto;

setTimeout(function(){

    window.location.href = "confirmation.html";

}, 1500);


}







// Calcul automatique au chargement

document.addEventListener(
    "DOMContentLoaded",
    calculerTotal
);
