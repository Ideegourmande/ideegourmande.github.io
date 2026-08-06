console.log("COMMANDE.JS CHARGE");
/* ===================================================
   PANIER GLOBAL
   =================================================== */


let panierCommande = [];


window.panierCommande = panierCommande;

/* ===================================================
   IDÉE GOURMANDE
   commande.js
   Partie 1/3
   Gestion produits et ajout panier
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



        if(
            typeof afficherPanier === "function"
        ){

            afficherPanier();

        }



        if(
            typeof initialiserNomTwint === "function"
        ){

            initialiserNomTwint();

        }



        const formulaire =
        document.getElementById(
            "formCommande"
        );



        if(
            formulaire
        ){

            formulaire.addEventListener(
                "submit",
                envoyerCommande
            );

        }



        const boutonVider =
        document.getElementById(
            "btnViderPanier"
        );



        if(
            boutonVider
        ){

            boutonVider.addEventListener(
                "click",
                viderPanier
            );

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



    console.log(
        "BOUTONS AJOUT PANIER :",
        boutons.length
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



    afficherPanier();


}






/* ===================================================
   FUSION ARTICLES IDENTIQUES
   =================================================== */


function fusionnerArticlePanier(article){



    const existant =
    panierCommande.find(
        item =>

        item.reference === article.reference

        &&

        (item.recette || "")
        ===
        (article.recette || "")

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
    else{


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
/* ===================================================
   Partie 2/3
   Affichage panier et gestion quantités
   =================================================== */


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
   QUANTITES
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
   AFFICHAGE PANIER
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




<div class="gestion-quantite">



<button
type="button"
class="btn-quantite moins"
onclick="modifierQuantite(${index},-1)">

−

</button>



<span>

${
article.reference === "saumon-fume"
?
article.poids + " g"
:
article.quantite
}

</span>




<button
type="button"
class="btn-quantite plus"
onclick="modifierQuantite(${index},1)">

+

</button>


</div>



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




    if(
        article.reference === "saumon-fume"
    ){


        article.poids +=
        variation * 100;



        if(
            article.poids < 100
        ){

            supprimerArticle(index);

            return;

        }


    }
    else{


        article.quantite +=
        variation;



        if(
            article.quantite <= 0
        ){

            supprimerArticle(index);

            return;

        }

    }





    article.prix =
    calculerPrixArticle(
        article
    );



    window.panierCommande =
    panierCommande;



    afficherPanier();


}








/* ===================================================
   SUPPRESSION ARTICLE
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
   VIDER PANIER
   =================================================== */


function viderPanier(){


    panierCommande.length = 0;



    window.panierCommande =
    panierCommande;



    afficherPanier();


}


