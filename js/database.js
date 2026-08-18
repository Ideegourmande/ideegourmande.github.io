// ======================================
// IDEE GOURMANDE
// Base de données centrale
// Version 2.8.0
// Commandes + stock + achats automatiques
// ======================================


// ======================================
// CHARGEMENT BASE
// ======================================

let db =
    JSON.parse(
        localStorage.getItem("ideeGourmandeDB")
    );

console.log(
    "DATABASE OK",
    db
);


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
// CREATION BASE SI ABSENTE
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
// MIGRATION / VERIFICATION
// ======================================

Object.keys(structureDB).forEach(
    cle => {

        if(
            db[cle] === undefined ||
            db[cle] === null
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


// ======================================
// SECURISATION TABLEAUX
// ======================================

const tableaux = [

    "commandes",
    "articles",
    "emplacements",
    "mouvements",
    "achats",
    "sessions",
    "archives",
    "clients"

];


tableaux.forEach(
    cle => {

        if(
            !Array.isArray(db[cle])
        ){

            db[cle] = [];

        }

    }
);


if(
    !db.emplacements.length
){

    db.emplacements = [
        ...emplacementsDefaut
    ];

}


// ======================================
// SAUVEGARDE CENTRALE
// ======================================

function sauvegarderDB(){

    localStorage.setItem(
        "ideeGourmandeDB",
        JSON.stringify(db)
    );

}


// Sauvegarde initiale / migration

sauvegarderDB();


// ======================================
// MIGRATION ANCIENNES COMMANDES
// ======================================

function migrerAnciennesCommandes(){

    let anciennes = [];

    try{

        anciennes =
            JSON.parse(
                localStorage.getItem(
                    "commandes"
                )
            ) || [];

    }
    catch(e){

        anciennes = [];

    }


    if(
        Array.isArray(anciennes)
        &&
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

        console.log(
            "ANCIENNES COMMANDES MIGREES :",
            anciennes.length
        );

    }

}


migrerAnciennesCommandes();


// ======================================
// NORMALISATION TEXTE
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
    )
    .replace(
        /\s+/g,
        " "
    );

}


// ======================================
// NORMALISATION RECETTE
// ======================================

function normaliserRecette(recette){

    return normaliserNomArticle(
        recette
    )
    .replace(
        "pimets",
        "piments"
    )
    .replace(
        "aux piments",
        "aux piments"
    )
    .trim();

}


// ======================================
// ALIAS PRODUITS
// ======================================

const correspondancesProduits = {

    "foie-gras": {

        "aux pimets":
            "foie gras aux pimets",

        "aux piments":
            "foie gras aux pimets",

        "aux figues":
            "fois gras aux figues",

        "figues":
            "fois gras aux figues"

    },


    "magret": {

        "aux herbes":
            "magret au herbes",

        "au herbes":
            "magret au herbes",

        "aux pimets":
            "magret aux pimets",

        "aux piments":
            "magret aux pimets"

    },


    "viande-sechee":
        "viande séchée",


    "lard-sec":
        "lard sec fumé",


    "saumon-fume": {

        "aux piments":
            "saumon aux piments",

        "aux pimets":
            "saumon aux piments",

        "a l'aneth":
            "saumon à l'aneth",

        "à l'aneth":
            "saumon à l'aneth",

        "aneth":
            "saumon à l'aneth"

    }

};


// ======================================
// RECHERCHE ARTICLE STOCK
// ======================================

function trouverArticleStock(
    articleCommande
){

    if(!articleCommande){

        return null;

    }


    const reference =
        String(
            articleCommande.reference || ""
        )
        .trim()
        .toLowerCase();


    const recette =
        normaliserRecette(
            articleCommande.recette
        );


    const nomCommande =
        normaliserNomArticle(
            articleCommande.nom
        );


    console.log(
        "🔎 RECHERCHE ARTICLE STOCK",
        {
            reference,
            recette,
            nomCommande
        }
    );


    // ==================================
    // 1. RECHERCHE REFERENCE SI PRESENTE
    // ==================================

    const parReference =
        db.articles.find(
            article => {

                const refStock =
                    String(
                        article.reference || ""
                    )
                    .trim()
                    .toLowerCase();

                return (
                    reference !== ""
                    &&
                    refStock === reference
                );

            }
        );


    if(parReference){

        console.log(
            "✅ ARTICLE TROUVE PAR REFERENCE :",
            parReference.nom
        );

        return parReference;

    }


    // ==================================
    // 2. RECHERCHE PAR CORRESPONDANCE
    // ==================================

    const correspondance =
        correspondancesProduits[
            reference
        ];


    if(
        correspondance
    ){

        let nomRecherche = null;


        if(
            typeof correspondance === "string"
        ){

            nomRecherche =
                correspondance;

        }
        else if(
            typeof correspondance === "object"
        ){

            nomRecherche =
                correspondance[recette];

        }


        if(nomRecherche){

            const article =
                db.articles.find(
                    a =>

                        normaliserNomArticle(
                            a.nom
                        )
                        ===
                        normaliserNomArticle(
                            nomRecherche
                        )

                );


            if(article){

                console.log(
                    "✅ ARTICLE TROUVE PAR CORRESPONDANCE :",
                    article.nom
                );

                return article;

            }

        }

    }


    // ==================================
    // 3. RECHERCHE PAR NOM EXACT
    // ==================================

    const articleParNom =
        db.articles.find(
            a =>

                normaliserNomArticle(
                    a.nom
                )
                ===
                nomCommande

        );


    if(articleParNom){

        console.log(
            "✅ ARTICLE TROUVE PAR NOM :",
            articleParNom.nom
        );

        return articleParNom;

    }


    // ==================================
    // 4. RECHERCHE PARTIELLE
    // ==================================

    if(
        nomCommande.length >= 5
    ){

        const articlePartiel =
            db.articles.find(
                a => {

                    const nomStock =
                        normaliserNomArticle(
                            a.nom
                        );

                    return (

                        nomStock.includes(
                            nomCommande
                        )

                        ||

                        nomCommande.includes(
                            nomStock
                        )

                    );

                }
            );


        if(articlePartiel){

            console.log(
                "✅ ARTICLE TROUVE PAR NOM PARTIEL :",
                articlePartiel.nom
            );

            return articlePartiel;

        }

    }


    // ==================================
    // INTROUVABLE
    // ==================================

    console.error(
        "❌ ARTICLE STOCK INTROUVABLE :",
        {
            nom:
                articleCommande.nom,

            reference:
                articleCommande.reference,

            recette:
                articleCommande.recette
        }
    );


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
// MOUVEMENT STOCK
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
            new Date().toLocaleString(
                "fr-FR"
            ),

        action:
            "Commande client",

        article:
            article.nom,

        commande:
            commande.id,

        ancienStock,

        nouveauStock,

        difference:
            -consommation,

        origine:
            "Commande client"

    });

}


// ======================================
// RECHERCHE ACHAT AUTOMATIQUE
// ======================================

function trouverAchatAutomatique(
    article
){

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
// RECALCUL TOTAL ACHAT
// ======================================

function recalculerTotalAchat(
    achat
){

    if(!achat){

        return;

    }


    achat.total =
        (achat.articles || [])
        .reduce(
            (
                total,
                ligne
            ) => {

                return total +

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
                    );

            },
            0
        );

}


// ======================================
// CREATION ACHAT AUTOMATIQUE
// ======================================

function creerOuCompleterAchatAutomatique(
    article,
    quantite
){

    if(
        !article
        ||
        Number(quantite) <= 0
    ){

        return null;

    }


    quantite =
        Number(
            quantite
        );


    console.log(
        "🛒 CREATION / COMPLETION ACHAT AUTOMATIQUE",
        {
            article:
                article.nom,

            quantite,

            stock:
                article.stock
        }
    );


    // ==================================
    // ACHAT EXISTANT
    // ==================================

    let achatExistant =
        trouverAchatAutomatique(
            article
        );


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
                    Number(
                        ligne.quantite
                    ) || 0
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
                new Date().toLocaleString(
                    "fr-FR"
                ),

            action:
                "Complément achat automatique",

            achat:
                achatExistant.numero,

            article:
                article.nom,

            quantite,

            origine:
                "Commande client"

        });


        sauvegarderDB();


        console.log(
            "✅ ACHAT AUTOMATIQUE COMPLETE :",
            achatExistant
        );


        return achatExistant;

    }


    // ==================================
    // NOUVEL ACHAT
    // ==================================

    const id =
        Date.now();


    const achat = {

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
            "En attente",

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
            new Date().toLocaleString(
                "fr-FR"
            ),

        action:
            "Création achat automatique",

        achat:
            achat.numero,

        article:
            article.nom,

        quantite,

        origine:
            "Commande client"

    });


    sauvegarderDB();


    console.log(
        "✅ ACHAT AUTOMATIQUE AJOUTE A db.achats :",
        achat
    );


    console.log(
        "📦 NOMBRE TOTAL D'ACHATS :",
        db.achats.length
    );


    return achat;

}


// ======================================
// TRAITEMENT STOCK + ACHAT
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
            "ℹ️ STOCK DEJA TRAITE :",
            commande.id
        );

        return true;

    }


    // ==================================
    // PRODUITS
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
            "⚠️ AUCUN PRODUIT POUR LA COMMANDE :",
            commande.id
        );


        commande.stockErreur =
            true;


        commande.stockErreurMessage =
            "Aucun produit dans la commande.";


        sauvegarderDB();


        return false;

    }


    // ==================================
    // OPERATIONS
    // ==================================

    const operations = [];


    // ==================================
    // VERIFICATION ARTICLES
    // ==================================

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
                "⚠️ ARTICLE STOCK INTROUVABLE :",
                articleCommande
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
    // APPLICATION STOCK
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


            const stockDisponible =
                Math.max(
                    0,
                    ancienStock
                );


            const consommation =
                Math.min(
                    stockDisponible,
                    quantiteCommandee
                );


            const quantiteManquante =
                Math.max(
                    0,
                    quantiteCommandee
                    -
                    consommation
                );


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

            if(
                consommation > 0
            ){

                enregistrerMouvementCommande(

                    article,

                    ancienStock,

                    nouveauStock,

                    consommation,

                    commande

                );

            }


            // ==================================
            // STOCK INSUFFISANT
            // ==================================

            if(
                quantiteManquante > 0
            ){

                console.warn(
                    "🟡 STOCK INSUFFISANT",
                    {
                        article:
                            article.nom,

                        stock:
                            ancienStock,

                        demande:
                            quantiteCommandee,

                        consommation,

                        manque:
                            quantiteManquante
                    }
                );


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
        new Date().toLocaleString(
            "fr-FR"
        );


    sauvegarderDB();


    console.log(
        "✅ STOCK + ACHATS TRAITES :",
        commande.id
    );


    console.log(
        "📦 ACHATS ACTUELS :",
        db.achats
    );


    return true;

}


// ======================================
// AJOUT COMMANDE
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
    // SECURISATION
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

    const email =

        String(
            commande.email || ""
        )
        .trim()
        .toLowerCase();


    const clientExiste =

        email

        ?

        db.clients.find(
            client =>

                String(
                    client.email || ""
                )
                .trim()
                .toLowerCase()

                ===

                email
        )

        :

        null;


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
    // SAUVEGARDE COMMANDE AVANT STOCK
    // ==================================

    sauvegarderDB();


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
            new Date().toLocaleString(
                "fr-FR"
            );

    }


    // ==================================
    // SAUVEGARDE FINALE
    // ==================================

    sauvegarderDB();


    console.log(
        "✅ COMMANDE AJOUTEE :",
        commande
    );


    console.log(
        "📊 ETAT ACHATS APRES COMMANDE :",
        db.achats
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

                String(
                    cmd.id
                )

                ===

                String(
                    idCommande
                )

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
// ACCES BASE
// ======================================

function obtenirDB(){

    return db;

}


// ======================================
// SECURISATION HTML
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
// EXPORTS
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


window.creerOuCompleterAchatAutomatique =
    creerOuCompleterAchatAutomatique;


window.normaliserNomArticle =
    normaliserNomArticle;


// ======================================
// FIN
// ======================================

console.log(
    "DATABASE.JS 2.8.0 CHARGE - STOCK + ACHATS AUTOMATIQUES ACTIFS",
    db
);
