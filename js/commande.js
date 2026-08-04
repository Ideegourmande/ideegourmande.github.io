// ===================================================
// COMMANDE.JS
// Idée Gourmande V2
// Gestion panier artisanat
// ===================================================


// ===================================================
// VARIABLES GLOBALES
// ===================================================


let panierActuel = [];



let foieRecetteValidee = null;

let saumonRecetteValidee = null;






// ===================================================
// PRIX
// ===================================================


const PRIX = {


    foieGras: 35,


    magret: 25,


    viandeSechee: 45,


    lardSec: 20,


    saumon: 8


};








// ===================================================
// VALIDATION RECETTE FOIE GRAS
// ===================================================


function validerFoie() {


    let choix =
    document.querySelector(
        'input[name="foieRecette"]:checked'
    );



    if(!choix){


        alert(
            "Veuillez choisir une recette de foie gras."
        );


        return;


    }



    foieRecetteValidee = choix.value;



    let texte =
    choix.value === "figues"

    ?

    "Gelée de figues au vin de messe"

    :

    "Piment d'Espelette & Porto Calem";



    document
    .getElementById("foieSelection")
    .innerHTML =

    "✅ Recette sélectionnée : " + texte;



}







// ===================================================
// VALIDATION RECETTE SAUMON
// ===================================================


function validerSaumon(){


    let choix =
    document.querySelector(
        'input[name="saumonRecette"]:checked'
    );



    if(!choix){


        alert(
            "Veuillez choisir une recette de saumon."
        );


        return;


    }



    saumonRecetteValidee = choix.value;



    let texte =
    choix.value === "aneth"

    ?

    "Aneth"

    :

    "Piment d'Espelette";



    document
    .getElementById("saumonSelection")
    .innerHTML =

    "✅ Recette sélectionnée : " + texte;



}

// ===================================================
// CALCUL DU PANIER
// ===================================================


function calculerTotal(){


    panierActuel = [];


    let total = 0;





    // ===================================================
    // FOIE GRAS
    // ===================================================


    let foieQuantite =
    Number(
        document.getElementById("foieQuantite").value
    );



    if(foieQuantite > 0){


        if(!foieRecetteValidee){


            alert(
                "Veuillez valider la recette du foie gras."
            );


            return;


        }



        let recette =

        foieRecetteValidee === "figues"

        ?

        "Gelée de figues au vin de messe"

        :

        "Piment d'Espelette & Porto Calem";



        let prix =
        foieQuantite * PRIX.foieGras;



        total += prix;



        panierActuel.push({


            produit:
            "Foie gras de canard au torchon",


            detail:
            recette,


            quantite:
            foieQuantite + " x 200 g",


            prix:
            prix


        });



    }







    // ===================================================
    // MAGRET
    // ===================================================


    let magret =
    Number(
        document.getElementById("magret").value
    );



    if(magret > 0){


        let recette =
        document.getElementById("magretRecette").value;



        let detail =

        recette === "herbes"

        ?

        "Herbes de Provence"

        :

        "Piment d'Espelette";



        let prix =
        magret * PRIX.magret;



        total += prix;



        panierActuel.push({


            produit:
            "Magret de canard fumé et séché",


            detail:
            detail,


            quantite:
            magret + " pièce(s)",


            prix:
            prix



        });



    }








    // ===================================================
    // VIANDE SÉCHÉE
    // ===================================================


    let viande =
    Number(
        document.getElementById("viandeSechee").value
    );



    if(viande > 0){



        let prix =
        (viande / 500) * PRIX.viandeSechee;



        total += prix;



        panierActuel.push({


            produit:
            "Viande séchée artisanale",


            detail:
            "Poids réel confirmé lors de la préparation",


            quantite:
            viande + " g",


            prix:
            prix


        });


    }





    // ===================================================
    // LARD SEC
    // ===================================================


    let lard =
    Number(
        document.getElementById("lardSec").value
    );



    if(lard > 0){


        let prix =
        (lard / 500) * PRIX.lardSec;



        total += prix;



        panierActuel.push({


            produit:
            "Lard sec légèrement fumé",


            detail:
            "Poids réel confirmé lors de la préparation",


            quantite:
            lard + " g",


            prix:
            prix



        });



    }
// ===================================================
// SAUMON FUMÉ
// ===================================================


let saumonPoids =

Number(
    document.getElementById("saumonPoids").value
);



if(saumonPoids > 0){



    if(!saumonRecetteValidee){


        alert(
            "Veuillez valider la recette du saumon."
        );


        return;


    }




    let recette =

    saumonRecetteValidee === "aneth"

    ?

    "Aneth"

    :

    "Piment d'Espelette";





    let prix =

    (saumonPoids / 100) * PRIX.saumon;




    total += prix;




    panierActuel.push({



        produit:

        "Cœur de saumon fumé",



        detail:

        recette,



        quantite:

        saumonPoids + " g",



        prix:

        prix



    });



}







// Affichage

afficherPanier();




document
.getElementById("total")
.innerHTML =

total.toFixed(2) + " CHF";



}










// ===================================================
// AFFICHAGE PANIER
// ===================================================


function afficherPanier(){


    let zone =

    document.getElementById(
        "recapCommande"
    );




    if(panierActuel.length === 0){


        zone.innerHTML =

        "Aucun produit sélectionné.";


        return;


    }






    let html = "";




    panierActuel.forEach(article => {



        html += `


        <div class="ligne-produit">


            <div>


                <strong>
                ${article.produit}
                </strong>


                <br>


                ${article.detail}


                <br>


                ${article.quantite}


            </div>



            <strong>

            ${article.prix.toFixed(2)} CHF

            </strong>



        </div>


        `;



    });




    zone.innerHTML = html;



}









// ===================================================
// VIDER PANIER
// ===================================================


document
.getElementById("btnViderPanier")
.addEventListener(
"click",
function(){



    panierActuel = [];



    foieRecetteValidee = null;


    saumonRecetteValidee = null;




    document
    .getElementById("foieQuantite")
    .value = 0;



    document
    .getElementById("magret")
    .value = 0;



    document
    .getElementById("viandeSechee")
    .value = 0;



    document
    .getElementById("lardSec")
    .value = 0;



    document
    .getElementById("saumonPoids")
    .value = 0;




    document
    .getElementById("foieSelection")
    .innerHTML =

    "Aucune recette sélectionnée.";



    document
    .getElementById("saumonSelection")
    .innerHTML =

    "Aucune recette sélectionnée.";




    afficherPanier();



    document
    .getElementById("total")
    .innerHTML =

    "0.00 CHF";



});









// ===================================================
// ENVOI COMMANDE
// ===================================================


function envoyerCommande(event){


    event.preventDefault();




    let commande = {



        date:

        new Date()
        .toLocaleString("fr-CH"),




        client:{


            nom:

            document
            .getElementById("nom")
            .value,



            telephone:

            document
            .getElementById("telephone")
            .value,



            email:

            document
            .getElementById("email")
            .value,



            adresse:

            document
            .getElementById("adresse")
            .value,



            commentaire:

            document
            .getElementById("commentaire")
            .value


        },




        produits:

        panierActuel,




        total:

        document
        .getElementById("total")
        .innerText



    };






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

    "Votre commande a été enregistrée. Elle sera confirmée après vérification du paiement."

    );




    window.location.href =
    "confirmation.html";



}









// ===================================================
// NOM TWINT
// ===================================================


document
.getElementById("nom")
.addEventListener(
"input",
function(){


document
.getElementById("twintNomComplet")
.innerText =
this.value;


});
