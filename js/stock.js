// ======================================
// IDEE GOURMANDE - GESTION DU STOCK
// Version 2.1.0
// Compatible database.js
// ======================================


let indexEdition = -1;


//--------------------------------------
// Chargement des emplacements
//--------------------------------------

function chargerEmplacements(){

    const liste = document.getElementById("artEmplacement");

    if(!liste) return;

    liste.innerHTML="";

    db.emplacements.forEach(emplacement=>{

        liste.innerHTML += `
            <option value="${emplacement}">
                ${emplacement}
            </option>
        `;

    });

}


//--------------------------------------
// Sauvegarde
//--------------------------------------

function sauvegarderStock(){

    sauvegarderDB();

}


//--------------------------------------
// Affichage du stock
//--------------------------------------

function afficherStock(){

    const tbody = document.getElementById("tbodyStock");

    if(!tbody) return;


    tbody.innerHTML="";


    let critique = 0;

    db.articles.forEach((article,index)=>{


        let etat="";
        let classe="";


        if(article.stock <= 0){

            etat="🔴 Rupture";
            classe="stock-rupture";

        }
        else if(article.stock <= article.minimum){

            etat="🟠 Critique";
            classe="stock-critique";

            critique++;

        }
        else{

            etat="🟢 OK";
            classe="stock-ok";

        }



        tbody.innerHTML += `

        <tr>

            <td>${article.nom}</td>

            <td>${article.categorie}</td>

            <td>
                ${article.stock} ${article.unite}
            </td>

            <td>
                ${article.minimum} ${article.unite}
            </td>

            <td>
                ${article.emplacement}
            </td>

            <td class="${classe}">
                ${etat}
            </td>

            <td class="action-stock">

                <button class="btn-stock"
                onclick="modifierArticle(${index})">
                ✏️
                </button>


                <button class="btn-stock"
                onclick="supprimerArticle(${index})">
                🗑️
                </button>

            </td>


        </tr>

        `;


    });



    document.getElementById("nbArticles").textContent =
        db.articles.length;


    document.getElementById("nbCritique").textContent =
        critique;



    document.getElementById("nbEmplacements").textContent =
        db.emplacements.length;



    sauvegarderDB();

}



//--------------------------------------
// Nouveau article
//--------------------------------------

function ajouterArticle(){


    indexEdition=-1;


    chargerEmplacements();


    document.getElementById("artNom").value="";

    document.getElementById("artCategorie").selectedIndex=0;

    document.getElementById("artUnite").selectedIndex=0;

    document.getElementById("artStock").value=0;

    document.getElementById("artMinimum").value=0;

    document.getElementById("artEmplacement").selectedIndex=0;



    document.getElementById("popupArticle").style.display="flex";


}



//--------------------------------------
// Modifier article
//--------------------------------------

function modifierArticle(index){


    indexEdition=index;


    chargerEmplacements();


    const article=db.articles[index];


    document.getElementById("artNom").value=
        article.nom;


    document.getElementById("artCategorie").value=
        article.categorie;


    document.getElementById("artUnite").value=
        article.unite;


    document.getElementById("artStock").value=
        article.stock;


    document.getElementById("artMinimum").value=
        article.minimum;


    document.getElementById("artEmplacement").value=
        article.emplacement;



    document.getElementById("popupArticle").style.display="flex";


}



//--------------------------------------
// Enregistrer
//--------------------------------------

function enregistrerArticle(){


    const ancienStock =
        indexEdition >=0
        ? db.articles[indexEdition].stock
        : 0;



    const article={


        nom:
        document.getElementById("artNom")
        .value.trim(),


        categorie:
        document.getElementById("artCategorie")
        .value,


        unite:
        document.getElementById("artUnite")
        .value,


        stock:
        parseFloat(
            document.getElementById("artStock").value
        ) || 0,


        minimum:
        parseFloat(
            document.getElementById("artMinimum").value
        ) || 0,


        emplacement:
        document.getElementById("artEmplacement")
        .value


    };



    if(article.nom===""){

        alert("Veuillez saisir le nom de l'article.");

        return;

    }



    if(indexEdition===-1){


        db.articles.push(article);



        db.mouvements.push({

            date:new Date().toLocaleString(),

            article:article.nom,

            action:"Création",

            ancienStock:0,

            nouveauStock:article.stock,

            difference:article.stock


        });



    }
    else{


        db.articles[indexEdition]=article;



        db.mouvements.push({

            date:new Date().toLocaleString(),

            article:article.nom,

            action:"Modification",

            ancienStock:ancienStock,

            nouveauStock:article.stock,

            difference:
            article.stock-ancienStock


        });


    }



    sauvegarderDB();


    afficherStock();


    fermerPopup();


}



//--------------------------------------
// Fermer popup
//--------------------------------------

function fermerPopup(){

    document.getElementById("popupArticle")
    .style.display="none";

}



//--------------------------------------
// Supprimer
//--------------------------------------

function supprimerArticle(index){


    if(confirm("Supprimer cet article ?")){


        const article=db.articles[index];


        db.mouvements.push({

            date:new Date().toLocaleString(),

            article:article.nom,

            action:"Suppression",

            ancienStock:article.stock,

            nouveauStock:0,

            difference:-article.stock


        });



        db.articles.splice(index,1);


        sauvegarderDB();


        afficherStock();


    }


}



//--------------------------------------
// Recherche
//--------------------------------------

function rechercherArticle(){


    const filtre =
    document.getElementById("rechercheArticle")
    .value.toLowerCase();



    document
    .querySelectorAll("#tbodyStock tr")
    .forEach(ligne=>{


        ligne.style.display =
        ligne.innerText
        .toLowerCase()
        .includes(filtre)
        ? ""
        : "none";


    });


}



//--------------------------------------
// Impression
//--------------------------------------

function imprimerStock(){

    window.print();

}



//--------------------------------------
// Initialisation
//--------------------------------------

document.addEventListener("DOMContentLoaded",()=>{


    if(typeof db==="undefined"){

        console.error(
        "database.js doit être chargé avant stock.js"
        );

        return;

    }


    chargerEmplacements();


    afficherStock();



    const bouton =
    document.getElementById("btnNouvelArticle");


    if(bouton){

        bouton.addEventListener(
            "click",
            ajouterArticle
        );

    }


});
