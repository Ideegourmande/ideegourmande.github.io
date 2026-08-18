// ======================================
// IDEE GOURMANDE
// Base de données centrale
// Version 3.0.0
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

        emplacements:
            [
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
// SECURISATION OBJETS
// ======================================

if (
    !db.statistiques ||
    typeof db.statistiques !== "object" ||
    Array.isArray(db.statistiques)
) {

    db.statistiques = {};

}


if (
    !db.parametres ||
    typeof db.parametres !== "object" ||
    Array.isArray(db.parametres)
) {

    db.parametres = {};

}


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
        /\bpimets\b/g,
        "piments"
    )
    .trim();

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
                ===
                String(
                    commande.client || ""
                )

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

                Number(
                    element.total || 0
                )
                ===
                Number(
                    commande.total || 0
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

                migrationEffectuee = true;

            }

        }
    );


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

                migrationEffectuee = true;

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
// EXECUTION MIGRATION
// ======================================

migrerAnciennesDonnees();


// ======================================
// ALIAS PRODUITS
// ======================================

const correspondancesProduits = {

    "foie-gras": {

        "piment":
            "foie gras aux pimets",

        "piments":
            "foie gras aux pimets",

        "pimets":
            "foie gras aux pimets",

        "aux piment":
            "foie gras aux pimets",

        "aux piments":
            "foie gras aux pimets",

        "aux pimets":
            "foie gras aux pimets",

        "figue":
            "fois gras aux figues",

        "figues":
            "fois gras aux figues",

        "aux figues":
            "fois gras aux figues"

    },


    "magret": {

        "herbe":
            "magret au herbes",

        "herbes":
            "magret au herbes",

        "aux herbes":
            "magret au herbes",

        "au herbes":
            "magret au herbes",

        "piment":
            "magret aux pimets",

        "piments":
            "magret aux pimets",

        "pimets":
            "magret aux pimets",

        "aux piment":
            "magret aux pimets",

        "aux piments":
            "magret aux pimets",

        "aux pimets":
            "magret aux pimets"

    },


    "viande-sechee":
        "viande séchée",


    "lard-sec":
        "lard sec fumé",


    "saumon-fume": {

        "piment":
            "saumon aux piments",

        "piments":
            "saumon aux piments",

        "pimets":
            "saumon aux piments",

        "aux piment":
            "saumon aux piments",

        "aux piments":
            "saumon aux piments",

        "aux pimets":
            "saumon aux piments",

        "aneth":
            "saumon à l'aneth",

        "a l'aneth":
            "saumon à l'aneth",

        "à l'aneth":
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
    // REFERENCE + RECETTE
    // ==================================

    const correspondance =
        correspondancesProduits[
            reference
        ];


    if (
        correspondance &&
        typeof correspondance === "object"
    ) {

        const nomCorrespondant =
            correspondance[
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
    // PRODUITS SANS VARIANTE
    // ==================================

    if (
        typeof correspondance === "string"
    ) {

        const article =
            db.articles.find(
                function (a) {

                    return (
                        normaliserNomArticle(
                            a.nom
                        )
                        ===
                        normaliserNomArticle(
                            correspondance
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


                if (
                    reference === "foie-gras"
                ) {

                    if (
                        recette === "piment" ||
                        recette === "piments"
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
                        recette === "figue" ||
                        recette === "figues" ||
                        recette === "aux figues"
                    ) {

                        return (
                            nomStock.includes(
                                "foie gras"
                            )
                            &&
                            nomStock.includes(
                                "figue"
                            )
                        );

                    }

                }


                if (
                    reference === "magret"
                ) {

                    if (
                        recette === "herbe" ||
                        recette === "herbes" ||
                        recette === "aux herbes"
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
                        recette === "piment" ||
                        recette === "piments"
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


                if (
                    reference === "viande-sechee"
                ) {

                    return (
                        nomStock ===
                        "viande sechee"
                    );

                }


                if (
                    reference === "lard-sec"
                ) {

                    return (
                        nomStock ===
                        "lard sec fume"
                    );

                }


                if (
                    reference === "saumon-fume"
                ) {

                    if (
                        recette === "aneth" ||
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
                        recette === "piment" ||
                        recette === "piments"
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
        .trim()
        .toLowerCase()
        ===
        "saumon-fume"
    ) {

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
) {

    db.mouvements.push({

        date:
            new Date()
            .toLocaleString(
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


    achat.total =
        (
            achat.articles || []
        )
        .reduce(
            function (
                total,
                ligne
            ) {

                return (

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
                    )

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
) {

    if (
        !article ||
        Number(quantite) <= 0
    ) {

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


    let achatExistant =
        trouverAchatAutomatique(
            article
        );


    if (achatExistant) {

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
                (
                    Number(
                        ligne.quantite
                    ) || 0
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
                .toLocaleString(
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
            new Date()
            .toLocaleString(
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


            sauvegarderDB();


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


    commande.stockTraiteDate =
        new Date()
        .toLocaleString(
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
// AJOUT / MISE A JOUR CLIENT
// ======================================

function enregistrerClientCommande(
    commande
) {

    if (!commande) {

        return;

    }


    if (
        !Array.isArray(
            db.clients
        )
    ) {

        db.clients = [];

    }


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


    // ==================================
    // CLIENT EXISTANT
    // ==================================

    if (clientExiste) {

        if (
            commande.client
        ) {

            clientExiste.nom =
                commande.client;

        }

        if (
            commande.telephone
        ) {

            clientExiste.telephone =
                commande.telephone;

        }

        if (
            commande.adresse
        ) {

            clientExiste.adresse =
                commande.adresse;

        }

        clientExiste.derniereCommande =
            commande.id;

        return;

    }


    // ==================================
    // NOUVEAU CLIENT
    // ==================================

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

        derniereCommande:
            commande.id

    });

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
    // SECURISATION
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
            commande.id || commande.numero
        );

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

    enregistrerClientCommande(
        commande
    );


    // ==================================
    // SAUVEGARDE AVANT STOCK
    // ==================================

    sauvegarderDB();


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
            .toLocaleString(
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
// ACCES BASE
// ======================================

function obtenirDB() {

    return db;

}


// ======================================
// EXPORTS
// ======================================

window.db =
    db;


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


window.obtenirDB =
    obtenirDB;


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
// FIN
// ======================================

console.log(
    "DATABASE.JS 3.0.0 CHARGE",
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
