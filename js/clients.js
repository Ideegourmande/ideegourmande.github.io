// ==================================
// IDEE GOURMANDE
// Gestion clients
// Version 2.4.0
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

function afficherClients(){


let zone =
document.getElementById("listeClients");


if(!zone){

return;

}



let clients =
obtenirClients();



if(clients.length === 0){


zone.innerHTML =

"<p>Aucun client enregistré.</p>";


return;


}



let html = "";



clients.forEach(function(client){



html += `

<div class="commande-admin">


<h3>
👤 ${client.nom || "-"}
</h3>


<p>
<strong>Téléphone :</strong><br>
${client.telephone || "-"}
</p>


<p>
<strong>Email :</strong><br>
${client.email || "-"}
</p>


<p>
<strong>Adresse :</strong><br>
${client.adresse || "-"}
</p>


<hr>


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
document.getElementById(
"rechercheClient"
);



if(!champ){

return;

}



let recherche =
champ.value.toLowerCase();



let clients =
obtenirClients();



let resultat =
clients.filter(function(client){


return (

(client.nom || "")
.toLowerCase()
.includes(recherche)


||

(client.email || "")
.toLowerCase()
.includes(recherche)


);


});



afficherListeClients(resultat);


}




// ==================================
// AFFICHAGE LISTE FILTREE
// ==================================

function afficherListeClients(clients){


let zone =
document.getElementById("listeClients");


if(!zone){

return;

}



if(clients.length === 0){

zone.innerHTML =
"<p>Aucun client trouvé.</p>";

return;

}



let html = "";



clients.forEach(function(client){


html += `

<div class="commande-admin">

<h3>
👤 ${client.nom || "-"}
</h3>


<p>
${client.email || ""}
</p>


<p>
${client.telephone || ""}
</p>


</div>

`;


});



zone.innerHTML = html;


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
