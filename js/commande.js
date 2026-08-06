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


        if(typeof initialiserNomTwint === "function"){

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



    if(!produit){


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



            if(article.poids <= 0){


                alert(
                    "Veuillez choisir un poids pour le saumon fumé."
                );


                return;


            }



            article.quantite = 1;


        break;



    }







    if(article.quantite <= 0){


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





    if(existant){


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



    if(!produit){


        return 0;


    }




    if(article.reference === "saumon-fume"){



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
   RECETTES
   =================================================== */


function getRecette(reference, carte){



    if(!carte){


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
console.log("ARRIVEE AVANT AFFICHAGE PANIER");
console.log("AFFICHAGE PANIER CHARGE");

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
              Calcul du nombre réel d'articles
            */


            if(article.reference === "saumon-fume"){


                nombreArticles += 1;


            }
            else {


                nombreArticles +=
                Number(article.quantite);


            }





            total +=
            Number(article.prix);





            contenu += `


<div class="ligne-produit">


    <div class="infos-produit">


        <strong>
        ${article.nom}
        </strong>


        <br>


        ${afficherDetailsArticle(article)}



        ${
article.reference === "saumon-fume"

?

`
<div class="gestion-quantite">

<button
type="button"
class="btn-quantite moins"
onclick="modifierQuantite(${index},-100)">
−
</button>

<span>
${article.poids} g
</span>

<button
type="button"
class="btn-quantite plus"
onclick="modifierQuantite(${index},100)">
+
</button>

</div>
`

:

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



   if(article.reference === "saumon-fume"){

    article.poids += variation;

    if(article.poids < 100){

        supprimerArticle(index);
        return;

    }

    article.prix = calculerPrixArticle(article);

    window.panierCommande = panierCommande;

    afficherPanier();

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
        document.querySelector(
            "#btnViderPanier"
        );


        if(!bouton){

            console.warn(
                "Bouton vider panier introuvable"
            );

            return;

        }



        bouton.addEventListener(
            "click",
            function(){

                viderPanier();

            }

        );


        console.log(
            "Bouton vider panier activé"
        );


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


        affichage.textContent =

        prenom.value.trim()
        +
        " "
        +
        nom.value.trim();


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
        panierCommande,





        total:
        calculerTotalCommande()



    };






    console.log(
        "Commande préparée :",
        commande
    );





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
        "Merci pour votre commande. Elle a été enregistrée."
    );



}









/* ===================================================
   LECTURE CHAMP FORMULAIRE
   =================================================== */


function lireChamp(id){



    const champ =
    document.getElementById(
        id
    );



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

/* ===================================================
   INITIALISATION FORMULAIRE COMMANDE
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


            console.log(
                "FORMULAIRE COMMANDE CONNECTÉ"
            );


        }
        else {


            console.error(
                "Formulaire formCommande introuvable"
            );


        }


    }

);
