// ==================================
// IDÉE GOURMANDE
// Administration commandes
// Version 1.5
// ==================================


// ==================================
// CHARGEMENT DES COMMANDES
// ==================================

function obtenirCommandes(){

if(!db.commandes){

db.commandes = [];

}

return db.commandes;

}


// ==================================
// CHARGEMENT DES ARCHIVES
// ==================================

function obtenirArchives(){

if(!db.archives){

db.archives = [];

}

return db.archives;

}


// ==================================
// AFFICHAGE DES COMMANDES
// ==================================

function afficherCommandes(){

afficherListeCommandes(
obtenirCommandes()
);

}



function afficherListeCommandes(commandes){

const zone =
document.getElementById("listeCommandes");


if(!zone){

return;

}


if(commandes.length === 0){

zone.innerHTML =
"<p>Aucune commande enregistrée.</p>";

return;

}


let html = "";


commandes.forEach(function(cmd,index){


html += `

<div class="commande-admin">


<h3>
📦 Commande ${cmd.id}
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
<strong>Téléphone :</strong><br>
${cmd.telephone || "-"}
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
${(cmd.produits || "")
.replace(/\n/g,"<br>")}
</p>


<p>
<strong>Total :</strong>
${cmd.total || 0} CHF
</p>



<p>

<strong>Statut :</strong>


<select onchange="changerStatut(${index},this.value)">


<option value="Nouvelle"
${(cmd.statut || "Nouvelle")==="Nouvelle"?"selected":""}>
Nouvelle
</option>


<option value="En préparation"
${cmd.statut==="En préparation"?"selected":""}>
En préparation
</option>


<option value="Prête"
${cmd.statut==="Prête"?"selected":""}>
Prête
</option>


<option value="Livrée"
${cmd.statut==="Livrée"?"selected":""}>
Livrée
</option>


</select>

</p>



<button
class="btn"
onclick="imprimerCommande(${index})">

🖨 Imprimer PDF

</button>



<button
class="btn"
onclick="renvoyerEmail(${index})">

📧 Renvoyer email

</button>



${cmd.statut==="Livrée" ? `

<button
class="btn"
onclick="archiverCommande(${index})">

📁 Archiver

</button>

` : ""}



<button
class="btn"
onclick="supprimerCommande(${index})">

🗑 Supprimer

</button>


<hr>


</div>

`;

});


zone.innerHTML = html;


}



// ==================================
// CHANGER STATUT
// ==================================

function changerStatut(index,valeur){

let commandes =
obtenirCommandes();


if(commandes[index]){


commandes[index].statut = valeur;


sauvegarderDB();


afficherCommandes();

afficherStatistiques();
afficherAlertes();
afficherDernieresCommandes();
}

}



// ==================================
// ARCHIVER COMMANDE
// ==================================

function archiverCommande(index){

let commandes =
obtenirCommandes();


let archives =
obtenirArchives();


let cmd =
commandes[index];


if(!cmd){

return;

}


if(!confirm(
"Archiver cette commande ?"
)){

return;

}


archives.push(cmd);


commandes.splice(index,1);


sauvegarderDB();


afficherCommandes();

afficherStatistiques();


}



// ==================================
// SUPPRIMER COMMANDE
// ==================================

function supprimerCommande(index){


if(!confirm(
"Supprimer cette commande ?"
)){

return;

}


let commandes =
obtenirCommandes();


commandes.splice(index,1);


sauvegarderDB();


afficherCommandes();

afficherStatistiques();


}



// ==================================
// IMPRIMER PDF
// ==================================

function imprimerCommande(index){

let commandes =
obtenirCommandes();


let cmd =
commandes[index];


if(!cmd){

return;

}


genererPDFCommande({

nom: cmd.client,

email: cmd.email,

adresse: cmd.adresse,

recap: cmd.produits || "",

total: cmd.total

});


}



// ==================================
// EMAIL CLIENT
// ==================================

function renvoyerEmail(index){


let commandes =
obtenirCommandes();


let cmd =
commandes[index];


if(!cmd){

return;

}


if(!cmd.email){

alert(
"Cette commande n'a pas d'adresse email."
);

return;

}



let sujet =
"Votre commande Idée Gourmande";


let message =

"Bonjour " +
cmd.client +
",\n\n" +

"Nous vous confirmons le rappel de votre commande :\n\n" +

(cmd.produits || "") +

"\n\nTotal : " +

cmd.total +

" CHF\n\n" +

"Merci pour votre confiance.\n\n" +

"L'équipe Idée Gourmande";



window.location.href =

"mailto:" +

cmd.email +

"?subject=" +

encodeURIComponent(sujet) +

"&body=" +

encodeURIComponent(message);


}



// ==================================
// STATISTIQUES
// ==================================

function afficherStatistiques(){


let commandes =
obtenirCommandes();


let nb =
document.getElementById("nbCommandes");


let ca =
document.getElementById("caTotal");


let jour =
document.getElementById("commandeJour");



if(nb){

nb.innerHTML =
commandes.length;

}


let total = 0;


commandes.forEach(function(cmd){

total += Number(cmd.total) || 0;

});


if(ca){

ca.innerHTML =
total.toFixed(2) + " CHF";

}



let aujourd_hui =
new Date()
.toLocaleDateString("fr-FR");


let compteur = 0;


commandes.forEach(function(cmd){


if(
cmd.date &&
cmd.date.includes(aujourd_hui)
){

compteur++;

}

});


if(jour){

jour.innerHTML =
compteur;

}

// STOCK ET ACHATS

if(typeof db !== "undefined"){


let stockCritique = 0;


db.articles.forEach(function(article){


if(article.stock > 0 && article.stock <= article.minimum){

    stockCritique++;

}


});


let zoneStock =
document.getElementById("stockCritique");


if(zoneStock){

zoneStock.innerHTML = stockCritique;

}



let achatsAttente = 0;


db.achats.forEach(function(achat){


if(achat.statut !== "Réceptionné"){

achatsAttente++;

}


});


let zoneAchats =
document.getElementById("nbAchats");


if(zoneAchats){

zoneAchats.innerHTML = achatsAttente;

}


}
}



// ==================================
// RECHERCHE
// ==================================

function rechercherCommande(){


let champ =
document.getElementById(
"rechercheCommande"
);


if(!champ){

return;

}


let recherche =
champ.value.toLowerCase();


let commandes =
obtenirCommandes();



let filtre =
commandes.filter(function(cmd){


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


afficherListeCommandes(filtre);


}



// ==================================
// DECONNEXION
// ==================================

function deconnexion(){


localStorage.removeItem(
"adminConnecte"
);


window.location.href =
"admin-login.html";


}

// ==================================
// ALERTES TABLEAU DE BORD
// Version 2.3.3
// ==================================

function afficherAlertes(){

let zone =
document.getElementById("listeAlertes");


if(!zone){

return;

}


let html = "";



// STOCK

if(typeof db !== "undefined" && db.articles){


let rupture = 0;

let critique = 0;


db.articles.forEach(function(article){


let stock =
Number(article.stock) || 0;


let minimum =
Number(article.minimum) || 0;



if(stock <= 0){

rupture++;

}

else if(stock <= minimum){

critique++;

}


});



if(rupture > 0){

html +=

"<p>🔴 " +
rupture +
" article(s) en rupture de stock</p>";

}



if(critique > 0){

html +=

"<p>🟠 " +
critique +
" article(s) sous le minimum</p>";

}


}



// ACHATS

if(typeof db !== "undefined" && db.achats){


let attente = 0;


db.achats.forEach(function(achat){


if(achat.statut !== "Réceptionné"){

attente++;

}


});



if(attente > 0){

html +=

"<p>🛒 " +
attente +
" achat(s) en attente</p>";

}


}



// COMMANDES

if(typeof db !== "undefined" && db.commandes){


let enCours = 0;


db.commandes.forEach(function(cmd){


if(
cmd.statut !== "Livrée"
&&
cmd.statut !== "Archivée"
){

enCours++;

}


});



if(enCours > 0){

html +=

"<p>📦 " +
enCours +
" commande(s) en cours</p>";

}


}



// AUCUNE ALERTE

if(html === ""){


html =
"<p>✅ Aucune alerte.</p>";


}



zone.innerHTML = html;


}
// ==================================
// DERNIERES COMMANDES
// ==================================

function afficherDernieresCommandes(){

let zone =
document.getElementById("dernieresCommandes");


if(!zone){

return;

}


let commandes =
obtenirCommandes();


if(commandes.length === 0){

zone.innerHTML =
"<p>Aucune commande récente.</p>";

return;

}


// prendre les 5 dernières

let dernieres =
commandes.slice(-5).reverse();



let html = "";


dernieres.forEach(function(cmd){


html += `

<div class="commande-admin">

<strong>
📦 Commande ${cmd.id}
</strong>

<br>

Client :
${cmd.client || "-"}

<br>

Total :
${cmd.total || 0} CHF

<br>

Statut :
${cmd.statut || "Nouvelle"}

</div>

<hr>

`;


});


zone.innerHTML = html;


}
// ==================================
// RESUME STOCK TABLEAU DE BORD
// ==================================

function afficherResumeStock(){


if(typeof db === "undefined"){

return;

}



let articles =
db.articles || [];



let totalArticles =
articles.length;



let valeurStock = 0;


let stockCritique = 0;



articles.forEach(function(article){


let stock =
Number(article.stock) || 0;


let prix =
Number(article.prixAchatMoyen) || 0;



valeurStock += stock * prix;



if(
stock > 0 &&
stock <= Number(article.minimum)
){

stockCritique++;

}


});



let zoneArticles =
document.getElementById(
"totalArticlesStock"
);


if(zoneArticles){

zoneArticles.textContent =
totalArticles;

}



let zoneValeur =
document.getElementById(
"valeurStock"
);


if(zoneValeur){

zoneValeur.textContent =
valeurStock.toFixed(2)
+ " CHF";

}



let zoneCritique =
document.getElementById(
"stockCritiqueStock"
);


if(zoneCritique){

zoneCritique.textContent =
stockCritique;

}


}
// ==================================
// RESUME ACHATS TABLEAU DE BORD
// ==================================

function afficherResumeAchats(){


if(typeof db === "undefined"){

return;

}



let achats =
db.achats || [];



let attente = 0;

let receptionnes = 0;

let montantAttente = 0;



achats.forEach(function(achat){


if(
achat.statut === "Réceptionné"
){

receptionnes++;

}
else{

attente++;

montantAttente +=
Number(achat.total) || 0;

}


});



let fournisseurs =
(db.clients || []).filter(function(client){

return client.type === "Fournisseur";

});




let zoneAttente =
document.getElementById(
"achatsEnAttente"
);


if(zoneAttente){

zoneAttente.textContent =
attente;

}




let zoneReception =
document.getElementById(
"achatsReceptionnes"
);


if(zoneReception){

zoneReception.textContent =
receptionnes;

}




let zoneFournisseurs =
document.getElementById(
"nombreFournisseurs"
);


if(zoneFournisseurs){

zoneFournisseurs.textContent =
fournisseurs.length;

}




let zoneMontant =
document.getElementById(
"montantAchatsAttente"
);


if(zoneMontant){

zoneMontant.textContent =
montantAttente.toFixed(2)
+
" CHF";

}


}
// ==================================
// INITIALISATION
// ==================================

document.addEventListener(
"DOMContentLoaded",
function(){


afficherCommandes();
afficherResumeStock();
afficherStatistiques();

afficherAlertes();

afficherDernieresCommandes();


}
);
