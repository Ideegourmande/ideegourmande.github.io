// ==================================
// IDÉE GOURMANDE
// commande.js
// Panier + commande + PDF + sauvegarde
// ==================================

let recapTexte = "";


// ==================================
// CALCUL DU TOTAL
// ==================================

function calculerTotal() {


    const foieFigues =
    Number(document.getElementById("foieFigues").value) || 0;


    const foiePiment =
    Number(document.getElementById("foiePiment").value) || 0;


    const magretHerbes =
    Number(document.getElementById("magretHerbes").value) || 0;


    const magretPiment =
    Number(document.getElementById("magretPiment").value) || 0;


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



    // ==============================
    // RÉCAPITULATIF
    // ==============================

    let recapHTML = "";

    recapTexte = "";



    function ajouterProduit(nom, quantite, prix) {

        recapHTML +=
        "• " + nom +
        " × " + quantite +
        " — " +
        prix.toFixed(2) +
        " CHF<br>";


        recapTexte +=
        nom +
        " × " +
        quantite +
        " : " +
        prix.toFixed(2) +
        " CHF\n";

    }



    if (foieFigues > 0)
    ajouterProduit(
        "Foie gras figues",
        foieFigues,
        prixFoieFigues
    );


    if (foiePiment > 0)
    ajouterProduit(
        "Foie gras Piment & Porto",
        foiePiment,
        prixFoiePiment
    );


    if (magretHerbes > 0)
    ajouterProduit(
        "Magret Herbes de Provence",
        magretHerbes,
        prixMagretHerbes
    );


    if (magretPiment > 0)
    ajouterProduit(
        "Magret Piment d'Espelette",
        magretPiment,
        prixMagretPiment
    );


    if (saumonAneth > 0)
    ajouterProduit(
        "Saumon Aneth " + saumonAneth + " g",
        "",
        prixSaumonAneth
    );


    if (saumonPiment > 0)
    ajouterProduit(
        "Saumon Piment d'Espelette " + saumonPiment + " g",
        "",
        prixSaumonPiment
    );



    if (recapHTML === "") {

        recapHTML =
        "Aucun produit sélectionné.";

    }


    document.getElementById("recapCommande").innerHTML =
    recapHTML;



    return total;

}





// ==================================
// VIDER LE PANIER
// ==================================

function viderPanier() {


    document
    .querySelectorAll(".commande-card input[type='number']")
    .forEach(function(input){

        input.value = 0;

    });


    calculerTotal();


    alert(
        "Votre panier a été vidé."
    );

}





// ==================================
// ENVOI COMMANDE
// ==================================

function envoyerCommande(event) {


    event.preventDefault();



    const total =
    calculerTotal();



    if(total <= 0){

        alert(
        "⚠️ Votre panier est vide."
        );

        return;

    }



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



    const twint =
    document.querySelector('input[type="checkbox"]');



    if(!twint.checked){

        alert(
        "⚠️ Merci de confirmer le paiement TWINT."
        );

        return;

    }



    // PDF

    if(typeof genererPDFCommande === "function"){

        genererPDFCommande({

            nom:nom,
            email:email,
            adresse:adresse,
            recap:recapTexte,
            total:total.toFixed(2)

        });

    }




    // Sauvegarde commande


    const commande = {

        id:
        "IG-" + Date.now(),

        date:
        new Date().toLocaleString("fr-FR"),

        client:
        nom,

        telephone:
        telephone,

        email:
        email,

        adresse:
        adresse,

        produits:
        recapTexte,

        total:
        total.toFixed(2),

        commentaire:
        commentaire,

        statut:
        "Nouvelle"

    };



    let commandes =
    JSON.parse(
        localStorage.getItem("commandes")
    ) || [];



    commandes.push(commande);



    localStorage.setItem(
        "commandes",
        JSON.stringify(commandes)
    );





    // Email


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





// ==================================
// INITIALISATION
// ==================================

document.addEventListener(
"DOMContentLoaded",
calculerTotal
);
