// ======================================
// IDEE GOURMANDE
// Base de données centrale
// Version 2.6.0
// Commandes + stock + achats automatiques
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
// VERIFICATION / MIGRATION
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


    const recette =
        normaliserNomArticle(
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
    // CORRESPONDANCES EXACTES
    // ==================================

    const correspondances = {


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

            "à l'aneth":
                "saumon à l'aneth",

            "a l'aneth":
                "saumon à l'aneth",

            "aneth":
                "saumon à l'aneth"

        }

    };


    // ==================================
    // RECHERCHE AVEC REFERENCE + RECETTE
    // ==================================

    if(
        correspondances[reference]
        &&
        typeof correspondances[reference] === "object"
    ){

        const nomCorrespondant =
            correspondances[reference][recette];


        if(nomCorrespondant){

            const article =
                db.articles.find(
                    a =>
                        normaliserNomArticle(
                            a.nom
                        )
                        ===
                        normaliserNomArticle(
                            nomCorrespondant
                        )
                );


            if(article){

                console.log(
                    "✅ ARTICLE STOCK TROUVÉ :",
                    article.nom
                );


                return article;

            }

        }

    }


    // ==================================
    // PRODUITS SANS VARIANTE
    // ==================================

    if(
        typeof correspondances[reference] === "string"
    ){

        const nomCorrespondant =
            correspondances[reference];


        const article =
            db.articles.find(
                a =>
                    normaliserNomArticle(
                        a.nom
                    )
                    ===
                    normaliserNomArticle(
                        nomCorrespondant
                    )
            );


        if(article){

            console.log(
                "✅ ARTICLE STOCK TROUVÉ :",
                article.nom
            );


            return article;

        }

    }


    // ==================================
    // RECHERCHE PAR NOM EXACT
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
            "✅ ARTICLE STOCK TROUVÉ PAR NOM :",
            articleParNom.nom
        );


        return articleParNom;

    }


    // ==================================
    // ARTICLE INTROUVABLE
    // ==================================

    console.error(
        "❌ ARTICLE STOCK INTROUVABLE :",
        articleCommande.nom,
        articleCommande.reference,
        articleCommande.recette
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


    // Le saumon est géré en grammes.

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
// RECALCUL TOTAL ACHAT
// ======================================

function recalculerTotalAchat(achat){

    if(!achat){

        return;

    }


    achat.total =
        (achat.articles || [])
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
// CREATION / COMPLETION ACHAT AUTOMATIQUE
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

        return null;

    }


    let achatExistant =
        trouverAchatAutomatique(
            article
        );


    // Achat automatique déjà existant

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
                new Date().toLocaleString(),

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


        return achatExistant;

    }


    // Nouvel achat automatique

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
console.log(
    "✅ ACHAT AUTOMATIQUE AJOUTÉ À db.achats :",
    achat
);

console.log(
    "📦 NOMBRE TOTAL D'ACHATS :",
    db.achats.length
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

        quantite,

        origine:
            "Commande client"

    });


    sauvegarderDB();


    console.log(
        "ACHAT AUTOMATIQUE CREE :",
        achat
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


    // Protection double traitement

    if(
        commande.stockTraite === true
    ){

        console.log(
            "STOCK DEJA TRAITE :",
            commande.id
        );

        return true;

    }


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

        commande.stockErreur = true;

        commande.stockErreurMessage =
            "Aucun produit dans la commande.";

        sauvegarderDB();

        return false;

    }


    const operations = [];


    // Vérification de tous les articles
    // AVANT de modifier le stock.

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


    // Application des opérations

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


            // Mouvement de stock

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
            else{

                db.mouvements.push({

                    date:
                        new Date().toLocaleString(),

                    action:
                        "Commande client - stock insuffisant",

                    article:
                        article.nom,

                    commande:
                        commande.id,

                    ancienStock,

                    nouveauStock,

                    difference:
                        0,

                    origine:
                        "Commande client"

                });

            }


            // Création de l'achat correspondant
            // UNIQUEMENT pour le manque.

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


    commande.stockTraite =
        true;

    commande.stockErreur =
        false;

    commande.stockTraiteDate =
        new Date().toLocaleString();


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


    if(!Array.isArray(db.commandes))
        db.commandes = [];

    if(!Array.isArray(db.achats))
        db.achats = [];

    if(!Array.isArray(db.mouvements))
        db.mouvements = [];

    if(!Array.isArray(db.clients))
        db.clients = [];


    // Ajout commande

    db.commandes.push(
        commande
    );


    // Client

    const email =
        String(
            commande.email || ""
        )
        .trim()
        .toLowerCase();


    let clientExiste =
        email
        ?
        db.clients.find(
            c =>
                String(
                    c.email || ""
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


    // Traitement stock

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

window.normaliserNomArticle =
    normaliserNomArticle;


// ======================================
// FIN
// ======================================

console.log(
    "DATABASE.JS 2.6.0 CHARGE - STOCK + ACHATS AUTOMATIQUES ACTIFS",
    db
);
