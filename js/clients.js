// ==================================
// IDEE GOURMANDE
// Gestion clients
// Version 2.5.0
// ==================================

// ==================================
// CHARGEMENT CLIENTS
// ==================================

function obtenirClients(){

    if(typeof db === "undefined"){
        return [];
    }

    return db.clients || [];

}


// ==================================
// AFFICHAGE CLIENTS
// ==================================

function afficherClients(clients = obtenirClients()){

    let zone = document.getElementById("listeClients");

    if(!zone){
        return;
    }

    if(clients.length === 0){

        zone.innerHTML =
        "<p>Aucun client enregistré.</p>";

        return;

    }

    let html = "";

    clients.forEach(function(client){

        let commandes = (db.commandes || [])

            .filter(c => c.email === client.email)

            .sort(function(a,b){

                return new Date(a.date) -
                       new Date(b.date);

            });

        let nbCommandes = commandes.length;

        let total = commandes.reduce(function(somme,c){

            return somme + Number(c.total || 0);

        },0);

        let premiereCommande = "-";
        let derniereCommande = "-";

        if(commandes.length){

            premiereCommande =
            commandes[0].date;

            derniereCommande =
            commandes[commandes.length-1].date;

        }

        html += `

<div class="commande-admin">

<h3>👤 ${client.nom || "-"}</h3>

<p><strong>Téléphone :</strong><br>
${client.telephone || "-"}
</p>

<p><strong>Email :</strong><br>
${client.email || "-"}
</p>

<p><strong>Adresse :</strong><br>
${client.adresse || "-"}
</p>

<hr>

<p>🛒 <strong>Commandes :</strong> ${nbCommandes}</p>

<p>💰 <strong>Total dépensé :</strong> ${total.toFixed(2)} CHF</p>

<p>📅 <strong>Première commande :</strong> ${premiereCommande}</p>

<p>🕒 <strong>Dernière commande :</strong> ${derniereCommande}</p>

<br>

<button
class="btn"
onclick="voirHistorique('${client.email}')">

📂 Voir l'historique

</button>

</div>

`;

    });

    zone.innerHTML = html;

}


// ==================================
// RECHERCHE CLIENT
// ==================================

function rechercherClient(){

    let champ =
    document.getElementById("rechercheClient");

    if(!champ){
        return;
    }

    let recherche =
    champ.value.toLowerCase().trim();

    let resultat =
    obtenirClients().filter(function(client){

        return (

            (client.nom || "")
            .toLowerCase()
            .includes(recherche)

            ||

            (client.email || "")
            .toLowerCase()
            .includes(recherche)

            ||

            (client.telephone || "")
            .toLowerCase()
            .includes(recherche)

            ||

            (client.adresse || "")
            .toLowerCase()
            .includes(recherche)

        );

    });

    afficherClients(resultat);

}


// ==================================
// HISTORIQUE CLIENT
// ==================================

function voirHistorique(email){

    let commandes = (db.commandes || [])

        .filter(c => c.email === email)

        .sort(function(a,b){

            return new Date(a.date) -
                   new Date(b.date);

        });

    let html = "<h3>Historique des commandes</h3>";

    if(commandes.length === 0){

        html +=
        "<p>Aucune commande trouvée.</p>";

    }
    else{

        commandes.forEach(function(c){

            html += `

<div class="commande-admin">

<strong>${c.id}</strong><br>

📅 ${c.date}<br>

💰 ${c.total} CHF<br>

📦 ${c.statut}<br><br>

<small>

${c.produits}

</small>

</div>

<br>

`;

        });

    }

    document.getElementById(
        "contenuHistorique"
    ).innerHTML = html;

    document.getElementById(
        "fenetreHistorique"
    ).style.display = "block";

}


// ==================================
// FERMETURE HISTORIQUE
// ==================================

function fermerHistorique(){

    document.getElementById(
        "fenetreHistorique"
    ).style.display = "none";

}


// ==================================
// INITIALISATION
// ==================================

document.addEventListener(

    "DOMContentLoaded",

    function(){

        afficherClients();

    }

);
