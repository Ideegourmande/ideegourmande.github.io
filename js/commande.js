console.log("COMMANDE.JS CHARGE");


/* ===================================================
   IDÉE GOURMANDE
   commande.js
   Version complète corrigée
   Partie 1/4
   Produits + ajout panier
   =================================================== */


/* ===================================================
   VARIABLES GLOBALES
   =================================================== */


let panierCommande = [];


window.panierCommande =
panierCommande;





/* ===================================================
   BASE PRODUITS
   =================================================== */


const produits = {


    "foie-gras": {

        nom: "Foie gras de canard au torchon",

        unite: "200 g",

        prix: 35

    },


    "magret": {

        nom: "Magret de canard fumé et séché",

        unite: "pièce",

        prix: 25

    },


    "viande-sechee": {

        nom: "Viande séchée artisanale",

        unite: "portion 500 g",

        prix: 45

    },


    "lard-sec": {

        nom: "Lard sec légèrement fumé",

        unite: "portion 500 g",

        prix: 20

    },


    "saumon-fume": {

        nom: "Cœur de saumon fumé",

        unite: "100 g",

        prix: 8

    }


};








/* ===================================================
   INITIALISATION
   =================================================== */


document.addEventListener(
    "DOMContentLoaded",
    function(){


        initialiserBoutonsPanier();


        console.log(
            "INITIALISATION BOUTONS PANIER OK"
        );


    }
);








/* ===================================================
   BOUTONS AJOUT PANIER
   =================================================== */


function initialiserBoutonsPanier(){


    const boutons =
    document.querySelectorAll(
        ".ajouter-panier"
    );



    boutons.forEach(
        bouton => {


            bouton.addEventListener(
                "click",
                function(){


                    console.log(
    "CLIC AJOUT PANIER :",
    bouton.dataset.produit
);


ajouterAuPanier(
    bouton.dataset.produit
);


                }

            );


        }

    );


}








/* ===================================================
   AJOUT AU PANIER
   =================================================== */


function ajouterAuPanier(reference){

    console.log(
        "AJOUT PANIER APPELE :",
        reference
    );


    const produit =
    produits[reference];
console.log("PRODUIT :", produit);


    if(
        !produit
    ){

        console.error(
            "Produit inconnu :",
            reference
        );

        return;

    }




    const carte =
    document.querySelector(
        `.commande-card[data-produit="${reference}"]`
    );





    let article = {


        reference: reference,


        nom: produit.nom,


        recette:
        getRecette(
            reference,
            carte
        ),


        quantite: 1,


        poids: null,


        prix: 0


    };







    switch(reference){



        case "foie-gras":


            article.quantite =
            obtenirQuantite(
                "foieQuantite"
            );


        break;





        case "magret":


            article.quantite =
            obtenirQuantite(
                "magretQuantite"
            );


        break;





        case "viande-sechee":


            article.quantite =
            obtenirQuantite(
                "viandeQuantite"
            );


        break;





        case "lard-sec":


            article.quantite =
            obtenirQuantite(
                "lardQuantite"
            );


        break;





        case "saumon-fume":


            article.poids =
            obtenirPoidsSaumon();



            if(
                article.poids <= 0
            ){

                alert(
                    "Veuillez choisir un poids pour le saumon fumé."
                );

                return;

            }



            article.quantite = 1;


        break;


    }







    if(
        article.quantite <= 0
    ){

        alert(
            "Veuillez choisir une quantité valide."
        );

        return;

    }







    article.prix =
    calculerPrixArticle(
        article
    );
console.log("ARTICLE :", article);






    fusionnerArticlePanier(
        article
    );
console.log(
    "PANIER APRES AJOUT :",
    panierCommande
);






    window.panierCommande =
    panierCommande;







    document.addEventListener(
    "DOMContentLoaded",
    function(){

        initialiserBoutonsPanier();

        console.log(
            "INITIALISATION BOUTONS PANIER OK"
        );

    }
);


}








/* ===================================================
   FUSION ARTICLES IDENTIQUES
   =================================================== */


function fusionnerArticlePanier(article){



    const recette =
    (article.recette || "")
    .trim();




    const existant =
    panierCommande.find(
        item =>


        item.reference === article.reference


        &&


        (item.recette || "")
        .trim()
        ===
        recette


        &&


        Number(item.poids || 0)
        ===
        Number(article.poids || 0)


    );





    if(
        existant
    ){


        existant.quantite +=
        article.quantite;



        existant.prix =
        calculerPrixArticle(
            existant
        );


    }
    else {


        article.recette =
        recette;


        panierCommande.push(
            article
        );


    }


}
/* =====================================================
   PARTIE 2 - PANIER / CALCULS / QUANTITES
   ===================================================== */


/* -----------------------------------------------------
   RECUPERATION RECETTE PRODUIT
----------------------------------------------------- */

function getRecette(id) {

    const produit = produits[id];


    if (!produit) {
        return "";
    }


    return produit.recette || "";

}

/* -----------------------------------------------------
   CALCUL PRIX ARTICLE
----------------------------------------------------- */

function calculerPrixArticle(article) {

    if (!article) return 0;


    // Produits au poids (ex : saumon fumé)
    if (article.id === "saumon-fume") {

        let poids = Number(article.poids || 100);

        let prix100g = article.prix || 0;

        return (poids / 100) * prix100g;

    }


    // Produits à la pièce
    let quantite = Number(article.quantite || 1);

    return article.prix * quantite;

}



/* -----------------------------------------------------
   CALCUL TOTAL COMMANDE
----------------------------------------------------- */
/* ===================================================
   PARTIE 2
   Calculs + affichage panier
   =================================================== */


/* ===================================================
   CALCUL PRIX ARTICLE
   =================================================== */


function calculerPrixArticle(article){


    const produit =
    produits[article.reference];



    if(
        !produit
    ){

        return 0;

    }




    if(
        article.reference === "saumon-fume"
    ){


        return Number(

            (
                produit.prix
                *
                article.poids
                /
                100

            )
            .toFixed(2)

        );


    }




    return Number(

        (
            produit.prix
            *
            article.quantite

        )
        .toFixed(2)

    );


}








/* ===================================================
   RECETTE
   =================================================== */


function getRecette(reference, carte){


    if(
        !carte
    ){

        return "";

    }



    const choix =
    carte.querySelector(
        ".choix-recette input:checked"
    );



    return choix
    ?
    choix.value
    :
    "";


}








/* ===================================================
   QUANTITE PRODUIT
   =================================================== */

console.log("PARTIE 2 CHARGEE");
console.log("AVANT OBTENIR QUANTITE");
function obtenirQuantite(id){


    const champ =
    document.getElementById(
        id
    );



    if(
        !champ
    ){

        return 0;

    }



    return Number(
        champ.value
    );


}


console.log(
    "TEST FONCTION QUANTITE :",
    typeof obtenirQuantite
);





/* ===================================================
   POIDS SAUMON
   =================================================== */


function obtenirPoidsSaumon(){


    const champ =
    document.getElementById(
        "saumonPoids"
    );



    if(
        !champ
    ){

        return 0;

    }



    return Number(
        champ.value
    );


}








/* ===================================================
   AFFICHAGE PANIER
   =================================================== */

console.log("APPEL afficherPanier()");
function afficherPanier(){


    console.log(
        "AFFICHAGE PANIER CHARGE"
    );



    const zonePanier =
    document.getElementById(
        "recapCommande"
    );



    const zoneTotal =
    document.getElementById(
        "total"
    );



    if(
        !zonePanier
        ||
        !zoneTotal
    ){

        return;

    }




    if(
        panierCommande.length === 0
    ){


        zonePanier.innerHTML =
        "<p>Aucun produit sélectionné.</p>";



        zoneTotal.textContent =
        "0.00 CHF";



        mettreAJourTitrePanier(0);


        return;


    }






    let contenu = "";

    let total = 0;

    let nombreArticles = 0;





    panierCommande.forEach(
        (article,index)=>{


            if(
                article.reference === "saumon-fume"
            ){

                nombreArticles += 1;

            }
            else{

                nombreArticles +=
                Number(
                    article.quantite
                );

            }



            total +=
            Number(
                article.prix
            );





            contenu += `


<div class="ligne-produit">


<div class="infos-produit">


<strong>
${article.nom}
</strong>


<br>


${afficherDetailsArticle(article)}



</div>




<div class="prix-produit">


<strong>
${article.prix.toFixed(2)} CHF
</strong>



<br><br>



<button
type="button"
class="btn-supprimer"
onclick="supprimerArticle(${index})">

Supprimer

</button>


</div>


</div>


`;



        }

    );





    zonePanier.innerHTML =
    contenu;



    zoneTotal.textContent =
    total.toFixed(2)
    +
    " CHF";



    mettreAJourTitrePanier(
        nombreArticles
    );


}








/* ===================================================
   TITRE PANIER
   =================================================== */


function mettreAJourTitrePanier(nombre){


    const titre =
    document.getElementById(
        "titrePanier"
    );



    if(
        !titre
    ){

        return;

    }



    titre.textContent =

    "🛒 Votre panier ("
    +
    nombre
    +
    " article"
    +
    (
        nombre > 1
        ?
        "s"
        :
        ""
    )
    +
    ")";


}








/* ===================================================
   DETAILS ARTICLE
   =================================================== */


function afficherDetailsArticle(article){


    let details = "";



    if(
        article.recette
    ){

        details +=
        "Recette : "
        +
        article.recette
        +
        "<br>";

    }




    if(
        article.poids
    ){

        details +=
        article.poids
        +
        " g";

    }



    return details;


}
