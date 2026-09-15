// ==================================
// Connexion administration
// ==================================


function connexionAdmin(){


const motdepasse =
document.getElementById("motdepasse").value;



// À modifier par votre propre mot de passe

const motdepasseAdmin =
"Idee2026";



if(motdepasse === motdepasseAdmin){


localStorage.setItem(
"adminConnecte",
"oui"
);



window.location.href =
"admin.html";


}

else{


document.getElementById("message").innerHTML =
"❌ Mot de passe incorrect";


}


}
