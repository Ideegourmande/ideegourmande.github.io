 // ======================================
// IDEE GOURMANDE
// Base de données centrale
// Version 2.0.1
// ======================================


let db = JSON.parse(localStorage.getItem("ideeGourmandeDB"));



const structureDB = {

    commandes: [],

    articles: [],

    emplacements: [

        "Congélateur du réduit",

        "Congélateur bahut",

        "Congélateur GI",

        "Chambre froide",

        "Cave",

        "Réserve sèche"

    ],

    mouvements: [],

    achats: [],

    sessions: [],

    archives: [],

    clients: [],

    statistiques: {},

    parametres: {}

};



if (!db) {

    db = structureDB;

    sauvegarderDB();

}

else {


    Object.keys(structureDB).forEach(function(cle){

        if(db[cle] === undefined){

            db[cle] = structureDB[cle];

        }

    });


    sauvegarderDB();

}



function sauvegarderDB() {


    localStorage.setItem(

        "ideeGourmandeDB",

        JSON.stringify(db)

    );


}



function obtenirDB(){

    return db;

}
