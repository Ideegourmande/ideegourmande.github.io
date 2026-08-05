console.log("COMMANDE.JS CHARGE");
/* ===================================================
   IDÉE GOURMANDE
   commande.js
   Partie 1/3
   Gestion panier et ajout produits
   =================================================== */


/* ===================================================
   VARIABLES GLOBALES
   =================================================== */


let panierCommande = [];


// Variable accessible pour pdfcommande.js

window.panierCommande = panierCommande;





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


        initialiserNomTwint();


    }

);









/* ===================================================
   BOUTONS AJOUT PANIER
   =================================================== */


function initialiserBoutonsPanier(){


    const boutons = document.querySelectorAll(
        ".ajouter-panier"
    );



    boutons.forEach(
        bouton => {


            bouton.addEventListener(
                "click",
                function(){


                    const produit =
                    bouton.dataset.produit;



                    ajouterAuPanier(produit);


                }

            );


        }

    );


}









/* ===================================================
   AJOUT AU PANIER
   =================================================== */


function ajouterAuPanier(reference){



    const produit = produits[reference];



    if(!produit){

        console.error(
            "Produit inconnu : ",
            reference
        );

        return;

    }






    const carte =
    document.querySelector(
        `[data-produit="${reference}"]`
    );



    let article = {

        reference:reference,

        nom:produit.nom,

        recette:getRecette(reference, carte),

        quantite:1,

        poids:null,

        prix:0

    };







    /*
       Gestion spécifique des produits
    */


    switch(reference){



        case "foie-gras":


            article.quantite =
            obtenirQuantite(
                "foieQuantite"
            );


            article.prix =
            produit.prix *
            article.quantite;


        break;







        case "magret":


            article.quantite =
            obtenirQuantite(
                "magretQuantite"
            );


            article.prix =
            produit.prix *
            article.quantite;


        break;








        case "viande-sechee":


            article.quantite =
            obtenirQuantite(
                "viandeQuantite"
            );


            article.prix =
            produit.prix *
            article.quantite;


        break;








        case "lard-sec":


            article.quantite =
            obtenirQuantite(
                "lardQuantite"
            );


            article.prix =
            produit.prix *
            article.quantite;


        break;








        case "saumon-fume":


            article.poids =
            obtenirPoidsSaumon();



            if(article.poids === 0){

                alert(
                    "Veuillez choisir un poids pour le saumon fumé."
                );

                return;

            }



            article.quantite =
            article.poids / 100;



            article.prix =
            produit.prix *
            article.quantite;



        break;


    }






    if(article.quantite <=0){

        alert(
            "Veuillez choisir une quantité valide."
        );

        return;

    }






    panierCommande.push(article);



    window.panierCommande =
    panierCommande;



    afficherPanier();



}









/* ===================================================
   LECTURE RECETTES
   =================================================== */


function getRecette(reference, carte){



    if(!carte){

        return "";

    }




    const choix =
    carte.querySelector(
        ".choix-recette input:checked"
    );



    if(choix){


        return choix.value;


    }



    return "";

}









/* ===================================================
   QUANTITES
   =================================================== */


function obtenirQuantite(id){



    const champ =
    document.getElementById(id);



    if(!champ){

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



    if(!champ){

        return 0;

    }



    return Number(
        champ.value
    );


}
/* ===================================================
   AFFICHAGE DU PANIER
   =================================================== */


function afficherPanier(){


    const zonePanier =
    document.getElementById(
        "recapCommande"
    );



    const zoneTotal =
    document.getElementById(
        "total"
    );



    if(!zonePanier || !zoneTotal){

        return;

    }







    if(panierCommande.length === 0){



        zonePanier.innerHTML =

        "<p>Aucun produit sélectionné.</p>";



        zoneTotal.textContent =
        "0.00 CHF";



        return;

    }







    let contenu = "";



    let total = 0;







    panierCommande.forEach(
        (article,index)=>{


            total += article.prix;





            contenu += `

            <div class="ligne-produit">


                <div>


                    <strong>
                    ${article.nom}
                    </strong>


                    <br>


                    ${afficherDetailsArticle(article)}


                </div>



                <div>


                    <strong>
                    ${article.prix.toFixed(2)} CHF
                    </strong>



                    <br>


                    <button
                    type="button"
                    class="btn-supprimer"
                    data-index="${index}">

                    Supprimer

                    </button>


                </div>



            </div>

            `;



        }

    );







    zonePanier.innerHTML = contenu;



    zoneTotal.textContent =
    total.toFixed(2) + " CHF";





    initialiserSuppression();

}









/* ===================================================
   DETAILS ARTICLE PANIER
   =================================================== */


function afficherDetailsArticle(article){



    let details = "";





    if(article.recette){


        details +=
        "Recette : "
        +
        article.recette
        +
        "<br>";

    }







    if(article.poids){


        details +=
        article.poids
        +
        " g";

    }

    else {


        details +=

        "Quantité : "
        +
        article.quantite;


    }




    return details;


}









/* ===================================================
   SUPPRESSION ARTICLE
   =================================================== */


function initialiserSuppression(){



    const boutons =
    document.querySelectorAll(
        ".btn-supprimer"
    );



    boutons.forEach(
        bouton => {



            bouton.addEventListener(
                "click",
                function(){



                    const index =
                    Number(
                        bouton.dataset.index
                    );



                    supprimerArticle(index);



                }

            );



        }

    );


}









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


document.addEventListener(
    "DOMContentLoaded",
    function(){



        const bouton =
        document.getElementById(
            "btnViderPanier"
        );



        if(bouton){



            bouton.addEventListener(
                "click",
                function(){


                    viderPanier();


                }

            );


        }



    }

);









function viderPanier(){



    panierCommande.length = 0;



    window.panierCommande =
    panierCommande;



    afficherPanier();



}
/* ===================================================
   GESTION NOM TWINT
   =================================================== */


function initialiserNomTwint(){


    const prenom =
    document.getElementById(
        "prenom"
    );


    const nom =
    document.getElementById(
        "nom"
    );


    const affichage =
    document.getElementById(
        "twintNomComplet"
    );



    if(!prenom || !nom || !affichage){

        return;

    }






    function mettreAJourNomTwint(){



        const nomComplet =

        prenom.value.trim()
        +
        " "
        +
        nom.value.trim();



        affichage.textContent =
        nomComplet;



    }







    prenom.addEventListener(
        "input",
        mettreAJourNomTwint
    );



    nom.addEventListener(
        "input",
        mettreAJourNomTwint
    );



}









/* ===================================================
   VALIDATION COMMANDE
   =================================================== */


document.addEventListener(
    "DOMContentLoaded",
    function(){



        const formulaire =
        document.getElementById(
            "formCommande"
        );



        if(formulaire){



            formulaire.addEventListener(
                "submit",
                envoyerCommande
            );



        }



    }

);









function envoyerCommande(event){



    event.preventDefault();







    if(panierCommande.length === 0){


        alert(
            "Votre panier est vide."
        );


        return;


    }








    const confirmationTwint =

    document.getElementById(
        "confirmationTwint"
    );





    if(
        confirmationTwint
        &&
        !confirmationTwint.checked
    ){


        alert(
            "Veuillez confirmer le paiement TWINT."
        );


        return;


    }










    const commande = {


        date:
        new Date()
        .toLocaleString(
            "fr-CH"
        ),



        client:{


            prenom:
            document.getElementById(
                "prenom"
            ).value,


            nom:
            document.getElementById(
                "nom"
            ).value,


            telephone:
            document.getElementById(
                "telephone"
            ).value,


            email:
            document.getElementById(
                "email"
            ).value,


            adresse:
            document.getElementById(
                "adresse"
            ).value,


            commentaire:
            document.getElementById(
                "commentaire"
            ).value


        },





        produits:
        panierCommande,





        total:
        calculerTotalCommande()


    };









    console.log(
        "Commande préparée :",
        commande
    );





    /*
       Disponible pour pdfcommande.js
    */


    window.commandeFinale =
    commande;









    if(
        typeof genererPDFCommande
        ===
        "function"
    ){


        genererPDFCommande(
            commande
        );


    }






    alert(
        "Merci pour votre commande. Elle a été préparée avec succès."
    );






}









/* ===================================================
   CALCUL TOTAL GLOBAL
   =================================================== */


function calculerTotalCommande(){



    let total = 0;



    panierCommande.forEach(
        article=>{


            total += article.prix;


        }

    );



    return Number(
        total.toFixed(2)
    );


}









/* ===================================================
   EXPORT POUR AUTRES MODULES
   =================================================== */


window.getPanierCommande =
function(){


    return panierCommande;


};



window.getTotalCommande =
function(){


    return calculerTotalCommande();


};
