// ======================================
// IDEE GOURMANDE - GESTION DES ACHATS
// Version 1.3.0
// Compatible database.js 2.1.0
// Compatible js-stock.js 2.2.0
// Compatible js-fournisseurs.js 1.1.1
// ======================================


let achatEdition = -1;

let lignesAchat = [];


//--------------------------------------
// Vérification base de données
//--------------------------------------

function verifierAchatsDB(){


    if(typeof db === "undefined"){

        console.error(
            "database.js doit être chargé avant js-achats.js"
        );

        return false;

    }


    db.achats ??= [];

    db.mouvements ??= [];

    db.articles ??= [];

    db.clients ??= [];


    return true;

}



//--------------------------------------
// Sauvegarde centrale
//--------------------------------------

function sauvegarderAchats(){


    if(typeof sauvegarderDB === "function"){

        sauvegarderDB();

    }


}



//--------------------------------------
// Génération numéro achat
//--------------------------------------

function genererNumeroAchat(){


    return "ACH-" + Date.now();


}



//--------------------------------------
// Nouveau achat
//--------------------------------------

function nouvelAchat(){


    achatEdition = -1;


    lignesAchat = [];



    const fournisseur =
    document.getElementById(
        "achatFournisseur"
    );


    const date =
    document.getElementById(
        "achatDate"
    );



    if(fournisseur){

        fournisseur.value = "";

    }



    if(date){

        date.value =

        new Date()

        .toISOString()

        .split("T")[0];

    }



    afficherLignesAchat();



    const popup =

    document.getElementById(
        "popupAchat"
    );



    if(popup){

        popup.style.display = "flex";

    }


}



//--------------------------------------
// Ajouter ligne achat
//--------------------------------------

function ajouterLigneAchat(){


    const selectArticle =

    document.getElementById(
        "achatArticle"
    );


    const inputQuantite =

    document.getElementById(
        "achatQuantite"
    );


    const inputPrix =

    document.getElementById(
        "achatPrix"
    );



    if(
        !selectArticle ||
        !inputQuantite ||
        !inputPrix
    ){

        return;

    }



    const article =

    selectArticle.value;



    const quantite =

    Number(inputQuantite.value) || 0;



    const prix =

    Number(inputPrix.value) || 0;



    if(article === ""){


        alert(
            "Sélectionnez un article."
        );


        return;

    }



    if(quantite <= 0){


        alert(
            "La quantité doit être supérieure à zéro."
        );


        return;

    }



    if(prix < 0){


        alert(
            "Le prix est incorrect."
        );


        return;

    }



    lignesAchat.push({

        article,

        quantite,

        prix

    });



    afficherLignesAchat();


}



//--------------------------------------
// Affichage lignes achat
//--------------------------------------

function afficherLignesAchat(){


    const zone =

    document.getElementById(
        "listeAchat"
    );



    if(!zone){

        return;

    }



    zone.innerHTML = "";



    let total = 0;



    lignesAchat.forEach((ligne,index)=>{


        const montant =

        ligne.quantite *

        ligne.prix;



        total += montant;



        zone.innerHTML += `


        <div class="ligne-produit">


            <span>

                ${ligne.article}

                (${ligne.quantite})

            </span>



            <strong>

                ${montant.toFixed(2)} CHF

            </strong>



            <button onclick="supprimerLigneAchat(${index})">

                ❌

            </button>


        </div>


        `;


    });



    const totalZone =

    document.getElementById(
        "totalAchat"
    );



    if(totalZone){

        totalZone.textContent =

        total.toFixed(2) + " CHF";

    }


}



//--------------------------------------
// Supprimer ligne achat
//--------------------------------------

function supprimerLigneAchat(index){


    lignesAchat.splice(

        index,

        1

    );


    afficherLignesAchat();


}
//--------------------------------------
// Enregistrer achat
//--------------------------------------

function enregistrerAchat(){


    if(!verifierAchatsDB())
        return;



    const fournisseurNom =

    document.getElementById(
        "achatFournisseur"
    )
    ?.value
    ?.trim();



    if(!fournisseurNom){


        alert(
            "Veuillez saisir le fournisseur."
        );


        return;

    }



    if(lignesAchat.length === 0){


        alert(
            "Ajoutez au moins un article."
        );


        return;

    }




    //----------------------------------
    // Recherche fournisseur existant
    //----------------------------------

    let fournisseur =

    db.clients.find(client =>


        client.type === "Fournisseur"

        &&

        client.nom?.toLowerCase()

        ===

        fournisseurNom.toLowerCase()


    );



    //----------------------------------
    // Création fournisseur automatique
    //----------------------------------

    if(!fournisseur){


        fournisseur = {


            id:
            Date.now(),


            nom:
            fournisseurNom,


            type:
            "Fournisseur",


            telephone:"",
            email:"",
            adresse:"",
            notes:"",


            dateCreation:

            new Date()
            .toLocaleString()


        };



        db.clients.push(
            fournisseur
        );


    }



    //----------------------------------
    // Création achat
    //----------------------------------

    const achat = {


        id:

        Date.now(),



        numero:

        genererNumeroAchat(),



        date:

        document.getElementById(
            "achatDate"
        )
        ?.value

        ||

        new Date()
        .toISOString()
        .split("T")[0],



        fournisseur:

        fournisseur.nom,



        fournisseurId:

        fournisseur.id,



        articles:

        [...lignesAchat],



        total:

        lignesAchat.reduce(

            (total,ligne)=>

            total +

            (

                ligne.quantite *

                ligne.prix

            ),

            0

        ),



        statut:

        "En attente",



        dateReception:

        null


    };



    db.achats.push(
        achat
    );





    db.mouvements.push({


        date:

        new Date()
        .toLocaleString(),



        action:

        "Création achat",



        achat:

        achat.numero,



        fournisseur:

        fournisseur.nom,



        fournisseurId:

        fournisseur.id,



        montant:

        achat.total


    });





    lignesAchat = [];



    sauvegarderAchats();



    afficherAchats();



    fermerPopupAchat();


}






//--------------------------------------
// Affichage liste achats
//--------------------------------------

function afficherAchats(){


    if(!verifierAchatsDB())
        return;



    const zone =

    document.getElementById(
        "listeAchats"
    );



    if(!zone)
        return;



    zone.innerHTML = "";



    db.achats.forEach((achat,index)=>{



        achat.numero ??=

        "ACH-" + achat.id;



        achat.dateReception ??=

        null;



        achat.total =

        Number(achat.total) || 0;



        zone.innerHTML += `


        <div class="commande-admin">


            <h3>

                ${achat.numero}

            </h3>



            <p>

            Fournisseur :

            <strong>

            ${achat.fournisseur || "-"}

            </strong>

            </p>



            <p>

            Date :

            ${achat.date || "-"}

            </p>



            <p>

            Total :

            <strong>

            ${achat.total.toFixed(2)} CHF

            </strong>

            </p>



            <p>

            Statut :

            ${achat.statut || "En attente"}

            </p>





            ${
                achat.statut !== "Réceptionné"

                ?

                `

                <button onclick="receptionnerAchat(${index})">

                    📦 Réceptionner

                </button>

                `

                :

                `

                <p>

                ✅ Réceptionné le :

                ${achat.dateReception || "-"}

                </p>

                `

            }





            <button onclick="supprimerAchat(${index})">

                🗑 Supprimer

            </button>



        </div>


        `;



    });


}





//--------------------------------------
// Calcul prix moyen achat
//--------------------------------------

function calculerPrixMoyen(article,quantiteAjoutee,prixAchat){


    const ancienStock =

    Number(article.stock) || 0;



    const ancienPrix =

    Number(article.prixAchatMoyen) || 0;



    const nouveauStock =

    ancienStock + quantiteAjoutee;



    if(nouveauStock <= 0){

        return prixAchat;

    }



    return (

        (

            ancienStock * ancienPrix

            +

            quantiteAjoutee * prixAchat

        )

        /

        nouveauStock

    );


}
//--------------------------------------
// Réception achat → Stock
//--------------------------------------

function receptionnerAchat(index){


    if(!verifierAchatsDB())
        return;



    const achat =

    db.achats[index];



    if(!achat)
        return;



    if(achat.statut === "Réceptionné"){


        alert(
            "Cet achat est déjà réceptionné."
        );


        return;

    }



    achat.articles.forEach(ligne=>{


        const article =

        db.articles.find(a =>

            a.nom === ligne.article

        );



        if(article){


            const ancienStock =

            Number(article.stock) || 0;



            const ancienPrix =

            Number(article.prixAchatMoyen) || 0;



            article.prixAchatMoyen =

            calculerPrixMoyen(

                article,

                ligne.quantite,

                ligne.prix

            );



            article.stock =

            ancienStock +

            ligne.quantite;



            db.mouvements.push({


                date:

                new Date()
                .toLocaleString(),



                action:

                "Réception achat",



                article:

                article.nom,



                ancienStock,



                nouveauStock:

                article.stock,



                ancienPrix,



                nouveauPrix:

                article.prixAchatMoyen,



                difference:

                ligne.quantite


            });



        }


    });





    achat.statut =

    "Réceptionné";



    achat.dateReception =

    new Date()
    .toLocaleString();





    db.mouvements.push({


        date:

        new Date()
        .toLocaleString(),



        action:

        "Achat réceptionné",



        achat:

        achat.numero,



        fournisseur:

        achat.fournisseur,



        fournisseurId:

        achat.fournisseurId,



        montant:

        achat.total


    });





    sauvegarderAchats();



    afficherAchats();



    if(typeof afficherStock === "function"){


        afficherStock();


    }


}






//--------------------------------------
// Supprimer achat
//--------------------------------------

function supprimerAchat(index){


    if(!verifierAchatsDB())
        return;



    const achat =

    db.achats[index];



    if(!achat)
        return;



    let message =

    "Supprimer cet achat ?";



    if(achat.statut === "Réceptionné"){


        message =

        "Cet achat a déjà été réceptionné.\n\n" +

        "Le stock ajouté ne sera pas retiré.\n\n" +

        "Continuer ?";


    }



    if(!confirm(message))
        return;




    db.mouvements.push({


        date:

        new Date()
        .toLocaleString(),



        action:

        "Suppression achat",



        achat:

        achat.numero ?? achat.id,



        fournisseur:

        achat.fournisseur,



        fournisseurId:

        achat.fournisseurId,


        statut:

        achat.statut


    });





    db.achats.splice(

        index,

        1

    );



    sauvegarderAchats();



    afficherAchats();


}






//--------------------------------------
// Annulation réception future
//--------------------------------------

function annulerReceptionAchat(index){


    const achat =

    db.achats[index];



    if(!achat)
        return;



    if(achat.statut !== "Réceptionné"){


        alert(
            "Cet achat n'est pas réceptionné."
        );


        return;

    }



    alert(

        "Fonction prévue dans une prochaine version."

    );


}






//--------------------------------------
// Fermer popup achat
//--------------------------------------

function fermerPopupAchat(){


    const popup =

    document.getElementById(
        "popupAchat"
    );



    if(popup){

        popup.style.display = "none";

    }


}






//--------------------------------------
// Charger articles
//--------------------------------------

function chargerArticlesAchat(){


    if(!verifierAchatsDB())
        return;



    const liste =

    document.getElementById(
        "achatArticle"
    );



    if(!liste)
        return;



    liste.innerHTML = "";



    db.articles.forEach(article=>{


        liste.innerHTML += `

        <option value="${article.nom}">

            ${article.nom}

        </option>

        `;


    });


}






//--------------------------------------
// Charger fournisseurs
//--------------------------------------

function chargerFournisseursAchat(){


    if(!verifierAchatsDB())
        return;



    const liste =

    document.getElementById(
        "achatFournisseur"
    );



    if(!liste)
        return;



    if(liste.tagName === "SELECT"){


        liste.innerHTML = "";



        db.clients

        .filter(client =>

            client.type === "Fournisseur"

        )

        .forEach(fournisseur=>{


            liste.innerHTML += `


            <option value="${fournisseur.nom}">

                ${fournisseur.nom}

            </option>


            `;


        });


    }


}






//--------------------------------------
// Actualisation module achats
//--------------------------------------

function actualiserModuleAchats(){


    chargerArticlesAchat();


    chargerFournisseursAchat();


    afficherAchats();


}






//--------------------------------------
// Initialisation
//--------------------------------------

document.addEventListener(

"DOMContentLoaded",

()=>{


    if(!verifierAchatsDB())
        return;



    chargerArticlesAchat();



    chargerFournisseursAchat();



    afficherAchats();




    const bouton =

    document.getElementById(
        "btnNouvelAchat"
    );



    if(bouton){


        bouton.addEventListener(

            "click",

            nouvelAchat

        );


    }



});
