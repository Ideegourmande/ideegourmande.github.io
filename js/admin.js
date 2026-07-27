// ==================================
// IDÉE GOURMANDE
// Administration des commandes
// ==================================

// ================================
// AFFICHER LES COMMANDES
// ================================

function afficherCommandes() {

    const zone = document.getElementById("listeCommandes");

    let commandes =
        JSON.parse(localStorage.getItem("commandes")) || [];

    if (commandes.length === 0) {

        zone.innerHTML =
            "<p>Aucune commande enregistrée.</p>";

        return;
    }

    let html = "";

    commandes.forEach(function (cmd, index) {

        html += `

<div class="commande-admin">

<h3>📦 Commande ${cmd.id}</h3>

<p><strong>Date :</strong> ${cmd.date}</p>

<p><strong>Client :</strong> ${cmd.client}</p>

<p><strong>Téléphone :</strong> ${cmd.telephone}</p>

<p><strong>Email :</strong> ${cmd.email}</p>

<p><strong>Adresse :</strong><br>${cmd.adresse}</p>

<p>
<strong>Produits :</strong><br>
${cmd.produits.replace(/\n/g, "<br>")}
</p>

<p>
<strong>Total :</strong>
${cmd.total} CHF
</p>

<p>

<strong>Statut :</strong>

<select onchange="changerStatut(${index},this.value)">

<option value="Nouvelle" ${cmd.statut === "Nouvelle" ? "selected" : ""}>Nouvelle</option>

<option value="En préparation" ${cmd.statut === "En préparation" ? "selected" : ""}>En préparation</option>

<option value="Prête" ${cmd.statut === "Prête" ? "selected" : ""}>Prête</option>

<option value="Livrée" ${cmd.statut === "Livrée" ? "selected" : ""}>Livrée</option>

</select>

</p>

<button class="btn" onclick="supprimerCommande(${index})">
🗑 Supprimer la commande
</button>

<hr>

</div>

`;

    });

    zone.innerHTML = html;
}

// ================================
// CHANGER LE STATUT
// ================================

function changerStatut(index, valeur) {

    let commandes =
        JSON.parse(localStorage.getItem("commandes")) || [];

    commandes[index].statut = valeur;

    localStorage.setItem(
        "commandes",
        JSON.stringify(commandes)
    );

    afficherStatistiques();
}

// ================================
// SUPPRIMER UNE COMMANDE
// ================================

function supprimerCommande(index) {

    if (!confirm("Supprimer cette commande ?")) {

        return;

    }

    let commandes =
        JSON.parse(localStorage.getItem("commandes")) || [];

    commandes.splice(index, 1);

    localStorage.setItem(
        "commandes",
        JSON.stringify(commandes)
    );

    afficherCommandes();
    afficherStatistiques();
}

// ================================
// STATISTIQUES
// ================================

function afficherStatistiques() {

    let commandes =
        JSON.parse(localStorage.getItem("commandes")) || [];

    document.getElementById("nbCommandes").textContent =
        commandes.length;

    let total = 0;

    commandes.forEach(function (cmd) {

        total += Number(cmd.total);

    });

    document.getElementById("caTotal").textContent =
        total.toFixed(2) + " CHF";

    const aujourdhui =
        new Date().toLocaleDateString("fr-FR");

    let nbJour = 0;

    commandes.forEach(function (cmd) {

        if (cmd.date.startsWith(aujourdhui)) {

            nbJour++;

        }

    });

    document.getElementById("commandeJour").textContent =
        nbJour;
}

// ================================
// DÉCONNEXION
// ================================

function deconnexion() {

    localStorage.removeItem("adminConnecte");

    window.location.href = "admin-login.html";

}

// ================================
// INITIALISATION
// ================================

document.addEventListener("DOMContentLoaded", function () {

    afficherCommandes();

    afficherStatistiques();

});
