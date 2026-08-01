// ==================================
// IDÉE GOURMANDE
// Module statistiques
// Version 2.3.0
// ==================================


function afficherStatistiques(){


if(typeof db === "undefined"){

console.error(
"Base de données non chargée"
);

return;

}



let commandes = db.commandes || [];



let nbCommandes =
document.getElementById("nbCommandes");


if(nbCommandes){

nbCommandes.textContent =
commandes.length;

}



let chiffreAffaires = 0;


commandes.forEach(function(cmd){

chiffreAffaires +=
Number(cmd.total) || 0;

});



let ca =
document.getElementById("caTotal");


if(ca){

ca.textContent =
chiffreAffaires.toFixed(2)
+ " CHF";

}




let aujourdHui =
new Date()
.toLocaleDateString("fr-FR");



let commandesJour = 0;


commandes.forEach(function(cmd){


if(
cmd.date &&
cmd.date.includes(aujourdHui)
){

commandesJour++;

}


});



let jour =
document.getElementById("commandeJour");


if(jour){

jour.textContent =
commandesJour;

}




let stockCritique = 0;


(db.articles || []).forEach(function(article){


if(
Number(article.stock) <= Number(article.minimum)
){

stockCritique++;

}


});



let zoneStock =
document.getElementById("stockCritique");


if(zoneStock){

zoneStock.textContent =
stockCritique;

}





let achats = 0;


(db.achats || []).forEach(function(achat){


if(
achat.statut !== "Réceptionné"
){

achats++;

}


});



let zoneAchats =
document.getElementById("nbAchats");


if(zoneAchats){

zoneAchats.textContent =
achats;

}


}




document.addEventListener(
"DOMContentLoaded",
function(){

afficherStatistiques();

});
