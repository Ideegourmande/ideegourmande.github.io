// ==================================
// IDÉE GOURMANDE
// BASE DE DONNÉES CENTRALE
// Version 2.9.0
// ==================================


// ==================================
// CLÉS LOCALSTORAGE
// ==================================

const CLE_BASE = "ideeGourmandeDB";

// Ancienne clé utilisée par l'ancien système d'archives
const CLE_ANCIENNES_ARCHIVES =
    "commandesArchivees";

// Indique que la migration des anciennes archives
// a déjà été effectuée
const CLE_MIGRATION_ARCHIVES =
    "ideeGourmande_migration_archives_v1";


// ==================================
// STRUCTURE PAR DÉFAUT
// ==================================

function creerBaseParDefaut(){

    return {

        commandes: [],

        archives: [],

        clients: [],

        articles: [],

        achats: [],

        mouvements: []

    };

}


// ==================================
// CHARGEMENT DE LA BASE
// ==================================

let db = null;


function chargerDB(){

    try{

        const contenu =
            localStorage.getItem(
                CLE_BASE
            );


        // ==================================
        // AUCUNE BASE EXISTANTE
        // ==================================

        if(!contenu){

            db =
                creerBaseParDefaut();

            sauvegarderDB();

            return db;

        }


        // ==================================
        // LECTURE DE LA BASE
        // ==================================

        const base =
            JSON.parse(
                contenu
            );


        if(
            !base ||
            typeof base !== "object" ||
            Array.isArray(base)
        ){

            throw new Error(
                "Structure de base invalide."
            );

        }


        db = base;


        // ==================================
        // GARANTIE DES TABLEAUX
        // ==================================

        if(
            !Array.isArray(db.commandes)
        ){

            db.commandes = [];

        }


        if(
            !Array.isArray(db.archives)
        ){

            db.archives = [];

        }


        if(
            !Array.isArray(db.clients)
        ){

            db.clients = [];

        }


        if(
            !Array.isArray(db.articles)
        ){

            db.articles = [];

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


        // ==================================
        // MIGRATION ANCIENNES ARCHIVES
        // ==================================

        migrerAnciennesArchives();


        // ==================================
        // SAUVEGARDE
        // ==================================

        sauvegarderDB();


        return db;

    }
    catch(erreur){

        console.error(
            "❌ ERREUR CHARGEMENT BASE :",
            erreur
        );


        db =
            creerBaseParDefaut();


        return db;

    }

}


// ==================================
// MIGRATION DES ANCIENNES ARCHIVES
// ==================================

function migrerAnciennesArchives(){

    // ==================================
    // DÉJÀ MIGRÉ
    // ==================================

    if(
        localStorage.getItem(
            CLE_MIGRATION_ARCHIVES
        ) === "oui"
    ){

        return;

    }


    // ==================================
    // RÉCUPÉRATION ANCIENNES ARCHIVES
    // ==================================

    let anciennesArchives = [];


    try{

        const anciennesDonnees =
            localStorage.getItem(
                CLE_ANCIENNES_ARCHIVES
            );


        if(anciennesDonnees){

            const donnees =
                JSON.parse(
                    anciennesDonnees
                );


            if(
                Array.isArray(donnees)
            ){

                anciennesArchives =
                    donnees;

            }

        }

    }
    catch(erreur){

        console.error(
            "❌ Impossible de lire les anciennes archives :",
            erreur
        );

        return;

    }


    // ==================================
    // AUCUNE ANCIENNE ARCHIVE
    // ==================================

    if(
        anciennesArchives.length === 0
    ){

        localStorage.setItem(
            CLE_MIGRATION_ARCHIVES,
            "oui"
        );

        return;

    }


    // ==================================
    // PROTECTION CONTRE LES DOUBLONS
    // ==================================

    anciennesArchives.forEach(
        function(ancienneArchive){

            if(!ancienneArchive){

                return;

            }


            const id =
                String(
                    ancienneArchive.id || ""
                )
                .trim();


            // Recherche d'une archive
            // déjà présente dans la nouvelle base
            const existe =
                db.archives.some(
                    function(archive){

                        if(!archive){

                            return false;

                        }


                        const archiveId =
                            String(
                                archive.id || ""
                            )
                            .trim();


                        // Si l'ID existe
                        if(
                            id &&
                            archiveId === id
                        ){

                            return true;

                        }


                        // Sécurité supplémentaire :
                        // comparaison email + date + total
                        return (

                            !id &&

                            String(
                                archive.email || ""
                            )
                            .trim()
                            ===
                            String(
                                ancienneArchive.email || ""
                            )
                            .trim()

                            &&

                            String(
                                archive.date || ""
                            )
                            .trim()
                            ===
                            String(
                                ancienneArchive.date || ""
                            )
                            .trim()

                            &&

                            Number(
                                archive.total || 0
                            )
                            ===
                            Number(
                                ancienneArchive.total || 0
                            )

                        );

                    }
                );


            // ==================================
            // AJOUT
            // ==================================

            if(!existe){

                db.archives.push(
                    ancienneArchive
                );

            }

        }
    );


    // ==================================
    // MARQUER LA MIGRATION
    // ==================================

    localStorage.setItem(
        CLE_MIGRATION_ARCHIVES,
        "oui"
    );


    console.log(
        "📂 Migration des anciennes archives terminée.",
        {
            anciennes:
                anciennesArchives.length,

            nouvelles:
                db.archives.length
        }
    );

}


// ==================================
// SAUVEGARDE DE LA BASE
// ==================================

function sauvegarderDB(){

    try{

        if(
            typeof db === "undefined" ||
            !db ||
            typeof db !== "object"
        ){

            console.error(
                "❌ Impossible de sauvegarder : db indisponible."
            );

            return false;

        }


        localStorage.setItem(
            CLE_BASE,
            JSON.stringify(db)
        );


        return true;

    }
    catch(erreur){

        console.error(
            "❌ ERREUR SAUVEGARDE DB :",
            erreur
        );


        return false;

    }

}


// ==================================
// OBTENIR LA BASE
// ==================================

function obtenirDB(){

    if(
        typeof db === "undefined" ||
        !db
    ){

        return null;

    }


    return db;

}


// ==================================
// RÉINITIALISATION COMPLÈTE
// ==================================
// À utiliser uniquement si nécessaire.
// Cette fonction ne doit PAS être appelée
// automatiquement.
// ==================================

function reinitialiserDB(){

    const confirmation =
        confirm(

            "⚠️ ATTENTION\n\n" +

            "Cette opération va supprimer " +
            "toute la base de données Idée Gourmande.\n\n" +

            "Commandes\n" +
            "Archives\n" +
            "Clients\n" +
            "Articles\n" +
            "Achats\n" +
            "Mouvements\n\n" +

            "Cette opération est irréversible.\n\n" +

            "Voulez-vous continuer ?"

        );


    if(!confirmation){

        return;

    }


    db =
        creerBaseParDefaut();


    localStorage.setItem(
        CLE_BASE,
        JSON.stringify(db)
    );


    // Autoriser une nouvelle migration
    // si nécessaire après une restauration
    localStorage.removeItem(
        CLE_MIGRATION_ARCHIVES
    );


    console.log(
        "🗑️ Base de données réinitialisée."
    );


    window.location.reload();

}


// ==================================
// SYNCHRONISATION ENTRE LES PAGES
// ==================================

window.addEventListener(
    "storage",
    function(e){

        if(
            e.key !== CLE_BASE
        ){

            return;

        }


        try{

            const contenu =
                localStorage.getItem(
                    CLE_BASE
                );


            if(!contenu){

                return;

            }


            const nouvelleBase =
                JSON.parse(
                    contenu
                );


            if(
                !nouvelleBase ||
                typeof nouvelleBase !== "object" ||
                Array.isArray(nouvelleBase)
            ){

                return;

            }


            db =
                nouvelleBase;


            // ==================================
            // GARANTIE DES TABLEAUX
            // ==================================

            if(
                !Array.isArray(db.commandes)
            ){

                db.commandes = [];

            }


            if(
                !Array.isArray(db.archives)
            ){

                db.archives = [];

            }


            if(
                !Array.isArray(db.clients)
            ){

                db.clients = [];

            }


            if(
                !Array.isArray(db.articles)
            ){

                db.articles = [];

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


            console.log(
                "🔄 Base synchronisée entre les pages."
            );


        }
        catch(erreur){

            console.error(
                "❌ Erreur synchronisation DB :",
                erreur
            );

        }

    }
);


// ==================================
// INITIALISATION
// ==================================

db =
    chargerDB();


// ==================================
// EXPORTS WINDOW
// ==================================

window.db =
    db;


window.chargerDB =
    chargerDB;


window.sauvegarderDB =
    sauvegarderDB;


window.obtenirDB =
    obtenirDB;


window.reinitialiserDB =
    reinitialiserDB;


window.migrerAnciennesArchives =
    migrerAnciennesArchives;


console.log(
    "✅ IDEE GOURMANDE - BASE DE DONNÉES CHARGÉE",
    {
        commandes:
            db.commandes.length,

        archives:
            db.archives.length,

        clients:
            db.clients.length,

        articles:
            db.articles.length,

        achats:
            db.achats.length,

        mouvements:
            db.mouvements.length
    }
);
