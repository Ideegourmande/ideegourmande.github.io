// ======================================
// IDEE GOURMANDE
// Base de données centrale
// Version 2.5.0
// Gestion commandes + stock + achats
// ======================================


// ======================================
// CHARGEMENT BASE
// ======================================

let db = JSON.parse(
    localStorage.getItem("ideeGourmandeDB")
);

console.log("DATABASE OK", db);


// ======================================
// EMPLACEMENTS PAR DEFAUT
// ======================================

const emplacementsDefaut = [

    "Congélateur du réduit",
    "Congélateur bahut",
    "Congélateur GI",
    "Chambre froide",
    "Cave",
    "Réserve sèche"

];


// ======================================
// STRUCTURE BASE
// ======================================

const structureDB = {

    commandes: [],
    articles: [],
    emplacements: emplacementsDefaut,
    mouvements: [],
    achats: [],
    sessions: [],
    archives: [],
    clients: [],
    statistiques: {},
    parametres: {}

};


// ======================================
// SAUVEGARDE CENTRALE
// ======================================

function sauvegarderDB(){

    localStorage.setItem(
        "ideeGourmandeDB",
        JSON.stringify(db)
    );

}


// ======================================
// CREATION PREMIERE BASE
// ======================================

if(!db){

    db = {

        commandes: [],
        articles: [],
        emplacements: [
            ...emplacementsDefaut
        ],
        mouvements: [],
        achats: [],
        sessions: [],
        archives: [],
        clients: [],
        statistiques: {},
        parametres: {}

    };

    sauvegarderDB();

}


// ======================================
// VERIFICATION ANCIENNES VERSIONS
// ======================================

else{

    Object.keys(structureDB).forEach(
        cle => {

            if(db[cle] === undefined){

                if(Array.isArray(structureDB[cle])){

                    db[cle] = [
                        ...structureDB[cle]
                    ];

                }
                else{

                    db[cle] = {};

                }

            }

        }
    );


    // Sécurité tableaux

    if(!Array.isArray(db.commandes))
        db.commandes = [];

    if(!Array.isArray(db.archives))
        db.archives = [];

    if(!Array.isArray(db.achats))
        db.achats = [];

    if(!Array.isArray(db.sessions))
        db.sessions = [];

    if(!Array.isArray(db.clients))
        db.clients = [];

    if(!Array.isArray(db.articles))
        db.articles = [];

    if(!Array.isArray(db.mouvements))
        db.mouvements = [];


    if(
        !Array.isArray(db.emplacements)
        ||
        db.emplacements.length === 0
    ){

        db.emplacements = [
            ...emplacementsDefaut
        ];

    }


    sauvegarderDB();

}


// ======================================
// MIGRATION ANCIENNES COMMANDES
// ======================================

function migrerAnciennesCommandes(){

    let anciennes =
        JSON.parse(
            localStorage.getItem("commandes")
        ) || [];


    if(
        anciennes.length > 0
        &&
        db.commandes.length === 0
    ){

        db.commandes = [
            ...anciennes
        ];


        localStorage.removeItem(
            "commandes"
        );


        sauvegarderDB();

    }

}


migrerAnciennesCommandes();


// ======================================
// NORMALISATION NOM ARTICLE
// ======================================

function normaliserNomArticle(nom){

    return String(nom || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        );

}


// ======================================
// RECHERCHE ARTICLE STOCK
// ======================================

function trouverArticleStock(articleCommande){

    if(!articleCommande){
        return null;
    }


    const reference =
        String(
            articleCommande.reference || ""
        )
        .trim()
        .toLowerCase();


    const nom =
        normaliserNomArticle(
            articleCommande.nom
        );


    // ==================================
    // RECHERCHE PAR NOM
    // ==================================

    let article =
        db.articles.find(
            a =>
                normaliserNomArticle(a.nom)
                ===
                nom
        );


    if(article){
        return article;
    }


    // ==================================
    // CORRESPONDANCES PRODUITS
    // ==================================

    const correspondances = {

        "foie-gras":
            "foie gras de canard au torchon",

        "magret":
            "magret de canard fumé et séché",

        "viande-sechee":
            "viande séchée artisanale",

        "lard-sec":
            "lard sec légèrement fumé",

        "saumon-fume":
            "cœur de saumon fumé"

    };


    if(correspondances[reference]){

        const nomCorrespondant =
            normaliserNomArticle(
                correspondances[reference]
            );


        article =
            db.articles.find(
                a =>
                    normaliserNomArticle(a.nom)
                    ===
                    nomCorrespondant
            );


        if(article){
            return article;
        }

    }


    // ==================================
    // RECHERCHE PAR REFERENCE
    // ==================================

    if(reference){

        article =
            db.articles.find(
                a =>
                    String(
                        a.reference || ""
                    )
                    .trim()
                    .toLowerCase()
                    ===
                    reference
            );


        if(article){
            return article;
        }

    }


    return null;

}


// ======================================
// QUANTITE COMMANDEE
// ======================================

function calculerQuantiteCommande(
    articleCommande
){

    if(!articleCommande){
        return 0;
    }


    // Le saumon est géré en grammes

    if(
        articleCommande.reference
        ===
        "saumon-fume"
    ){

        return Number(
            articleCommande.poids
        ) || 0;

    }


    return Number(
        articleCommande.quantite
    ) || 0;

}


// ======================================
// CREATION MOUVEMENT STOCK
// ======================================

function enregistrerMouvementCommande(

    article,
    ancienStock,
    nouveauStock,
    consommation,
    commande

){

    db.mouvements.push({

        date:
            new Date().toLocaleString(),

        action:
            "Commande client",

        article:
            article.nom,

        commande:
            commande.id,

        ancienStock:
            ancienStock,

        nouveauStock:
            nouveauStock,

        difference:
            -consommation,

        origine:
            "Commande client"

    });

}


// ======================================
// RECHERCHE ACHAT AUTOMATIQUE EXISTANT
// ======================================

function trouverAchatAutomatique(article){

    if(!article){
        return null;
    }


    return db.achats.find(
        achat =>

            achat.automatique === true

            &&

            achat.statut !== "Réceptionné"

            &&

            Array.isArray(
                achat.articles
            )

            &&

            achat.articles.some(
                ligne =>

                    normaliserNomArticle(
                        ligne.article
                    )
                    ===
                    normaliserNomArticle(
                        article.nom
                    )
            )
    ) || null;

}


// ======================================
// AJOUT / MISE A JOUR ACHAT AUTOMATIQUE
// ======================================

function creerOuCompleterAchatAutomatique(

    article,
    quantite

){

    if(
        !article
        ||
        quantite <= 0
    ){

        return;

    }


    let achatExistant =
        trouverAchatAutomatique(
            article
        );


    // ==================================
    // ACHAT EXISTANT
    // ==================================

    if(achatExistant){

        let ligne =
            achatExistant.articles.find(
                ligne =>

                    normaliserNomArticle(
                        ligne.article
                    )
                    ===
                    normaliserNomArticle(
                        article.nom
                    )
            );


        if(ligne){

            ligne.quantite =
                (
                    Number(ligne.quantite)
                    || 0
                )
                +
                quantite;

        }
        else{

            achatExistant.articles.push({

                article:
                    article.nom,

                reference:
                    article.reference || "",

                quantite:
                    quantite,

                prix:
                    Number(
                        article.prixAchatMoyen
                    ) || 0

            });

        }


        recalculerTotalAchat(
            achatExistant
        );


        db.mouvements.push({

            date:
                new Date().toLocaleString(),

            action:
                "Complément achat automatique",

            achat:
                achatExistant.numero,

            article:
                article.nom,

            quantite:
                quantite,

            origine:
                "Commande client"

        });


        return achatExistant;

    }


    // ==================================
    // NOUVEL ACHAT
    // ==================================

    const id =
        Date.now();


    const achat = {

        id:
            id,

        numero:
            "ACH-" + id,

        date:
            new Date()
            .toISOString()
            .split("T")[0],

        fournisseur:
            "À définir",

        fournisseurId:
            null,

        articles: [

            {

                article:
                    article.nom,

                reference:
                    article.reference || "",

                quantite:
                    quantite,

                prix:
                    Number(
                        article.prixAchatMoyen
                    ) || 0

            }

        ],

        total:
            0,

        statut:
            "À commander",

        dateReception:
            null,

        automatique:
            true,

        origine:
            "Commande client"

    };


    recalculerTotalAchat(
        achat
    );


    db.achats.push(
        achat
    );


    db.mouvements.push({

        date:
            new Date().toLocaleString(),

        action:
            "Création achat automatique",

        achat:
            achat.numero,

        article:
            article.nom,

        quantite:
            quantite,

        origine:
            "Commande client"

    });


    console.log(
        "ACHAT AUTOMATIQUE CREE :",
        achat
    );


    return achat;

}


// ======================================
// RECALCUL TOTAL ACHAT
// ======================================

function recalculerTotalAchat(achat){

    if(!achat){
        return;
    }


    achat.total =
        (
            achat.articles || []
        )
        .reduce(

            (total, ligne) =>

                total
                +
                (
                    Number(
                        ligne.quantite
                    ) || 0
                )
                *
                (
                    Number(
                        ligne.prix
                    ) || 0
                ),

            0

        );

}


// ======================================
// TRAITEMENT STOCK + ACHAT COMMANDE
// ======================================

function traiterStockCommande(
    commande
){

    if(!commande){
        return false;
    }


    // ==================================
    // SECURITE DOUBLE TRAITEMENT
    // ==================================

    if(
        commande.stockTraite === true
    ){

        console.log(
            "STOCK DEJA TRAITE :",
            commande.id
        );

        return true;

    }


    // ==================================
    // RECUPERATION PRODUITS
    // ==================================

    const produits =
        Array.isArray(
            commande.produitsListe
        )
        ?
        commande.produitsListe
        :
        (
            Array.isArray(
                commande.produits
            )
            ?
            commande.produits
            :
            []
        );


    if(produits.length === 0){

        console.warn(
            "Aucun produit à traiter pour la commande",
            commande.id
        );

        return false;

    }


    // ==================================
    // PREPARATION DES OPERATIONS
    // ==================================

    const operations = [];


    for(
        const articleCommande
        of produits
    ){

        const articleStock =
            trouverArticleStock(
                articleCommande
            );


        if(!articleStock){

            console.warn(
                "ARTICLE STOCK INTROUVABLE :",
                articleCommande.nom,
                articleCommande.reference
            );


            commande.stockErreur =
                true;


            commande.stockErreurMessage =
                "Article introuvable dans le stock : "
                +
                (
                    articleCommande.nom
                    ||
                    articleCommande.reference
                    ||
                    "Article inconnu"
                );


            sauvegarderDB();


            return false;

        }


        const quantiteCommandee =
            calculerQuantiteCommande(
                articleCommande
            );


        if(
            quantiteCommandee <= 0
        ){

            continue;

        }


        operations.push({

            commande:
                articleCommande,

            stock:
                articleStock,

            quantite:
                quantiteCommandee

        });

    }


    // ==================================
    // APPLICATION STOCK + ACHATS
    // ==================================

    operations.forEach(
        operation => {

            const article =
                operation.stock;


            const quantiteCommandee =
                operation.quantite;


            const ancienStock =
                Number(
                    article.stock
                ) || 0;


            /*
                Quantité réellement disponible
                dans le stock.
            */

            const quantiteStockDisponible =
                Math.max(
                    0,
                    ancienStock
                );


            /*
                Quantité prélevée du stock.
            */

            const consommation =
                Math.min(
                    quantiteStockDisponible,
                    quantiteCommandee
                );


            /*
                Quantité manquante.
            */

            const quantiteManquante =
                Math.max(
                    0,
                    quantiteCommandee
                    -
                    consommation
                );


            /*
                Nouveau stock.
            */

            const nouveauStock =
                Math.max(
                    0,
                    ancienStock
                    -
                    consommation
                );


            article.stock =
                nouveauStock;


            // ==================================
            // MOUVEMENT STOCK
            // ==================================

            if(consommation > 0){

                enregistrerMouvementCommande(

                    article,

                    ancienStock,

                    nouveauStock,

                    consommation,

                    commande

                );

            }
            else{

                /*
                    Même avec un stock à 0,
                    on conserve une trace de la commande.
                */

                db.mouvements.push({

                    date:
                        new Date().toLocaleString(),

                    action:
                        "Commande client - stock insuffisant",

                    article:
                        article.nom,

                    commande:
                        commande.id,

                    ancienStock:
                        ancienStock,

                    nouveauStock:
                        nouveauStock,

                    difference:
                        0,

                    origine:
                        "Commande client"

                });

            }


            // ==================================
            // CREATION ACHAT MANQUANT
            // ==================================

            if(
                quantiteManquante > 0
            ){

                creerOuCompleterAchatAutomatique(

                    article,

                    quantiteManquante

                );

            }

        }
    );


    // ==================================
    // COMMANDE TRAITEE
    // ==================================

    commande.stockTraite =
        true;


    commande.stockErreur =
        false;


    commande.stockTraiteDate =
        new Date().toLocaleString();


    // ==================================
    // SAUVEGARDE
    // ==================================

    sauvegarderDB();


    console.log(
        "STOCK + ACHATS COMMANDE TRAITES :",
        commande.id
    );


    return true;

}


// ======================================
// AJOUT COMMANDE + CLIENT
// ======================================

function ajouterCommande(
    commande
){

    if(!commande){

        console.error(
            "Impossible d'ajouter une commande vide."
        );

        return false;

    }


    // ==================================
    // SECURITE TABLEAUX
    // ==================================

    if(!Array.isArray(db.commandes))
        db.commandes = [];

    if(!Array.isArray(db.achats))
        db.achats = [];

    if(!Array.isArray(db.mouvements))
        db.mouvements = [];

    if(!Array.isArray(db.clients))
        db.clients = [];


    // ==================================
    // AJOUT COMMANDE
    // ==================================

    db.commandes.push(
        commande
    );


    // ==================================
    // CLIENT
    // ==================================

    let clientExiste =
        db.clients.find(
            c =>
                c.email
                ===
                commande.email
        );


    if(!clientExiste){

        db.clients.push({

            id:
                commande.id,

            nom:
                commande.client,

            telephone:
                commande.telephone,

            email:
                commande.email,

            adresse:
                commande.adresse || ""

        });

    }


    // ==================================
    // TRAITEMENT STOCK
    // ==================================

    const stockTraite =
        traiterStockCommande(
            commande
        );


    if(
        stockTraite === false
    ){

        commande.stockTraite =
            false;

        commande.stockErreur =
            true;

        commande.stockErreurDate =
            new Date().toLocaleString();

    }


    // ==================================
    // SAUVEGARDE COMPLETE
    // ==================================

    sauvegarderDB();


    console.log(
        "COMMANDE AJOUTEE :",
        commande
    );


    return true;

}


// ======================================
// RETRAITEMENT MANUEL
// ======================================

function retraiterStockCommande(
    idCommande
){

    const commande =
        db.commandes.find(
            cmd =>
                String(cmd.id)
                ===
                String(idCommande)
        );


    if(!commande){

        console.warn(
            "Commande introuvable :",
            idCommande
        );

        return false;

    }


    if(
        commande.stockTraite === true
    ){

        alert(
            "Le stock de cette commande a déjà été traité."
        );

        return false;

    }


    commande.stockErreur =
        false;


    const resultat =
        traiterStockCommande(
            commande
        );


    sauvegarderDB();


    return resultat;

}


// ======================================
// ACCES BASE COMPLETE
// ======================================

function obtenirDB(){

    return db;

}


// ======================================
// SECURITE AFFICHAGE HTML
// ======================================

function securiserTexte(
    texte
){

    return String(
        texte || ""
    )

    .replace(
        /&/g,
        "&amp;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    );

}


// ======================================
// EXPORT GLOBAL
// ======================================

window.ajouterCommande =
    ajouterCommande;

window.obtenirDB =
    obtenirDB;

window.sauvegarderDB =
    sauvegarderDB;

window.traiterStockCommande =
    traiterStockCommande;

window.retraiterStockCommande =
    retraiterStockCommande;

window.trouverArticleStock =
    trouverArticleStock;


// ======================================
// FIN
// ======================================

console.log(
    "DATABASE.JS 2.5.0 CHARGE - STOCK + ACHATS AUTOMATIQUES ACTIFS",
    db
);
