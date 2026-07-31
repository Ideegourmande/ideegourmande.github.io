// ======================================
// IDEE GOURMANDE
// Base de données centrale
// Version 2.1.0
// ======================================


let db = JSON.parse(
    localStorage.getItem("ideeGourmandeDB")
);



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



    // Sécurité supplémentaire stock


    if(!Array.isArray(db.articles)){


        db.articles=[];


    }



    if(!Array.isArray(db.mouvements)){


        db.mouvements=[];


    }



    if(!Array.isArray(db.emplacements)
       || db.emplacements.length===0){


        db.emplacements=[...emplacementsDefaut];


    }



    sauvegarderDB();


}




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
