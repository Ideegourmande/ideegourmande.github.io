
console.log("COMMANDE.JS CHARGE");

// ======================================
// IDEE GOURMANDE — GESTION DU PANIER
// ======================================

let panierCommande = [];
window.panierCommande = panierCommande;

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
// INITIALISATION
// ======================================

document.addEventListener("DOMContentLoaded", () => {
    initialiserBoutonsPanier();
    afficherPanier();

    const boutonVider = document.getElementById("btnViderPanier");
    if (boutonVider) {
        boutonVider.addEventListener("click", viderPanier);
    }

    const formulaire = document.getElementById("formCommande");
    if (formulaire) {
        formulaire.addEventListener("submit", envoyerCommande);
    }

    if (typeof initialiserNomTwint === "function") {
        initialiserNomTwint();
    }
});

// ======================================
// BOUTONS D'AJOUT AU PANIER
// ======================================

function initialiserBoutonsPanier() {
    const boutons = document.querySelectorAll(".ajouter-panier");

    boutons.forEach(bouton => {
        bouton.addEventListener("click", () => {
            ajouterAuPanier(bouton.dataset.produit);
        });
    });
}

// ======================================
// AJOUT D'UN ARTICLE
// ======================================

function ajouterAuPanier(reference) {
    const produit = produits[reference];

    if (!produit) {
        console.error("Produit inconnu :", reference);
        return;
    }

    const carte = document.querySelector(
        `.commande-card[data-produit="${reference}"]`
    );

    const article = {
        reference,
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
        case "lard-sec": {
            const idPoids = reference === "viande-sechee"
                ? "viandePoids"
                : "lardPoids";

            const champPoids = document.getElementById(idPoids);
            const valeurPoids = champPoids
                ? String(champPoids.value || "")
                : "";

            const poidsChoisi = Number(valeurPoids);

            if (!Number.isInteger(poidsChoisi) || poidsChoisi < 500 || poidsChoisi > 3000 || poidsChoisi % 100 !== 0) {
                alert(
                    "Veuillez choisir un poids approximatif d’au moins 500 g (par tranches de 100 g) pour " +
                    (reference === "viande-sechee" ? "la viande séchée." : "le lard sec.")
                );
                return;
            }

            // Le poids sélectionné sert de référence et de plafond de prix.
            article.poidsMin = poidsChoisi;
            article.poidsMax = poidsChoisi;
            article.poids = article.poidsMin;
            article.quantite = 1;
            article.prixPar100g = reference === "lard-sec" ? 4 : 9;

            article.prixIndicatif = Number(
                (article.poidsMin * article.prixPar100g / 100).toFixed(2)
            );

            article.prixPlafond = Number(
                (article.poidsMax * article.prixPar100g / 100).toFixed(2)
            );

            break;
        }

        case "saumon-fume":
            article.poids = lirePoidsSaumon();

            if (article.poids < 100) {
                alert("Veuillez choisir un poids pour le saumon.");
                return;
            }
            break;
    }

    if (
        reference !== "saumon-fume" &&
        article.reference !== "viande-sechee" &&
        article.reference !== "lard-sec" &&
        article.quantite <= 0
    ) {
        alert("Veuillez choisir une quantité valide.");
        return;
    }

    article.prix = calculerPrixArticle(article);

    ajouterOuFusionner(article);
    window.panierCommande = panierCommande;
    afficherPanier();
}

// ======================================
// FUSION DES ARTICLES IDENTIQUES
// ======================================

function ajouterOuFusionner(article) {
    const existant = panierCommande.find(a =>
        a.reference === article.reference &&
        (a.recette || "") === (article.recette || "") &&
        Number(a.poids || 0) === Number(article.poids || 0) &&
        Number(a.poidsMin || 0) === Number(article.poidsMin || 0) &&
        Number(a.poidsMax || 0) === Number(article.poidsMax || 0)
    );

    if (!existant) {
        panierCommande.push(article);
        return;
    }

    if (article.reference === "saumon-fume") {
        existant.poids =
            (Number(existant.poids) || 0) +
            (Number(article.poids) || 0);
    } else if (
        article.reference !== "viande-sechee" &&
        article.reference !== "lard-sec"
    ) {
        existant.quantite += article.quantite;
    }

    existant.prix = calculerPrixArticle(existant);
}

// ======================================
// CALCUL DU PRIX
// ======================================

function calculerPrixArticle(article) {
    const produit = produits[article.reference];

    if (!produit) {
        return 0;
    }

    if (
        article.reference === "viande-sechee" ||
        article.reference === "lard-sec"
    ) {
        const tarif = article.reference === "lard-sec" ? 4 : 9;
        const poidsMin = Number(article.poidsMin || article.poids || 0);

        return Number((poidsMin * tarif / 100).toFixed(2));
    }

    if (article.reference === "saumon-fume") {
        return Number(
            (produit.prix * Number(article.poids) / 100).toFixed(2)
        );
    }

    return Number(
        (produit.prix * Number(article.quantite)).toFixed(2)
    );
}

// ======================================
// RECETTE ET LECTURE DES CHAMPS
// ======================================

function getRecette(carte) {
    if (!carte) {
        return "";
    }

    const choix = carte.querySelector(".choix-recette input:checked");
    return choix ? choix.value : "";
}

function lireQuantite(id) {
    const champ = document.getElementById(id);
    if (!champ) {
        return 0;
    }

    return Number(champ.value) || 0;
}

function lirePoidsSaumon() {
    const champ = document.getElementById("saumonPoids");
    if (!champ) {
        return 0;
    }

    return Number(champ.value) || 0;
}

// ======================================
// AFFICHAGE DU PANIER
// ======================================

function afficherPanier() {
    const zone = document.getElementById("recapCommande");
    const totalZone = document.getElementById("total");

    if (!zone || !totalZone) {
        return;
    }

    if (panierCommande.length === 0) {
        zone.innerHTML = "<p>Aucun produit sélectionné.</p>";
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

        const produitAuPoids =
            article.reference === "viande-sechee" ||
            article.reference === "lard-sec";

        let quantiteAffichee;

        if (article.reference === "saumon-fume") {
            quantiteAffichee = article.poids + " g";
        } else if (
            produitAuPoids &&
            article.poidsMin &&
            article.poidsMax
        ) {
            quantiteAffichee = article.poidsMin === article.poidsMax
                ? "Environ " + article.poidsMin + " g"
                : article.poidsMin + "–" + article.poidsMax + " g";
        } else {
            quantiteAffichee = article.quantite;
        }

        const controlesQuantite = produitAuPoids
            ? ""
            : `
                <button
                    type="button"
                    class="btn-quantite moins"
                    onclick="modifierQuantite(${index},-1)"
                    aria-label="Diminuer la quantité"
                >−</button>

                <span>${quantiteAffichee}</span>

                <button
                    type="button"
                    class="btn-quantite plus"
                    onclick="modifierQuantite(${index},1)"
                    aria-label="Augmenter la quantité"
                >+</button>
            `;

        html += `
            <div class="ligne-produit">
                <div class="infos-produit">
                    <strong>${article.nom}</strong>
                    <br>
                    ${afficherDetailsArticle(article)}

                    <div class="gestion-quantite">
                        ${controlesQuantite}
                    </div>
                </div>

                <div class="prix-produit">
                    <strong>${Number(article.prix || 0).toFixed(2)} CHF</strong>
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
    totalZone.textContent = total.toFixed(2) + " CHF";
    mettreAJourTitrePanier(compteur);
}

// ======================================
// DÉTAILS D'UN ARTICLE
// ======================================

function afficherDetailsArticle(article) {
    let texte = "";

    if (article.recette) {
        texte += "Recette : " + article.recette + "<br>";
    }

    if (article.reference === "saumon-fume" && article.poids) {
        texte += article.poids + " g";
    }

    if (
        (article.reference === "viande-sechee" ||
         article.reference === "lard-sec") &&
        article.poidsMin &&
        article.poidsMax
    ) {
        texte += article.poidsMin === article.poidsMax
            ? "Poids souhaité : environ " + article.poidsMin + " g"
            : "Fourchette choisie : " + article.poidsMin + "–" + article.poidsMax + " g";

        texte +=
            "<br>Prix estimatif : " +
            Number(article.prixIndicatif || article.prix || 0).toFixed(2) +
            " CHF";

        texte +=
            "<br>Plafond : " +
            Number(article.prixPlafond || 0).toFixed(2) +
            " CHF";
    }

    return texte;
}

// ======================================
// TITRE DU PANIER
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
// MODIFIER LA QUANTITÉ
// ======================================

function modifierQuantite(index, variation) {
    const article = panierCommande[index];

    if (!article) {
        return;
    }

    if (
        article.reference === "viande-sechee" ||
        article.reference === "lard-sec"
    ) {
        return;
    }

    if (article.reference === "saumon-fume") {
        article.poids =
            (Number(article.poids) || 0) +
            (variation * 100);

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
// SUPPRIMER UN ARTICLE
// ======================================

function supprimerArticle(index) {
    panierCommande.splice(index, 1);
    window.panierCommande = panierCommande;
    afficherPanier();
}

// ======================================
// VIDER LE PANIER
// ======================================

function viderPanier() {
    panierCommande.length = 0;
    window.panierCommande = panierCommande;
    afficherPanier();
}

// ======================================
// COMPTEUR CENTRAL DES COMMANDES
// ======================================

const URL_COMPTEUR_COMMANDES =
    "https://script.google.com/macros/s/AKfycby5o5V0dRb9fPpnhmUYCeWB1LxXjGRXfQK0kQ2Tzw2gHK58GQn8VmxlDI1DFWzogAhI/exec";

function obtenirNumeroCommande(nomClient, annee) {
    return new Promise((resolve, reject) => {
        const callback = "igNumeroCommande_" + Date.now() + "_" +
            Math.floor(Math.random() * 100000);
        const script = document.createElement("script");
        const timeout = setTimeout(() => {
            nettoyer();
            reject(new Error("Délai dépassé lors de la réservation du numéro."));
        }, 15000);

        function nettoyer() {
            clearTimeout(timeout);
            delete window[callback];
            if (script.parentNode) script.parentNode.removeChild(script);
        }

        window[callback] = function(reponse) {
            nettoyer();
            if (!reponse || reponse.ok !== true || !reponse.numero) {
                reject(new Error(reponse && reponse.error || "Réponse invalide du compteur."));
                return;
            }
            resolve(reponse.numero);
        };

        script.onerror = function() {
            nettoyer();
            reject(new Error("Le service de numérotation est inaccessible."));
        };

        const params = new URLSearchParams({
            action: "nextOrderNumber",
            nom: nomClient,
            annee: String(annee),
            callback
        });
        script.src = URL_COMPTEUR_COMMANDES + "?" + params.toString();
        document.head.appendChild(script);
    });
}

// ======================================
// ENVOYER LA COMMANDE
// ======================================

async function envoyerCommande(e) {
    e.preventDefault();

    if (panierCommande.length === 0) {
        alert("Votre panier est vide.");
        return;
    }

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
            modeLivraison: getValue("modeLivraison"),
            nomExpediteurTwint: getValue("nomExpediteurTwint")
        },

        produits: panierCommande.map(article => ({ ...article })),

        total: panierCommande.reduce(
            (somme, article) => somme + (Number(article.prix) || 0),
            0
        )
    };

    // ID technique interne conservé pour la base de données.
    commande.id = "IG-" + Date.now().toString(36).toUpperCase();

    // Numéro lisible et séquentiel utilisé sur les e-mails et les PDF.
    try {
        commande.numeroCommande = await obtenirNumeroCommande(
            (commande.client.prenom + " " + commande.client.nom).trim() || "Commande",
            new Date().getFullYear()
        );
    } catch (erreurNumero) {
        console.error("Impossible d'obtenir le numéro de commande :", erreurNumero);
        alert("Le numéro de commande n'a pas pu être attribué. Aucune commande n'a été enregistrée. Réessaie dans quelques instants.");
        return;
    }

    console.log("COMMANDE PRÉPARÉE :", commande);

    // Vérifier la disponibilité de la base de données.
    if (typeof ajouterCommande !== "function") {
        console.error(
            "ajouterCommande() est introuvable. Vérifiez le chargement de js/database.js."
        );

        alert(
            "Impossible d'enregistrer la commande. La base de données n'est pas disponible."
        );
        return;
    }

    const commandeEnregistree = {
        id: commande.id,
        numeroCommande: commande.numeroCommande,
        date: new Date().toLocaleDateString("fr-FR"),

        client: commande.client.prenom + " " + commande.client.nom,
        telephone: commande.client.telephone,
        email: commande.client.email,
        adresse: commande.client.adresse,
        commentaire: commande.client.commentaire,
        modeLivraison: commande.client.modeLivraison,
        clientDetails: { ...commande.client },

        produits: commande.produits.map(article => {
            let description = article.nom;

            if (article.reference === "saumon-fume") {
                description += " (" + article.poids + " g)";
            } else if (
                article.reference === "viande-sechee" ||
                article.reference === "lard-sec"
            ) {
                description +=
                    " (" +
                    article.poidsMin +
                    "–" +
                    article.poidsMax +
                    " g)";
            } else if (article.quantite > 1) {
                description += " x" + article.quantite;
            }

            return description;
        }).join("\n"),

        produitsListe: commande.produits,
        total: commande.total,
        statut: "Nouvelle",
        stockTraite: false,
        stockErreur: false
    };

    let resultat;

    try {
        resultat = ajouterCommande(commandeEnregistree);
    } catch (erreur) {
        console.error("Erreur lors de l'enregistrement :", erreur);
        alert("Une erreur est survenue pendant l'enregistrement de la commande.");
        return;
    }

    if (!resultat) {
        alert("La commande n'a pas pu être enregistrée.");
        return;
    }

    // ==================================
    // PDF ET DEMANDE D'ENVOI PAR E-MAIL
    // ==================================

    let envoiOK = false;
    let erreurEnvoi = "";

    try {
        if (typeof window.genererPDFCommande !== "function") {
            throw new Error(
                "Le module PDF n'est pas chargé. Vérifiez js/pdfcommande.js."
            );
        }

        const resultatEmail = await window.genererPDFCommande(commande, {
            envoyerEmail: true,
            typeEmail: "nouvelle-commande",
            telecharger: true,
            afficher: true
        });

        envoiOK = Boolean(
            resultatEmail &&
            resultatEmail.ok &&
            resultatEmail.transmis
        );

        if (!envoiOK) {
            erreurEnvoi = resultatEmail && resultatEmail.message
                ? resultatEmail.message
                : "La transmission de la demande d'e-mail n'a pas été confirmée.";
        }
    } catch (erreur) {
        console.error("Erreur PDF / e-mail :", erreur);
        erreurEnvoi = erreur && erreur.message
            ? erreur.message
            : String(erreur);
    }

    // La commande est déjà enregistrée : vider le panier.
    panierCommande.length = 0;
    window.panierCommande = panierCommande;
    afficherPanier();

    if (envoiOK) {
        alert(
            "Commande enregistrée. La demande d'envoi du PDF par e-mail a été transmise. " +
            "Vérifiez la réception du message."
        );
    } else {
        alert(
            "Commande enregistrée, mais la demande d'envoi de l'e-mail a échoué.\n\n" +
            (erreurEnvoi || "Vérifiez la configuration du service d'e-mail.")
        );
    }
}

// ======================================
// EXPORT DES FONCTIONS UTILISÉES PAR LA PAGE
// ======================================

window.ajouterAuPanier = ajouterAuPanier;
window.modifierQuantite = modifierQuantite;
window.supprimerArticle = supprimerArticle;
window.viderPanier = viderPanier;
window.envoyerCommande = envoyerCommande;

console.log("COMMANDE.JS CORRIGÉ CHARGÉ");
