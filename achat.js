// ======================================
// IDEE GOURMANDE
// GESTION DES ACHATS
// Version 1.4.0
// Achats manuels + automatiques
// ======================================


let achatEdition = -1;

let lignesAchat = [];


// ======================================
// VERIFICATION BASE
// ======================================

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


// ======================================
// SAUVEGARDE
// ======================================

function sauvegarderAchats(){

    if(
        typeof sauvegarderDB ===
        "function"
    ){

        sauvegarderDB();

    }

}


// ======================================
// NUMERO ACHAT
// ======================================

function genererNumeroAchat(){

    return "ACH-" + Date.now();

}


// ======================================
// NOUVEL ACHAT
// ======================================

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

        popup.style.display =
            "flex";

    }

}


// ======================================
// AJOUT LIGNE ACHAT
// ======================================

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
        Number(
            inputQuantite.value
        ) || 0;


    const prix =
        Number(
            inputPrix.value
        ) || 0;


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


// ======================================
// AFFICHAGE LIGNES
// ======================================

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


    lignesAchat.forEach(
        (ligne,index) => {

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


                <button
                    onclick="supprimerLigneAchat(${index})"
                >

                    ❌

                </button>

            </div>

            `;

        }
    );


    const totalZone =
        document.getElementById(
            "totalAchat"
        );


    if(totalZone){

        totalZone.textContent =
            total.toFixed(2)
            +
            " CHF";

    }

}


// ======================================
// SUPPRIMER LIGNE
// ======================================

function supprimerLigneAchat(
    index
){

    lignesAchat.splice(
        index,
        1
    );


    afficherLignesAchat();

}


// ======================================
// ENREGISTRER ACHAT MANUEL
// ======================================

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


    // Recherche fournisseur

    let fournisseur =
        db.clients.find(
            client =>

                client.type ===
                "Fournisseur"

                &&

                client.nom?.toLowerCase()
                ===
                fournisseurNom.toLowerCase()
        );


    // Création fournisseur

    if(!fournisseur){

        fournisseur = {

            id:
                Date.now(),

            nom:
                fournisseurNom,

            type:
                "Fournisseur",

            telephone:
                "",

            email:
                "",

            adresse:
                "",

            notes:
                "",

            dateCreation:
                new Date()
                .toLocaleString()

        };


        db.clients.push(
            fournisseur
        );

    }


    // Création achat

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
                (
                    total,
                    ligne
                ) =>

                    total
                    +
                    (
                        ligne.quantite
                        *
                        ligne.prix
                    ),

                0
            ),

        statut:
            "En attente",

        dateReception:
            null,

        automatique:
            false,

        origine:
            "Saisie manuelle"

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
            achat.total,

        origine:
            "Saisie manuelle"

    });


    lignesAchat = [];


    sauvegarderAchats();


    afficherAchats();


    fermerPopupAchat();

}


// ======================================
// AFFICHAGE ACHATS
// ======================================

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


    db.achats.forEach(
        (achat,index) => {

            achat.numero ??=
                "ACH-" + achat.id;


            achat.dateReception ??=
                null;


            achat.statut ??=
                "En attente";


            achat.total =
                Number(
                    achat.total
                ) || 0;


            const badgeAutomatique =

                achat.automatique === true

                ?

                `

                <p>

                    🤖

                    <strong>
                        Achat automatique
                    </strong>

                    ${
                        achat.origine
                        ?
                        `(${achat.origine})`
                        :
                        ""
                    }

                </p>

                `

                :

                "";


            const articlesHTML =

                Array.isArray(
                    achat.articles
                )

                ?

                achat.articles
                    .map(
                        ligne =>
                            `
                            ${ligne.article}
                            (${ligne.quantite})
                            `
                    )
                    .join(", ")

                :

                "-";


            zone.innerHTML += `

            <div class="commande-admin">

                <h3>

                    ${achat.numero}

                </h3>


                ${badgeAutomatique}


                <p>

                    Fournisseur :

                    <strong>

                        ${
                            achat.fournisseur
                            ||
                            "À définir"
                        }

                    </strong>

                </p>


                <p>

                    Date :

                    ${achat.date || "-"}

                </p>


                <p>

                    Articles :

                    ${articlesHTML}

                </p>


                <p>

                    Total :

                    <strong>

                        ${achat.total.toFixed(2)}
                        CHF

                    </strong>

                </p>


                <p>

                    Statut :

                    ${achat.statut}

                </p>


                ${
                    achat.statut !==
                    "Réceptionné"

                    ?

                    `

                    <button
                        onclick="receptionnerAchat(${index})"
                    >

                        📦 Réceptionner

                    </button>

                    `

                    :

                    `

                    <p>

                        ✅ Réceptionné le :

                        ${
                            achat.dateReception
                            ||
                            "-"
                        }

                    </p>

                    `
                }


                <button
                    onclick="supprimerAchat(${index})"
                >

                    🗑 Supprimer

                </button>


            </div>

            `;

        }
    );

}


// ======================================
// PRIX MOYEN ACHAT
// ======================================

function calculerPrixMoyen(
    article,
    quantiteAjoutee,
    prixAchat
){

    const ancienStock =
        Number(
            article.stock
        ) || 0;


    const ancienPrix =
        Number(
            article.prixAchatMoyen
        ) || 0;


    const nouveauStock =
        ancienStock
        +
        quantiteAjoutee;


    if(nouveauStock <= 0){

        return prixAchat;

    }


    return (

        (
            ancienStock
            *
            ancienPrix

            +

            quantiteAjoutee
            *
            prixAchat
        )

        /

        nouveauStock

    );

}


// ======================================
// RECHERCHE ARTICLE RECEPTION
// ======================================

function trouverArticlePourReception(
    ligne
){

    if(!ligne){

        return null;

    }


    // Par référence

    if(ligne.reference){

        const reference =
            String(
                ligne.reference
            )
            .trim()
            .toLowerCase();


        const articleParReference =
            db.articles.find(
                article =>

                    String(
                        article.reference
                        ||
                        ""
                    )
                    .trim()
                    .toLowerCase()
                    ===
                    reference
            );


        if(articleParReference){

            return articleParReference;

        }

    }


    // Par nom normalisé

    const nomLigne =

        typeof normaliserNomArticle ===
        "function"

        ?

        normaliserNomArticle(
            ligne.article
        )

        :

        String(
            ligne.article || ""
        )
        .trim()
        .toLowerCase();


    const article =
        db.articles.find(
            article => {

                const nomArticle =

                    typeof normaliserNomArticle ===
                    "function"

                    ?

                    normaliserNomArticle(
                        article.nom
                    )

                    :

                    String(
                        article.nom || ""
                    )
                    .trim()
                    .toLowerCase();


                return (
                    nomArticle
                    ===
                    nomLigne
                );

            }
        );


    if(article){

        return article;

    }


    return db.articles.find(
        article =>
            article.nom
            ===
            ligne.article
    ) || null;

}


// ======================================
// RECEPTION ACHAT → STOCK
// ======================================

function receptionnerAchat(
    index
){

    if(!verifierAchatsDB())
        return;


    const achat =
        db.achats[index];


    if(!achat)
        return;


    if(
        achat.statut ===
        "Réceptionné"
    ){

        alert(
            "Cet achat est déjà réceptionné."
        );

        return;

    }


    if(
        !Array.isArray(
            achat.articles
        )
        ||
        achat.articles.length === 0
    ){

        alert(
            "Cet achat ne contient aucun article."
        );

        return;

    }


    // ==================================
    // VERIFICATION COMPLETE AVANT
    // DE MODIFIER LE STOCK
    // ==================================

    const lignesValidees = [];


    for(
        const ligne
        of achat.articles
    ){

        const article =
            trouverArticlePourReception(
                ligne
            );


        if(!article){

            alert(

                "Impossible de réceptionner l'achat.\n\n"

                +

                "Article introuvable dans le stock : "

                +

                (
                    ligne.article
                    ||
                    ligne.reference
                    ||
                    "Article inconnu"
                )

            );


            console.error(
                "ARTICLE INTROUVABLE :",
                ligne
            );


            return;

        }


        const quantite =
            Number(
                ligne.quantite
            ) || 0;


        if(quantite <= 0){

            alert(

                "Quantité incorrecte pour : "

                +

                article.nom

            );


            return;

        }


        lignesValidees.push({

            ligne,

            article,

            quantite

        });

    }


    // ==================================
    // APPLICATION RECEPTION
    // ==================================

    lignesValidees.forEach(
        operation => {

            const ligne =
                operation.ligne;


            const article =
                operation.article;


            const quantite =
                operation.quantite;


            const ancienStock =
                Number(
                    article.stock
                ) || 0;


            const ancienPrix =
                Number(
                    article.prixAchatMoyen
                ) || 0;


            const prix =
                Number(
                    ligne.prix
                ) || 0;


            article.prixAchatMoyen =

                calculerPrixMoyen(

                    article,

                    quantite,

                    prix

                );


            article.stock =
                ancienStock
                +
                quantite;


            db.mouvements.push({

                date:
                    new Date()
                    .toLocaleString(),

                action:
                    "Réception achat",

                article:
                    article.nom,

                achat:
                    achat.numero,

                ancienStock,

                nouveauStock:
                    article.stock,

                ancienPrix,

                nouveauPrix:
                    article.prixAchatMoyen,

                difference:
                    quantite,

                origine:
                    achat.automatique === true
                    ?
                    "Achat automatique"
                    :
                    "Achat manuel"

            });

        }
    );


    // ==================================
    // FINALISATION ACHAT
    // ==================================

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
            achat.total,

        automatique:
            achat.automatique === true,

        origine:
            achat.origine
            ||
            "Achat manuel"

    });


    sauvegarderAchats();


    afficherAchats();


    if(
        typeof afficherStock ===
        "function"
    ){

        afficherStock();

    }

}


// ======================================
// SUPPRIMER ACHAT
// ======================================

function supprimerAchat(
    index
){

    if(!verifierAchatsDB())
        return;


    const achat =
        db.achats[index];


    if(!achat)
        return;


    let message =
        "Supprimer cet achat ?";


    if(
        achat.statut ===
        "Réceptionné"
    ){

        message =

            "Cet achat a déjà été réceptionné.\n\n"

            +

            "Le stock ajouté ne sera pas retiré.\n\n"

            +

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
            achat.numero
            ??
            achat.id,

        fournisseur:
            achat.fournisseur,

        fournisseurId:
            achat.fournisseurId,

        statut:
            achat.statut,

        automatique:
            achat.automatique === true,

        origine:
            achat.origine
            ||
            "Achat manuel"

    });


    db.achats.splice(
        index,
        1
    );


    sauvegarderAchats();


    afficherAchats();

}


// ======================================
// ANNULATION RECEPTION
// ======================================

function annulerReceptionAchat(
    index
){

    const achat =
        db.achats[index];


    if(!achat)
        return;


    if(
        achat.statut !==
        "Réceptionné"
    ){

        alert(
            "Cet achat n'est pas réceptionné."
        );

        return;

    }


    alert(
        "Fonction prévue dans une prochaine version."
    );

}


// ======================================
// FERMER POPUP
// ======================================

function fermerPopupAchat(){

    const popup =
        document.getElementById(
            "popupAchat"
        );


    if(popup){

        popup.style.display =
            "none";

    }

}


// ======================================
// CHARGER ARTICLES
// ======================================

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


    db.articles.forEach(
        article => {

            liste.innerHTML += `

            <option value="${article.nom}">

                ${article.nom}

            </option>

            `;

        }
    );

}


// ======================================
// CHARGER FOURNISSEURS
// ======================================

function chargerFournisseursAchat(){

    if(!verifierAchatsDB())
        return;


    const liste =
        document.getElementById(
            "achatFournisseur"
        );


    if(!liste)
        return;


    if(
        liste.tagName ===
        "SELECT"
    ){

        liste.innerHTML = "";


        db.clients
        .filter(
            client =>
                client.type ===
                "Fournisseur"
        )
        .forEach(
            fournisseur => {

                liste.innerHTML += `

                <option value="${fournisseur.nom}">

                    ${fournisseur.nom}

                </option>

                `;

            }
        );

    }

}


// ======================================
// ACTUALISATION MODULE
// ======================================

function actualiserModuleAchats(){

    chargerArticlesAchat();

    chargerFournisseursAchat();

    afficherAchats();

}


// ======================================
// INITIALISATION
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

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

    }
);
