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


        initialiserNomTwint();


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

    ...

    switch(reference){

        case "foie-gras":
        break;

        case "magret":
        break;

        case "viande-sechee":
        break;

        case "lard-sec":
        break;

        case "saumon-fume":

            ...

        break;

    }   // fermeture switch


    ... // calcul prix

}   // fermeture ajouterAuPanier
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


        mettreAJourTitrePanier(0);


        return;


    }





    let contenu = "";

    let total = 0;

    let nombreArticles = 0;





    panierCommande.forEach(
        (article,index)=>{


            /*
              Calcul du nombre d'articles
            */


            if(article.reference === "saumon-fume"){


                nombreArticles += 1;


            }
            else {


                nombreArticles +=
                article.quantite;


            }



            total +=
            article.prix;






            contenu += `


<div class="ligne-produit">



    <div class="infos-produit">


        <strong>
            ${article.nom}
        </strong>


        <br>


        ${afficherDetailsArticle(article)}



        ${
            article.reference !== "saumon-fume"

            ?

`
<div class="gestion-quantite">


<button
type="button"
class="btn-quantite moins"
onclick="modifierQuantite(${index},-1)">
−
</button>



<span>
${article.quantite}
</span>



<button
type="button"
class="btn-quantite plus"
onclick="modifierQuantite(${index},1)">
+
</button>


</div>
`

            :

""

        }


    </div>





    <div class="prix-produit">


        <strong>
            Sous-total :
        </strong>


        <br>


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



    if(!titre){

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



    return details;


}









/* ===================================================
   MODIFICATION QUANTITE
   =================================================== */


function modifierQuantite(index, variation){



    const article =
    panierCommande[index];



    if(!article){

        return;

    }





    /*
       Le saumon est géré par son poids
       et non par quantité
    */


    if(article.reference === "saumon-fume"){


        return;


    }





    article.quantite +=
    variation;





    if(article.quantite <= 0){


        supprimerArticle(index);


        return;


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
                viderPanier
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
   EXPORT GLOBAL
   =================================================== */


window.modifierQuantite =
modifierQuantite;



window.supprimerArticle =
supprimerArticle;
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



    if(
        !prenom
        ||
        !nom
        ||
        !affichage
    ){

        return;

    }






    function mettreAJourNomTwint(){


        const nomComplet =

        (
            prenom.value.trim()
            +
            " "
            +
            nom.value.trim()
        )
        .trim();



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
            lireChamp(
                "prenom"
            ),



            nom:
            lireChamp(
                "nom"
            ),



            telephone:
            lireChamp(
                "telephone"
            ),



            email:
            lireChamp(
                "email"
            ),



            adresse:
            lireChamp(
                "adresse"
            ),



            commentaire:
            lireChamp(
                "commentaire"
            )


        },






        produits:

        panierCommande.map(
            article => ({


                ...article


            })
        ),






        total:

        calculerTotalCommande()



    };









    console.log(
        "Commande préparée :",
        commande
    );







    window.commandeFinale =
    commande;







    /*
       Génération PDF
    */


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
   LECTURE CHAMP FORMULAIRE
   =================================================== */


function lireChamp(id){



    const champ =
    document.getElementById(id);



    if(!champ){

        return "";

    }



    return champ.value.trim();


}









/* ===================================================
   CALCUL TOTAL COMMANDE
   =================================================== */


function calculerTotalCommande(){



    let total = 0;



    panierCommande.forEach(
        article => {


            total +=
            Number(
                article.prix
            );


        }

    );




    return Number(
        total.toFixed(2)
    );


}









/* ===================================================
   EXPORTS POUR AUTRES MODULES
   =================================================== */


window.getPanierCommande =
function(){


    return panierCommande;


};





window.getTotalCommande =
function(){


    return calculerTotalCommande();


};





window.calculerTotalCommande =
calculerTotalCommande;
