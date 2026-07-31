// ======================================
// IDEE GOURMANDE - GESTION DES ACHATS
// Version 1.0.1
// Compatible database.js 2.0.1
// Compatible js-stock.js 2.2.0
// ======================================


let achatEdition = -1;

let lignesAchat = [];


//--------------------------------------
// Vérification DB
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
// Sauvegarde
//--------------------------------------

function sauvegarderAchats(){

    if(typeof sauvegarderDB === "function"){

        sauvegarderDB();

    }

}



//--------------------------------------
// Nouveau achat
//--------------------------------------

function nouvelAchat(){


    achatEdition=-1;

    lignesAchat=[];


    const fournisseur =
    document.getElementById("achatFournisseur");


    const date =
    document.getElementById("achatDate");



    if(fournisseur)
        fournisseur.value="";


    if(date)
        date.value =
        new Date()
        .toISOString()
        .split("T")[0];



    afficherLignesAchat();



    const popup =
    document.getElementById("popupAchat");


    if(popup)
        popup.style.display="flex";


}



//--------------------------------------
// Ajouter ligne achat
//--------------------------------------

function ajouterLigneAchat(){


    const article =
    document.getElementById("achatArticle")?.value;


    const quantite =
    Number(
        document.getElementById("achatQuantite")?.value
    ) || 0;


    const prix =
    Number(
        document.getElementById("achatPrix")?.value
    ) || 0;



    if(!article){

        alert(
            "Sélectionnez un article."
        );

        return;

    }



    if(quantite<=0 || prix<0){

        alert(
            "Quantité ou prix incorrect."
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


    if(!zone)
        return;



    zone.innerHTML="";


    let total=0;



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


            <button onclick="
            supprimerLigneAchat(${index})
            ">

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
// Supprimer ligne
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



    const achat={


        id:Date.now(),


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
            (total,l)=>
            total+
            (
                l.quantite*
                l.prix
            ),
            0
        ),


        statut:
        "En attente"


    };



    db.achats.push(achat);



    // Création fournisseur automatique

    const existeFournisseur =
    db.clients.find(
        c=>
        c.nom===fournisseur &&
        c.type==="Fournisseur"
    );



    if(!existeFournisseur){

        db.clients.push({

            id:Date.now(),

            nom:fournisseur,

            type:"Fournisseur"

        });

    }



    lignesAchat=[];



    sauvegarderAchats();


    afficherAchats();


    fermerPopupAchat();


}



//--------------------------------------
// Affichage achats
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
            ${achat.fournisseur}
            </h3>


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
            achat.statut!=="Réceptionné"

            ?

            `<button onclick="
            receptionnerAchat(${index})
            ">
            📦 Réceptionner
            </button>`

            :

            "✅ Achat réceptionné"

            }



            <button onclick="
            supprimerAchat(${index})
            ">
            🗑 Supprimer
            </button>


        </div>

        `;


    });


}



//--------------------------------------
// Réception achat
//--------------------------------------

function receptionnerAchat(index){


    const achat =
    db.achats[index];



    if(!achat)
        return;



    if(achat.statut==="Réceptionné"){

        alert(
            "Cet achat a déjà été réceptionné."
        );

        return;

    }



    achat.articles.forEach(ligne=>{


        const article =
        db.articles.find(
            a=>a.nom===ligne.article
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


    if(confirm(
        "Supprimer cet achat ?"
    )){


        db.achats.splice(index,1);


        sauvegarderDB();


        afficherAchats();


    }


}



//--------------------------------------
// Fermer popup
//--------------------------------------

function fermerPopupAchat(){


    const popup =
    document.getElementById("popupAchat");


    if(popup){

        popup.style.display="none";

    }


}



//--------------------------------------
// Charger articles
//--------------------------------------

function chargerArticlesAchat(){


    const liste =
    document.getElementById("achatArticle");


    if(!liste || !verifierAchatsDB())
        return;



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
// Initialisation
//--------------------------------------

document.addEventListener(
"DOMContentLoaded",
()=>{


    if(!verifierAchatsDB())
        return;



    chargerArticlesAchat();


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
