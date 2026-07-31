// ======================================
// IDEE GOURMANDE
// Base de données centrale
// Version 2.0.0
// ======================================

let db = JSON.parse(localStorage.getItem("ideeGourmandeDB"));

if (!db) {

    db = {

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

    sauvegarderDB();

}

function sauvegarderDB() {

    localStorage.setItem(
        "ideeGourmandeDB",
        JSON.stringify(db)
    );

}
