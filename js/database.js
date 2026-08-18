// ======================================
// IDEE GOURMANDE
// Base de données centrale
// Version 2.10.0
// Commandes + stock + achats automatiques
// Clients + archives
// Migration ancienne base intégrée
// ======================================


// ======================================
// CONSTANTES
// ======================================

const CLE_BASE =
    "ideeGourmandeDB";

const CLE_ANCIENNES_COMMANDES =
    "commandes";

const CLE_ANCIENNES_ARCHIVES =
    "commandesArchivees";


// ======================================
// CHARGEMENT BASE
// ======================================

let db = null;

try {

    const contenu =
        localStorage.getItem(
            CLE_BASE
        );

    if (contenu) {

        db =
            JSON.parse(
                contenu
            );

    }

}
catch (erreur) {

    console.warn(
        "⚠️ Base principale illisible.",
        erreur
    );

    db = null;

}


console.log(
    "DATABASE - BASE CHARGEE",
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

    emplacements:
        emplacementsDefaut,

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

if (
    !db ||
    typeof db !== "object" ||
    Array.isArray(db)
) {

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
// MIGRATION / VERIFICATION STRUCTURE
// ======================================

Object.keys(
    structureDB
)
.forEach(
    function (cle) {

        if (
            db[cle] === undefined ||
            db[cle] === null
        ) {

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
    function (cle) {

        if (
            !Array.isArray(
                db[cle]
            )
        ) {

            db[cle] = [];

        }

    }
);


// ======================================
// EMPLACEMENTS PAR DEFAUT
// ======================================

if (
    db.emplacements.length === 0
) {

    db.emplacements = [
        ...emplacementsDefaut
    ];

}


// ======================================
// NORMALISATION TEXTE
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
    )
    .replace(
        /\s+/g,
        " "
    );

}


// ======================================
// NORMALISATION RECETTE
// ======================================

function normaliserRecette(recette) {

    return normaliserNomArticle(
        recette
    )
    .replace(
        /\bpimets?\b/g,
        "piments"
    )
    .trim();

}


// ======================================
// NOMBRE SECURISE
// ======================================

function nombreSecurise(
    valeur,
    valeurDefaut = 0
) {

    const nombre =
        Number(
            valeur
        );

    return Number.isFinite(
        nombre
    )
        ? nombre
        : valeurDefaut;

}


// ======================================
// IDENTIFICATION COMMANDE
// ======================================

function obtenirIdentifiantCommandeMigration(
    commande
) {

    if (
        !commande ||
        typeof commande !== "object"
    ) {

        return "";

    }

    return String(

        commande.id
        ||
        commande.numero
        ||
        ""

    )
    .trim();

}


// ======================================
// TEST DOUBLON COMMANDE
// ======================================

function commandeExisteDeja(
    liste,
    commande
) {

    if (
        !Array.isArray(liste) ||
        !commande
    ) {

        return false;

    }


    const id =
        obtenirIdentifiantCommandeMigration(
            commande
        );


    if (id) {

        return liste.some(
            function (element) {

                return (
                    obtenirIdentifiantCommandeMigration(
                        element
                    )
                    ===
                    id
                );

            }
        );

    }


    return liste.some(
        function (element) {

            if (!element) {

                return false;

            }

            return (

                String(
                    element.client || ""
                )
                .trim()
                .toLowerCase()

                ===

                String(
                    commande.client || ""
                )
                .trim()
                .toLowerCase()

                &&

                String(
                    element.email || ""
                )
                .trim()
                .toLowerCase()

                ===

                String(
                    commande.email || ""
                )
                .trim()
                .toLowerCase()

                &&

                String(
                    element.date || ""
                )

                ===

                String(
                    commande.date || ""
                )

                &&

                nombreSecurise(
                    element.total
                )

                ===

                nombreSecurise(
                    commande.total
                )

            );

        }
    );

}


// ======================================
// MIGRATION ANCIENNES COMMANDES
// ======================================

function migrerAnciennesCommandes() {

    let anciennes = [];

    let migrationEffectuee =
        false;


    try {

        const contenu =
            localStorage.getItem(
                CLE_ANCIENNES_COMMANDES
            );


        if (!contenu) {

            return;

        }


        const donnees =
            JSON.parse(
                contenu
            );


        if (
            Array.isArray(
                donnees
            )
        ) {

            anciennes =
                donnees;

        }

    }
    catch (erreur) {

        console.error(
            "❌ Erreur lecture anciennes commandes :",
            erreur
        );

        /*
            On conserve volontairement
            l'ancienne clé en cas d'erreur.
        */

        return;

    }


    if (
        anciennes.length === 0
    ) {

        localStorage.removeItem(
            CLE_ANCIENNES_COMMANDES
        );

        return;

    }


    if (
        !Array.isArray(
            db.commandes
        )
    ) {

        db.commandes = [];

    }


    anciennes.forEach(
        function (commande) {

            if (!commande) {

                return;

            }


            if (
                !commandeExisteDeja(
                    db.commandes,
                    commande
                )
            ) {

                db.commandes.push(
                    commande
                );

                migrationEffectuee =
                    true;

            }

        }
    );


    /*
        Suppression uniquement après
        lecture JSON réussie.
    */

    localStorage.removeItem(
        CLE_ANCIENNES_COMMANDES
    );


    if (migrationEffectuee) {

        console.log(
            "✅ ANCIENNES COMMANDES MIGREES :",
            anciennes.length
        );

    }
    else {

        console.log(
            "ℹ️ Anciennes commandes déjà présentes."
        );

    }

}


// ======================================
// MIGRATION ANCIENNES ARCHIVES
// ======================================

function migrerAnciennesArchives() {

    let anciennesArchives = [];

    let migrationEffectuee =
        false;


    try {

        const contenu =
            localStorage.getItem(
                CLE_ANCIENNES_ARCHIVES
            );


        if (!contenu) {

            return;

        }


        const donnees =
            JSON.parse(
                contenu
            );


        if (
            Array.isArray(
                donnees
            )
        ) {

            anciennesArchives =
                donnees;

        }

    }
    catch (erreur) {

        console.error(
            "❌ Erreur lecture anciennes archives :",
            erreur
        );

        return;

    }


    if (
        anciennesArchives.length === 0
    ) {

        localStorage.removeItem(
            CLE_ANCIENNES_ARCHIVES
        );

        return;

    }


    if (
        !Array.isArray(
            db.archives
        )
    ) {

        db.archives = [];

    }


    anciennesArchives.forEach(
        function (archive) {

            if (!archive) {

                return;

            }


            if (
                !commandeExisteDeja(
                    db.archives,
                    archive
                )
            ) {

                db.archives.push(
                    archive
                );

                migrationEffectuee =
                    true;

            }

        }
    );


    localStorage.removeItem(
        CLE_ANCIENNES_ARCHIVES
    );


    if (migrationEffectuee) {

        console.log(
            "✅ ANCIENNES ARCHIVES MIGREES :",
            anciennesArchives.length
        );

    }
    else {

        console.log(
            "ℹ️ Anciennes archives déjà présentes."
        );

    }

}


// ======================================
// SAUVEGARDE CENTRALE
// ======================================

function sauvegarderDB() {

    try {

        localStorage.setItem(
            CLE_BASE,
            JSON.stringify(
                db
            )
        );

        return true;

    }
    catch (erreur) {

        console.error(
            "❌ ERREUR SAUVEGARDE DB :",
            erreur
        );

        return false;

    }

}


// ======================================
// MIGRATION GENERALE
// ======================================

function migrerAnciennesDonnees() {

    console.log(
        "🔄 DEMARRAGE MIGRATION ANCIENNES DONNEES"
    );


    migrerAnciennesCommandes();

    migrerAnciennesArchives();


    sauvegarderDB();


    console.log(
        "✅ MIGRATION TERMINEE",
        {

            commandes:
                db.commandes.length,

            archives:
                db.archives.length,

            clients:
                db.clients.length

        }
    );

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
) {

    if (!articleCommande) {

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
    // CORRESPONDANCE REFERENCE + RECETTE
    // ==================================

    if (
        correspondancesProduits[reference]
        &&
        typeof correspondancesProduits[reference]
            === "object"
    ) {

        const correspondances =
            correspondancesProduits[
                reference
            ];


        const nomCorrespondant =
            correspondances[
                recette
            ];


        if (nomCorrespondant) {

            const article =
                db.articles.find(
                    function (a) {

                        return (
                            normaliserNomArticle(
                                a.nom
                            )
                            ===
                            normaliserNomArticle(
                                nomCorrespondant
                            )
                        );

                    }
                );


            if (article) {

                console.log(
                    "✅ ARTICLE STOCK TROUVE :",
                    article.nom
                );

                return article;

            }

        }

    }


    // ==================================
    // PRODUIT SANS VARIANTE
    // ==================================

    if (
        typeof correspondancesProduits[reference]
            === "string"
    ) {

        const nomCorrespondant =
            correspondancesProduits[
                reference
            ];


        const article =
            db.articles.find(
                function (a) {

                    return (
                        normaliserNomArticle(
                            a.nom
                        )
                        ===
                        normaliserNomArticle(
                            nomCorrespondant
                        )
                    );

                }
            );


        if (article) {

            console.log(
                "✅ ARTICLE STOCK TROUVE :",
                article.nom
            );

            return article;

        }

    }


    // ==================================
    // NOM EXACT
    // ==================================

    if (nomCommande) {

        const articleParNom =
            db.articles.find(
                function (a) {

                    return (
                        normaliserNomArticle(
                            a.nom
                        )
                        ===
                        nomCommande
                    );

                }
            );


        if (articleParNom) {

            console.log(
                "✅ ARTICLE STOCK TROUVE PAR NOM :",
                articleParNom.nom
            );

            return articleParNom;

        }

    }


    // ==================================
    // RECHERCHE SOUPLE
    // ==================================

    const articleParReference =
        db.articles.find(
            function (a) {

                const nomStock =
                    normaliserNomArticle(
                        a.nom
                    );


                // ------------------------------
                // FOIE GRAS
                // ------------------------------

                if (
                    reference === "foie-gras"
                ) {

                    if (
                        [
                            "piment",
                            "piments",
                            "pimets",
                            "aux piment",
                            "aux piments",
                            "aux pimets"
                        ]
                        .includes(
                            recette
                        )
                    ) {

                        return (
                            nomStock.includes(
                                "foie gras"
                            )
                            &&
                            nomStock.includes(
                                "pimet"
                            )
                        );

                    }


                    if (
                        [
                            "figue",
                            "figues",
                            "aux figues"
                        ]
                        .includes(
                            recette
                        )
                    ) {

                        return (
                            nomStock.includes(
                                "foi"
                            )
                            &&
                            nomStock.includes(
                                "gras"
                            )
                            &&
                            nomStock.includes(
                                "figue"
                            )
                        );

                    }

                }


                // ------------------------------
                // MAGRET
                // ------------------------------

                if (
                    reference === "magret"
                ) {

                    if (
                        [
                            "herbe",
                            "herbes",
                            "aux herbes",
                            "au herbes"
                        ]
                        .includes(
                            recette
                        )
                    ) {

                        return (
                            nomStock.includes(
                                "magret"
                            )
                            &&
                            nomStock.includes(
                                "herbe"
                            )
                        );

                    }


                    if (
                        [
                            "piment",
                            "piments",
                            "pimets",
                            "aux piment",
                            "aux piments",
                            "aux pimets"
                        ]
                        .includes(
                            recette
                        )
                    ) {

                        return (
                            nomStock.includes(
                                "magret"
                            )
                            &&
                            nomStock.includes(
                                "pimet"
                            )
                        );

                    }

                }


                // ------------------------------
                // VIANDE SECHEE
                // ------------------------------

                if (
                    reference === "viande-sechee"
                ) {

                    return (
                        nomStock ===
                        "viande sechee"
                    );

                }


                // ------------------------------
                // LARD SEC
                // ------------------------------

                if (
                    reference === "lard-sec"
                ) {

                    return (
                        nomStock ===
                        "lard sec fume"
                    );

                }


                // ------------------------------
                // SAUMON FUME
                // ------------------------------

                if (
                    reference === "saumon-fume"
                ) {

                    if (
                        recette === "aneth"
                        ||
                        recette === "a l'aneth"
                    ) {

                        return (

                            nomStock.includes(
                                "saumon"
                            )

                            &&

                            nomStock.includes(
                                "aneth"
                            )

                        );

                    }


                    if (
                        [
                            "piment",
                            "piments",
                            "pimets",
                            "aux piment",
                            "aux piments",
                            "aux pimets"
                        ]
                        .includes(
                            recette
                        )
                    ) {

                        return (

                            nomStock.includes(
                                "saumon"
                            )

                            &&

                            nomStock.includes(
                                "piment"
                            )

                        );

                    }

                }


                return false;

            }
        );


    if (articleParReference) {

        console.log(
            "✅ ARTICLE STOCK TROUVE PAR RECHERCHE SOUPLE :",
            articleParReference.nom
        );

        return articleParReference;

    }


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
) {

    if (!articleCommande) {

        return 0;

    }


    if (
        String(
            articleCommande.reference || ""
        )
        ===
        "saumon-fume"
    ) {

        return Math.max(
            0,
            nombreSecurise(
                articleCommande.poids
            )
        );

    }


    return Math.max(
        0,
        nombreSecurise(
            articleCommande.quantite
        )
    );

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
) {

    db.mouvements.push({

        id:
            Date.now()
            +
            Math.random(),

        date:
            new Date().toISOString(),

        dateAffichage:
            new Date().toLocaleString(
                "fr-FR"
            ),

        action:
            "Commande client",

        article:
            article.nom,

        articleId:
            article.id || null,

        commande:
            commande.id,

        ancienStock:
            nombreSecurise(
                ancienStock
            ),

        nouveauStock:
            nombreSecurise(
                nouveauStock
            ),

        difference:
            -nombreSecurise(
                consommation
            ),

        origine:
            "Commande client"

    });

}


// ======================================
// RECHERCHE ACHAT AUTOMATIQUE
// ======================================

function trouverAchatAutomatique(
    article
) {

    if (!article) {

        return null;

    }


    return db.achats.find(
        function (achat) {

            return (

                achat.automatique === true

                &&

                achat.statut !== "Réceptionné"

                &&

                Array.isArray(
                    achat.articles
                )

                &&

                achat.articles.some(
                    function (ligne) {

                        return (

                            normaliserNomArticle(
                                ligne.article
                            )

                            ===

                            normaliserNomArticle(
                                article.nom
                            )

                        );

                    }
                )

            );

        }
    )
    || null;

}


// ======================================
// RECALCUL TOTAL ACHAT
// ======================================

function recalculerTotalAchat(
    achat
) {

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
            function (
                total,
                ligne
            ) {

                const quantite =
                    Math.max(
                        0,
                        nombreSecurise(
                            ligne.quantite
                        )
                    );


                const prix =
                    Math.max(
                        0,
                        nombreSecurise(
                            ligne.prix
                        )
                    );


                return (
                    total
                    +
                    (
                        quantite
                        *
                        prix
                    )
                );

            },
            0
        );

}


// ======================================
// CREATION / COMPLETION ACHAT AUTOMATIQUE
// ======================================

function creerOuCompleterAchatAutomatique(
    article,
    quantite
) {

    if (
        !article
    ) {

        return null;

    }


    quantite =
        Math.max(
            0,
            nombreSecurise(
                quantite
            )
        );


    if (
        quantite <= 0
    ) {

        return null;

    }


    console.log(
        "🛒 CREATION / COMPLETION ACHAT AUTOMATIQUE",
        {
            article:
                article.nom,

            quantite,

            stock:
                nombreSecurise(
                    article.stock
                )

        }
    );


    let achatExistant =
        trouverAchatAutomatique(
            article
        );


    // ==================================
    // COMPLEMENT ACHAT EXISTANT
    // ==================================

    if (achatExistant) {

        if (
            !Array.isArray(
                achatExistant.articles
            )
        ) {

            achatExistant.articles = [];

        }


        let ligne =
            achatExistant.articles.find(
                function (ligne) {

                    return (
                        normaliserNomArticle(
                            ligne.article
                        )
                        ===
                        normaliserNomArticle(
                            article.nom
                        )
                    );

                }
            );


        if (ligne) {

            ligne.quantite =
                Math.max(
                    0,
                    nombreSecurise(
                        ligne.quantite
                    )
                )
                +
                quantite;

        }
        else {

            achatExistant.articles.push({

                article:
                    article.nom,

                reference:
                    article.reference || "",

                quantite,

                prix:
                    Math.max(
                        0,
                        nombreSecurise(
                            article.prixAchatMoyen
                        )
                    )

            });

        }


        recalculerTotalAchat(
            achatExistant
        );


        db.mouvements.push({

            id:
                Date.now()
                +
                Math.random(),

            date:
                new Date().toISOString(),

            dateAffichage:
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
                    Math.max(
                        0,
                        nombreSecurise(
                            article.prixAchatMoyen
                        )
                    )

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

        id:
            Date.now()
            +
            Math.random(),

        date:
            new Date().toISOString(),

        dateAffichage:
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


    console.log(
        "✅ ACHAT AUTOMATIQUE AJOUTE :",
        achat
    );


    return achat;

}


// ======================================
// TRAITEMENT STOCK + ACHAT
// ======================================

function traiterStockCommande(
    commande
) {

    if (!commande) {

        return false;

    }


    // ==================================
    // PROTECTION DOUBLE TRAITEMENT
    // ==================================

    if (
        commande.stockTraite === true
    ) {

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


    if (
        produits.length === 0
    ) {

        console.warn(
            "⚠️ AUCUN PRODUIT POUR LA COMMANDE :",
            commande.id
        );


        commande.stockErreur =
            true;


        commande.stockErreurMessage =
            "Aucun produit dans la commande.";


        return false;

    }


    // ==================================
    // PREPARATION DES OPERATIONS
    // ==================================

    const operations = [];


    // ==================================
    // VERIFICATION COMPLETE
    // AVANT MODIFICATION STOCK
    // ==================================

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


            return false;

        }


        const quantiteCommandee =
            calculerQuantiteCommande(
                articleCommande
            );


        if (
            quantiteCommandee <= 0
        ) {

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


    if (
        operations.length === 0
    ) {

        commande.stockErreur =
            true;

        commande.stockErreurMessage =
            "Aucune quantité valide dans la commande.";

        return false;

    }


    // ==================================
    // APPLICATION STOCK
    // ==================================

    operations.forEach(
        function (operation) {

            const article =
                operation.stock;


            const quantiteCommandee =
                operation.quantite;


            const ancienStock =
                Math.max(
                    0,
                    nombreSecurise(
                        article.stock
                    )
                );


            const consommation =
                Math.min(
                    ancienStock,
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


            // ==================================
            // STOCK
            // ==================================

            article.stock =
                nouveauStock;


            // ==================================
            // MOUVEMENT
            // ==================================

            if (
                consommation > 0
            ) {

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

            if (
                quantiteManquante > 0
            ) {

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

    commande.stockErreurMessage =
        "";

    commande.stockTraiteDate =
        new Date().toISOString();

    commande.stockTraiteDateAffichage =
        new Date().toLocaleString(
            "fr-FR"
        );


    console.log(
        "✅ STOCK + ACHATS TRAITES :",
        commande.id
    );


    return true;

}


// ======================================
// AJOUT COMMANDE
// ======================================

function ajouterCommande(
    commande
) {

    if (!commande) {

        console.error(
            "Impossible d'ajouter une commande vide."
        );

        return false;

    }


    // ==================================
    // SECURISATION TABLEAUX
    // ==================================

    if (
        !Array.isArray(
            db.commandes
        )
    ) {

        db.commandes = [];

    }


    if (
        !Array.isArray(
            db.achats
        )
    ) {

        db.achats = [];

    }


    if (
        !Array.isArray(
            db.mouvements
        )
    ) {

        db.mouvements = [];

    }


    if (
        !Array.isArray(
            db.clients
        )
    ) {

        db.clients = [];

    }


    // ==================================
    // IDENTIFIANT COMMANDE
    // ==================================

    const idCommande =
        obtenirIdentifiantCommandeMigration(
            commande
        );


    // ==================================
    // PROTECTION DOUBLON
    // ==================================

    if (
        commandeExisteDeja(
            db.commandes,
            commande
        )
    ) {

        console.warn(
            "⚠️ COMMANDE DEJA PRESENTE :",
            idCommande || commande
        );


        const commandeExistante =
            db.commandes.find(
                function (cmd) {

                    const id =
                        obtenirIdentifiantCommandeMigration(
                            cmd
                        );

                    return (
                        id
                        &&
                        idCommande
                        &&
                        id === idCommande
                    );

                }
            );


        if (
            commandeExistante
        ) {

            if (
                commandeExistante.stockTraite !== true
            ) {

                return retraiterStockCommande(
                    commandeExistante.id
                    ||
                    commandeExistante.numero
                );

            }

        }


        return false;

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


    let clientExiste = null;


    if (email) {

        clientExiste =
            db.clients.find(
                function (client) {

                    return (

                        String(
                            client.email || ""
                        )
                        .trim()
                        .toLowerCase()

                        ===

                        email

                    );

                }
            );

    }


    if (!clientExiste) {

        db.clients.push({

            id:
                commande.id,

            nom:
                commande.client || "",

            telephone:
                commande.telephone || "",

            email:
                commande.email || "",

            adresse:
                commande.adresse || "",

            dateCreation:
                new Date().toISOString()

        });

    }


    // ==================================
    // SAUVEGARDE INITIALE
    // ==================================

    if (
        !sauvegarderDB()
    ) {

        console.error(
            "❌ IMPOSSIBLE DE SAUVEGARDER LA COMMANDE."
        );

        /*
            On laisse néanmoins l'objet en mémoire.
            Le traitement n'est pas lancé aveuglément.
        */

        return false;

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
            new Date().toISOString();

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
) {

    const commande =
        db.commandes.find(
            function (cmd) {

                return (

                    String(
                        cmd.id
                    )

                    ===

                    String(
                        idCommande
                    )

                    ||

                    String(
                        cmd.numero
                    )

                    ===

                    String(
                        idCommande
                    )

                );

            }
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

        console.warn(
            "ℹ️ Le stock de cette commande a déjà été traité."
        );

        return false;

    }


    commande.stockErreur =
        false;

    commande.stockErreurMessage =
        "";


    const resultat =
        traiterStockCommande(
            commande
        );


    sauvegarderDB();


    return resultat;

}


// ======================================
// SECURISATION HTML
// ======================================

function securiserTexte(
    texte
) {

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


window.normaliserRecette =
    normaliserRecette;


window.securiserTexte =
    securiserTexte;


// ======================================
// EXPORTS MIGRATION
// ======================================

window.migrerAnciennesDonnees =
    migrerAnciennesDonnees;


window.migrerAnciennesCommandes =
    migrerAnciennesCommandes;


window.migrerAnciennesArchives =
    migrerAnciennesArchives;


// ======================================
// EXPORTS UTILITAIRES
// ======================================

window.trouverAchatAutomatique =
    trouverAchatAutomatique;


window.recalculerTotalAchat =
    recalculerTotalAchat;


window.calculerQuantiteCommande =
    calculerQuantiteCommande;


// ======================================
// EXECUTION MIGRATION
// ======================================

migrerAnciennesDonnees();


// ======================================
// SAUVEGARDE FINALE APRES NORMALISATION
// ======================================

sauvegarderDB();


// ======================================
// FIN
// ======================================

console.log(
    "DATABASE.JS 2.10.0 CHARGE",
    {

        commandes:
            db.commandes.length,

        archives:
            db.archives.length,

        articles:
            db.articles.length,

        achats:
            db.achats.length,

        clients:
            db.clients.length,

        mouvements:
            db.mouvements.length

    }
);
