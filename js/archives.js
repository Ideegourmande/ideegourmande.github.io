// ==================================
// IDÉE GOURMANDE
// Archives des commandes
// Version 1.2
// ==================================


// ==================================
// CHARGEMENT DES ARCHIVES
// ==================================

function obtenirArchives(){

    try{

        return JSON.parse(
            localStorage.getItem("commandesArchivees")
        ) || [];

    }
    catch(e){

        return [];

    }

}




// ==================================
// AFFICHAGE DES ARCHIVES
// ==================================

function afficherArchives(){

    afficherListeArchives(
        obtenirArchives()
    );

}




function afficherListeArchives(archives){

    const zone =
        document.getElementById("listeArchives");


    if(!zone){

        return;

    }


    if(archives.length === 0){

        zone.innerHTML =
            "<p>Aucune archive.</p>";

        return;

    }


    let html = "";


    archives.forEach(function(cmd,index){

        html += `

<div class="commande-admin">

<h3>

📦 Commande ${cmd.id || "-"}

</h3>

<p>

<strong>Date :</strong><br>

${cmd.date || "-"}

</p>

<p>

<strong>Client :</strong><br>

${cmd.client || "-"}

</p>

<p>

<strong>Email :</strong><br>

${cmd.email || "-"}

</p>

<p>

<strong>Adresse :</strong><br>

${cmd.adresse || "-"}

</p>

<p>

<strong>Commande :</strong><br>

${(cmd.produits || "").replace(/\n/g,"<br>")}

</p>

<p>

<strong>Total :</strong>

${cmd.total || "0.00"} CHF

</p>

<button
class="btn"
onclick="restaurerCommande(${index})">

♻ Restaurer

</button>

<button
class="btn"
onclick="supprimerArchive(${index})">

🗑 Supprimer

</button>

<hr>

</div>

`;

    });


    zone.innerHTML = html;

}




// ==================================
// RESTAURER UNE COMMANDE
// ==================================

function restaurerCommande(index){

    let archives =
        obtenirArchives();


    if(!archives[index]){

        return;

    }


    let commandes = [];


    try{

        commandes = JSON.parse(
            localStorage.getItem("commandes")
        ) || [];

    }
    catch(e){

        commandes = [];

    }

archives[index].statut = "Nouvelle";
    commandes.push(
        archives[index]
    );


    archives.splice(index,1);


    localStorage.setItem(
        "commandes",
        JSON.stringify(commandes)
    );


    localStorage.setItem(
        "commandesArchivees",
        JSON.stringify(archives)
    );


    afficherArchives();

    alert(
        "La commande a été restaurée."
    );

}




// ==================================
// SUPPRIMER UNE ARCHIVE
// ==================================

function supprimerArchive(index){

    if(
        !confirm(
            "Supprimer définitivement cette archive ?"
        )
    ){

        return;

    }


    let archives =
        obtenirArchives();


    if(!archives[index]){

        return;

    }


    archives.splice(index,1);


    localStorage.setItem(
        "commandesArchivees",
        JSON.stringify(archives)
    );


    afficherArchives();

    alert(
        "L'archive a été supprimée."
    );

}




// ==================================
// RECHERCHE DANS LES ARCHIVES
// ==================================

function rechercherArchive(){

    const champ =
        document.getElementById("rechercheArchive");


    if(!champ){

        return;

    }


    let recherche =
        champ.value.toLowerCase();


    let archives =
        obtenirArchives();


    let resultat =
        archives.filter(function(cmd){

            return (

                (cmd.client || "")
                .toLowerCase()
                .includes(recherche)

                ||

                (cmd.email || "")
                .toLowerCase()
                .includes(recherche)

            );

        });


    afficherListeArchives(
        resultat
    );

}




// ==================================
// DÉCONNEXION
// ==================================

function deconnexion(){

    localStorage.removeItem(
        "adminConnecte"
    );

    window.location.href =
        "admin-login.html";

}




// ==================================
// INITIALISATION
// ==================================

document.addEventListener(
    "DOMContentLoaded",
    function(){

        afficherArchives();

    }
);
