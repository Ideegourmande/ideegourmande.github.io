// ======================================
// IDEE GOURMANDE - GESTION DU STOCK
// Version 2.0.1
// ======================================

let articles = JSON.parse(localStorage.getItem("articlesStock")) || [];

const emplacements = [
    "Congélateur du réduit",
    "Congélateur bahut",
    "Congélateur GI",
    "Chambre froide",
    "Cave",
    "Réserve sèche"
];

let indexEdition = -1;

//--------------------------------------

function sauvegarderStock() {

    localStorage.setItem("articlesStock", JSON.stringify(articles));

}

//--------------------------------------

function chargerEmplacements() {

    const liste = document.getElementById("artEmplacement");

    liste.innerHTML = "";

    emplacements.forEach(e => {

        liste.innerHTML += `<option>${e}</option>`;

    });

}

//--------------------------------------

function afficherStock() {

    const tbody = document.getElementById("tbodyStock");

    tbody.innerHTML = "";

    let critique = 0;

    articles.forEach((article, index) => {

        let etat = "🟢";

        if (article.stock <= article.minimum) {

            etat = "🔴";

            critique++;

        }

        tbody.innerHTML += `

        <tr>

            <td>${article.nom}</td>

            <td>${article.categorie}</td>

            <td>${article.stock} ${article.unite}</td>

            <td>${article.minimum} ${article.unite}</td>

            <td>${article.emplacement}</td>

            <td>${etat}</td>

            <td>

                <button onclick="modifierArticle(${index})">
                    ✏️
                </button>

                <button onclick="supprimerArticle(${index})">
                    🗑️
                </button>

            </td>

        </tr>

        `;

    });

    document.getElementById("nbArticles").textContent = articles.length;

    document.getElementById("nbCritique").textContent = critique;

    sauvegarderStock();

}

//--------------------------------------

function ajouterArticle() {

    indexEdition = -1;

    chargerEmplacements();

    document.getElementById("artNom").value = "";

    document.getElementById("artCategorie").selectedIndex = 0;

    document.getElementById("artUnite").selectedIndex = 0;

    document.getElementById("artStock").value = 0;

    document.getElementById("artMinimum").value = 0;

    document.getElementById("artEmplacement").selectedIndex = 0;

    document.getElementById("popupArticle").style.display = "block";

}

//--------------------------------------

function modifierArticle(index) {

    indexEdition = index;

    chargerEmplacements();

    const a = articles[index];

    document.getElementById("artNom").value = a.nom;

    document.getElementById("artCategorie").value = a.categorie;

    document.getElementById("artUnite").value = a.unite;

    document.getElementById("artStock").value = a.stock;

    document.getElementById("artMinimum").value = a.minimum;

    document.getElementById("artEmplacement").value = a.emplacement;

    document.getElementById("popupArticle").style.display = "block";

}

//--------------------------------------

function enregistrerArticle() {

    const article = {

        nom: document.getElementById("artNom").value.trim(),

        categorie: document.getElementById("artCategorie").value,

        unite: document.getElementById("artUnite").value,

        stock: parseFloat(document.getElementById("artStock").value) || 0,

        minimum: parseFloat(document.getElementById("artMinimum").value) || 0,

        emplacement: document.getElementById("artEmplacement").value

    };

    if (article.nom === "") {

        alert("Veuillez saisir le nom de l'article.");

        return;

    }

    if (indexEdition === -1) {

        articles.push(article);

    } else {

        articles[indexEdition] = article;

    }

    sauvegarderStock();

    afficherStock();

    fermerPopup();

}

//--------------------------------------

function fermerPopup() {

    document.getElementById("popupArticle").style.display = "none";

}

//--------------------------------------

function supprimerArticle(index) {

    if (confirm("Supprimer cet article ?")) {

        articles.splice(index, 1);

        afficherStock();

    }

}

//--------------------------------------

function rechercherArticle() {

    const filtre = document
        .getElementById("rechercheArticle")
        .value
        .toLowerCase();

    const lignes = document.querySelectorAll("#tbodyStock tr");

    lignes.forEach(ligne => {

        ligne.style.display =
            ligne.innerText.toLowerCase().includes(filtre)
                ? ""
                : "none";

    });

}

//--------------------------------------

function imprimerStock() {

    window.print();

}

//--------------------------------------

document
    .getElementById("btnNouvelArticle")
    .addEventListener("click", ajouterArticle);

//--------------------------------------

chargerEmplacements();

afficherStock();
