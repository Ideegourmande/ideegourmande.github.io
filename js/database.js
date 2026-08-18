// ======================================
// IDEE GOURMANDE
// Base de données centrale
// Version 2.4.0
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


    sauvegarderDB();

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


    // ==================================
    // SECURITE COMMANDES
    // ==================================

    if(
        !Array.isArray(db.commandes)
    ){

        db.commandes = [];

    }


    // ==================================
    // SECURITE ARCHIVES
    // ==================================

    if(
        !Array.isArray(db.archives)
    ){

        db.archives = [];

    }


    // ==================================
    // SECURITE ACHATS
    // ==================================

    if(
        !Array.isArray(db.achats)
    ){

        db.achats = [];

    }


    // ==================================
    // SECURITE SESSIONS
    // ==================================

    if(
        !Array.isArray(db.sessions)
    ){

        db.sessions = [];

    }


    // ==================================
    // SECURITE CLIENTS
    // ==================================

    if(
        !Array.isArray(db.clients)
    ){

        db.clients = [];

    }


    // ==================================
    // SECURITE STOCK
    // ==================================

    if(
        !Array.isArray(db.articles)
    ){

        db.articles = [];

    }


    // ==================================
    // SECURITE MOUVEMENTS
    // ==================================

    if(
        !Array.isArray(db.mouvements)
    ){

        db.mouvements = [];

    }


    // ==================================
    // SECURITE EMPLACEMENTS
    // ==================================

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

function sauvegarderDB(){

    localStorage.setItem(

        "ideeGourmandeDB",

        JSON.stringify(db)

    );

}


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
// RECHERCHE ARTICLE STOCK
// ======================================

function trouverArticleStock(articleCommande){

    if(!articleCommande){

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


    /*
        On essaie d'abord de retrouver
        l'article par son nom exact.
    */

    let article =
        db.articles.find(
            a =>
                normaliserNomArticle(
                    a.nom
                ) === nom
        );


    if(article){

        return article;

    }


    /*
        Correspondance par référence
        pour les produits connus.
    */

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


    if(
        correspondances[
            articleCommande.reference
        ]
    ){

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


        if(article){

            return article;

        }

    }


    /*
        Dernière tentative avec la référence.
    */

    if(reference){

        article =
            db.articles.find(
                a =>
                    normaliserNomArticle(
                        a.reference
                    )
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
// CALCUL CONSOMMATION STOCK
// ======================================

function calculerConsommationStock(
    articleCommande,
    articleStock
){

    if(!articleCommande){

        return 0;

    }


    /*
        SAUMON
        ------------------------------
        Le saumon est géré directement
        en grammes.
    */

    if(
        articleCommande.reference
        ===
        "saumon-fume"
    ){

        return Number(
            articleCommande.poids
        ) || 0;

    }


    /*
        AUTRES PRODUITS
        ------------------------------
        Le stock est géré en unités
        correspondant aux portions/articles.
    */

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

        origine:
            "Commande client"

    });

}


// ======================================
// CREATION / MISE A JOUR ACHAT AUTOMATIQUE
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


    /*
        Pas de besoin d'achat si le stock
        reste strictement supérieur au minimum.
    */

    if(
        stock > minimum
    ){

        return;

    }


    /*
        Quantité nécessaire pour revenir
        au minimum.
    */

    let quantiteACommander =
        minimum - stock;


    /*
        Si le minimum est atteint à zéro,
        on commande au moins une unité.
    */

    if(
        quantiteACommander <= 0
    ){

        quantiteACommander = 1;

    }


    /*
        Recherche d'un achat automatique
        encore ouvert pour cet article.
    */

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

            /*
                On recalcule la quantité nécessaire
                au lieu d'empiler aveuglément
                les quantités.
            */

            ligne.quantite =
                Math.max(
                    Number(ligne.quantite) || 0,
                    quantiteACommander
                );

        }


        achatExistant.total =
            achatExistant.articles.reduce(

                (total,ligne) =>

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


        return;

    }


    /*
        Création d'un nouvel achat automatique.
    */

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


    /*
        Sécurité :
        si la commande a déjà été traitée,
        on ne touche plus au stock.
    */

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


    if(
        produits.length === 0
    ){

        console.warn(
            "Aucun produit à traiter pour la commande",
            commande.id
        );

        return false;

    }


    /*
        ==================================
        PREPARATION
        ==================================

        On prépare toutes les opérations
        avant de modifier le stock.

        Cela évite une situation où un produit
        serait retiré alors qu'un autre produit
        n'a pas été trouvé.
    */

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


            /*
                On ne marque pas la commande
                comme traitée.

                Ainsi, le problème pourra être
                corrigé dans le stock avant
                de relancer le traitement.
            */

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


    /*
        ==================================
        APPLICATION
        ==================================
    */

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


            /*
                Le stock ne descend pas sous zéro.
            */

            article.stock =
                Math.max(
                    0,
                    nouveauStock
                );


            enregistrerMouvementCommande(

                article,

                ancienStock,

                article.stock,

                consommation,

                commande

            );


            /*
                Après la consommation,
                on vérifie immédiatement
                le niveau minimum.
            */

            verifierBesoinAchat(
                article
            );

        }
    );


    /*
        ==================================
        COMMANDE TRAITEE
        ==================================
    */

    commande.stockTraite =
        true;


    commande.stockTraiteDate =
        new Date()
        .toLocaleString();


    /*
        Sauvegarde globale.
    */

    sauvegarderDB();


    console.log(
        "STOCK COMMANDE TRAITE :",
        commande.id
    );


    return true;

}


// ======================================
// AJOUT COMMANDE + CLIENT AUTOMATIQUE
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


    /*
        ==================================
        SECURITE COMMANDES
        ==================================
    */

    if(
        !Array.isArray(db.commandes)
    ){

        db.commandes = [];

    }


    /*
        ==================================
        SECURITE ACHATS
        ==================================
    */

    if(
        !Array.isArray(db.achats)
    ){

        db.achats = [];

    }


    /*
        ==================================
        SECURITE MOUVEMENTS
        ==================================
    */

    if(
        !Array.isArray(db.mouvements)
    ){

        db.mouvements = [];

    }


    /*
        ==================================
        AJOUT COMMANDE
        ==================================
    */

    db.commandes.push(
        commande
    );


    /*
        ==================================
        CLIENT
        ==================================
    */

    let clientExiste =
        db.clients.find(
            c =>
                c.email ===
                commande.email
        );


    /*
        ==================================
        CREATION CLIENT
        ==================================
    */

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


    /*
        ==================================
        TRAITEMENT STOCK
        ==================================
    */

    const stockTraite =
        traiterStockCommande(
            commande
        );


    /*
        Si le stock ne peut pas être traité,
        la commande reste enregistrée,
        mais stockTraite reste false.
    */

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


    /*
        ==================================
        SAUVEGARDE COMPLETE
        ==================================
    */

    sauvegarderDB();


    console.log(
        "COMMANDE AJOUTEE :",
        commande
    );

}


// ======================================
// RETRAITEMENT MANUEL D'UNE COMMANDE
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

console.log(
    "DATABASE.JS 2.4.0 CHARGE - DB =",
    db
);
