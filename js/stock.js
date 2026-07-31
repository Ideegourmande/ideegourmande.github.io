// ======================================
// IDEE GOURMANDE - GESTION DU STOCK
// Version 2.2.0
// Compatible database.js 2.0.1
// ======================================


let indexEdition = -1;


//--------------------------------------
// Vérification database
//--------------------------------------

function verifierDB(){

    if(typeof db === "undefined"){

        console.error(
            "Erreur : database.js doit être chargé avant js-stock.js"
        );

        return false;

    }

    if(!db.articles){
        db.articles = [];
    }

    if(!db.mouvements){
        db.mouvements = [];
    }

    if(!db.emplacements){
        db.emplacements = [];
    }

    return true;

}



//--------------------------------------
// Chargement emplacements
//--------------------------------------

function chargerEmplacements(){

    const liste =
    document.getElementById("artEmplacement");


    if(!liste || !verifierDB()) return;


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

    if(typeof sauvegarderDB === "function"){

        sauvegarderDB();

    }

}



//--------------------------------------
// Affichage stock
//--------------------------------------

function afficherStock(){


    if(!verifierDB()) return;


    const tbody =
    document.getElementById("tbodyStock");


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

            <td>${article.categorie || ""}</td>

            <td>
                ${article.stock} ${article.unite || ""}
            </td>

            <td>
                ${article.minimum} ${article.unite || ""}
            </td>

            <td>
                ${article.emplacement || ""}
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



    const nbArticles =
    document.getElementById("nbArticles");


    const nbCritique =
    document.getElementById("nbCritique");


    const nbEmplacements =
    document.getElementById("nbEmplacements");



    if(nbArticles)
        nbArticles.textContent=db.articles.length;


    if(nbCritique)
        nbCritique.textContent=critique;


    if(nbEmplacements)
        nbEmplacements.textContent=db.emplacements.length;



    sauvegarderDB();

}



//--------------------------------------
// Ajouter article
//--------------------------------------

function ajouterArticle(){


    indexEdition=-1;


    chargerEmplacements();



    const champs=[

        "artNom",
        "artStock",
        "artMinimum"

    ];



    champs.forEach(id=>{

        const element=document.getElementById(id);

        if(element)
            element.value="";

    });



    document.getElementById("artStock").value=0;
    document.getElementById("artMinimum").value=0;



    const popup =
    document.getElementById("popupArticle");


    if(popup)
        popup.style.display="flex";


}



//--------------------------------------
// Modifier article
//--------------------------------------

function modifierArticle(index){


    if(!db.articles[index]) return;


    indexEdition=index;


    chargerEmplacements();



    const article=db.articles[index];


    document.getElementById("artNom").value =
    article.nom;


    document.getElementById("artCategorie").value =
    article.categorie;


    document.getElementById("artUnite").value =
    article.unite;


    document.getElementById("artStock").value =
    article.stock;


    document.getElementById("artMinimum").value =
    article.minimum;


    document.getElementById("artEmplacement").value =
    article.emplacement;



    document.getElementById("popupArticle")
    .style.display="flex";


}



//--------------------------------------
// Enregistrer article
//--------------------------------------

function enregistrerArticle(){


    const ancienStock =
    indexEdition >= 0
    ? db.articles[indexEdition].stock
    : 0;



    const article={


        id:
        indexEdition>=0
        ? db.articles[indexEdition].id
        : Date.now(),


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
        Number(document.getElementById("artStock").value) || 0,


        minimum:
        Number(document.getElementById("artMinimum").value) || 0,


        emplacement:
        document.getElementById("artEmplacement")
        .value


    };



    if(article.nom===""){

        alert(
            "Veuillez saisir le nom de l'article."
        );

        return;

    }



    const mouvement={

        date:new Date().toLocaleString(),

        article:article.nom,

        action:
        indexEdition===-1
        ? "Création"
        : "Modification",

        ancienStock:ancienStock,

        nouveauStock:article.stock,

        difference:
        article.stock-ancienStock

    };



    if(indexEdition===-1){

        db.articles.push(article);

    }

    else{

        db.articles[indexEdition]=article;

    }



    db.mouvements.push(mouvement);



    sauvegarderDB();


    afficherStock();


    fermerPopup();


}



//--------------------------------------
// Fermer popup
//--------------------------------------

function fermerPopup(){

    const popup =
    document.getElementById("popupArticle");


    if(popup){

        popup.style.display="none";

    }

}



//--------------------------------------
// Supprimer article
//--------------------------------------

function supprimerArticle(index){


    if(!db.articles[index]) return;



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


    const champ =
    document.getElementById("rechercheArticle");


    if(!champ) return;



    const filtre =
    champ.value.toLowerCase();



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

document.addEventListener(
"DOMContentLoaded",
()=>{


    if(!verifierDB())
        return;



    chargerEmplacements();


    afficherStock();



    const bouton =
    document.getElementById(
        "btnNouvelArticle"
    );


    if(bouton){

        bouton.addEventListener(
            "click",
            ajouterArticle
        );

    }


});
