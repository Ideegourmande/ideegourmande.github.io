// ==================================
// IDÉE GOURMANDE
// commande.js
// ==================================

let recapTexte = "";


// ==================================
// CALCUL PANIER
// ==================================

function calculerTotal(){


const produits = [

{
id:"foieFigues",
nom:"Foie gras figues",
prix:35
},

{
id:"foiePiment",
nom:"Foie gras Piment & Porto",
prix:35
},

{
id:"magretHerbes",
nom:"Magret Herbes de Provence",
prix:25
},

{
id:"magretPiment",
nom:"Magret Piment d'Espelette",
prix:25
}

];



let total = 0;

let html="";

recapTexte="";



produits.forEach(function(p){


let q =
Number(document.getElementById(p.id).value) || 0;


if(q>0){


let montant=q*p.prix;


total += montant;


html +=
"• "+p.nom+
" × "+q+
" — "+
montant.toFixed(2)+" CHF<br>";



recapTexte +=
p.nom+
" × "+
q+
" : "+
montant.toFixed(2)+" CHF\n";


}


});




// Saumon

let saumonA =
Number(document.getElementById("saumonAneth").value)||0;


if(saumonA>0){

let montant=(saumonA/100)*8;

total+=montant;


html +=
"• Saumon Aneth "+
saumonA+
" g — "+
montant.toFixed(2)+" CHF<br>";


recapTexte +=
"Saumon Aneth "+
saumonA+
" g : "+
montant.toFixed(2)+" CHF\n";

}




let saumonP =
Number(document.getElementById("saumonPiment").value)||0;



if(saumonP>0){

let montant=(saumonP/100)*8;

total+=montant;


html +=
"• Saumon Piment d'Espelette "+
saumonP+
" g — "+
montant.toFixed(2)+" CHF<br>";



recapTexte +=
"Saumon Piment d'Espelette "+
saumonP+
" g : "+
montant.toFixed(2)+" CHF\n";

}





if(html===""){

html="Aucun produit sélectionné.";

}



document.getElementById("recapCommande").innerHTML=html;


document.getElementById("total").innerHTML=
total.toFixed(2)+" CHF";



return total;


}



// ==================================
// VIDER PANIER
// ==================================

function viderPanier(){


document
.querySelectorAll(".commande-card input")
.forEach(function(input){

input.value=0;

});



calculerTotal();



}



// ==================================
// ENVOI COMMANDE
// ==================================

function envoyerCommande(event){
console.log("TEST DB", typeof db);

event.preventDefault();



let total=calculerTotal();



if(total<=0){

alert("Votre panier est vide.");

return;

}



let nom=
document.getElementById("nom").value;


let email=
document.getElementById("email").value;


let adresse=
document.getElementById("adresse").value;


let telephone=
document.getElementById("telephone").value;


let commentaire=
document.getElementById("commentaire").value;



let twint=
document.querySelector('input[type="checkbox"]');



if(!twint.checked){

alert("Merci de confirmer le paiement TWINT.");

return;

}



// PDF

if(typeof genererPDFCommande==="function"){


genererPDFCommande({

nom,
email,
adresse,
recap:recapTexte,
total:total.toFixed(2)

});


}



// sauvegarde administration


let commande={


id:"IG-"+Date.now(),

date:new Date().toLocaleString("fr-FR"),

client:nom,

telephone,

email,

adresse,

produits:recapTexte,

total:total.toFixed(2),

commentaire,

statut:"Nouvelle"


};



if(typeof db === "undefined"){

alert("DB absente - database.js non chargé");
return;

}


if(!Array.isArray(db.commandes)){

db.commandes = [];

}


db.commandes.push(commande);


sauvegarderDB();





let message=

`Nouvelle commande Idée Gourmande

Client :
${nom}

Téléphone :
${telephone}

Email :
${email}

Commande :

${recapTexte}

Total :
${total.toFixed(2)} CHF

Adresse :
${adresse}

Commentaire :
${commentaire}

Paiement TWINT confirmé`;



window.location.href=

"mailto:vkloetzli@bluewin.ch"+
"?subject="+
encodeURIComponent("Nouvelle commande Idée Gourmande")+
"&body="+
encodeURIComponent(message);



}



// ==================================
// INITIALISATION
// ==================================

document.addEventListener(
"DOMContentLoaded",
function(){


calculerTotal();



let bouton=
document.getElementById("btnViderPanier");


if(bouton){

bouton.addEventListener(
"click",
viderPanier
);

}


});
// ===============================
// Affichage du nom pour le paiement TWINT
// ===============================

const prenom = document.getElementById("prenom");
const nom = document.getElementById("nom");
const twintNomComplet = document.getElementById("twintNomComplet");

function majNomTwint() {
    if (!prenom || !nom || !twintNomComplet) return;

    twintNomComplet.textContent =
        (prenom.value + " " + nom.value).trim();
}

if (prenom && nom && twintNomComplet) {
    prenom.addEventListener("input", majNomTwint);
    nom.addEventListener("input", majNomTwint);
    majNomTwint();
}
