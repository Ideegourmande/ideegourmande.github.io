// ===================================================
// COMMANDE.JS
// Idée Gourmande V2
// Gestion du panier et calcul des commandes
// ===================================================


// ===================================================
// PRODUITS
// ===================================================


const produits = {

    foieGras: {

        nom: "Foie gras de canard au torchon",

        prix: 35,

        unite: "200 g"

    },


    magret: {

        nom: "Magret de canard fumé et séché",

        prix: 25,

        unite: "pièce"

    },


    viandeSechee: {

        nom: "Viande séchée artisanale",

        prix: 45,

        unite: "500 g",

        poidsVariable: true

    },


    lardSec: {

        nom: "Lard sec légèrement fumé",

        prix: 20,

        unite: "500 g",

        poidsVariable: true

    },


    saumon: {

        nom: "Cœur de saumon fumé",

        prix: 8,

        unite: "100 g",

        poidsVariable: true

    }

};







// ===================================================
// CALCUL DU TOTAL
// ===================================================


function calculerTotal() {


    let total = 0;


    let panier = [];






    // =========================
    // FOIE GRAS
    // =========================


    let foie = Number(
        document.getElementById("foieGras").value
    );



    if (foie > 0) {


        let recette =
            document.getElementById("foieRecette").value;



        let nomRecette =
            recette === "figues"
            ?
            "Gelée de figues au vin de messe"
            :
            "Piment d'Espelette & Porto Calem";



        let prix = foie * produits.foieGras.prix;



        total += prix;



        panier.push({

            nom:
            produits.foieGras.nom,

            detail:
            nomRecette,

            quantite:
            foie + " x 200 g",

            prix:
            prix

        });


    }






    // =========================
    // MAGRET
    // =========================


    let magret = Number(
        document.getElementById("magret").value
    );



    if (magret > 0) {


        let recette =
            document.getElementById("magretRecette").value;



        let nomRecette =
            recette === "herbes"
            ?
            "Herbes de Provence"
            :
            "Piment d'Espelette";



        let prix =
            magret * produits.magret.prix;



        total += prix;



        panier.push({

            nom:
            produits.magret.nom,

            detail:
            nomRecette,

            quantite:
            magret + " pièce(s)",

            prix:
            prix

        });


    }
// =========================
// VIANDE SÉCHÉE
// =========================


let viande = Number(
    document.getElementById("viandeSechee").value
);



if (viande > 0) {


    let prix =
        viande * produits.viandeSechee.prix;



    total += prix;



    panier.push({

        nom:
        produits.viandeSechee.nom,

        detail:
        "Poids réel confirmé lors de la préparation",

        quantite:
        viande + " x 500 g",

        prix:
        prix

    });


}






// =========================
// LARD SEC
// =========================


let lard = Number(
    document.getElementById("lardSec").value
);



if (lard > 0) {


    let prix =
        lard * produits.lardSec.prix;



    total += prix;



    panier.push({

        nom:
        produits.lardSec.nom,

        detail:
        "Poids réel confirmé lors de la préparation",

        quantite:
        lard + " x 500 g",

        prix:
        prix

    });


}







// =========================
// SAUMON
// =========================


let saumon = Number(
    document.getElementById("saumonPoids").value
);



if (saumon > 0) {


    let quantite100 =
        saumon / 100;



    let prix =
        quantite100 * produits.saumon.prix;



    total += prix;



    panier.push({

        nom:
        produits.saumon.nom,

        detail:
        "Poids réel confirmé lors de la préparation",

        quantite:
        saumon + " g",

        prix:
        prix

    });


}








// =========================
// AFFICHAGE PANIER
// =========================


afficherPanier(panier);




document.getElementById("total").innerHTML =

    total.toFixed(2) + " CHF";



}





// ===================================================
// AFFICHER PANIER
// ===================================================


function afficherPanier(panier) {


    let zone =
        document.getElementById("recapCommande");



    if (panier.length === 0) {


        zone.innerHTML =

        "Aucun produit sélectionné.";


        return;

    }





    let html = "";



    panier.forEach(produit => {



        html += `

        <div class="ligne-produit">


            <div>


                <strong>
                ${produit.nom}
                </strong>


                <br>


                ${produit.detail}


                <br>


                ${produit.quantite}


            </div>



            <div>


                ${produit.prix.toFixed(2)} CHF


            </div>


        </div>

        `;


    });





    zone.innerHTML = html;


}
// ===================================================
// BOUTON VIDER PANIER
// ===================================================


document
.getElementById("btnViderPanier")
.addEventListener("click", function(){


    document.getElementById("foieGras").value = 0;


    document.getElementById("magret").value = 0;


    document.getElementById("viandeSechee").value = 0;


    document.getElementById("lardSec").value = 0;


    document.getElementById("saumonPoids").value = 0;



    calculerTotal();


});








// ===================================================
// ENVOI COMMANDE
// ===================================================


function envoyerCommande(event) {


    event.preventDefault();



    let commande = {


        date:
        new Date().toLocaleString("fr-CH"),



        client: {


            nom:
            document.getElementById("nom").value,


            telephone:
            document.getElementById("telephone").value,


            email:
            document.getElementById("email").value,


            adresse:
            document.getElementById("adresse").value,


            commentaire:
            document.getElementById("commentaire").value


        },



        produits:
        recupererCommande(),



        total:
        document
        .getElementById("total")
        .innerText


    };






    // Sauvegarde locale provisoire
    // Sera remplacée plus tard par la base de données


    let commandes =
        JSON.parse(
            localStorage.getItem("commandes")
        )
        ||
        [];



    commandes.push(commande);



    localStorage.setItem(

        "commandes",

        JSON.stringify(commandes)

    );







    alert(

        "Merci pour votre commande. Elle sera confirmée après vérification du paiement TWINT."

    );



    window.location.href =
    "confirmation.html";



}








// ===================================================
// RÉCUPÉRER COMMANDE
// ===================================================


function recupererCommande() {


    let produitsCommande = [];



    let recap =
    document.getElementById("recapCommande")
    .innerText;



    produitsCommande.push({

        recap:
        recap


    });



    return produitsCommande;


}








// ===================================================
// NOM POUR TWINT
// ===================================================


document
.getElementById("nom")
.addEventListener("input", function(){


    document
    .getElementById("twintNomComplet")
    .innerText =
    this.value;


});
