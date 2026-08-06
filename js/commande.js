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



    const produit =
    produits[reference];



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







    fusionnerArticlePanier(
        article
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

    const produit = produits.find(p => p.id === id);

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

function calculerTotalCommande() {

    let total = 0;


    panierCommande.forEach(article => {

        total += calculerPrixArticle(article);

    });


    return Number(total.toFixed(2));

}



/* -----------------------------------------------------
   COMPTEUR ARTICLES
----------------------------------------------------- */

function calculerNombreArticles() {

    let nombre = 0;


    panierCommande.forEach(article => {


        // saumon = une commande de poids
        if (article.id === "saumon-fume") {

            nombre += 1;

        } else {

            nombre += Number(article.quantite || 1);

        }

    });


    return nombre;

}



/* -----------------------------------------------------
   AFFICHAGE PANIER
----------------------------------------------------- */

function afficherPanier() {


    const zonePanier = document.getElementById("recapCommande");

    if (!zonePanier) return;



    zonePanier.innerHTML = "";



    if (panierCommande.length === 0) {


        zonePanier.innerHTML = `
            <p class="panier-vide">
                Votre panier est vide.
            </p>
        `;


        mettreAJourCompteurPanier();

        return;

    }



    panierCommande.forEach((article,index)=>{


        let prix = calculerPrixArticle(article);



        let gestionQuantite = "";



        /*
          PRODUITS A LA PIECE
        */

        if (article.id !== "saumon-fume") {


            gestionQuantite = `

            <div class="gestion-quantite">

                <button 
                    class="btn-quantite"
                    onclick="modifierQuantite(${index}, -1)">
                    −
                </button>


                <span>
                    ${article.quantite || 1}
                </span>


                <button 
                    class="btn-quantite"
                    onclick="modifierQuantite(${index}, 1)">
                    +
                </button>

            </div>

            `;


        }


        /*
          SAUMON AU POIDS
        */

        else {


            gestionQuantite = `

            <div class="gestion-poids">

                <button 
                    class="btn-quantite"
                    onclick="modifierPoidsSaumon(${index}, -100)">
                    −
                </button>


                <span>
                    ${article.poids} g
                </span>


                <button 
                    class="btn-quantite"
                    onclick="modifierPoidsSaumon(${index}, 100)">
                    +
                </button>

            </div>

            `;


        }



        zonePanier.innerHTML += `

        <div class="panier-card">


            <h3>
                ${article.nom}
            </h3>


            <p>
                ${getRecette(article.id)}
            </p>


            ${gestionQuantite}


            <p class="prix-article">
                ${prix.toFixed(2)} CHF
            </p>


            <button 
                class="btn-supprimer"
                onclick="supprimerArticle(${index})">
                Supprimer
            </button>


        </div>

        `;


    });



    const total = document.getElementById("totalCommande");


    if (total) {

        total.textContent =
            calculerTotalCommande().toFixed(2) + " CHF";

    }


    mettreAJourCompteurPanier();

}




/* -----------------------------------------------------
   MODIFICATION QUANTITE
----------------------------------------------------- */

function modifierQuantite(index, variation) {


    let article = panierCommande[index];


    if (!article) return;



    article.quantite =
        Number(article.quantite || 1) + variation;



    if (article.quantite <= 0) {

        panierCommande.splice(index,1);

    }



    sauvegarderPanier();


    afficherPanier();

}



/* -----------------------------------------------------
   MODIFICATION POIDS SAUMON
----------------------------------------------------- */

function modifierPoidsSaumon(index, variation) {


    let article = panierCommande[index];


    if (!article) return;



    article.poids =
        Number(article.poids || 100) + variation;



    if (article.poids < 100) {

        article.poids = 100;

    }



    sauvegarderPanier();


    afficherPanier();

}



/* -----------------------------------------------------
   SUPPRESSION ARTICLE
----------------------------------------------------- */

function supprimerArticle(index) {


    panierCommande.splice(index,1);


    sauvegarderPanier();


    afficherPanier();

}



/* -----------------------------------------------------
   VIDAGE PANIER
----------------------------------------------------- */

function viderPanier() {


    panierCommande.length = 0;


    sauvegarderPanier();


    afficherPanier();

}



/* -----------------------------------------------------
   SAUVEGARDE LOCALSTORAGE
----------------------------------------------------- */

function sauvegarderPanier() {

    localStorage.setItem(
        "panierCommande",
        JSON.stringify(panierCommande)
    );

}



/* -----------------------------------------------------
   RESTAURATION PANIER
----------------------------------------------------- */

function chargerPanier() {


    const sauvegarde =
        localStorage.getItem("panierCommande");


    if (sauvegarde) {

       panierCommande.splice(
    0,
    panierCommande.length,
    ...JSON.parse(sauvegarde)
);


window.panierCommande = panierCommande;

    }

}



/* -----------------------------------------------------
   COMPTEUR PANIER
----------------------------------------------------- */

function mettreAJourCompteurPanier() {


    const compteur =
        document.getElementById("nombreArticles");


    if (compteur) {

        compteur.textContent =
            calculerNombreArticles();

    }

}
