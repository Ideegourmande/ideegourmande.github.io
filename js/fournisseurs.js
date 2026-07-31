// ======================================
// IDEE GOURMANDE - GESTION FOURNISSEURS
// Version 1.1.2 stable corrigée
// Compatible database.js 2.0.1
// Compatible js-achats.js 1.2.0
// ======================================


let fournisseurEdition = -1;


//--------------------------------------
// Protection affichage HTML
//--------------------------------------

function echapperHTML(texte){

    return String(texte ?? "")

    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}



//--------------------------------------
// Vérification base de données
//--------------------------------------

function verifierFournisseursDB(){

    if(typeof db === "undefined"){

        console.error(
            "database.js doit être chargé avant js-fournisseurs.js"
        );

        return false;

    }


    db.clients ??= [];

    db.achats ??= [];

    db.mouvements ??= [];


    return true;

}



//--------------------------------------
// Migration achats vers fournisseurId
//--------------------------------------

function migrerAchatsFournisseurID(){

    if(!verifierFournisseursDB())
        return;


    let modifications = 0;


    db.achats.forEach(achat=>{


        if(achat.fournisseurId){

            return;

        }


        if(!achat.fournisseur){

            return;

        }



        const fournisseur =

        db.clients.find(client =>


            client.type === "Fournisseur"

            &&

            client.nom?.trim().toLowerCase()

            ===

            achat.fournisseur?.trim().toLowerCase()


        );



        if(fournisseur){


            achat.fournisseurId =

            fournisseur.id;


            modifications++;

        }


    });



    if(modifications > 0){


        sauvegarderFournisseurs();


        console.log(

            modifications +

            " achat(s) migré(s) vers fournisseurId"

        );


    }


}





//--------------------------------------
// Sauvegarde centrale
//--------------------------------------

function sauvegarderFournisseurs(){


    if(typeof sauvegarderDB === "function"){


        sauvegarderDB();

    }

}





//--------------------------------------
// Nouveau fournisseur
//--------------------------------------

function nouveauFournisseur(){


    fournisseurEdition = -1;



    const champs = [

        "fournisseurNom",
        "fournisseurTelephone",
        "fournisseurEmail",
        "fournisseurAdresse",
        "fournisseurNotes"

    ];



    champs.forEach(id=>{


        const champ =

        document.getElementById(id);



        if(champ){

            champ.value = "";

        }


    });



    const popup =

    document.getElementById(
        "popupFournisseur"
    );



    if(popup){

        popup.style.display = "flex";

    }


}





//--------------------------------------
// Modifier fournisseur
//--------------------------------------

function modifierFournisseur(index){


    if(!verifierFournisseursDB())
        return;



    const fournisseurs =

    db.clients.filter(client =>

        client.type === "Fournisseur"

    );



    const fournisseur =

    fournisseurs[index];



    if(!fournisseur)
        return;



    fournisseurEdition =

    db.clients.indexOf(fournisseur);



    const champs = {


        fournisseurNom:
        fournisseur.nom || "",


        fournisseurTelephone:
        fournisseur.telephone || "",


        fournisseurEmail:
        fournisseur.email || "",


        fournisseurAdresse:
        fournisseur.adresse || "",


        fournisseurNotes:
        fournisseur.notes || ""

    };



    Object.entries(champs)

    .forEach(([id,valeur])=>{


        const champ =

        document.getElementById(id);



        if(champ){

            champ.value = valeur;

        }


    });



    const popup =

    document.getElementById(
        "popupFournisseur"
    );



    if(popup){

        popup.style.display = "flex";

    }


}





//--------------------------------------
// Enregistrer fournisseur
//--------------------------------------

function enregistrerFournisseur(){

    if(!verifierFournisseursDB())
        return;


    const fournisseur = {

        id:

        fournisseurEdition === -1

        ?

        Date.now()

        :

        db.clients[fournisseurEdition]?.id || Date.now(),


        nom:

        document.getElementById(
            "fournisseurNom"
        )
        ?.value
        ?.trim()
        || "",


        type:

        "Fournisseur",


        telephone:

        document.getElementById(
            "fournisseurTelephone"
        )
        ?.value
        ?.trim()
        || "",


        email:

        document.getElementById(
            "fournisseurEmail"
        )
        ?.value
        ?.trim()
        || "",


        adresse:

        document.getElementById(
            "fournisseurAdresse"
        )
        ?.value
        ?.trim()
        || "",


        notes:

        document.getElementById(
            "fournisseurNotes"
        )
        ?.value
        ?.trim()
        || "",


        dateCreation:

        fournisseurEdition === -1

        ?

        new Date().toLocaleString()

        :

        db.clients[fournisseurEdition]?.dateCreation

    };
    
    if(!fournisseur.nom){

        alert(
            "Veuillez saisir le nom du fournisseur."
        );

        return;

    }



    //----------------------------------
    // Contrôle doublon fournisseur
    //----------------------------------

    const doublon =

    db.clients.some(client =>


        client.type === "Fournisseur"

        &&

        client.nom?.trim().toLowerCase()

        ===

        fournisseur.nom.trim().toLowerCase()

        &&

        client.id !== fournisseur.id


    );



    if(doublon){

        alert(
            "Ce fournisseur existe déjà."
        );

        return;

    }





    //----------------------------------
    // Création ou modification
    //----------------------------------

    if(fournisseurEdition === -1){


        db.clients.push(
            fournisseur
        );



        db.mouvements.push({

            date:

            new Date()
            .toLocaleString(),


            action:

            "Création fournisseur",


            fournisseur:

            fournisseur.nom

        });


    }
    else{


        const ancienNom =

        db.clients[fournisseurEdition].nom;



        db.clients[fournisseurEdition] =

        fournisseur;



        //----------------------------------
        // Mise à jour achats existants
        //----------------------------------

        db.achats.forEach(achat=>{


            if(

                achat.fournisseurId === fournisseur.id

                ||

                achat.fournisseur === ancienNom

            ){


                achat.fournisseur =

                fournisseur.nom;


                achat.fournisseurId =

                fournisseur.id;


            }


        });



        db.mouvements.push({

            date:

            new Date()
            .toLocaleString(),


            action:

            "Modification fournisseur",


            ancienNom,


            nouveauNom:

            fournisseur.nom

        });


    }




    sauvegarderFournisseurs();


    afficherFournisseurs();


    fermerPopupFournisseur();


}







//--------------------------------------
// Affichage liste fournisseurs
//--------------------------------------

function afficherFournisseurs(){


    if(!verifierFournisseursDB())
        return;



    const zone =

    document.getElementById(
        "listeFournisseurs"
    );



    if(!zone)
        return;



    zone.innerHTML = "";



    const fournisseurs =

    db.clients

    .filter(client =>

        client.type === "Fournisseur"

    )

    .sort((a,b)=>

        (a.nom || "").localeCompare(
            b.nom || ""
        )

    );



    const compteur =

    document.getElementById(
        "nbFournisseurs"
    );



    if(compteur){

        compteur.textContent =

        fournisseurs.length;

    }




    const compteurInactifs =

    document.getElementById(
        "nbFournisseursSansAchat"
    );



    if(compteurInactifs){


        const sansAchat =

        fournisseurs.filter(f=>


            !db.achats.some(achat =>


                achat.fournisseurId === f.id

                ||

                achat.fournisseur === f.nom


            )


        ).length;



        compteurInactifs.textContent =

        sansAchat;


    }





    fournisseurs.forEach((fournisseur,index)=>{



        const achats =

        db.achats.filter(achat =>


            achat.fournisseurId === fournisseur.id

            ||

            achat.fournisseur === fournisseur.nom


        );



        const totalAchats =

        achats.reduce((total,achat)=>


            total +

            (Number(achat.total) || 0)


        ,0);




        const dernierAchat =

        achats.length

        ?

        achats

        .slice()

        .sort((a,b)=>

            new Date(b.date)

            -

            new Date(a.date)

        )[0].date


        :

        "-";





        zone.innerHTML += `


        <div class="fiche-fournisseur">


            <h3>

            ${echapperHTML(fournisseur.nom)}

            </h3>



            <p>

            📞

            ${echapperHTML(
                fournisseur.telephone || "Non renseigné"
            )}

            </p>



            <p>

            ✉️

            ${echapperHTML(
                fournisseur.email || "Non renseigné"
            )}

            </p>



            <p>

            Nombre d'achats :

            <strong>

            ${achats.length}

            </strong>

            </p>



            <p>

            Total achats :

            <strong>

            ${totalAchats.toFixed(2)} CHF

            </strong>

            </p>



            <p>

            Dernier achat :

            ${echapperHTML(dernierAchat)}

            </p>




            <button onclick="modifierFournisseur(${index})">

            ✏️ Modifier

            </button>



            <button onclick="afficherFicheFournisseur(${index})">

            📋 Fiche

            </button>



            <button onclick="supprimerFournisseur(${index})">

            🗑 Supprimer

            </button>



        </div>


        `;


    });


}





//--------------------------------------
// Recherche fournisseur
//--------------------------------------

function rechercherFournisseur(){


    const texte =

    document.getElementById(
        "rechercheFournisseur"
    )
    ?.value
    ?.toLowerCase()
    || "";



    document

    .querySelectorAll(
        ".fiche-fournisseur"
    )

    .forEach(fiche=>{


        fiche.style.display =


        fiche.innerText

        .toLowerCase()

        .includes(texte)


        ?

        ""

        :

        "none";


    });


}

//--------------------------------------
// Fiche fournisseur
//--------------------------------------

function afficherFicheFournisseur(index){


    if(!verifierFournisseursDB())
        return;



    const fournisseurs =

    db.clients.filter(client =>

        client.type === "Fournisseur"

    );



    const fournisseur =

    fournisseurs[index];



    if(!fournisseur)
        return;



    const achats =

    db.achats.filter(achat =>


        achat.fournisseurId === fournisseur.id

        ||

        achat.fournisseur === fournisseur.nom


    )

    .sort((a,b)=>

        new Date(b.date)

        -

        new Date(a.date)

    );



    const total =

    achats.reduce((somme,achat)=>


        somme +

        (Number(achat.total) || 0)


    ,0);



    const derniereCommande =

    achats.length

    ?

    achats[0].date

    :

    "Aucun achat";



    const zone =

    document.getElementById(
        "ficheFournisseur"
    );



    if(!zone)
        return;



    zone.innerHTML = `


    <div class="fiche-detail">


        <h2>

        ${echapperHTML(fournisseur.nom)}

        </h2>



        <p>

        Téléphone :

        ${echapperHTML(
            fournisseur.telephone || "-"
        )}

        </p>



        <p>

        Email :

        ${echapperHTML(
            fournisseur.email || "-"
        )}

        </p>



        <p>

        Adresse :

        ${echapperHTML(
            fournisseur.adresse || "-"
        )}

        </p>



        <p>

        Notes :

        ${echapperHTML(
            fournisseur.notes || "-"
        )}

        </p>



        <hr>



        <h3>

        Statistiques

        </h3>



        <p>

        Nombre d'achats :

        ${achats.length}

        </p>



        <p>

        Total commandé :

        ${total.toFixed(2)} CHF

        </p>



        <p>

        Dernier achat :

        ${echapperHTML(derniereCommande)}

        </p>



        <button onclick="afficherHistoriqueFournisseur(${fournisseur.id})">

        📦 Historique achats

        </button>


    </div>


    `;


}






//--------------------------------------
// Historique achats fournisseur
//--------------------------------------

function afficherHistoriqueFournisseur(idFournisseur){


    if(!verifierFournisseursDB())
        return;



    const fournisseur =

    db.clients.find(client =>

        Number(client.id) === Number(idFournisseur)

    );



    if(!fournisseur)
        return;



    const zone =

    document.getElementById(
        "historiqueFournisseur"
    );



    if(!zone)
        return;



    const achats =

    db.achats.filter(achat =>


        achat.fournisseurId === fournisseur.id

        ||

        achat.fournisseur === fournisseur.nom


    )

    .sort((a,b)=>

        new Date(b.date)

        -

        new Date(a.date)

    );



    zone.innerHTML = "";



    if(achats.length === 0){


        zone.innerHTML = `

        <p>
        Aucun achat enregistré pour ce fournisseur.
        </p>

        `;


        return;

    }



    let totalGeneral = 0;



    achats.forEach(achat=>{


        const montant =

        Number(achat.total) || 0;



        totalGeneral += montant;



        zone.innerHTML += `


        <div class="historique-achat">


            <h3>

            ${echapperHTML(
                achat.numero || "Achat"
            )}

            </h3>



            <p>

            Date :

            ${echapperHTML(
                achat.date || "-"
            )}

            </p>



            <p>

            Statut :

            ${echapperHTML(
                achat.statut || "Inconnu"
            )}

            </p>



            <p>

            Total :

            ${montant.toFixed(2)} CHF

            </p>


        </div>


        `;


    });



    zone.innerHTML += `


    <hr>

    <h3>

    Total fournisseur :

    ${totalGeneral.toFixed(2)} CHF

    </h3>


    `;


}






//--------------------------------------
// Supprimer fournisseur
//--------------------------------------

function supprimerFournisseur(index){


    if(!verifierFournisseursDB())
        return;



    const fournisseurs =

    db.clients.filter(client =>

        client.type === "Fournisseur"

    );



    const fournisseur =

    fournisseurs[index];



    if(!fournisseur)
        return;



    const achatsExistants =

    db.achats.some(achat =>


        achat.fournisseurId === fournisseur.id

        ||

        achat.fournisseur === fournisseur.nom


    );



    let message =

    "Supprimer ce fournisseur ?";



    if(achatsExistants){


        message =

        "Ce fournisseur possède des achats enregistrés.\n\n" +

        "Le fournisseur sera supprimé mais les achats resteront dans l'historique.\n\n" +

        "Continuer ?";


    }



    if(!confirm(message))
        return;



    const position =

    db.clients.indexOf(fournisseur);



    if(position >= 0){


        db.clients.splice(

            position,

            1

        );


    }



    db.mouvements.push({

        date:

        new Date()
        .toLocaleString(),


        action:

        "Suppression fournisseur",


        fournisseur:

        fournisseur.nom


    });



    sauvegarderFournisseurs();


    afficherFournisseurs();



    const fiche =

    document.getElementById(
        "ficheFournisseur"
    );



    if(fiche){

        fiche.innerHTML = "";

    }


}






//--------------------------------------
// Fermer popup fournisseur
//--------------------------------------

function fermerPopupFournisseur(){


    const popup =

    document.getElementById(
        "popupFournisseur"
    );



    if(popup){

        popup.style.display = "none";

    }


}






//--------------------------------------
// Initialisation module fournisseurs
//--------------------------------------

document.addEventListener(

"DOMContentLoaded",

()=>{


    if(!verifierFournisseursDB()){

        return;

    }



    migrerAchatsFournisseurID();



    afficherFournisseurs();




    const bouton =

    document.getElementById(
        "btnNouveauFournisseur"
    );



    if(bouton){


        bouton.addEventListener(

            "click",

            nouveauFournisseur

        );


    }



    const recherche =

    document.getElementById(
        "rechercheFournisseur"
    );



    if(recherche){


        recherche.addEventListener(

            "input",

            rechercherFournisseur

        );


    }



});
