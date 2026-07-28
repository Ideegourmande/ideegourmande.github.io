// ==================================
// IDÉE GOURMANDE
// Archives des commandes
// Version 1.0
// ==================================


// ==================================
// CHARGEMENT
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
// AFFICHAGE
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


if(archives.length===0){

zone.innerHTML=
"<p>Aucune archive.</p>";

return;

}


let html="";


archives.forEach(function(cmd,index){

html+=`

<div class="commande-admin">

<h3>

📦 Commande ${cmd.id}

</h3>

<p>

<strong>Date :</strong><br>

${cmd.date}

</p>

<p>

<strong>Client :</strong><br>

${cmd.client}

</p>

<p>

<strong>Email :</strong><br>

${cmd.email}

</p>

<p>

<strong>Adresse :</strong><br>

${cmd.adresse}

</p>

<p>

<strong>Commande :</strong><br>

${(cmd.produits||"").replace(/\n/g,"<br>")}

</p>

<p>

<strong>Total :</strong>

${cmd.total} CHF

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

zone.innerHTML=html;

}



// ==================================
// RESTAURER
// ==================================

function restaurerCommande(index){

let archives=
obtenirArchives();

let commandes=
JSON.parse(
localStorage.getItem("commandes")
) || [];


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

}



// ==================================
// SUPPRESSION
// ==================================

function supprimerArchive(index){

if(
!confirm(
"Supprimer définitivement cette archive ?"
)
){

return;

}


let archives=
obtenirArchives();

archives.splice(index,1);

localStorage.setItem(
"commandesArchivees",
JSON.stringify(archives)
);

afficherArchives();

}



// ==================================
// RECHERCHE
// ==================================

function rechercherArchive(){

let recherche=
document
.getElementById("rechercheArchive")
.value
.toLowerCase();

let archives=
obtenirArchives();

let resultat=
archives.filter(function(cmd){

return(

(cmd.client||"")
.toLowerCase()
.includes(recherche)

||

(cmd.email||"")
.toLowerCase()
.includes(recherche)

);

});

afficherListeArchives(
resultat
);

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
