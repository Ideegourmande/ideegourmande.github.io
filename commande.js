
console.log("COMMANDE.JS CHARGE");

// ======================================
// IDEE GOURMANDE
// commande.js
// Gestion complète du panier
// Version 2.1.1
// ======================================

// ======================================
// CONFIGURATION API
// ======================================

const EMAIL_API_URL =
    "https://script.google.com/macros/s/AKfycby5o5V0dRb9fPpnhmUYCeWB1LxXjGRXfQK0kQ2Tzw2gHK58GQn8VmxlDI1DFWzogAhI/exec";

// ======================================
// PANIER GLOBAL
// ======================================

let panierCommande = [];

window.panierCommande = panierCommande;

// ======================================
// BASE PRODUITS
// ======================================

const produits = {
    "foie-gras": {
        nom: "Foie gras de canard au torchon",
        prix: 35
    },

    "magret": {
        nom: "Magret de canard fumé et séché",
        prix: 25
    },

    "viande-sechee": {
        nom: "Viande séchée artisanale",
        prix: 45
    },

    "lard-sec": {
        nom: "Lard sec légèrement fumé",
        prix: 20
    },

    "saumon-fume": {
        nom: "Cœur de saumon fumé",
        prix: 8
    }
};

// ======================================
// PROTECTION AFFICHAGE HTML
// ======================================

function echapperHTML(valeur) {
    return String(valeur ?? "").replace(
        /[&<>"']/g,
        function(caractere) {
            const correspondances = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return correspondances[caractere];
        }
    );
}

// ======================================
// INITIALISATION PAGE
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    initialiserBoutonsPanier();

    afficherPanier();

    const boutonVider =
        document.getElementById("btnViderPanier");

    if (boutonVider) {
        boutonVider.addEventListener(
            "click",
            viderPanier
        );
    }

    const formulaire =
        document.getElementById("formCommande");

    if (formulaire) {
        formulaire.addEventListener(
            "submit",
            envoyerCommande
        );
    }

    if (typeof initialiserNomTwint === "function") {
        initialiserNomTwint();
    }
});

// ======================================
// BOUTONS AJOUT PANIER
// ======================================

function initialiserBoutonsPanier() {

    const boutons =
        document.querySelectorAll(".ajouter-panier");

    console.log(
        "BOUTONS AJOUT PANIER :",
        boutons.length
    );

    boutons.forEach(bouton => {

        bouton.addEventListener("click", () => {

            ajouterAuPanier(
                bouton.dataset.produit
            );

        });

    });
}

// ======================================
// AJOUT ARTICLE
// ======================================

function ajouterAuPanier(reference) {

    const produit = produits[reference];

    if (!produit) {
        console.error("Produit inconnu", reference);
        return;
    }

    const carte = document.querySelector(
        `.commande-card[data-produit="${reference}"]`
    );

    const article = {
        reference: reference,
        nom: produit.nom,
        recette: getRecette(carte),
        quantite: 1,
        poids: null,
        prix: 0
    };

    switch (reference) {

        case "foie-gras":
            article.quantite = lireQuantite("foieQuantite");
            break;

        case "magret":
            article.quantite = lireQuantite("magretQuantite");
            break;

        case "viande-sechee":
            article.quantite = lireQuantite("viandeQuantite");
            break;

        case "lard-sec":
            article.quantite = lireQuantite("lardQuantite");
            break;

        case "saumon-fume":

            article.poids = lirePoidsSaumon();

            if (article.poids < 100) {
                alert(
                    "Veuillez choisir un poids pour le saumon."
                );
                return;
            }

            break;
    }

    if (
        reference !== "saumon-fume" &&
        article.quantite <= 0
    ) {
        alert("Quantité invalide");
        return;
    }

    article.prix = calculerPrixArticle(article);

    ajouterOuFusionner(article);

    window.panierCommande = panierCommande;

    afficherPanier();
}

// ======================================
// FUSION ARTICLES IDENTIQUES
// ======================================

function ajouterOuFusionner(article) {

    const existant = panierCommande.find(a =>

        a.reference === article.reference &&

        (a.recette || "") === (article.recette || "") &&

        Number(a.poids || 0) === Number(article.poids || 0)

    );

    if (existant) {

        if (article.reference === "saumon-fume") {

            existant.poids =
                (Number(existant.poids) || 0) +
                (Number(article.poids) || 0);

        } else {

            existant.quantite += article.quantite;

        }

        existant.prix = calculerPrixArticle(existant);

    } else {

        panierCommande.push(article);

    }
}

// ======================================
// CALCUL PRIX ARTICLE
// ======================================

function calculerPrixArticle(article) {

    const produit = produits[article.reference];

    if (!produit) {
        return 0;
    }

    if (article.reference === "saumon-fume") {

        return Number(
            (
                produit.prix *
                Number(article.poids) /
                100
            ).toFixed(2)
        );

    }

    return Number(
        (
            produit.prix *
            Number(article.quantite)
        ).toFixed(2)
    );
}

// ======================================
// RECETTE
// ======================================

function getRecette(carte) {

    if (!carte) {
        return "";
    }

    const choix = carte.querySelector(
        ".choix-recette input:checked"
    );

    return choix ? choix.value : "";
}

// ======================================
// LECTURE QUANTITE
// ======================================

function lireQuantite(id) {

    const champ = document.getElementById(id);

    if (!champ) {
        return 0;
    }

    return Number(champ.value) || 0;
}

// ======================================
// LECTURE POIDS SAUMON
// ======================================

function lirePoidsSaumon() {

    const champ = document.getElementById("saumonPoids");

    if (!champ) {
        return 0;
    }

    return Number(champ.value) || 0;
}

// ======================================
// AFFICHAGE PANIER
// ======================================

function afficherPanier() {

    const zone = document.getElementById("recapCommande");
    const totalZone = document.getElementById("total");

    if (!zone || !totalZone) {
        return;
    }

    if (panierCommande.length === 0) {

        zone.innerHTML =
            "<p>Aucun produit sélectionné.</p>";

        totalZone.textContent = "0.00 CHF";

        mettreAJourTitrePanier(0);

        return;
    }

    let html = "";
    let total = 0;
    let compteur = 0;

    panierCommande.forEach((article, index) => {

        if (article.reference === "saumon-fume") {
            compteur++;
        } else {
            compteur += Number(article.quantite) || 0;
        }

        total += Number(article.prix) || 0;

        html += `
            <div class="ligne-produit">

                <div class="infos-produit">

                    <strong>
                        ${echapperHTML(article.nom)}
                    </strong>

                    <br>

                    ${afficherDetailsArticle(article)}

                    <div class="gestion-quantite">

                        <button
                            type="button"
                            class="btn-quantite moins"
                            onclick="modifierQuantite(${index},-1)"
                        >−</button>

                        <span>
                            ${
                                article.reference === "saumon-fume"
                                ? echapperHTML(article.poids) + " g"
                                : echapperHTML(article.quantite)
                            }
                        </span>

                        <button
                            type="button"
                            class="btn-quantite plus"
                            onclick="modifierQuantite(${index},1)"
                        >+</button>

                    </div>

                </div>

                <div class="prix-produit">

                    <strong>
                        ${Number(article.prix || 0).toFixed(2)} CHF
                    </strong>

                    <br><br>

                    <button
                        type="button"
                        class="btn-supprimer"
                        onclick="supprimerArticle(${index})"
                    >Supprimer</button>

                </div>

            </div>
        `;
    });

    zone.innerHTML = html;

    totalZone.textContent =
        total.toFixed(2) + " CHF";

    mettreAJourTitrePanier(compteur);
}

// ======================================
// DETAILS ARTICLE
// ======================================

function afficherDetailsArticle(article) {

    let texte = "";

    if (article.recette) {
        texte +=
            "Recette : " +
            echapperHTML(article.recette) +
            "<br>";
    }

    if (
        article.reference === "saumon-fume" &&
        article.poids
    ) {
        texte += echapperHTML(article.poids) + " g";
    }

    return texte;
}

// ======================================
// TITRE PANIER
// ======================================

function mettreAJourTitrePanier(nombre) {

    const titre = document.getElementById("titrePanier");

    if (!titre) {
        return;
    }

    titre.textContent =
        "🛒 Votre panier (" +
        nombre +
        " article" +
        (nombre > 1 ? "s" : "") +
        ")";
}

// ======================================
// MODIFIER QUANTITE
// ======================================

function modifierQuantite(index, variation) {

    const article = panierCommande[index];

    if (!article) {
        return;
    }

    if (article.reference === "saumon-fume") {

        article.poids =
            (Number(article.poids) || 0) +
            variation * 100;

        if (article.poids < 100) {
            supprimerArticle(index);
            return;
        }

    } else {

        article.quantite += variation;

        if (article.quantite <= 0) {
            supprimerArticle(index);
            return;
        }
    }

    article.prix = calculerPrixArticle(article);

    window.panierCommande = panierCommande;

    afficherPanier();
}

// ======================================
// SUPPRESSION ARTICLE
// ======================================

function supprimerArticle(index) {

    panierCommande.splice(index, 1);

    window.panierCommande = panierCommande;

    afficherPanier();
}

// ======================================
// VIDER PANIER
// ======================================

function viderPanier() {

    panierCommande.length = 0;

    window.panierCommande = panierCommande;

    afficherPanier();
}

// ======================================
// COMPTEUR CENTRAL DES COMMANDES
// ======================================

function obtenirNumeroCommande(nomClient, annee) {

    return new Promise((resolve, reject) => {

        const callback =
            "igNumeroCommande_" +
            Date.now() +
            "_" +
            Math.floor(Math.random() * 100000);

        const script = document.createElement("script");

        let termine = false;

        function nettoyer() {

            if (termine) return;

            termine = true;

            clearTimeout(timeout);

            delete window[callback];

            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        }

        const timeout = setTimeout(() => {
            nettoyer();
            reject(
                new Error(
                    "Délai dépassé lors de la réservation du numéro."
                )
            );
        }, 15000);

        window[callback] = function(reponse) {

            nettoyer();

            if (
                !reponse ||
                reponse.ok !== true ||
                !reponse.numero
            ) {
                reject(
                    new Error(
                        reponse && reponse.error ||
                        "Réponse invalide du compteur."
                    )
                );
                return;
            }

            resolve(reponse.numero);
        };

        script.onerror = function() {

            nettoyer();

            reject(
                new Error(
                    "Le service de numérotation est inaccessible."
                )
            );
        };

        const params = new URLSearchParams({
            action: "nextOrderNumber",
            nom: nomClient,
            annee: String(annee),
            callback: callback
        });

        const separateur =
            EMAIL_API_URL.includes("?") ? "&" : "?";

        script.src =
            EMAIL_API_URL +
            separateur +
            params.toString();

        document.head.appendChild(script);
    });
}

// ======================================
// ENVOI COMMANDE
// ======================================

async function envoyerCommande(e) {

    e.preventDefault();

    if (panierCommande.length === 0) {
        alert("Votre panier est vide.");
        return;
    }

    const formulaire =
        document.getElementById("formCommande");

    const boutonEnvoi =
        formulaire
            ? formulaire.querySelector('[type="submit"]')
            : null;

    if (boutonEnvoi && boutonEnvoi.disabled) {
        return;
    }

    if (boutonEnvoi) {
        boutonEnvoi.disabled = true;
    }

    try {

        const getValue = id =>
            document.getElementById(id)?.value?.trim() || "";

        const commande = {

            client: {
                prenom: getValue("prenom"),
                nom: getValue("nom"),
                telephone: getValue("telephone"),
                email: getValue("email"),
                adresse: getValue("adresse"),
                commentaire: getValue("commentaire"),

                nomExpediteurTwint:
                    getValue("nomExpediteurTwint")
            },

            produits: panierCommande.map(
                article => ({ ...article })
            ),

            total: panierCommande.reduce(
                (somme, article) =>
                    somme + (Number(article.prix) || 0),
                0
            )
        };

        // Validation de l'adresse e-mail avant toute réservation.
        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                commande.client.email
            )
        ) {
            throw new Error(
                "Veuillez saisir une adresse e-mail valide."
            );
        }

        // Identifiant technique.
        commande.id = Date.now();

        // Identifiant unique attendu par Apps Script.
        commande.idCommande =
            "IG-" +
            Date.now() +
            "-" +
            Math.floor(Math.random() * 1000000);

        // Numéro de commande séquentiel.
        const nomCommande =
            (
                commande.client.prenom +
                " " +
                commande.client.nom
            ).trim() || "Commande";

        const anneeCommande = new Date().getFullYear();

        try {

            commande.numeroCommande =
                await obtenirNumeroCommande(
                    nomCommande,
                    anneeCommande
                );

        } catch (erreurNumero) {

            console.error(
                "Impossible d'obtenir le numéro de commande :",
                erreurNumero
            );

            throw new Error(
                "Impossible d'attribuer un numéro de commande. Veuillez réessayer dans quelques instants."
            );
        }

        console.log("COMMANDE PREPAREE :", commande);

        console.log(
            "NOM TWINT AVANT PDF :",
            commande.client.nomExpediteurTwint
        );

        // ==================================
        // ENREGISTREMENT BASE LOCALE
        // ==================================

        if (typeof ajouterCommande !== "function") {

            console.error(
                "ajouterCommande() est introuvable. database.js doit être chargé avant commande.js."
            );

            throw new Error(
                "Impossible d'enregistrer la commande. La base de données n'est pas disponible."
            );
        }

        const commandeEnregistree = {

            id: commande.id,

            numeroCommande: commande.numeroCommande,

            date: new Date().toLocaleDateString("fr-FR"),

            client:
                commande.client.prenom +
                " " +
                commande.client.nom,

            telephone: commande.client.telephone,

            email: commande.client.email,

            adresse: commande.client.adresse,

            commentaire: commande.client.commentaire,

            produits: commande.produits.map(article =>

                article.nom +

                (
                    article.reference === "saumon-fume"
                    ? " (" + article.poids + " g)"
                    : (
                        article.quantite > 1
                        ? " x" + article.quantite
                        : ""
                    )
                )

            ).join("\n"),

            produitsListe: commande.produits,

            total: commande.total,

            statut: "Nouvelle",

            stockTraite: false,

            stockErreur: false
        };

        const resultat = ajouterCommande(
            commandeEnregistree
        );

        if (!resultat) {
            throw new Error(
                "La commande n'a pas pu être enregistrée."
            );
        }

        // ==================================
        // GÉNÉRATION DU PDF
        // ==================================

        let resultatPDF = null;

        if (typeof genererPDFCommande === "function") {

            try {

                resultatPDF = await genererPDFCommande(
                    commande,
                    {
                        envoyerEmail: false,
                        typeEmail: "nouvelle-commande"
                    }
                );

            } catch (erreurPDF) {

                console.error(
                    "Erreur lors de la génération du PDF :",
                    erreurPDF
                );
            }
        }

        if (
            !resultatPDF ||
            !resultatPDF.pdf ||
            typeof resultatPDF.pdf.output !== "function"
        ) {
            throw new Error(
                "La commande est enregistrée, mais le PDF n'a pas pu être préparé pour l'envoi."
            );
        }

        const pdfBlob = resultatPDF.pdf.output("blob");

        if (!pdfBlob || pdfBlob.size < 100) {
            throw new Error(
                "La commande est enregistrée, mais le fichier PDF est vide ou invalide."
            );
        }

        // ==================================
        // ENVOI AUTOMATIQUE
        // ==================================

        const envoiOK = await envoyerCommandeAutomatiquement(
            commande,
            {
                blob: pdfBlob,
                filename:
                    resultatPDF.nomFichier ||
                    `Commande_${commande.numeroCommande}.pdf`
            }
        );

        // ==================================
        // NETTOYAGE APRÈS CONFIRMATION
        // ==================================

        if (envoiOK) {

            panierCommande.length = 0;

            window.panierCommande = panierCommande;

            afficherPanier();

            alert(
                "Commande enregistrée. Les e-mails ont été traités et confirmés par le serveur."
            );

        } else {

            alert(
                "La commande est enregistrée, mais l'envoi des e-mails n'a pas pu être confirmé. Conservez votre panier et contactez-nous avant de recommencer."
            );
        }

    } catch (erreur) {

        console.error(
            "Erreur lors de la préparation de la commande :",
            erreur
        );

        alert(
            String(erreur.message || erreur)
        );

    } finally {

        if (boutonEnvoi) {
            boutonEnvoi.disabled = false;
        }
    }
}

// ======================================
// CONVERSION PDF EN BASE64
// ======================================

async function blobToBase64(blob) {

    if (!blob) {
        throw new Error("Blob PDF manquant.");
    }

    const buffer = await blob.arrayBuffer();

    const bytes = new Uint8Array(buffer);

    let binary = "";

    const tailleBloc = 0x8000;

    for (
        let i = 0;
        i < bytes.length;
        i += tailleBloc
    ) {

        binary += String.fromCharCode(
            ...bytes.subarray(
                i,
                Math.min(i + tailleBloc, bytes.length)
            )
        );
    }

    return btoa(binary);
}

// ======================================
// ENVOI AUTOMATIQUE PAR GOOGLE APPS SCRIPT
// ======================================

async function envoyerCommandeAutomatiquement(
    commande,
    resultatPDF
) {

    const destinataire = String(
        commande?.client?.email || ""
    ).trim();

    if (!destinataire) {
        console.error("Adresse e-mail du client manquante.");
        return false;
    }

    if (!commande?.idCommande) {
        console.error("Identifiant idCommande manquant.");
        return false;
    }

    try {

        const pdfBase64 = await blobToBase64(
            resultatPDF.blob
        );

        if (!pdfBase64 || pdfBase64.length < 100) {
            throw new Error("Le PDF est vide ou invalide.");
        }

        const numeroCommande = String(
            commande.numeroCommande || ""
        ).trim();

        if (!numeroCommande) {
            throw new Error("Numéro de commande manquant.");
        }

        const idEnvoi =
            "IGMAIL_" +
            Date.now() +
            "_" +
            Math.floor(Math.random() * 1000000000);

        const payload = {

            idCommande: commande.idCommande,

            idEnvoi: idEnvoi,

            typeEmail: "nouvelle-commande",

            to: destinataire,

            subject:
                `Commande Idée Gourmande n°${numeroCommande}`,

            client: commande.client,

            produits: commande.produits || [],

            total: commande.total || 0,

            numeroCommande: numeroCommande,

            pdfBase64: pdfBase64,

            pdfFilename:
                resultatPDF.filename ||
                `Commande_${numeroCommande}.pdf`
        };

        const formulaire = new URLSearchParams();

        formulaire.set(
            "payload",
            JSON.stringify(payload)
        );

        await fetch(EMAIL_API_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded;charset=UTF-8"
            },
            body: formulaire.toString()
        });

        console.log(
            "Demande transmise. Vérification du suivi :",
            idEnvoi
        );

        return await attendreConfirmationEmail(idEnvoi);

    } catch (erreur) {

        console.error(
            "Erreur lors de l'envoi automatique :",
            erreur
        );

        return false;
    }
}

// ======================================
// LECTURE DU STATUT VIA JSONP
// ======================================

function lireStatutEmail(idEnvoi) {

    return new Promise(function(resolve, reject) {

        const identifiant = String(idEnvoi || "").trim();

        if (!/^[A-Za-z0-9_-]{8,100}$/.test(identifiant)) {
            reject(new Error("Identifiant de suivi invalide."));
            return;
        }

        const callbackName =
            "igMailStatus_" +
            Date.now() +
            "_" +
            Math.floor(Math.random() * 1000000);

        const separateur =
            EMAIL_API_URL.includes("?") ? "&" : "?";

        const script = document.createElement("script");

        let termine = false;

        function nettoyer() {

            if (termine) return;

            termine = true;

            clearTimeout(delai);

            delete window[callbackName];

            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        }

        const delai = setTimeout(function() {

            nettoyer();

            reject(
                new Error(
                    "Délai de lecture du statut dépassé."
                )
            );

        }, 10000);

        window[callbackName] = function(reponse) {

            nettoyer();

            if (!reponse || typeof reponse !== "object") {
                reject(
                    new Error("Réponse de suivi invalide.")
                );
                return;
            }

            resolve(reponse);
        };

        script.onerror = function() {

            nettoyer();

            reject(
                new Error(
                    "Impossible de lire le statut de l'envoi."
                )
            );
        };

        script.src =
            EMAIL_API_URL +
            separateur +
            "action=mailStatus" +
            "&requestId=" +
            encodeURIComponent(identifiant) +
            "&callback=" +
            encodeURIComponent(callbackName);

        document.head.appendChild(script);
    });
}

// ======================================
// ATTENTE DE LA CONFIRMATION SERVEUR
// ======================================

async function attendreConfirmationEmail(idEnvoi) {

    const delaiMaximum = 120000;

    const intervalle = 2500;

    const debut = Date.now();

    while (Date.now() - debut < delaiMaximum) {

        try {

            const resultat = await lireStatutEmail(idEnvoi);

            if (resultat && resultat.found === true) {

                if (resultat.status === "termine") {

                    console.log(
                        "Traitement des e-mails terminé."
                    );

                    return true;
                }

                if (
                    resultat.status === "echec" ||
                    resultat.status === "indetermine"
                ) {

                    console.error(
                        "Le traitement des e-mails a échoué ou reste incertain :",
                        resultat.status
                    );

                    return false;
                }
            }

        } catch (erreur) {

            console.warn(
                "Statut temporairement indisponible :",
                erreur.message
            );
        }

        await new Promise(function(resolve) {
            setTimeout(resolve, intervalle);
        });
    }

    console.error(
        "Délai dépassé : aucune confirmation finale reçue."
    );

    return false;
}

// ======================================
// EXPORT GLOBAL
// ======================================

window.ajouterAuPanier = ajouterAuPanier;

window.modifierQuantite = modifierQuantite;

window.supprimerArticle = supprimerArticle;

window.viderPanier = viderPanier;

window.envoyerCommande = envoyerCommande;

// ======================================
// FIN
// ======================================

console.log("COMMANDE.JS 2.1.1 CHARGE");
