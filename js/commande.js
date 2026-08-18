console.log("COMMANDE.JS CHARGE");


/* ===================================================
   IDÉE GOURMANDE
   commande.js
   Gestion complète du panier
   =================================================== */


/* ===================================================
   PANIER GLOBAL
   =================================================== */


let panierCommande = [];

window.panierCommande = panierCommande;



/* ===================================================
   BASE PRODUITS
   =================================================== */


const produits = {


    "foie-gras": {

        nom: "Foie gras de canard au torchon",

        prix: 35

    },


    "magret": {

        nom: "Magret de canard fumé et séché",

        prix: 25

    },


    "viande-sechee": {

        nom: "Viande séchée artisanale",

        prix: 45

    },


    "lard-sec": {

        nom: "Lard sec légèrement fumé",

        prix: 20

    },


    "saumon-fume": {

        nom: "Cœur de saumon fumé",

        prix: 8

    }


};




/* ===================================================
   INITIALISATION PAGE
   =================================================== */


document.addEventListener(
    "DOMContentLoaded",
    () => {


        initialiserBoutonsPanier();


        afficherPanier();



        const boutonVider =
        document.getElementById(
            "btnViderPanier"
        );


        if(boutonVider){

            boutonVider.addEventListener(
                "click",
                viderPanier
            );

        }



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


    console.log(
        "BOUTONS AJOUT PANIER :",
        boutons.length
    );



    boutons.forEach(
        bouton => {


            bouton.addEventListener(
                "click",
                () => {


                    ajouterAuPanier(
                        bouton.dataset.produit
                    );


                }

            );


        }

    );

   


}





/* ===================================================
   AJOUT ARTICLE
   =================================================== */


function ajouterAuPanier(reference){


    const produit =
    produits[reference];


    if(!produit){

        console.error(
            "Produit inconnu",
            reference
        );

        return;

    }



    const carte =
    document.querySelector(
        `.commande-card[data-produit="${reference}"]`
    );



    const article = {

        reference,

        nom: produit.nom,

        recette:
        getRecette(carte),

        quantite:1,

        poids:null,

        prix:0

    };



    switch(reference){


        case "foie-gras":

            article.quantite =
            lireQuantite(
                "foieQuantite"
            );

        break;



        case "magret":

            article.quantite =
            lireQuantite(
                "magretQuantite"
            );

        break;



        case "viande-sechee":

            article.quantite =
            lireQuantite(
                "viandeQuantite"
            );

        break;



        case "lard-sec":

            article.quantite =
            lireQuantite(
                "lardQuantite"
            );

        break;



        case "saumon-fume":

            article.poids =
            lirePoidsSaumon();


            if(article.poids < 100){

                alert(
                    "Veuillez choisir un poids pour le saumon."
                );

                return;

            }

        break;


    }



    if(
        article.quantite <=0
    ){

        alert(
            "Quantité invalide"
        );

        return;

    }



    article.prix =
    calculerPrixArticle(
        article
    );



    ajouterOuFusionner(
        article
    );



    window.panierCommande =
    panierCommande;



    afficherPanier();


}






/* ===================================================
   FUSION ARTICLES IDENTIQUES
   =================================================== */


function ajouterOuFusionner(article){


    const existant =
    panierCommande.find(
        a =>

        a.reference === article.reference

        &&

        (a.recette || "")
        ===
        (article.recette || "")

        &&

        Number(a.poids || 0)
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
    else{

    panierCommande.push(
        article
    );

}

} // <-- à ajouter ici

/* ===================================================
   CALCUL PRIX ARTICLE
   =================================================== */
/* ===================================================
   CALCUL PRIX ARTICLE
   =================================================== */


function calculerPrixArticle(article){


    const produit =
    produits[article.reference];


    if(!produit){

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


function getRecette(carte){


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
   LECTURE QUANTITES
   =================================================== */


function lireQuantite(id){


    const champ =
    document.getElementById(
        id
    );


    if(!champ){

        return 0;

    }



    return Number(
        champ.value
    );


}







/* ===================================================
   LECTURE POIDS SAUMON
   =================================================== */


function lirePoidsSaumon(){


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
   AFFICHAGE PANIER
   =================================================== */


function afficherPanier(){



    const zone =
    document.getElementById(
        "recapCommande"
    );


    const totalZone =
    document.getElementById(
        "total"
    );



    if(
        !zone
        ||
        !totalZone
    ){

        return;

    }





    if(
        panierCommande.length === 0
    ){


        zone.innerHTML =
        "<p>Aucun produit sélectionné.</p>";



        totalZone.textContent =
        "0.00 CHF";



        mettreAJourTitrePanier(0);


        return;

    }






    let html = "";

    let total = 0;

    let compteur = 0;





    panierCommande.forEach(
        (article,index)=>{


            if(
                article.reference === "saumon-fume"
            ){

                compteur++;

            }
            else{

                compteur +=
                article.quantite;

            }



            total +=
            article.prix;





            html += `


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





    zone.innerHTML =
    html;



    totalZone.textContent =
    total.toFixed(2)
    +
    " CHF";



    mettreAJourTitrePanier(
        compteur
    );


}







/* ===================================================
   DETAILS ARTICLE
   =================================================== */


function afficherDetailsArticle(article){


    let texte = "";



    if(article.recette){


        texte +=
        "Recette : "
        +
        article.recette
        +
        "<br>";

    }



    if(article.poids){


        texte +=
        article.poids
        +
        " g";

    }



    return texte;


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
   MODIFIER QUANTITE
   =================================================== */


function modifierQuantite(index, variation){


    const article =
    panierCommande[index];


    if(!article){

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







/* ===================================================
   EXPORT GLOBAL BOUTONS HTML
   =================================================== */
/* ===================================================
ENVOI COMMANDE
=================================================== */

function envoyerCommande(e){

    e.preventDefault();


    if(panierCommande.length === 0){

        alert(
            "Votre panier est vide."
        );

        return;

    }



    const commande = {


        client:{


            prenom:
            document.getElementById("prenom").value,


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
        panierCommande,


        total:
        panierCommande.reduce(
            (somme, article) =>
            somme + article.prix,
            0
        )


    };



    console.log(
        "COMMANDE PREPAREE :",
        commande
    );


    // Test disponibilité fonction ajout base

    alert("PASSAGE AVANT AJOUT COMMANDE");

console.log(
    "TEST AJOUT COMMANDE",
    typeof ajouterCommande
);


    // Enregistrement dans la base de données

    ajouterCommande({

        id: Date.now(),

        date:
        new Date().toLocaleDateString("fr-FR"),


        client:
        commande.client.prenom
        +
        " "
        +
        commande.client.nom,


        telephone:
        commande.client.telephone,


        email:
        commande.client.email,


        adresse:
        commande.client.adresse,


        commentaire:
        commande.client.commentaire,


produits:
commande.produits
.map(article =>
    article.nom
    +
    (
        article.poids
        ?
        " (" + article.poids + " g)"
        :
        (
            article.quantite > 1
            ?
            " x" + article.quantite
            :
            ""
        )
    )
)
.join("\n"),


produitsListe:
commande.produits,


        total:
        commande.total,


        statut:
        "Nouvelle"

    });



    genererPDFCommande(
        commande
    );



    alert(
        "Votre commande a été générée."
    );

}



window.ajouterAuPanier =
ajouterAuPanier;

window.modifierQuantite =
modifierQuantite;

window.supprimerArticle =
supprimerArticle;

window.viderPanier =
viderPanier;

window.envoyerCommande =
envoyerCommande;
