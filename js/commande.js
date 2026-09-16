console.log("COMMANDE.JS CHARGE");


// ======================================
// IDEE GOURMANDE
// commande.js
// Gestion complète du panier
// Version 3.0.0
// ======================================


// ======================================
// PANIER GLOBAL
// ======================================

let panierCommande = [];

window.panierCommande =
    panierCommande;


// ======================================
// BASE PRODUITS
// ======================================

const produits = {

    "foie-gras": {

        nom:
            "Foie gras de canard au torchon",

        prix:
            35

    },


    "magret": {

        nom:
            "Magret de canard fumé et séché",

        prix:
            25

    },


    "viande-sechee": {

        nom:
            "Viande séchée artisanale",

        prix:
            45

    },


    "lard-sec": {

        nom:
            "Lard sec légèrement fumé",

        prix:
            20

    },


    "saumon-fume": {

        nom:
            "Cœur de saumon fumé",

        prix:
            8

    }

};


// ======================================
// INITIALISATION PAGE
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initialiserBoutonsPanier();

        afficherPanier();


        const boutonVider =
            document.getElementById(
                "btnViderPanier"
            );


        if (boutonVider) {

            boutonVider.addEventListener(
                "click",
                viderPanier
            );

        }


        const formulaire =
            document.getElementById(
                "formCommande"
            );


        if (formulaire) {

            formulaire.addEventListener(
                "submit",
                envoyerCommande
            );

        }


        if (
            typeof initialiserNomTwint ===
            "function"
        ) {

            initialiserNomTwint();

        }

    }
);


// ======================================
// BOUTONS AJOUT PANIER
// ======================================

function initialiserBoutonsPanier() {

    const boutons =
        document.querySelectorAll(
            ".ajouter-panier"
        );


    console.log(
        "BOUTONS AJOUT PANIER :",
        boutons.length
    );


    boutons.forEach(
        bouton => {

            bouton.addEventListener(
                "click",
                () => {

                    ajouterAuPanier(
                        bouton.dataset.produit
                    );

                }
            );

        }
    );

}


// ======================================
// AJOUT ARTICLE
// ======================================

function ajouterAuPanier(
    reference
) {

    const produit =
        produits[reference];


    if (!produit) {

        console.error(
            "Produit inconnu",
            reference
        );

        return;

    }


    const carte =
        document.querySelector(
            `.commande-card[data-produit="${reference}"]`
        );


    const article = {

        reference,

        nom:
            produit.nom,

        recette:
            getRecette(carte),

        quantite:
            1,

        poids:
            null,

        prix:
            0

    };


    switch (reference) {

        case "foie-gras":

            article.quantite =
                lireQuantite(
                    "foieQuantite"
                );

            break;


        case "magret":

            article.quantite =
                lireQuantite(
                    "magretQuantite"
                );

            break;


        case "viande-sechee":

            article.quantite =
                lireQuantite(
                    "viandeQuantite"
                );

            break;


        case "lard-sec":

            article.quantite =
                lireQuantite(
                    "lardQuantite"
                );

            break;


        case "saumon-fume":

            article.poids =
                lirePoidsSaumon();


            if (
                article.poids < 100
            ) {

                alert(
                    "Veuillez choisir un poids pour le saumon."
                );

                return;

            }

            break;

    }


    if (
        reference !==
        "saumon-fume"
        &&
        article.quantite <= 0
    ) {

        alert(
            "Quantité invalide"
        );

        return;

    }


    article.prix =
        calculerPrixArticle(
            article
        );


    ajouterOuFusionner(
        article
    );


    window.panierCommande =
        panierCommande;


    afficherPanier();

}


// ======================================
// FUSION ARTICLES IDENTIQUES
// ======================================

function ajouterOuFusionner(
    article
) {

    const existant =
        panierCommande.find(
            a =>

                a.reference ===
                article.reference

                &&

                (
                    a.recette || ""
                )
                ===
                (
                    article.recette || ""
                )

                &&

                Number(
                    a.poids || 0
                )
                ===
                Number(
                    article.poids || 0
                )
        );


    if (existant) {

        if (
            article.reference ===
            "saumon-fume"
        ) {

            existant.poids =
                (
                    Number(
                        existant.poids
                    ) || 0
                )
                +
                (
                    Number(
                        article.poids
                    ) || 0
                );

        }
        else {

            existant.quantite +=
                article.quantite;

        }


        existant.prix =
            calculerPrixArticle(
                existant
            );

    }
    else {

        panierCommande.push(
            article
        );

    }

}


// ======================================
// CALCUL PRIX ARTICLE
// ======================================

function calculerPrixArticle(
    article
) {

    const produit =
        produits[
            article.reference
        ];


    if (!produit) {

        return 0;

    }


    if (
        article.reference ===
        "saumon-fume"
    ) {

        return Number(

            (
                produit.prix
                *
                Number(
                    article.poids
                )
                /
                100
            )
            .toFixed(2)

        );

    }


    return Number(

        (
            produit.prix
            *
            Number(
                article.quantite
            )
        )
        .toFixed(2)

    );

}


// ======================================
// RECETTE
// ======================================

function getRecette(
    carte
) {

    if (!carte) {

        return "";

    }


    const choix =
        carte.querySelector(
            ".choix-recette input:checked"
        );


    return choix
        ?
        choix.value
        :
        "";

}


// ======================================
// LECTURE QUANTITE
// ======================================

function lireQuantite(
    id
) {

    const champ =
        document.getElementById(
            id
        );


    if (!champ) {

        return 0;

    }


    return Number(
        champ.value
    ) || 0;

}


// ======================================
// LECTURE POIDS SAUMON
// ======================================

function lirePoidsSaumon() {

    const champ =
        document.getElementById(
            "saumonPoids"
        );


    if (!champ) {

        return 0;

    }


    return Number(
        champ.value
    ) || 0;

}


// ======================================
// AFFICHAGE PANIER
// ======================================

function afficherPanier() {

    const zone =
        document.getElementById(
            "recapCommande"
        );


    const totalZone =
        document.getElementById(
            "total"
        );


    if (
        !zone
        ||
        !totalZone
    ) {

        return;

    }


    if (
        panierCommande.length === 0
    ) {

        zone.innerHTML =
            "<p>Aucun produit sélectionné.</p>";


        totalZone.textContent =
            "0.00 CHF";


        mettreAJourTitrePanier(
            0
        );


        return;

    }


    let html = "";

    let total = 0;

    let compteur = 0;


    panierCommande.forEach(
        (article, index) => {


            if (
                article.reference ===
                "saumon-fume"
            ) {

                compteur++;

            }
            else {

                compteur +=
                    Number(
                        article.quantite
                    ) || 0;

            }


            total +=
                Number(
                    article.prix
                ) || 0;


            html += `

            <div class="ligne-produit">

                <div class="infos-produit">

                    <strong>
                        ${article.nom}
                    </strong>

                    <br>

                    ${afficherDetailsArticle(article)}

                    <div class="gestion-quantite">

                        <button
                            type="button"
                            class="btn-quantite moins"
                            onclick="modifierQuantite(${index},-1)"
                        >
                            −
                        </button>

                        <span>
                            ${
                                article.reference ===
                                "saumon-fume"

                                ?

                                article.poids + " g"

                                :

                                article.quantite
                            }
                        </span>

                        <button
                            type="button"
                            class="btn-quantite plus"
                            onclick="modifierQuantite(${index},1)"
                        >
                            +
                        </button>

                    </div>

                </div>

                <div class="prix-produit">

                    <strong>
                        ${article.prix.toFixed(2)}
                        CHF
                    </strong>

                    <br><br>

                    <button
                        type="button"
                        class="btn-supprimer"
                        onclick="supprimerArticle(${index})"
                    >
                        Supprimer
                    </button>

                </div>

            </div>

            `;

        }
    );


    zone.innerHTML =
        html;


    totalZone.textContent =
        total.toFixed(2)
        +
        " CHF";


    mettreAJourTitrePanier(
        compteur
    );

}


// ======================================
// DETAILS ARTICLE
// ======================================

function afficherDetailsArticle(
    article
) {

    let texte = "";


    if (article.recette) {

        texte +=
            "Recette : "
            +
            article.recette
            +
            "<br>";

    }


    if (
        article.reference ===
        "saumon-fume"
        &&
        article.poids
    ) {

        texte +=
            article.poids
            +
            " g";

    }


    return texte;

}


// ======================================
// TITRE PANIER
// ======================================

function mettreAJourTitrePanier(
    nombre
) {

    const titre =
        document.getElementById(
            "titrePanier"
        );


    if (!titre) {

        return;

    }


    titre.textContent =
        "🛒 Votre panier ("
        +
        nombre
        +
        " article"
        +
        (
            nombre > 1
            ?
            "s"
            :
            ""
        )
        +
        ")";

}


// ======================================
// MODIFIER QUANTITE
// ======================================

function modifierQuantite(
    index,
    variation
) {

    const article =
        panierCommande[index];


    if (!article) {

        return;

    }


    if (
        article.reference ===
        "saumon-fume"
    ) {

        article.poids =
            (
                Number(
                    article.poids
                ) || 0
            )
            +
            (
                variation *
                100
            );


        if (
            article.poids < 100
        ) {

            supprimerArticle(
                index
            );

            return;

        }

    }
    else {

        article.quantite +=
            variation;


        if (
            article.quantite <= 0
        ) {

            supprimerArticle(
                index
            );

            return;

        }

    }


    article.prix =
        calculerPrixArticle(
            article
        );


    window.panierCommande =
        panierCommande;


    afficherPanier();

}


// ======================================
// SUPPRESSION ARTICLE
// ======================================

function supprimerArticle(
    index
) {

    panierCommande.splice(
        index,
        1
    );


    window.panierCommande =
        panierCommande;


    afficherPanier();

}


// ======================================
// VIDER PANIER
// ======================================

function viderPanier() {

    panierCommande.length = 0;


    window.panierCommande =
        panierCommande;


    afficherPanier();

}


// ======================================
// ENVOI COMMANDE
// ======================================

async function envoyerCommande(
    e
) {

    e.preventDefault();


    if (
        panierCommande.length === 0
    ) {

        alert(
            "Votre panier est vide."
        );

        return;

    }


    const getValue =
        id =>
            document.getElementById(id)
            ?.value
            ?.trim()
            ||
            "";


    const commande = {

        // Numéro unique créé AVANT
        // la génération du PDF.
        id:
            Date.now(),


        client: {

            prenom:
                getValue("prenom"),

            nom:
                getValue("nom"),

            telephone:
                getValue("telephone"),

            email:
                getValue("email"),

            adresse:
                getValue("adresse"),

            commentaire:
                getValue("commentaire")

        },


        produits:
            panierCommande.map(
                article => ({
                    ...article
                })
            ),


        total:
            panierCommande.reduce(
                (
                    somme,
                    article
                ) =>

                    somme
                    +
                    (
                        Number(
                            article.prix
                        ) || 0
                    ),

                0
            )

    };


    console.log(
        "COMMANDE PREPAREE :",
        commande
    );


    // ==================================
    // ENREGISTREMENT BASE
    // ==================================

    if (
        typeof ajouterCommande !==
        "function"
    ) {

        console.error(
            "ajouterCommande() est introuvable. database.js doit être chargé avant commande.js."
        );


        alert(
            "Impossible d'enregistrer la commande. La base de données n'est pas disponible."
        );


        return;

    }


    const commandeEnregistree = {

        id:
            commande.id,

        date:
            new Date()
            .toLocaleDateString(
                "fr-FR"
            ),

        client:
            commande.client.prenom
            +
            " "
            +
            commande.client.nom,

        telephone:
            commande.client.telephone,

        email:
            commande.client.email,

        adresse:
            commande.client.adresse,

        commentaire:
            commande.client.commentaire,


        produits:
            commande.produits
            .map(
                article =>

                    article.nom

                    +

                    (
                        article.reference ===
                        "saumon-fume"

                        ?

                        " (" +
                        article.poids +
                        " g)"

                        :

                        (
                            article.quantite > 1

                            ?

                            " x" +
                            article.quantite

                            :

                            ""
                        )
                    )
            )
            .join("\n"),


        produitsListe:
            commande.produits,


        total:
            commande.total,

        statut:
            "Nouvelle",

        stockTraite:
            false,

        stockErreur:
            false

    };


    const resultat =
        ajouterCommande(
            commandeEnregistree
        );


    if (!resultat) {

        alert(
            "La commande n'a pas pu être enregistrée."
        );

        return;

    }


    // ==================================
    // PDF + ENVOI AUTOMATIQUE
    // ==================================

    if (
        typeof genererPDFCommande !==
        "function"
    ) {

        console.error(
            "genererPDFCommande() est introuvable."
        );


        alert(
            "La commande a été enregistrée, mais le générateur PDF est introuvable."
        );

        return;

    }


    try {

        console.log(
            "Génération et envoi automatique du PDF..."
        );


        await genererPDFCommande(
            commande
        );


        console.log(
            "PDF traité et envoi terminé."
        );


    }
    catch (error) {

        console.error(
            "Erreur pendant la génération/envoi du PDF :",
            error
        );


        alert(
            "La commande a été enregistrée, mais une erreur est survenue lors de la génération ou de l'envoi du PDF.\n\n" +
            error.message
        );


        return;

    }


    // ==================================
    // NETTOYAGE PANIER
    // ==================================

    panierCommande.length =
        0;


    window.panierCommande =
        panierCommande;


    afficherPanier();


    // ==================================
    // CONFIRMATION
    // ==================================

    alert(
        "Votre commande a été envoyée avec succès.\n\n" +
        "Le PDF a été transmis automatiquement avec le mail.\n\n" +
        "Cette page reste ouverte."
    );

}


// ======================================
// EXPORT GLOBAL
// ======================================

window.ajouterAuPanier =
    ajouterAuPanier;

window.modifierQuantite =
    modifierQuantite;

window.supprimerArticle =
    supprimerArticle;

window.viderPanier =
    viderPanier;

window.envoyerCommande =
    envoyerCommande;


// ======================================
// FIN
// ======================================

console.log(
    "COMMANDE.JS 3.0.0 CHARGE"
);
