
console.log("COMMANDE.JS CHARGE");

// ======================================
// IDEE GOURMANDE
// commande.js
// Gestion du panier
// Version 4.0.0
// ======================================

let panierCommande = [];
const FRAIS_LIVRAISON_SUISSE = 10.50;

window.panierCommande = panierCommande;

// Prix des produits :
// foie gras : CHF 35 par portion de 200 g
// magret : CHF 25 par portion
// viande séchée : CHF 9 / 100 g
// lard sec : CHF 4 / 100 g
// saumon fumé : CHF 8 / 100 g

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
        prix: 9
    },
    "lard-sec": {
        nom: "Lard sec légèrement fumé",
        prix: 4
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

    const selectLivraison =
        document.getElementById("modeLivraison");

    if (selectLivraison) {
        selectLivraison.addEventListener("change", afficherPanier);
    }

    const boutonVider =
        document.getElementById("btnViderPanier");

    if (boutonVider) {
        boutonVider.addEventListener("click", viderPanier);
    }

    const formulaire =
        document.getElementById("formCommande");

    if (formulaire) {
        formulaire.addEventListener("submit", envoyerCommande);
    }

    if (typeof initialiserNomTwint === "function") {
        initialiserNomTwint();
    }

    initialiserPartageSite();
});

// ======================================
// BOUTONS DU PANIER
// ======================================

function initialiserBoutonsPanier() {
    document.querySelectorAll(".ajouter-panier").forEach(bouton => {
        bouton.addEventListener("click", () => {
            ajouterAuPanier(bouton.dataset.produit);
        });
    });
}

// ======================================
// LECTURE DES FOURCHETTES DE POIDS
// ======================================

function lireFourchettePoids(id) {
    const champ = document.getElementById(id);

    if (!champ || !champ.value || champ.value === "0") {
        return null;
    }

    const morceaux = champ.value.split("-").map(Number);

    if (
        morceaux.length !== 2 ||
        !Number.isFinite(morceaux[0]) ||
        !Number.isFinite(morceaux[1]) ||
        morceaux[0] <= 0 ||
        morceaux[1] <= morceaux[0]
    ) {
        return null;
    }

    return {
        poidsMin: morceaux[0],
        poidsMax: morceaux[1]
    };
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
        poidsMin: null,
        poidsMax: null,
        prix: 0,
        prixIndicatif: 0,
        prixPlafond: null
    };

    switch (reference) {
        case "foie-gras":
            article.quantite = lireQuantite("foieQuantite");
            if (!article.recette) {
                alert("Veuillez choisir la recette du foie gras.");
                return;
            }
            break;

        case "magret":
            article.quantite = lireQuantite("magretQuantite");
            if (!article.recette) {
                alert("Veuillez choisir la recette du magret.");
                return;
            }
            break;

        case "viande-sechee": {
            const fourchette = lireFourchettePoids("viandePoids");

            if (!fourchette) {
                alert("Veuillez choisir une fourchette de poids pour la viande séchée.");
                return;
            }

            article.poidsMin = fourchette.poidsMin;
            article.poidsMax = fourchette.poidsMax;
            article.quantite = 1;
            break;
        }

        case "lard-sec": {
            const fourchette = lireFourchettePoids("lardPoids");

            if (!fourchette) {
                alert("Veuillez choisir une fourchette de poids pour le lard sec.");
                return;
            }

            article.poidsMin = fourchette.poidsMin;
            article.poidsMax = fourchette.poidsMax;
            article.quantite = 1;
            break;
        }

        case "saumon-fume":
            article.poids = lirePoidsSaumon();

            if (article.poids < 100) {
                alert("Veuillez choisir un poids pour le saumon.");
                return;
            }

            if (!article.recette) {
                alert("Veuillez choisir la recette du saumon.");
                return;
            }
            break;
    }

    if (
        !["saumon-fume", "viande-sechee", "lard-sec"].includes(reference) &&
        article.quantite <= 0
    ) {
        alert("Veuillez choisir une quantité valide.");
        return;
    }

    calculerPrixArticle(article);
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

    if (existant) {
        if (article.reference === "saumon-fume") {
            existant.poids =
                (Number(existant.poids) || 0) +
                (Number(article.poids) || 0);
        } else if (
            article.reference === "viande-sechee" ||
            article.reference === "lard-sec"
        ) {
            // Une fourchette identique représente une demande
            // supplémentaire du même produit.
            existant.quantite += 1;
        } else {
            existant.quantite += article.quantite;
        }

        calculerPrixArticle(existant);
    } else {
        panierCommande.push(article);
    }
}

// ======================================
// CALCUL DES PRIX
// ======================================

function calculerPrixArticle(article) {
    const produit = produits[article.reference];

    if (!produit) {
        article.prix = 0;
        return 0;
    }

    if (article.reference === "saumon-fume") {
        article.prix = arrondir(
            produit.prix * Number(article.poids) / 100
        );
        article.prixIndicatif = article.prix;
        return article.prix;
    }

    if (
        article.reference === "viande-sechee" ||
        article.reference === "lard-sec"
    ) {
        const minimum = Number(article.poidsMin) || 0;
        const maximum = Number(article.poidsMax) || 0;
        const quantite = Math.max(1, Number(article.quantite) || 1);

        // Estimation affichée sur la base de la limite basse.
        // Le plafond est calculé sur la limite haute.
        article.prixIndicatif = arrondir(
            produit.prix * minimum / 100 * quantite
        );

        article.prixPlafond = arrondir(
            produit.prix * maximum / 100 * quantite
        );

        // En attendant la pesée réelle, le prix du panier
        // correspond à l'estimation basse.
        article.prix = article.prixIndicatif;

        return article.prix;
    }

    article.prix = arrondir(
        produit.prix * (Number(article.quantite) || 0)
    );

    article.prixIndicatif = article.prix;
    return article.prix;
}

function arrondir(nombre) {
    return Number((Number(nombre) || 0).toFixed(2));
}

// ======================================
// RECETTE
// ======================================

function getRecette(carte) {
    if (!carte) {
        return "";
    }

    const choix = carte.querySelector(".choix-recette input:checked");
    return choix ? choix.value : "";
}

// ======================================
// LECTURE QUANTITÉ
// ======================================

function lireQuantite(id) {
    const champ = document.getElementById(id);
    return champ ? Number(champ.value) || 0 : 0;
}

// ======================================
// LECTURE POIDS SAUMON
// ======================================

function lirePoidsSaumon() {
    const champ = document.getElementById("saumonPoids");
    return champ ? Number(champ.value) || 0 : 0;
}

// ======================================
// FRAIS DE LIVRAISON
// ======================================

function calculerFraisLivraison() {
    const modeLivraison =
        document.getElementById("modeLivraison")?.value || "";

    return modeLivraison === "Livraison en Suisse"
        ? FRAIS_LIVRAISON_SUISSE
        : 0;
}

// ======================================
// FORMATAGE D'UN ARTICLE
// ======================================

function afficherDetailsArticle(article) {
    let texte = "";

    if (article.recette) {
        texte += "Recette : " + article.recette + "<br>";
    }

    if (
        article.reference === "viande-sechee" ||
        article.reference === "lard-sec"
    ) {
        const min = Number(article.poidsMin) || 0;
        const max = Number(article.poidsMax) || 0;
        const uniteMin = min >= 1000
            ? (min / 1000).toLocaleString("fr-CH") + " kg"
            : min + " g";
        const uniteMax = max >= 1000
            ? (max / 1000).toLocaleString("fr-CH") + " kg"
            : max + " g";

        texte += `Fourchette choisie : ${uniteMin} – ${uniteMax}<br>`;
        texte += `Estimation : ${article.prixIndicatif.toFixed(2)} CHF<br>`;
        texte += `Plafond : ${article.prixPlafond.toFixed(2)} CHF<br>`;
        texte += "Le poids supplémentaire éventuel est offert.";
    }

    if (article.reference === "saumon-fume" && article.poids) {
        texte += article.poids + " g";
    }

    return texte;
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
        if (
            article.reference === "saumon-fume" ||
            article.reference === "viande-sechee" ||
            article.reference === "lard-sec"
        ) {
            compteur += Number(article.quantite) || 1;
        } else {
            compteur += Number(article.quantite) || 0;
        }

        total += Number(article.prix) || 0;

        let quantiteAffichee;

        if (article.reference === "saumon-fume") {
            quantiteAffichee = article.poids + " g";
        } else if (
            article.reference === "viande-sechee" ||
            article.reference === "lard-sec"
        ) {
            quantiteAffichee = Number(article.quantite) > 1
                ? article.quantite + " demandes"
                : "1 demande";
        } else {
            quantiteAffichee = article.quantite;
        }

        html += `
            <div class="ligne-produit">
                <div class="infos-produit">
                    <strong>${echapperHTML(article.nom)}</strong>
                    <br>
                    ${afficherDetailsArticle(article)}
                    <div class="gestion-quantite">
                        <button type="button"
                            class="btn-quantite moins"
                            onclick="modifierQuantite(${index},-1)"
                            aria-label="Diminuer la quantité">−</button>
                        <span>${quantiteAffichee}</span>
                        <button type="button"
                            class="btn-quantite plus"
                            onclick="modifierQuantite(${index},1)"
                            aria-label="Augmenter la quantité">+</button>
                    </div>
                </div>
                <div class="prix-produit">
                    <strong>${(Number(article.prix) || 0).toFixed(2)} CHF</strong>
                    <br><br>
                    <button type="button" class="btn-supprimer"
                        onclick="supprimerArticle(${index})">Supprimer</button>
                </div>
            </div>
        `;
    });

    const fraisLivraison = calculerFraisLivraison();

    if (fraisLivraison > 0) {
        html += `
            <div class="ligne-produit">
                <div class="infos-produit"><strong>📦 Livraison en Suisse</strong></div>
                <div class="prix-produit"><strong>${fraisLivraison.toFixed(2)} CHF</strong></div>
            </div>
        `;
        total += fraisLivraison;
    }

    zone.innerHTML = html;
    totalZone.textContent = arrondir(total).toFixed(2) + " CHF";
    mettreAJourTitrePanier(compteur);
}

function echapperHTML(texte) {
    return String(texte ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[caractere]);
}

// ======================================
// TITRE DU PANIER
// ======================================

function mettreAJourTitrePanier(nombre) {
    const titre = document.getElementById("titrePanier");

    if (titre) {
        titre.textContent =
            "🛒 Votre panier (" + nombre +
            " article" + (nombre > 1 ? "s" : "") + ")";
    }
}

// ======================================
// MODIFIER QUANTITÉ
// ======================================

function modifierQuantite(index, variation) {
    const article = panierCommande[index];

    if (!article) {
        return;
    }

    if (article.reference === "saumon-fume") {
        article.poids =
            (Number(article.poids) || 0) + variation * 100;

        if (article.poids < 100) {
            supprimerArticle(index);
            return;
        }
    } else {
        article.quantite =
            (Number(article.quantite) || 1) + variation;

        if (article.quantite <= 0) {
            supprimerArticle(index);
            return;
        }
    }

    calculerPrixArticle(article);
    window.panierCommande = panierCommande;
    afficherPanier();
}

// ======================================
// SUPPRIMER / VIDER
// ======================================

function supprimerArticle(index) {
    panierCommande.splice(index, 1);
    window.panierCommande = panierCommande;
    afficherPanier();
}

function viderPanier() {
    panierCommande.length = 0;
    window.panierCommande = panierCommande;
    afficherPanier();
}

// ======================================
// ENVOI DE LA COMMANDE
// Aucun paiement à cette étape.
// Le stock n'est pas déduit à la commande.
// ======================================

async function envoyerCommande(e) {
    e.preventDefault();

    if (panierCommande.length === 0) {
        alert("Votre panier est vide.");
        return;
    }

    const getValue = id =>
        document.getElementById(id)?.value?.trim() || "";

    const produitsCommande = panierCommande.map(article => ({
        ...article,
        prix: Number(article.prix) || 0,
        prixIndicatif: Number(article.prixIndicatif ?? article.prix) || 0,
        prixPlafond: article.prixPlafond == null
            ? null
            : Number(article.prixPlafond),
        poidsMin: article.poidsMin == null ? null : Number(article.poidsMin),
        poidsMax: article.poidsMax == null ? null : Number(article.poidsMax),
        poidsReel: null,
        prixFinal: null
    }));

    const totalProduits = produitsCommande.reduce(
        (somme, article) => somme + (Number(article.prixIndicatif) || 0),
        0
    );

    const fraisLivraison = calculerFraisLivraison();

    const commande = {
        id: Date.now(),
        dateCreation: new Date().toISOString(),
        client: {
            prenom: getValue("prenom"),
            nom: getValue("nom"),
            telephone: getValue("telephone"),
            email: getValue("email"),
            adresse: getValue("adresse"),
            commentaire: getValue("commentaire"),
            modeLivraison: getValue("modeLivraison")
        },
        produits: produitsCommande,
        total: arrondir(totalProduits + fraisLivraison),
        totalIndicatif: arrondir(totalProduits + fraisLivraison),
        fraisLivraison,
        prixConfirme: false,
        paiementConfirme: false,
        paiementEnAttente: true,
        stockTraite: false,
        stockErreur: false,
        statut: "Nouvelle"
    };

    const produitsTexte = produitsCommande.map(article => {
        let ligne = article.nom;

        if (article.recette) {
            ligne += " — recette : " + article.recette;
        }

        if (article.reference === "saumon-fume") {
            ligne += " (" + article.poids + " g)";
        } else if (
            article.reference === "viande-sechee" ||
            article.reference === "lard-sec"
        ) {
            ligne += " — fourchette " +
                article.poidsMin + "–" + article.poidsMax + " g" +
                " — estimation CHF " +
                Number(article.prixIndicatif).toFixed(2) +
                " — plafond CHF " +
                Number(article.prixPlafond).toFixed(2);
        } else if (Number(article.quantite) > 1) {
            ligne += " x" + article.quantite;
        }

        return ligne;
    }).join("\n");

    const commandeEnregistree = {
        id: commande.id,
        date: new Date().toLocaleDateString("fr-CH"),
        dateCreation: commande.dateCreation,
        client: commande.client.prenom + " " + commande.client.nom,
        prenom: commande.client.prenom,
        nom: commande.client.nom,
        telephone: commande.client.telephone,
        email: commande.client.email,
        adresse: commande.client.adresse,
        commentaire: commande.client.commentaire,
        modeLivraison: commande.client.modeLivraison,
        produits: produitsTexte,
        produitsListe: produitsCommande,
        total: commande.total,
        totalIndicatif: commande.totalIndicatif,
        fraisLivraison: commande.fraisLivraison,
        prixConfirme: false,
        paiementConfirme: false,
        paiementEnAttente: true,
        stockTraite: false,
        stockErreur: false,
        statut: "Nouvelle"
    };

    if (typeof ajouterCommande !== "function") {
        console.error("ajouterCommande() est introuvable.");
        alert("Impossible d'enregistrer la commande : la base de données n'est pas disponible.");
        return;
    }

    let resultat;

    try {
        resultat = ajouterCommande(commandeEnregistree);
    } catch (erreur) {
        console.error("Erreur d'enregistrement :", erreur);
        alert("Une erreur est survenue lors de l'enregistrement de la commande.");
        return;
    }

    if (!resultat) {
        alert("La commande n'a pas pu être enregistrée. Vérifiez si elle existe déjà avant de réessayer.");
        return;
    }

    // Le PDF peut envoyer un e-mail selon l'implémentation actuelle
    // de pdfcommande.js. La commande reste estimative et non payée.
    if (typeof genererPDFCommande === "function") {
        try {
            await genererPDFCommande(commande);
        } catch (erreur) {
            console.error("Erreur PDF / e-mail :", erreur);
            alert(
                "Votre commande a été enregistrée, mais l'envoi du récapitulatif a rencontré un problème. " +
                "Conservez votre numéro de commande : " + commande.id
            );
            return;
        }
    } else {
        console.warn("genererPDFCommande() est introuvable.");
    }

    panierCommande.length = 0;
    window.panierCommande = panierCommande;
    afficherPanier();

    const formulaire = document.getElementById("formCommande");

    if (formulaire) {
        formulaire.reset();
    }

    alert(
        "Merci pour votre commande !\n\n" +
        "Votre commande n'est pas encore à payer.\n" +
        "Nous vous communiquerons le montant définitif après préparation et pesée.\n" +
        "Vous pourrez ensuite effectuer le paiement TWINT."
    );

    window.location.href = "index.html";
}

// ======================================
// PARTAGE DU SITE
// ======================================

function initialiserPartageSite() {
    const boutonPartager = document.getElementById("partagerSite");

    if (!boutonPartager) {
        return;
    }

    boutonPartager.addEventListener("click", async function(e) {
        e.preventDefault();

        const partage = {
            title: "Idée Gourmande",
            text: "Découvrez Idée Gourmande – spécialités artisanales préparées à Genève.",
            url: window.location.origin + window.location.pathname
        };

        if (navigator.share) {
            try {
                await navigator.share(partage);
            } catch (erreur) {
                // Partage annulé par l'utilisateur.
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert("Le lien du site a été copié. Vous pouvez maintenant le partager.");
            } catch (erreur) {
                alert("Impossible de copier automatiquement le lien du site.");
            }
        }
    });
}

// ======================================
// EXPORT GLOBAL
// ======================================

window.ajouterAuPanier = ajouterAuPanier;
window.modifierQuantite = modifierQuantite;
window.supprimerArticle = supprimerArticle;
window.viderPanier = viderPanier;
window.envoyerCommande = envoyerCommande;

console.log("COMMANDE.JS 4.0.0 CHARGE");
