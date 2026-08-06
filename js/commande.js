console.log("COMMANDE.JS CHARGE");


/* ===================================================
   IDÉE GOURMANDE
   commande.js
   Partie 1/4
   Gestion panier et ajout produits
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


        afficherPanier();


        if(
            typeof initialiserNomTwint === "function"
        ){

            initialiserNomTwint();

        }


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
            "Produit inconnu : ",
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






    afficherPanier();



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
   QUANTITE
   =================================================== */


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
   MODIFICATION QUANTITE
   =================================================== */


function modifierQuantite(index, variation){



    const article =
    panierCommande[index];



    if(
        !article
    ){

        return;

    }





    /*
       Gestion spécifique saumon
    */


    if(
        article.reference === "saumon-fume"
    ){



        article.poids +=
        variation;



        if(
            article.poids < 100
        ){

            supprimerArticle(index);

            return;

        }



        article.prix =
        calculerPrixArticle(
            article
        );


        afficherPanier();


        return;


    }





    /*
       Produits classiques
    */


    article.quantite +=
    variation;




    if(
        article.quantite <= 0
    ){

        supprimerArticle(index);

        return;

    }





    article.prix =
    calculerPrixArticle(
        article
    );



    afficherPanier();


}









/* ===================================================
   SUPPRIMER UN ARTICLE
   =================================================== */


function supprimerArticle(index){



    panierCommande.splice(
        index,
        1
    );



    window.panierCommande =
    panierCommande;



    afficherPanier();


}









/* ===================================================
   VIDER LE PANIER
   =================================================== */


function viderPanier(){



    panierCommande.length = 0;



    window.panierCommande =
    panierCommande;



    afficherPanier();


}







/* ===================================================
   BOUTON VIDER PANIER
   =================================================== */


document.addEventListener(
    "DOMContentLoaded",
    function(){


        const bouton =
        document.getElementById(
            "btnViderPanier"
        );



        if(
            bouton
        ){


            bouton.addEventListener(
                "click",
                viderPanier
            );


            console.log(
                "Bouton vider panier activé"
            );


        }


    }

);
