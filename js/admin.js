// ==================================
// IDÉE GOURMANDE
// Administration commandes
// Version complète
// ==================================



// ==================================
// AFFICHAGE DES COMMANDES
// ==================================

function afficherCommandes(){


const zone =
document.getElementById("listeCommandes");


let commandes =
JSON.parse(
localStorage.getItem("commandes")
) || [];



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
${cmd.date}
</p>


<p>
<strong>Client :</strong><br>
${cmd.client}
</p>


<p>
<strong>Téléphone :</strong><br>
${cmd.telephone || "-"}
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
${cmd.produits.replace(/\n/g,"<br>")}
</p>


<p>
<strong>Total :</strong>
${cmd.total} CHF
</p>



<p>

<strong>Statut :</strong>

<select 
onchange="changerStatut(${index},this.value)">


<option value="Nouvelle"
${cmd.statut==="Nouvelle" ? "selected":""}>
Nouvelle
</option>


<option value="En préparation"
${cmd.statut==="En préparation" ? "selected":""}>
En préparation
</option>


<option value="Prête"
${cmd.statut==="Prête" ? "selected":""}>
Prête
</option>


<option value="Livrée"
${cmd.statut==="Livrée" ? "selected":""}>
Livrée
</option>


</select>

</p>



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
JSON.parse(
localStorage.getItem("commandes")
) || [];



commandes[index].statut = valeur;



localStorage.setItem(
"commandes",
JSON.stringify(commandes)
);


}





// ==================================
// SUPPRIMER COMMANDE
// ==================================

function supprimerCommande(index){


if(!confirm(
"Voulez-vous supprimer cette commande ?"
)){

return;

}



let commandes =
JSON.parse(
localStorage.getItem("commandes")
) || [];



commandes.splice(index,1);



localStorage.setItem(
"commandes",
JSON.stringify(commandes)
);



afficherCommandes();

afficherStatistiques();


}





// ==================================
// STATISTIQUES
// ==================================

function afficherStatistiques(){


let commandes =
JSON.parse(
localStorage.getItem("commandes")
) || [];



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


if(cmd.date && cmd.date.includes(aujourd_hui)){

compteur++;

}


});



if(jour){

jour.innerHTML =
compteur;

}



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
// DEMARRAGE
// ==================================
// ==================================
// RECHERCHE COMMANDES
// ==================================

function rechercherCommande(){


let recherche =
document.getElementById("rechercheCommande")
.value
.toLowerCase();



let commandes =
JSON.parse(
localStorage.getItem("commandes")
) || [];



let filtre =
commandes.filter(function(cmd){


return (

cmd.client
.toLowerCase()
.includes(recherche)

||
cmd.email
.toLowerCase()
.includes(recherche)

);


});



afficherListeFiltree(filtre);


}




function afficherListeFiltree(commandes){


const zone =
document.getElementById("listeCommandes");



if(commandes.length===0){

zone.innerHTML =
"<p>Aucun résultat.</p>";

return;

}



let html="";



commandes.forEach(function(cmd){


html += `


<div class="commande-admin">


<h3>
📦 ${cmd.id}
</h3>


<p>
<strong>Client :</strong>
${cmd.client}
</p>


<p>
<strong>Total :</strong>
${cmd.total} CHF
</p>


<p>
<strong>Statut :</strong>
${cmd.statut}
</p>


</div>


`;


});


zone.innerHTML=html;


}
document.addEventListener(
"DOMContentLoaded",
function(){


afficherCommandes();

afficherStatistiques();


}
);
