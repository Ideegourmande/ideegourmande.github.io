// ======================================
// IDEE GOURMANDE
// Base de données centrale
// Version 2.3.0 - Sécurisation base de données
// ======================================

let db = JSON.parse(
    localStorage.getItem("ideeGourmandeDB")
);

console.log("DATABASE OK", db);


const emplacementsDefaut = [
    "Congélateur du réduit",
    "Congélateur bahut",
    "Congélateur GI",
    "Chambre froide",
    "Cave",
    "Réserve sèche"
];


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


//--------------------------------------
// Création première base
//--------------------------------------

if(!db){

    db = {

        commandes: [],
        articles: [],
        emplacements: [...emplacementsDefaut],
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

else{


    // Vérification des anciennes versions

    Object.keys(structureDB).forEach(cle=>{


        if(db[cle] === undefined){


            if(Array.isArray(structureDB[cle])){

                db[cle] = [...structureDB[cle]];

            }
            else{

                db[cle] = {};

            }

        }


    });



    // Sécurité modules

    if(!Array.isArray(db.commandes)){
        db.commandes = [];
    }


    if(!Array.isArray(db.archives)){
        db.archives = [];
    }


    if(!Array.isArray(db.achats)){
        db.achats = [];
    }


    if(!Array.isArray(db.sessions)){
        db.sessions = [];
    }


    if(!Array.isArray(db.clients)){
        db.clients = [];
    }



    // Sécurité stock

    if(!Array.isArray(db.articles)){
        db.articles = [];
    }



    if(!Array.isArray(db.mouvements)){
        db.mouvements = [];
    }



    if(
        !Array.isArray(db.emplacements)
        || db.emplacements.length === 0
    ){

        db.emplacements = [...emplacementsDefaut];

    }



    sauvegarderDB();

}


//--------------------------------------
// Migration anciennes commandes
//--------------------------------------

function migrerAnciennesCommandes(){

    let anciennes =
    JSON.parse(
        localStorage.getItem("commandes")
    ) || [];



    if(
        anciennes.length > 0 &&
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


// Lancement migration automatique

migrerAnciennesCommandes();


//--------------------------------------
// Sauvegarde centrale
//--------------------------------------

function sauvegarderDB(){

    localStorage.setItem(

        "ideeGourmandeDB",

        JSON.stringify(db)

    );

}


//--------------------------------------
// Accès base complète
//--------------------------------------

function obtenirDB(){

    return db;

}


//--------------------------------------
// Sécurité affichage HTML
//--------------------------------------

function securiserTexte(texte){

    return String(texte)

        .replace(/&/g,"&amp;")

        .replace(/</g,"&lt;")

        .replace(/>/g,"&gt;")

        .replace(/"/g,"&quot;")

        .replace(/'/g,"&#039;");

}
