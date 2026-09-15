console.log("COMMANDE.JS CHARGE");


// ======================================
// IDEE GOURMANDE
// commande.js
// Gestion complète du panier
// Version 2.1.0
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


        if(boutonVider){

            boutonVider.addEventListener(
                "click",
                viderPanier
            );

        }


        const formulaire =
            document.getElementById(
                "formCommande"
            );


        if(formulaire){

            formulaire.addEventListener(
                "submit",
                envoyerCommande
            );

        }


        if(
            typeof initialiserNomTwint ===
            "function"
        ){

            initialiserNomTwint();

        }

    }
);


// ======================================
// BOUTONS AJOUT PANIER
// ======================================

function initialiserBoutonsPanier(){

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
){

    const produit =
        produits[reference];


    if(!produit){

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


    switch(reference){

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


            if(
                article.poids < 100
            ){

                alert(
                    "Veuillez choisir un poids pour le saumon."
                );

                return;

            }

            break;

    }


    if(
        reference !==
        "saumon-fume"
        &&
        article.quantite <= 0
    ){

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
){

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


    if(existant){

        if(
            article.reference ===
            "saumon-fume"
        ){

            // Pour le saumon, chaque ajout
            // correspond au poids sélectionné.

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
        else{

            existant.quantite +=
                article.quantite;

        }


        existant.prix =
            calculerPrixArticle(
                existant
            );

    }
    else{

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
){

    const produit =
        produits[
            article.reference
        ];


    if(!produit){

        return 0;

    }


    // Saumon : prix pour 100 g

    if(
        article.reference ===
        "saumon-fume"
    ){

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


    // Autres produits :
    // prix par unité

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
){

    if(!carte){

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
){

    const champ =
        document.getElementById(
            id
        );


    if(!champ){

        return 0;

    }


    return Number(
        champ.value
    ) || 0;

}


// ======================================
// LECTURE POIDS SAUMON
// ======================================

function lirePoidsSaumon(){

    const champ =
        document.getElementById(
            "saumonPoids"
        );


    if(!champ){

        return 0;

    }


    return Number(
        champ.value
    ) || 0;

}


// ======================================
// AFFICHAGE PANIER
// ======================================

function afficherPanier(){

    const zone =
        document.getElementById(
            "recapCommande"
        );


    const totalZone =
        document.getElementById(
            "total"
        );


    if(
        !zone
        ||
        !totalZone
    ){

        return;

    }


    if(
        panierCommande.length === 0
    ){

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
        (article,index) => {


            if(
                article.reference ===
                "saumon-fume"
            ){

                compteur++;

            }
            else{

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
){

    let texte = "";


    if(article.recette){

        texte +=
            "Recette : "
            +
            article.recette
            +
            "<br>";

    }


    if(
        article.reference ===
        "saumon-fume"
        &&
        article.poids
    ){

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
){

    const titre =
        document.getElementById(
            "titrePanier"
        );


    if(!titre){

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
){

    const article =
        panierCommande[index];


    if(!article){

        return;

    }


    if(
        article.reference ===
        "saumon-fume"
    ){

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


        if(
            article.poids < 100
        ){

            supprimerArticle(
                index
            );

            return;

        }

    }
    else{

        article.quantite +=
            variation;


        if(
            article.quantite <= 0
        ){

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
){

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

function viderPanier(){

    panierCommande.length = 0;


    window.panierCommande =
        panierCommande;


    afficherPanier();

}


// ======================================
// ENVOI COMMANDE
// ======================================

function envoyerCommande(
    e
){

    e.preventDefault();


    if(
        panierCommande.length === 0
    ){

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

    if(
        typeof ajouterCommande !==
        "function"
    ){

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
            Date.now(),

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


        // Texte pour l'affichage
        // des anciennes interfaces.

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


        // Structure complète utilisée
        // par database.js.

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


    if(!resultat){

        alert(
            "La commande n'a pas pu être enregistrée."
        );

        return;

    }


    // ==================================
    // PDF + ENVOI AUTOMATIQUE
    // ==================================

    let resultatPDF = null;

    if (typeof genererPDFCommande === "function") {
        resultatPDF = genererPDFCommande(commande);
    }

    if (!resultatPDF || !resultatPDF.blob) {
        alert("La commande a été enregistrée et le PDF a été généré, mais le PDF n'est pas disponible pour l'envoi automatique.");
        return;
    }

    envoyerCommandeAutomatiquement(commande, resultatPDF);

    // ==================================
    // NETTOYAGE PANIER
    // ==================================

    panierCommande.length = 0;
    window.panierCommande = panierCommande;
    afficherPanier();

}

// ======================================
// ENVOI AUTOMATIQUE PAR GOOGLE APPS SCRIPT
// ======================================

// Après déploiement du fichier Google Apps Script fourni dans
// google-apps-script/Code.gs, coller ici l'URL de l'application Web.
const EMAIL_API_URL =
    "https://script.google.com/macros/s/AKfycbzKiedAF-Qjr6gisEk9f6VeeKRnEu_WqTXJyj2QqNVXqTNPhJUIEPkKcdRNheq6w6wY/exec";

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = String(reader.result || "");
            const comma = result.indexOf(",");
            resolve(comma >= 0 ? result.slice(comma + 1) : result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

async function envoyerCommandeAutomatiquement(commande, resultatPDF) {

    const destinataire = String(commande?.client?.email || "").trim();

    if (!destinataire) {
        alert("La commande a été enregistrée, mais aucune adresse e-mail client n'est indiquée.");
        return;
    }

    if (!EMAIL_API_URL || EMAIL_API_URL === "https://script.google.com/macros/s/AKfycbzKiedAF-Qjr6gisEk9f6VeeKRnEu_WqTXJyj2QqNVXqTNPhJUIEPkKcdRNheq6w6wY/exec") {
        alert("La commande et le PDF sont prêts. Il faut encore configurer l'URL Google Apps Script dans js/commande.js pour activer l'envoi automatique.");
        return;
    }

    try {
        const pdfBase64 = await blobToBase64(resultatPDF.blob);
        const numeroCommande = Date.now();

        const payload = {
            to: destinataire,
            subject: `Commande Idée Gourmande n°${numeroCommande}`,
            client: commande.client,
            produits: commande.produits,
            total: commande.total,
            numeroCommande,
            pdfBase64,
            pdfFilename: resultatPDF.filename
        };

        // Formulaire POST vers une iframe : pas de problème CORS et aucun
        // clic Gmail n'est nécessaire.
        const iframe = document.createElement("iframe");
        iframe.name = "emailSubmitFrame" + Date.now();
        iframe.style.display = "none";
        document.body.appendChild(iframe);

        const form = document.createElement("form");
        form.method = "POST";
        form.action = EMAIL_API_URL;
        form.target = iframe.name;
        form.style.display = "none";

        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "payload";
        input.value = JSON.stringify(payload);
        form.appendChild(input);
        document.body.appendChild(form);

        form.submit();

        setTimeout(() => {
            form.remove();
            iframe.remove();
        }, 10000);

        alert("Commande enregistrée et e-mail envoyé automatiquement avec le PDF en pièce jointe.");

    } catch (erreur) {
        console.error("Erreur envoi automatique :", erreur);
        alert("La commande a été enregistrée et le PDF généré, mais l'envoi automatique a échoué. Vérifiez la configuration Google Apps Script.");
    }

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
    "COMMANDE.JS 2.1.0 CHARGE"
);
