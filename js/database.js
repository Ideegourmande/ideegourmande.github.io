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

}


// ======================================
// VERIFICATION ANCIENNES VERSIONS
// ======================================

else{

    Object.keys(structureDB).forEach(
        cle => {

            if(
                db[cle] === undefined
            ){

                if(
                    Array.isArray(
                        structureDB[cle]
                    )
                ){

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

}


// ======================================
// SECURITE DES TABLEAUX
// ======================================

if(!Array.isArray(db.commandes))
    db.commandes = [];

if(!Array.isArray(db.articles))
    db.articles = [];

if(!Array.isArray(db.emplacements))
    db.emplacements = [...emplacementsDefaut];

if(!Array.isArray(db.mouvements))
    db.mouvements = [];

if(!Array.isArray(db.achats))
    db.achats = [];

if(!Array.isArray(db.sessions))
    db.sessions = [];

if(!Array.isArray(db.archives))
    db.archives = [];

if(!Array.isArray(db.clients))
    db.clients = [];

if(typeof db.statistiques !== "object" || db.statistiques === null)
    db.statistiques = {};

if(typeof db.parametres !== "object" || db.parametres === null)
    db.parametres = {};


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
// MIGRATION ANCIENNES COMMANDES
// ======================================

function migrerAnciennesCommandes(){

    let anciennes =
        JSON.parse(
            localStorage.getItem(
                "commandes"
            )
        ) || [];


    if(

        anciennes.length > 0

        &&

        db.commandes.length === 0

    ){

        db.commandes =
            [...anciennes];


        localStorage.removeItem(
            "commandes"
        );

    }

}


migrerAnciennesCommandes();


// ======================================
// NORMALISATION NOM ARTICLE
// ======================================

function normaliserNomArticle(nom){

    return String(
        nom || ""
    )
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(
        /[\u0300-\u036f]/g,
        ""
    );

}


// ======================================
// CORRESPONDANCES PRODUITS
// ======================================

const correspondancesProduits = {

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


// ======================================
// UNITES / CONSOMMATION PAR PRODUIT
// ======================================

const reglesStockProduits = {

    "foie-gras": {

        unite: "g",

        poidsParArticle: 200

    },

    "magret": {

        unite: "pièce",

        poidsParArticle: 1

    },

    "viande-sechee": {

        unite: "g",

        poidsParArticle: 500

    },

    "lard-sec": {

        unite: "g",

        poidsParArticle: 500

    },

    "saumon-fume": {

        unite: "g",

        poidsParArticle: null

    }

};


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
        .trim();


    const nom =
        normaliserNomArticle(
            articleCommande.nom
        );


    // ----------------------------------
    // 1. Recherche par nom
    // ----------------------------------

    let article =
        db.articles.find(
            a =>

                normaliserNomArticle(
                    a.nom
                )
                ===
                nom

        );


    if(article){

        return article;

    }


    // ----------------------------------
    // 2. Recherche par référence connue
    // ----------------------------------

    if(
        correspondancesProduits[
            reference
        ]
    ){

        const nomCorrespondant =
            normaliserNomArticle(
                correspondancesProduits[
                    reference
                ]
            );


        article =
            db.articles.find(
                a =>

                    normaliserNomArticle(
                        a.nom
                    )
                    ===
                    nomCorrespondant

            );


        if(article){

            return article;

        }

    }


    // ----------------------------------
    // 3. Recherche par référence stock
    // ----------------------------------

    if(reference){

        article =
            db.articles.find(
                a =>

                    normaliserNomArticle(
                        a.reference
                    )
                    ===
                    normaliserNomArticle(
                        reference
                    )

            );


        if(article){

            return article;

        }

    }


    return null;

}


// ======================================
// DETERMINER CONSOMMATION STOCK
// ======================================

function calculerConsommationStock(

    articleCommande,

    articleStock

){

    if(!articleCommande){

        return 0;

    }


    const reference =
        String(
            articleCommande.reference || ""
        )
        .trim();


    // ==================================
    // SAUMON
    // ==================================

    if(
        reference === "saumon-fume"
    ){

        return Number(
            articleCommande.poids
        ) || 0;

    }


    // ==================================
    // FOIE GRAS
    // 200 g par article
    // ==================================

    if(
        reference === "foie-gras"
    ){

        const quantite =
            Number(
                articleCommande.quantite
            ) || 0;


        return (
            quantite *
            200
        );

    }


    // ==================================
    // VIANDE SECHEE
    // 500 g par article
    // ==================================

    if(
        reference === "viande-sechee"
    ){

        const quantite =
            Number(
                articleCommande.quantite
            ) || 0;


        return (
            quantite *
            500
        );

    }


    // ==================================
    // LARD SEC
    // 500 g par article
    // ==================================

    if(
        reference === "lard-sec"
    ){

        const quantite =
            Number(
                articleCommande.quantite
            ) || 0;


        return (
            quantite *
            500
        );

    }


    // ==================================
    // MAGRET
    // 1 PIECE PAR ARTICLE
    // ==================================

    if(
        reference === "magret"
    ){

        return Number(
            articleCommande.quantite
        ) || 0;

    }


    // ==================================
    // SECURITE PRODUITS INCONNUS
    // ==================================

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

    commande,

    articleCommande

){

    db.mouvements.push({

        date:
            new Date()
            .toLocaleString(),

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

        unite:
            article.unite || "",

        reference:
            articleCommande.reference || "",

        quantiteCommande:
            Number(
                articleCommande.quantite
            ) || 0,

        poidsCommande:
            Number(
                articleCommande.poids
            ) || 0,

        origine:
            "Commande client"

    });

}


// ======================================
// CREATION / MISE A JOUR ACHAT
// ======================================

function verifierBesoinAchat(article){

    if(!article){

        return;

    }


    const stock =
        Number(
            article.stock
        ) || 0;


    const minimum =
        Number(
            article.minimum
        ) || 0;


    // ----------------------------------
    // Stock suffisant
    // ----------------------------------

    if(
        stock > minimum
    ){

        return;

    }


    // ----------------------------------
    // Quantité nécessaire
    // ----------------------------------

    let quantiteACommander =
        minimum - stock;


    if(
        quantiteACommander <= 0
    ){

        quantiteACommander = 1;

    }


    // ----------------------------------
    // Recherche achat automatique ouvert
    // ----------------------------------

    let achatExistant =
        db.achats.find(
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

        );


    if(achatExistant){

        const ligne =
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
                Math.max(
                    Number(
                        ligne.quantite
                    ) || 0,

                    quantiteACommander
                );

        }


        achatExistant.total =
            achatExistant.articles.reduce(

                (
                    total,
                    ligne
                ) =>

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


        return;

    }


    // ----------------------------------
    // Création nouvel achat
    // ----------------------------------

    const id =
        Date.now();


    const numero =
        "ACH-" + id;


    const achat = {

        id:

            id,

        numero:

            numero,

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

                quantite:
                    quantiteACommander,

                unite:
                    article.unite || "",

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


    db.achats.push(
        achat
    );


    db.mouvements.push({

        date:
            new Date()
            .toLocaleString(),

        action:
            "Création achat automatique",

        achat:
            numero,

        article:
            article.nom,

        quantite:
            quantiteACommander,

        unite:
            article.unite || "",

        origine:
            "Stock sous minimum"

    });

}


// ======================================
// TRAITEMENT STOCK COMMANDE
// ======================================

function traiterStockCommande(
    commande
){

    if(!commande){

        return false;

    }


    // ==================================
    // PROTECTION DOUBLE TRAITEMENT
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


    if(
        produits.length === 0
    ){

        console.warn(
            "Aucun produit à traiter pour la commande",
            commande.id
        );

        return false;

    }


    // ==================================
    // PREPARATION OPERATIONS
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


            commande.stockErreurArticle =
                articleCommande.nom;


            return false;

        }


        const consommation =
            calculerConsommationStock(

                articleCommande,

                articleStock

            );


        if(
            consommation <= 0
        ){

            continue;

        }


        operations.push({

            commande:
                articleCommande,

            stock:
                articleStock,

            consommation:
                consommation

        });

    }


    // ==================================
    // APPLICATION STOCK
    // ==================================

    operations.forEach(
        operation => {

            const article =
                operation.stock;


            const consommation =
                operation.consommation;


            const ancienStock =
                Number(
                    article.stock
                ) || 0;


            const nouveauStock =
                ancienStock -
                consommation;


            // ----------------------------------
            // Le stock ne descend pas sous zéro
            // ----------------------------------

            article.stock =
                Math.max(
                    0,
                    nouveauStock
                );


            // ----------------------------------
            // Mouvement
            // ----------------------------------

            enregistrerMouvementCommande(

                article,

                ancienStock,

                article.stock,

                consommation,

                commande,

                operation.commande

            );


            // ----------------------------------
            // Vérification achat
            // ----------------------------------

            verifierBesoinAchat(
                article
            );

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
        new Date()
        .toLocaleString();


    // ==================================
    // SAUVEGARDE
    // ==================================

    sauvegarderDB();


    console.log(
        "STOCK COMMANDE TRAITE :",
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

        return;

    }


    // ==================================
    // SECURITE
    // ==================================

    if(
        !Array.isArray(db.commandes)
    ){

        db.commandes = [];

    }


    if(
        !Array.isArray(db.achats)
    ){

        db.achats = [];

    }


    if(
        !Array.isArray(db.mouvements)
    ){

        db.mouvements = [];

    }


    if(
        !Array.isArray(db.clients)
    ){

        db.clients = [];

    }


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

                c.email ===
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
            new Date()
            .toLocaleString();

    }


    // ==================================
    // SAUVEGARDE COMPLETE
    // ==================================

    sauvegarderDB();


    console.log(
        "COMMANDE AJOUTEE :",
        commande
    );

}


// ======================================
// RETRAITEMENT MANUEL STOCK
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
        texte
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
// FIN
// ======================================

sauvegarderDB();


console.log(
    "DATABASE.JS 2.5.0 CHARGE - DB =",
    db
);
