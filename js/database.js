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

console.log("DATABASE 2.5.0 - CHARGEMENT", db);


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

if (!db) {

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

else {

    Object.keys(structureDB).forEach(
        cle => {

            if (db[cle] === undefined) {

                if (
                    Array.isArray(
                        structureDB[cle]
                    )
                ) {

                    db[cle] = [
                        ...structureDB[cle]
                    ];

                }
                else {

                    db[cle] = {};

                }

            }

        }
    );


    // ==================================
    // SECURITE COMMANDES
    // ==================================

    if (!Array.isArray(db.commandes)) {

        db.commandes = [];

    }


    // ==================================
    // SECURITE ARCHIVES
    // ==================================

    if (!Array.isArray(db.archives)) {

        db.archives = [];

    }


    // ==================================
    // SECURITE ACHATS
    // ==================================

    if (!Array.isArray(db.achats)) {

        db.achats = [];

    }


    // ==================================
    // SECURITE SESSIONS
    // ==================================

    if (!Array.isArray(db.sessions)) {

        db.sessions = [];

    }


    // ==================================
    // SECURITE CLIENTS
    // ==================================

    if (!Array.isArray(db.clients)) {

        db.clients = [];

    }


    // ==================================
    // SECURITE STOCK
    // ==================================

    if (!Array.isArray(db.articles)) {

        db.articles = [];

    }


    // ==================================
    // SECURITE MOUVEMENTS
    // ==================================

    if (!Array.isArray(db.mouvements)) {

        db.mouvements = [];

    }


    // ==================================
    // SECURITE EMPLACEMENTS
    // ==================================

    if (
        !Array.isArray(db.emplacements)
        ||
        db.emplacements.length === 0
    ) {

        db.emplacements = [
            ...emplacementsDefaut
        ];

    }


    sauvegarderDB();

}


// ======================================
// MIGRATION ANCIENNES COMMANDES
// ======================================

function migrerAnciennesCommandes() {

    let anciennes =
        JSON.parse(
            localStorage.getItem(
                "commandes"
            )
        ) || [];


    if (

        anciennes.length > 0

        &&

        db.commandes.length === 0

    ) {

        db.commandes = [
            ...anciennes
        ];


        localStorage.removeItem(
            "commandes"
        );


        sauvegarderDB();

    }

}


// ======================================
// LANCEMENT MIGRATION
// ======================================

migrerAnciennesCommandes();


// ======================================
// SAUVEGARDE CENTRALE
// ======================================

function sauvegarderDB() {

    localStorage.setItem(

        "ideeGourmandeDB",

        JSON.stringify(db)

    );

}


// ======================================
// NORMALISATION NOM ARTICLE
// ======================================

function normaliserNomArticle(nom) {

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
// RECHERCHE ARTICLE STOCK
// ======================================

function trouverArticleStock(articleCommande) {

    if (!articleCommande) {

        return null;

    }


    const reference =
        normaliserNomArticle(
            articleCommande.reference
        );


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
                normaliserNomArticle(
                    a.nom
                ) === nom
        );


    if (article) {

        return article;

    }


    // ==================================
    // CORRESPONDANCES REFERENCES
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


    if (
        correspondances[
            articleCommande.reference
        ]
    ) {

        const nomCorrespondant =
            normaliserNomArticle(
                correspondances[
                    articleCommande.reference
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


        if (article) {

            return article;

        }

    }


    // ==================================
    // DERNIERE RECHERCHE PAR REFERENCE
    // ==================================

    if (reference) {

        article =
            db.articles.find(
                a =>
                    normaliserNomArticle(
                        a.reference
                    )
                    ===
                    reference
            );


        if (article) {

            return article;

        }

    }


    return null;

}


// ======================================
// CALCUL QUANTITE COMMANDEE
// ======================================

function calculerQuantiteCommande(
    articleCommande
) {

    if (!articleCommande) {

        return 0;

    }


    // ==================================
    // SAUMON
    // ==================================
    // Le saumon est géré en grammes.

    if (
        articleCommande.reference
        ===
        "saumon-fume"
    ) {

        return Number(
            articleCommande.poids
        ) || 0;

    }


    // ==================================
    // AUTRES PRODUITS
    // ==================================
    // 1 = une pièce / portion.

    return Number(
        articleCommande.quantite
    ) || 1;

}


// ======================================
// INFORMATIONS DE PORTION
// ======================================

function obtenirInformationsPortion(
    articleCommande
) {

    if (!articleCommande) {

        return {
            unite: "pièce",
            poidsUnitaire: 0
        };

    }


    const reference =
        normaliserNomArticle(
            articleCommande.reference
        );


    // ==================================
    // FOIE GRAS
    // ==================================

    if (reference === "foie-gras") {

        return {

            unite: "pièce",

            poidsUnitaire: 200

        };

    }


    // ==================================
    // VIANDE SECHEE
    // ==================================

    if (reference === "viande-sechee") {

        return {

            unite: "pièce",

            poidsUnitaire: 500

        };

    }


    // ==================================
    // LARD
    // ==================================

    if (reference === "lard-sec") {

        return {

            unite: "pièce",

            poidsUnitaire: 500

        };

    }


    // ==================================
    // MAGRET
    // ==================================

    if (reference === "magret") {

        return {

            unite: "pièce",

            poidsUnitaire: 0

        };

    }


    // ==================================
    // SAUMON
    // ==================================

    if (reference === "saumon-fume") {

        return {

            unite: "g",

            poidsUnitaire: 1

        };

    }


    return {

        unite:
            articleCommande.unite
            ||
            "pièce",

        poidsUnitaire:
            Number(
                articleCommande.poidsUnitaire
            ) || 0

    };

}


// ======================================
// CREATION MOUVEMENT STOCK
// ======================================

function enregistrerMouvementCommande(

    article,

    ancienStock,

    nouveauStock,

    quantiteConsommee,

    commande

) {

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
            -quantiteConsommee,

        origine:
            "Commande client"

    });

}


// ======================================
// RECHERCHE ACHAT EXISTANT
// ======================================

function trouverAchatOuvert(article) {

    if (!article) {

        return null;

    }


    return db.achats.find(

        achat =>

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
// CREATION ACHAT AUTOMATIQUE
// ======================================

function creerAchatAutomatique(

    article,

    quantiteManquante,

    articleCommande,

    commande

) {

    if (

        !article

        ||

        quantiteManquante <= 0

    ) {

        return null;

    }


    // ==================================
    // RECHERCHE ACHAT EXISTANT
    // ==================================

    let achatExistant =
        trouverAchatOuvert(
            article
        );


    // ==================================
    // SI ACHAT EXISTE DEJA
    // ==================================

    if (achatExistant) {

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


        if (ligne) {

            ligne.quantite =
                Number(
                    ligne.quantite
                ) +
                quantiteManquante;

        }
        else {

            achatExistant.articles.push({

                article:
                    article.nom,

                quantite:
                    quantiteManquante,

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
                new Date()
                    .toLocaleString(),

            action:
                "Mise à jour achat automatique",

            achat:
                achatExistant.numero,

            article:
                article.nom,

            quantite:
                quantiteManquante,

            commande:
                commande.id,

            origine:
                "Commande client - stock insuffisant"

        });


        return achatExistant;

    }


    // ==================================
    // CREATION NOUVEL ACHAT
    // ==================================

    const id =
        Date.now();


    const numero =
        "ACH-" + id;


    const infosPortion =
        obtenirInformationsPortion(
            articleCommande
        );


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
                    quantiteManquante,

                prix:
                    Number(
                        article.prixAchatMoyen
                    ) || 0,

                unite:
                    infosPortion.unite,

                poidsUnitaire:
                    infosPortion.poidsUnitaire

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
            "Commande client",

        commandeOrigine:
            commande.id

    };


    recalculerTotalAchat(
        achat
    );


    db.achats.push(
        achat
    );


    // ==================================
    // MOUVEMENT
    // ==================================

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
            quantiteManquante,

        commande:
            commande.id,

        origine:
            "Commande client - stock insuffisant"

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

function recalculerTotalAchat(achat) {

    if (!achat) {

        return;

    }


    if (
        !Array.isArray(
            achat.articles
        )
    ) {

        achat.articles = [];

    }


    achat.total =
        achat.articles.reduce(

            (
                total,
                ligne
            ) =>

                total +

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
// TRAITEMENT STOCK COMMANDE
// ======================================

function traiterStockCommande(
    commande
) {

    if (!commande) {

        return false;

    }


    // ==================================
    // SECURITE DOUBLE TRAITEMENT
    // ==================================

    if (
        commande.stockTraite === true
    ) {

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


    if (
        produits.length === 0
    ) {

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


    for (
        const articleCommande
        of produits
    ) {

        const articleStock =
            trouverArticleStock(
                articleCommande
            );


        if (!articleStock) {

            console.warn(

                "ARTICLE STOCK INTROUVABLE :",

                articleCommande.nom,

                articleCommande.reference

            );


            /*
                On arrête ici afin de ne pas
                traiter partiellement la commande.
            */

            return false;

        }


        const quantiteDemandee =
            calculerQuantiteCommande(
                articleCommande
            );


        if (
            quantiteDemandee <= 0
        ) {

            continue;

        }


        operations.push({

            commande:
                articleCommande,

            stock:
                articleStock,

            quantiteDemandee:
                quantiteDemandee

        });

    }


    // ==================================
    // APPLICATION STOCK + ACHATS
    // ==================================

    operations.forEach(

        operation => {

            const article =
                operation.stock;


            const quantiteDemandee =
                operation.quantiteDemandee;


            const ancienStock =
                Number(
                    article.stock
                ) || 0;


            /*
                ==================================
                QUANTITE PRISE DANS LE STOCK
                ==================================
            */

            const quantiteDisponible =
                Math.min(

                    ancienStock,

                    quantiteDemandee

                );


            /*
                ==================================
                MANQUE
                ==================================
            */

            const quantiteManquante =
                Math.max(

                    0,

                    quantiteDemandee
                    -
                    quantiteDisponible

                );


            /*
                ==================================
                NOUVEAU STOCK
                ==================================
            */

            const nouveauStock =
                Math.max(

                    0,

                    ancienStock
                    -
                    quantiteDisponible

                );


            article.stock =
                nouveauStock;


            /*
                ==================================
                MOUVEMENT STOCK
                ==================================
            */

            if (
                quantiteDisponible > 0
            ) {

                enregistrerMouvementCommande(

                    article,

                    ancienStock,

                    nouveauStock,

                    quantiteDisponible,

                    commande

                );

            }


            /*
                ==================================
                ACHAT AUTOMATIQUE
                ==================================
            */

            if (
                quantiteManquante > 0
            ) {

                creerAchatAutomatique(

                    article,

                    quantiteManquante,

                    operation.commande,

                    commande

                );

            }


            /*
                ==================================
                CAS STOCK ZERO
                ==================================
            */

            if (
                ancienStock === 0
                &&
                quantiteManquante > 0
            ) {

                db.mouvements.push({

                    date:
                        new Date()
                            .toLocaleString(),

                    action:
                        "Stock insuffisant",

                    article:
                        article.nom,

                    commande:
                        commande.id,

                    stock:
                        0,

                    quantiteDemandee:
                        quantiteDemandee,

                    quantiteManquante:
                        quantiteManquante,

                    origine:
                        "Commande client"

                });

            }

        }

    );


    // ==================================
    // COMMANDE TRAITEE
    // ==================================

    commande.stockTraite =
        true;


    commande.stockTraiteDate =
        new Date()
            .toLocaleString();


    commande.stockErreur =
        false;


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
// AJOUT COMMANDE + CLIENT AUTOMATIQUE
// ======================================

function ajouterCommande(
    commande
) {

    if (!commande) {

        console.error(
            "Impossible d'ajouter une commande vide."
        );

        return;

    }


    // ==================================
    // SECURITE TABLEAUX
    // ==================================

    if (
        !Array.isArray(db.commandes)
    ) {

        db.commandes = [];

    }


    if (
        !Array.isArray(db.achats)
    ) {

        db.achats = [];

    }


    if (
        !Array.isArray(db.mouvements)
    ) {

        db.mouvements = [];

    }


    if (
        !Array.isArray(db.clients)
    ) {

        db.clients = [];

    }


    // ==================================
    // AJOUT COMMANDE
    // ==================================

    db.commandes.push(
        commande
    );


    // ==================================
    // CREATION CLIENT
    // ==================================

    let clientExiste =
        db.clients.find(

            c =>

                c.email ===
                commande.email

        );


    if (!clientExiste) {

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


    if (
        stockTraite === false
    ) {

        commande.stockTraite =
            false;

        commande.stockErreur =
            true;

        commande.stockErreurDate =
            new Date()
                .toLocaleString();

    }


    // ==================================
    // SAUVEGARDE
    // ==================================

    sauvegarderDB();


    console.log(
        "COMMANDE AJOUTEE :",
        commande
    );

}


// ======================================
// RETRAITEMENT MANUEL
// ======================================

function retraiterStockCommande(
    idCommande
) {

    const commande =
        db.commandes.find(

            cmd =>

                String(cmd.id)
                ===
                String(idCommande)

        );


    if (!commande) {

        console.warn(
            "Commande introuvable :",
            idCommande
        );

        return false;

    }


    if (
        commande.stockTraite === true
    ) {

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

function obtenirDB() {

    return db;

}


// ======================================
// SECURITE AFFICHAGE HTML
// ======================================

function securiserTexte(
    texte
) {

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

console.log(
    "DATABASE.JS 2.5.0 CHARGE - DB =",
    db
);
