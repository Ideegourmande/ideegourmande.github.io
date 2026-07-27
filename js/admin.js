// ==================================
// IDÉE GOURMANDE
// Administration commandes
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
Commande ${cmd.id}
</h3>


<p>
<strong>Date :</strong>
${cmd.date}
</p>


<p>
<strong>Client :</strong>
${cmd.client}
</p>


<p>
<strong>Téléphone :</strong>
${cmd.telephone}
</p>


<p>
<strong>Email :</strong>
${cmd.email}
</p>


<p>
<strong>Adresse :</strong>
${cmd.adresse}
</p>


<p>
<strong>Produits :</strong><br>
${cmd.produits.replace(/\n/g,"<br>")}
</p>


<p>
<strong>Total :</strong>
${cmd.total} CHF
</p>


<p>
<strong>Statut :</strong>

<select onchange="changerStatut(${index},this.value)">

<option ${cmd.statut=="Nouvelle"?"selected":""}>
Nouvelle
</option>

<option ${cmd.statut=="En préparation"?"selected":""}>
En préparation
</option>

<option ${cmd.statut=="Prête"?"selected":""}>
Prête
</option>

<option ${cmd.statut=="Livrée"?"selected":""}>
Livrée
</option>

</select>

</p>


<button 
onclick="supprimerCommande(${index})">

Supprimer

</button>


<hr>

</div>

`;

});


zone.innerHTML = html;


}





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



function supprimerCommande(index){


if(!confirm("Supprimer cette commande ?")){

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


}





document.addEventListener(
"DOMContentLoaded",
afficherCommandes
);
function deconnexion(){

localStorage.removeItem(
"adminConnecte"
);

window.location.href =
"admin-login.html";

}
