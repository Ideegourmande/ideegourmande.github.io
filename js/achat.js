// ======================================
// IDEE GOURMANDE - GESTION DES ACHATS
// Version 1.1.0
// Compatible database.js 2.0.1
// Compatible js-stock.js 2.2.0
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
    document.getElementById("achatFournisseur");


    const date =
    document.getElementById("achatDate");



    if(fournisseur){

        fournisseur.value="";

    }



    if(date){

        date.value =
        new Date()
        .toISOString()
        .split("T")[0];

    }



    afficherLignesAchat();



    const popup =
    document.getElementById("popupAchat");



    if(popup){

        popup.style.display="flex";

    }


}



//--------------------------------------
// Ajouter une ligne achat
//--------------------------------------

function ajouterLigneAchat(){


    const selectArticle =
    document.getElementById("achatArticle");


    const inputQuantite =
    document.getElementById("achatQuantite");


    const inputPrix =
    document.getElementById("achatPrix");



    if(!selectArticle ||
       !inputQuantite ||
       !inputPrix){

        return;

    }



    const article =
    selectArticle.value;



    const quantite =
    Number(inputQuantite.value) || 0;



    const prix =
    Number(inputPrix.value) || 0;



    if(article===""){


        alert(
            "Sélectionnez un article."
        );

        return;

    }



    if(quantite<=0){


        alert(
            "La quantité doit être supérieure à zéro."
        );

        return;

    }



    if(prix<0){


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
    document.getElementById("listeAchat");


    if(!zone){

        return;

    }



    zone.innerHTML="";


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
    document.getElementById("totalAchat");



    if(totalZone){

        totalZone.textContent =
        total.toFixed(2)+" CHF";

    }


}



//--------------------------------------
// Supprimer ligne achat
//--------------------------------------

function supprimerLigneAchat(index){


    lignesAchat.splice(index,1);


    afficherLignesAchat();


}
//--------------------------------------
// Enregistrer achat
//--------------------------------------

function enregistrerAchat(){


    if(!verifierAchatsDB())
        return;



    const fournisseur =
    document.getElementById("achatFournisseur")
    ?.value
    .trim();



    if(!fournisseur){


        alert(
            "Veuillez saisir le fournisseur."
        );

        return;

    }



    if(lignesAchat.length===0){


        alert(
            "Ajoutez au moins un article."
        );

        return;

    }



    const achat = {


        id:
        Date.now(),


        numero:
        genererNumeroAchat(),


        date:
        document.getElementById("achatDate")
        ?.value
        ||
        new Date()
        .toISOString()
        .split("T")[0],



        fournisseur,



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



    db.achats.push(achat);



    // Création automatique fournisseur

    const fournisseurExiste =
    db.clients.some(
        client =>
        client.nom===fournisseur &&
        client.type==="Fournisseur"
    );



    if(!fournisseurExiste){


        db.clients.push({


            id:
            Date.now(),


            nom:
            fournisseur,


            type:
            "Fournisseur"


        });


    }



    db.mouvements.push({


        date:
        new Date()
        .toLocaleString(),


        action:
        "Création achat",


        achat:
        achat.numero,


        fournisseur,


        montant:
        achat.total


    });



    lignesAchat=[];



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
    document.getElementById("listeAchats");



    if(!zone)
        return;



    zone.innerHTML="";



    db.achats.forEach((achat,index)=>{


        zone.innerHTML += `


        <div class="commande-admin">


            <h3>

            ${achat.numero}

            </h3>



            <p>

            Fournisseur :
            <strong>
            ${achat.fournisseur}
            </strong>

            </p>



            <p>

            Date :
            ${achat.date}

            </p>



            <p>

            Total :
            <strong>

            ${achat.total.toFixed(2)} CHF

            </strong>

            </p>



            <p>

            Statut :
            ${achat.statut}

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
                ${achat.dateReception}
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
// Réception achat → Stock
//--------------------------------------

function receptionnerAchat(index){


    const achat =
    db.achats[index];



    if(!achat)
        return;



    if(achat.statut==="Réceptionné"){


        alert(
            "Cet achat est déjà réceptionné."
        );


        return;

    }



    achat.articles.forEach(ligne=>{


        let article =
        db.articles.find(
            a =>
            a.nom === ligne.article
        );



        if(article){


            const ancienStock =
            article.stock;



            article.stock +=
            ligne.quantite;



            db.mouvements.push({


                date:
                new Date()
                .toLocaleString(),



                article:
                article.nom,



                action:
                "Réception achat",



                ancienStock,



                nouveauStock:
                article.stock,



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
        achat.numero


    });



    sauvegarderDB();



    afficherAchats();



    if(typeof afficherStock==="function"){

        afficherStock();

    }


}
//--------------------------------------
// Supprimer achat
//--------------------------------------

function supprimerAchat(index){


    const achat =
    db.achats[index];



    if(!achat)
        return;



    let message =
    "Supprimer cet achat ?";



    if(achat.statut==="Réceptionné"){


        message =
        "Cet achat a déjà été réceptionné.\n\n" +
        "La suppression ne retirera pas le stock ajouté.\n\n" +
        "Continuer ?";


    }



    if(confirm(message)){



        db.mouvements.push({


            date:
            new Date()
            .toLocaleString(),


            action:
            "Suppression achat",


            achat:
            achat.numero,


            fournisseur:
            achat.fournisseur


        });



        db.achats.splice(index,1);



        sauvegarderDB();



        afficherAchats();



    }


}



//--------------------------------------
// Fermer popup achat
//--------------------------------------

function fermerPopupAchat(){


    const popup =
    document.getElementById("popupAchat");



    if(popup){


        popup.style.display="none";


    }


}



//--------------------------------------
// Charger articles dans formulaire achat
//--------------------------------------

function chargerArticlesAchat(){


    const liste =
    document.getElementById("achatArticle");



    if(!liste ||
       !verifierAchatsDB()){

        return;

    }



    liste.innerHTML="";



    db.articles.forEach(article=>{


        liste.innerHTML += `


        <option value="${article.nom}">

            ${article.nom}

        </option>


        `;


    });


}



//--------------------------------------
// Rafraîchir fournisseurs
//--------------------------------------

function chargerFournisseursAchat(){


    const liste =
    document.getElementById("achatFournisseur");



    if(!liste ||
       !verifierAchatsDB()){

        return;

    }



    // uniquement si c'est un select

    if(liste.tagName==="SELECT"){


        liste.innerHTML="";


        db.clients

        .filter(
            client =>
            client.type==="Fournisseur"
        )

        .forEach(client=>{


            liste.innerHTML += `


            <option value="${client.nom}">

            ${client.nom}

            </option>


            `;


        });


    }


}



//--------------------------------------
// Initialisation module achats
//--------------------------------------

document.addEventListener(
"DOMContentLoaded",
()=>{


    if(!verifierAchatsDB()){

        return;

    }



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
