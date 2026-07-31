// ======================================
// IDEE GOURMANDE - GESTION DU STOCK
// Version 2.0.0
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

function sauvegarderStock() {
    localStorage.setItem("articlesStock", JSON.stringify(articles));
}

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

        </tr>`;
    });

    document.getElementById("nbArticles").textContent = articles.length;
    document.getElementById("nbCritique").textContent = critique;

    sauvegarderStock();
}

function ajouterArticle() {

    const nom = prompt("Nom de l'article");

    if (!nom) return;

    const categorie = prompt("Catégorie");

    const unite = prompt("Unité (kg, pièce, litre...)");

    const stock = parseFloat(prompt("Stock actuel", "0")) || 0;

    const minimum = parseFloat(prompt("Stock minimum", "0")) || 0;

    const emplacement = prompt(
        "Emplacement :\n\n" +
        emplacements.join("\n"),
        emplacements[0]
    );

    articles.push({

        nom,
        categorie,
        unite,
        stock,
        minimum,
        emplacement

    });

    afficherStock();

}

function modifierArticle(index){

    ajouterStock(index);

}

function ajouterStock(index){

    let valeur = parseFloat(prompt(
        "Nouveau stock",
        articles[index].stock
    ));

    if(isNaN(valeur)) return;

    articles[index].stock = valeur;

    afficherStock();

}

function supprimerArticle(index){

    if(confirm("Supprimer cet article ?")){

        articles.splice(index,1);

        afficherStock();

    }

}

function rechercherArticle(){

    const filtre = document
        .getElementById("rechercheArticle")
        .value
        .toLowerCase();

    const lignes = document.querySelectorAll("#tbodyStock tr");

    lignes.forEach(ligne=>{

        ligne.style.display =
            ligne.innerText.toLowerCase().includes(filtre)
            ? ""
            : "none";

    });

}

function imprimerStock(){

    window.print();

}

document
.getElementById("btnNouvelArticle")
.addEventListener("click", ajouterArticle);

afficherStock();
