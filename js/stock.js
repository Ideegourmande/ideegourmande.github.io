// ======================================
// IDEE GOURMANDE - GESTION DU STOCK
// Version 2.6.0
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
    let articlesAffiches = 0;



    db.articles.forEach((article,index)=>{

        const nomFiltre = String(article.nom || "").toLocaleLowerCase("fr");
        if(!nomFiltre.includes("foie gras") && !nomFiltre.includes("figue") && !nomFiltre.includes("magret")) return;


        articlesAffiches++;

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
        nbArticles.textContent=articlesAffiches;


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
    "saumon-aneth": "Saumon fumé à l’aneth",
    "saumon-piments": "Saumon fumé aux piments",
    "saumon-fume": "Saumon fumé (ancienne entrée)"
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

    const produits = Object.keys(nomsProduitsPieces).filter(produit => produit !== "saumon-fume" || db.piecesEmballees.some(piece => piece.produit === "saumon-fume"));
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
        <td style="text-align:center; padding-left:20px; padding-right:20px;">${Number(piece.poids).toLocaleString("fr-CH")} g</td>
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
// Exportation d'une sauvegarde JSON complète
//--------------------------------------

function exporterSauvegardeStock(){
    if(!verifierDB() || typeof sauvegarderDB !== "function"){
        alert("Impossible de préparer la sauvegarde.");
        return;
    }

    // S'assurer que les données les plus récentes sont enregistrées.
    if(!sauvegarderDB()){
        alert("Le navigateur n'a pas pu enregistrer les données. Vérifie l'espace disponible.");
        return;
    }

    try {
        const contenu = JSON.stringify(db, null, 2);
        const fichier = new Blob([contenu], {type:"application/json;charset=utf-8"});
        const url = URL.createObjectURL(fichier);
        const lien = document.createElement("a");
        const date = new Date().toISOString().slice(0,10);
        lien.href = url;
        lien.download = "sauvegarde-stock-idee-gourmande-" + date + ".json";
        document.body.appendChild(lien);
        lien.click();
        lien.remove();
        setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
        alert("Sauvegarde téléchargée. Conserve ce fichier dans un endroit sûr.");
    } catch(erreur) {
        console.error("Erreur d'exportation de sauvegarde", erreur);
        alert("La sauvegarde n'a pas pu être créée.");
    }
}

//--------------------------------------
// Importation sécurisée d'une sauvegarde JSON
//--------------------------------------

function importerSauvegardeStock(fichier){
    if(!fichier) return;

    const lecteur = new FileReader();
    lecteur.onload = function(){
        let donnees;
        try {
            donnees = JSON.parse(String(lecteur.result || ""));
        } catch(erreur) {
            alert("Le fichier n'est pas un JSON valide. Aucune donnée n'a été modifiée.");
            return;
        }

        if(!donnees || typeof donnees !== "object" || Array.isArray(donnees) ||
           !Array.isArray(donnees.articles) || !Array.isArray(donnees.commandes) ||
           !Array.isArray(donnees.mouvements)){
            alert("Ce fichier ne semble pas être une sauvegarde Idée Gourmande complète. Aucune donnée n'a été modifiée.");
            return;
        }

        const resume = "La sauvegarde contient :\\n" +
            donnees.articles.length + " article(s)\\n" +
            (Array.isArray(donnees.piecesEmballees) ? donnees.piecesEmballees.length : 0) + " pièce(s) emballée(s)\\n" +
            donnees.commandes.length + " commande(s)\\n\\n" +
            "L'importation remplacera les données locales de ce navigateur (stock, mouvements, pièces, commandes et paramètres).\\n" +
            "Assure-toi d'avoir conservé la sauvegarde actuelle avant de continuer.\\n\\nContinuer ?";
        if(!confirm(resume)) return;

        try {
            localStorage.setItem("ideeGourmandeDB", JSON.stringify(donnees));
            alert("Sauvegarde importée. La page va se recharger.");
            window.location.reload();
        } catch(erreur) {
            alert("Impossible d'enregistrer la sauvegarde dans ce navigateur. Aucune importation confirmée.");
            console.error("Erreur d'importation de sauvegarde", erreur);
        }
    };
    lecteur.onerror = function(){
        alert("Impossible de lire le fichier sélectionné.");
    };
    lecteur.readAsText(fichier);
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

    const boutonDossier = document.getElementById("btnChoisirDossierSauvegarde");
    if(boutonDossier) boutonDossier.addEventListener("click", choisirDossierSauvegardeStock);
    chargerDossierSauvegardeStock();

    const boutonExport = document.getElementById("btnExporterSauvegarde");
    if(boutonExport) boutonExport.addEventListener("click", exporterSauvegardeStock);

    const boutonImport = document.getElementById("btnImporterSauvegarde");
    const fichierImport = document.getElementById("fichierSauvegardeStock");
    if(boutonImport && fichierImport){
        boutonImport.addEventListener("click", function(){ fichierImport.click(); });
        fichierImport.addEventListener("change", function(){
            const fichier = fichierImport.files && fichierImport.files[0];
            importerSauvegardeStock(fichier);
            fichierImport.value = "";
        });
    }

    const boutonPiece = document.getElementById("btnEnregistrerPiece");
    if(boutonPiece) boutonPiece.addEventListener("click", enregistrerPieceEmballee);
    const boutonAnnulerPiece = document.getElementById("btnAnnulerPiece");
    if(boutonAnnulerPiece) boutonAnnulerPiece.addEventListener("click", annulerModificationPiece);

    const selectSortieArticle = document.getElementById("sortieArticle");
    if(selectSortieArticle) selectSortieArticle.addEventListener("change", actualiserAideQuantiteSortie);



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


//--------------------------------------
// Sortie manuelle pour une commande
//--------------------------------------

function ouvrirSortieCommande(){
    if(!verifierDB()) return;
    const popup = document.getElementById("popupSortieCommande");
    if(!popup) return;

    const selectArticle = document.getElementById("sortieArticle");
    selectArticle.innerHTML = "";
    db.articles.forEach((article, index) => {
        const option = document.createElement("option");
        option.value = String(index);
        option.textContent = article.nom + " — stock : " + article.stock + " " + (article.unite || "");
        selectArticle.appendChild(option);
    });

    remplirListePiecesSortie();
    document.getElementById("sortieQuantite").value = "";
    document.getElementById("sortieCommande").value = "";
    document.getElementById("sortieMode").value = "vrac";
    changerModeSortie();
    popup.style.display = "flex";
}

function remplirListePiecesSortie(){
    const select = document.getElementById("sortiePiece");
    if(!select) return;
    select.innerHTML = "";
    db.piecesEmballees.forEach(piece => {
        const option = document.createElement("option");
        option.value = String(piece.id);
        const nom = nomsProduitsPieces[piece.produit] || piece.produit;
        option.textContent = nom + " — pièce " + piece.numero + " (" + piece.poids + " g)";
        select.appendChild(option);
    });
    if(!db.piecesEmballees.length){
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Aucune pièce emballée disponible";
        select.appendChild(option);
    }
}

function changerModeSortie(){
    const mode = document.getElementById("sortieMode").value;
    document.getElementById("blocSortieArticle").style.display = mode === "vrac" ? "block" : "none";
    document.getElementById("blocSortiePiece").style.display = mode === "emballe" ? "block" : "none";
    if(mode === "vrac") actualiserAideQuantiteSortie();
    else remplirListePiecesSortie();
}

function actualiserAideQuantiteSortie(){
    const select = document.getElementById("sortieArticle");
    const index = select ? Number(select.value) : -1;
    const article = db.articles[index];
    const unite = String(article && article.unite || "").toLowerCase();
    const grammes = unite === "kg" || unite === "g";
    document.getElementById("labelSortieQuantite").textContent =
        grammes ? "Quantité à retirer (grammes)" : "Quantité à retirer (" + (article && article.unite || "unité") + ")";
    document.getElementById("aideSortieQuantite").textContent = grammes
        ? "Saisis le poids réel en grammes, par exemple 487."
        : "Saisis la quantité dans l’unité utilisée par cet article.";
}

function fermerSortieCommande(){
    const popup = document.getElementById("popupSortieCommande");
    if(popup) popup.style.display = "none";
}

function confirmerSortieCommande(){
    if(!verifierDB()) return;
    const mode = document.getElementById("sortieMode").value;
    const reference = document.getElementById("sortieCommande").value.trim();
    const maintenant = new Date().toLocaleString("fr-CH");

    if(mode === "emballe"){
        const id = document.getElementById("sortiePiece").value;
        const piece = db.piecesEmballees.find(element => String(element.id) === String(id));
        if(!piece){
            alert("Aucune pièce emballée disponible. Choisis une autre méthode de sortie.");
            return;
        }
        const nom = nomsProduitsPieces[piece.produit] || piece.produit;
        const confirmation = "Sortir " + nom + " — pièce " + piece.numero + " (" + piece.poids + " g)" +
            (reference ? "\\nCommande : " + reference : "") + " ?";
        if(!confirm(confirmation)) return;

        db.piecesEmballees = db.piecesEmballees.filter(element => String(element.id) !== String(id));
        db.mouvements.push({
            date: maintenant,
            article: nom + " — pièce " + piece.numero,
            action: "Sortie pour commande" + (reference ? " (" + reference + ")" : ""),
            ancienStock: piece.poids,
            nouveauStock: 0,
            difference: -Number(piece.poids || 0)
        });
    } else {
        const index = Number(document.getElementById("sortieArticle").value);
        const article = db.articles[index];
        const quantiteSaisie = Number(document.getElementById("sortieQuantite").value);
        if(!article){
            alert("Choisis un article.");
            return;
        }
        if(!Number.isFinite(quantiteSaisie) || quantiteSaisie <= 0){
            alert("Saisis une quantité supérieure à zéro.");
            return;
        }
        const unite = String(article.unite || "").toLowerCase();
        const quantiteStock = unite === "kg" ? quantiteSaisie / 1000 : quantiteSaisie;
        if(quantiteStock > Number(article.stock || 0) + 1e-9){
            alert("La quantité demandée dépasse le stock disponible (" + article.stock + " " + (article.unite || "") + ").");
            return;
        }
        const nouveauStock = Math.round((Number(article.stock) - quantiteStock) * 1000000) / 1000000;
        const confirmation = "Retirer " + quantiteSaisie + (unite === "kg" || unite === "g" ? " g" : " " + (article.unite || "")) +
            " de « " + article.nom + " » ?" + (reference ? "\\nCommande : " + reference : "");
        if(!confirm(confirmation)) return;

        const ancienStock = Number(article.stock || 0);
        article.stock = nouveauStock;
        db.mouvements.push({
            date: maintenant,
            article: article.nom,
            action: "Sortie pour commande" + (reference ? " (" + reference + ")" : ""),
            ancienStock: ancienStock,
            nouveauStock: nouveauStock,
            difference: nouveauStock - ancienStock
        });
    }

    sauvegarderDB();
    afficherStock();
    afficherPiecesEmballees();
    remplirListePiecesSortie();
    fermerSortieCommande();
    alert("Sortie enregistrée.");
}


// ======================================
// SAUVEGARDE AUTOMATIQUE VERS UN DOSSIER
// Microsoft Edge / navigateurs compatibles
// ======================================
const CLE_DOSSIER_SAUVEGARDE_STOCK = "ideeGourmandeDossierSauvegardeStock";
let dossierSauvegardeStock = null;
let sauvegardeAutomatiqueEnCours = false;
let sauvegardeAutomatiqueEnAttente = false;

function ouvrirDBSauvegardeStock(){
    return new Promise(function(resolve, reject){
        const requete = indexedDB.open("ideeGourmandeSauvegardes", 1);
        requete.onupgradeneeded = function(){
            requete.result.createObjectStore("parametres");
        };
        requete.onsuccess = function(){ resolve(requete.result); };
        requete.onerror = function(){ reject(requete.error); };
    });
}

async function memoriserDossierSauvegardeStock(handle){
    const stockage = await ouvrirDBSauvegardeStock();
    await new Promise(function(resolve, reject){
        const transaction = stockage.transaction("parametres", "readwrite");
        transaction.objectStore("parametres").put(handle, CLE_DOSSIER_SAUVEGARDE_STOCK);
        transaction.oncomplete = resolve;
        transaction.onerror = function(){ reject(transaction.error); };
    });
    stockage.close();
}

async function chargerDossierSauvegardeStock(){
    try{
        const stockage = await ouvrirDBSauvegardeStock();
        const handle = await new Promise(function(resolve, reject){
            const transaction = stockage.transaction("parametres", "readonly");
            const requete = transaction.objectStore("parametres").get(CLE_DOSSIER_SAUVEGARDE_STOCK);
            requete.onsuccess = function(){ resolve(requete.result || null); };
            requete.onerror = function(){ reject(requete.error); };
        });
        stockage.close();
        if(handle){
            dossierSauvegardeStock = handle;
            actualiserEtatSauvegardeStock("Dossier mémorisé. Vérification de l’autorisation…");
            const permission = await handle.queryPermission({mode:"readwrite"});
            if(permission === "granted"){
                actualiserEtatSauvegardeStock("Sauvegarde automatique activée.");
            } else {
                actualiserEtatSauvegardeStock("Clique sur « Choisir le dossier » pour réautoriser l’accès.");
            }
        }
    }catch(erreur){
        console.warn("Impossible de restaurer le dossier de sauvegarde.", erreur);
    }
}

function actualiserEtatSauvegardeStock(message){
    const statut = document.getElementById("etatSauvegardeAutomatique");
    if(statut) statut.textContent = message;
}

async function choisirDossierSauvegardeStock(){
    if(!window.showDirectoryPicker){
        alert("Cette fonction nécessite une version récente de Microsoft Edge sur ordinateur et une connexion sécurisée HTTPS.");
        return;
    }
    try{
        const handle = await window.showDirectoryPicker({mode:"readwrite"});
        const permission = await handle.requestPermission({mode:"readwrite"});
        if(permission !== "granted"){
            actualiserEtatSauvegardeStock("Autorisation refusée. La sauvegarde automatique reste inactive.");
            return;
        }
        dossierSauvegardeStock = handle;
        await memoriserDossierSauvegardeStock(handle);
        actualiserEtatSauvegardeStock("Dossier choisi. Sauvegarde automatique activée.");
        await sauvegarderFichierAutomatiqueStock();
        alert("Dossier configuré. Une première sauvegarde vient d’être créée. Les prochaines modifications seront sauvegardées automatiquement.");
    }catch(erreur){
        if(erreur && erreur.name !== "AbortError"){
            console.error("Erreur de sélection du dossier de sauvegarde.", erreur);
            alert("Impossible de configurer la sauvegarde automatique. Vérifie les autorisations du navigateur.");
        }
    }
}

async function sauvegarderFichierAutomatiqueStock(){
    if(!dossierSauvegardeStock || sauvegardeAutomatiqueEnCours){
        if(sauvegardeAutomatiqueEnCours) sauvegardeAutomatiqueEnAttente = true;
        return;
    }
    sauvegardeAutomatiqueEnCours = true;
    try{
        let permission = await dossierSauvegardeStock.queryPermission({mode:"readwrite"});
        if(permission !== "granted"){
            actualiserEtatSauvegardeStock("Accès au dossier à autoriser : clique sur « Choisir le dossier ».");
            return;
        }
        const donnees = localStorage.getItem("ideeGourmandeDB");
        if(!donnees) return;
        const date = new Date();
        const tampon = function(n){ return String(n).padStart(2,"0"); };
        const nomFichier = "sauvegarde-stock-idee-gourmande-" +
            date.getFullYear() + "-" + tampon(date.getMonth()+1) + "-" + tampon(date.getDate()) +
            "-" + tampon(date.getHours()) + "-" + tampon(date.getMinutes()) + "-" + tampon(date.getSeconds()) + ".json";
        const fichier = await dossierSauvegardeStock.getFileHandle(nomFichier, {create:true});
        const ecrivain = await fichier.createWritable();
        await ecrivain.write(donnees);
        await ecrivain.close();
        actualiserEtatSauvegardeStock("Dernière sauvegarde automatique : " + date.toLocaleString("fr-CH"));
    }catch(erreur){
        console.error("Échec de la sauvegarde automatique du stock.", erreur);
        actualiserEtatSauvegardeStock("Échec de la sauvegarde automatique. Vérifie le dossier et ses autorisations.");
    }finally{
        sauvegardeAutomatiqueEnCours = false;
        if(sauvegardeAutomatiqueEnAttente){
            sauvegardeAutomatiqueEnAttente = false;
            sauvegarderFichierAutomatiqueStock();
        }
    }
}

// Intercepte les sauvegardes du site sur la page Stock.
if(typeof sauvegarderDB === "function"){
    const sauvegarderDBOriginaleStock = sauvegarderDB;
    sauvegarderDB = function(){
        const resultat = sauvegarderDBOriginaleStock.apply(this, arguments);
        if(resultat) sauvegarderFichierAutomatiqueStock();
        return resultat;
    };
}
