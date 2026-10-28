// ======================================
// IDEE GOURMANDE - GESTION DU STOCK
// Version 2.3.0
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

    if(!Array.isArray(db.piecesEmballees)){
        db.piecesEmballees = [];
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





// ======================================
// PIECES EMBALLEES (POIDS INDIVIDUELS)
// ======================================

const nomsProduitsPieces = {
    "viande-sechee": "Viande séchée",
    "lard-sec": "Lard sec",
    "saumon-fume": "Saumon fumé"
};

let idPieceEnEdition = null;

function echapperTexteStock(valeur){
    return String(valeur ?? "").replace(/[&<>"']/g, function(caractere){
        return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[caractere];
    });
}

function prochainNumeroPiece(produit){
    const numeros = db.piecesEmballees
        .filter(piece => piece.produit === produit)
        .map(piece => Number(piece.numero) || 0);
    return (numeros.length ? Math.max(...numeros) : 0) + 1;
}

function afficherPiecesEmballees(){
    if(!verifierDB()) return;

    const tbody = document.getElementById("tbodyPiecesStock");
    const resume = document.getElementById("resumePiecesStock");
    if(!tbody || !resume) return;

    const produits = Object.keys(nomsProduitsPieces);
    resume.innerHTML = produits.map(produit => {
        const pieces = db.piecesEmballees.filter(piece => piece.produit === produit);
        const poids = pieces.reduce((total,piece) => total + (Number(piece.poids) || 0),0);
        return `<div class="stat-card" style="min-width:170px;">
            <h3>${nomsProduitsPieces[produit]}</h3>
            <strong>${pieces.length} pièce(s)</strong>
            <div>${poids.toLocaleString("fr-CH")} g au total</div>
        </div>`;
    }).join("");

    const liste = [...db.piecesEmballees].sort((a,b) => {
        const ordre = produits.indexOf(a.produit) - produits.indexOf(b.produit);
        return ordre || Number(a.numero) - Number(b.numero);
    });

    if(!liste.length){
        tbody.innerHTML = '<tr><td colspan="4">Aucune pièce enregistrée pour le moment.</td></tr>';
        return;
    }

    tbody.innerHTML = liste.map(piece => `<tr>
        <td>${echapperTexteStock(nomsProduitsPieces[piece.produit] || piece.produit)}</td>
        <td>Pièce ${Number(piece.numero) || 1}</td>
        <td>${Number(piece.poids).toLocaleString("fr-CH")} g</td>
        <td class="action-stock">
            <button type="button" class="btn-stock" onclick="modifierPieceEmballee('${piece.id}')" aria-label="Modifier la pièce">✏️</button>
            <button type="button" class="btn-stock" onclick="supprimerPieceEmballee('${piece.id}')" aria-label="Supprimer la pièce">🗑️</button>
        </td>
    </tr>`).join("");
}

function enregistrerPieceEmballee(){
    if(!verifierDB()) return;

    const select = document.getElementById("pieceProduit");
    const poidsChamp = document.getElementById("piecePoids");
    const produit = select.value;
    const poids = Number(poidsChamp.value);

    if(!nomsProduitsPieces[produit]){
        alert("Veuillez choisir un produit.");
        return;
    }
    if(!Number.isFinite(poids) || poids <= 0){
        alert("Veuillez saisir un poids en grammes supérieur à zéro.");
        poidsChamp.focus();
        return;
    }

    if(idPieceEnEdition !== null){
        const piece = db.piecesEmballees.find(element => String(element.id) === String(idPieceEnEdition));
        if(!piece) {
            annulerModificationPiece();
            return;
        }
        const ancienProduit = piece.produit;
        piece.produit = produit;
        piece.poids = Math.round(poids);
        if(ancienProduit !== produit){
            piece.numero = prochainNumeroPiece(produit);
        }
        db.mouvements.push({
            date:new Date().toLocaleString("fr-CH"),
            article:nomsProduitsPieces[produit] + " — pièce " + piece.numero,
            action:"Modification du poids emballé",
            ancienStock:0,
            nouveauStock:piece.poids,
            difference:0
        });
    } else {
        const piece = {
            id: (window.crypto && typeof window.crypto.randomUUID === "function")
                ? window.crypto.randomUUID()
                : String(Date.now()) + "-" + Math.random().toString(36).slice(2,9),
            produit:produit,
            numero:prochainNumeroPiece(produit),
            poids:Math.round(poids),
            dateAjout:new Date().toISOString()
        };
        db.piecesEmballees.push(piece);
        db.mouvements.push({
            date:new Date().toLocaleString("fr-CH"),
            article:nomsProduitsPieces[produit] + " — pièce " + piece.numero,
            action:"Ajout d'une pièce emballée",
            ancienStock:0,
            nouveauStock:piece.poids,
            difference:piece.poids
        });
    }

    sauvegarderDB();
    annulerModificationPiece();
    afficherPiecesEmballees();
}

function modifierPieceEmballee(id){
    const piece = db.piecesEmballees.find(element => String(element.id) === String(id));
    if(!piece) return;
    idPieceEnEdition = piece.id;
    document.getElementById("pieceProduit").value = piece.produit;
    document.getElementById("piecePoids").value = piece.poids;
    document.getElementById("btnEnregistrerPiece").textContent = "💾 Enregistrer la modification";
    document.getElementById("btnAnnulerPiece").style.display = "inline-block";
    document.getElementById("piecePoids").focus();
}

function annulerModificationPiece(){
    idPieceEnEdition = null;
    const poids = document.getElementById("piecePoids");
    if(poids) poids.value = "";
    const enregistrer = document.getElementById("btnEnregistrerPiece");
    if(enregistrer) enregistrer.textContent = "➕ Ajouter une pièce";
    const annuler = document.getElementById("btnAnnulerPiece");
    if(annuler) annuler.style.display = "none";
}

function supprimerPieceEmballee(id){
    const piece = db.piecesEmballees.find(element => String(element.id) === String(id));
    if(!piece) return;
    const nom = nomsProduitsPieces[piece.produit] || piece.produit;
    if(!confirm("Supprimer " + nom + " — pièce " + piece.numero + " (" + piece.poids + " g) ?")) return;

    db.mouvements.push({
        date:new Date().toLocaleString("fr-CH"),
        article:nom + " — pièce " + piece.numero,
        action:"Suppression d'une pièce emballée",
        ancienStock:piece.poids,
        nouveauStock:0,
        difference:-piece.poids
    });
    db.piecesEmballees = db.piecesEmballees.filter(element => String(element.id) !== String(id));
    if(String(idPieceEnEdition) === String(id)) annulerModificationPiece();
    sauvegarderDB();
    afficherPiecesEmballees();
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
    afficherPiecesEmballees();

    const boutonPiece = document.getElementById("btnEnregistrerPiece");
    if(boutonPiece) boutonPiece.addEventListener("click", enregistrerPieceEmballee);
    const boutonAnnulerPiece = document.getElementById("btnAnnulerPiece");
    if(boutonAnnulerPiece) boutonAnnulerPiece.addEventListener("click", annulerModificationPiece);



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
