
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

const URL_PRIX =
    "https://script.google.com/macros/s/AKfycby5o5V0dRb9fPpnhmUYCeWB1LxXjGRXfQK0kQ2Tzw2gHK58GQn8VmxlDI1DFWzogAhI/exec";

// ======================================
// CHARGEMENT DES PRIX DEPUIS APPS SCRIPT
// ======================================

function chargerPrixCommande() {
    return new Promise((resolve) => {
        const callback =
            "igPrix_" + Date.now() + "_" +
            Math.floor(Math.random() * 100000);

        const script = document.createElement("script");
        let termine = false;

        const timeout = setTimeout(() => {
            finir(false);
        }, 15000);

        function finir(succes) {
            if (termine) return;

            termine = true;
            clearTimeout(timeout);
            delete window[callback];

            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }

            resolve(succes);
        }

        window[callback] = function(reponse) {
            if (
                !reponse ||
                reponse.ok !== true ||
                !reponse.prices
            ) {
                console.error("Réponse des prix invalide :", reponse);
                finir(false);
                return;
            }

            const references = Object.keys(produits);

            // Vérifier tous les prix avant de les appliquer.
            for (const reference of references) {
                const prix = reponse.prices[reference];

                if (
                    typeof prix !== "number" ||
                    !Number.isFinite(prix) ||
                    prix < 0
                ) {
                    console.error(
                        "Prix invalide pour " + reference,
                        prix
                    );
                    finir(false);
                    return;
                }
            }

            // Actualiser les prix utilisés pour les calculs.
            references.forEach(reference => {
                const prix = reponse.prices[reference];
                produits[reference].prix = prix;

                const carte = document.querySelector(
                    '.commande-card[data-produit="' +
                    reference + '"]'
                );

                if (!carte) return;

                carte.dataset.prix = String(prix);

                // Actualiser le prix affiché sur la carte.
                const prixTexte = carte.querySelector("p strong");

                if (prixTexte) {
                    let unite = "";

                    if (reference === "foie-gras") {
                        unite = " / 200 g";
                    } else if (
                        reference === "viande-sechee" ||
                        reference === "lard-sec" ||
                        reference === "saumon-fume"
                    ) {
                        unite = " / 100 g";
                    }

                    prixTexte.textContent =
                        prix.toFixed(2) + " CHF" + unite;
                }
            });

            console.log("Prix chargés :", reponse.prices);
            finir(true);
        };

        script.onerror = function() {
            console.error("Impossible de charger les prix.");
            finir(false);
        };

        const params = new URLSearchParams({
            action: "getPrices",
            callback: callback
        });

        script.src = URL_PRIX + "?" + params.toString();
        document.head.appendChild(script);
    });
}

// ======================================
// INITIALISATION
// ======================================

document.addEventListener("DOMContentLoaded", async () => {
    const prixCharges = await chargerPrixCommande();

    if (!prixCharges) {
        alert(
            "Impossible de charger les prix actuels. " +
            "Rechargez la page avant de passer commande."
        );
        return;
    }

    initialiserBoutonsPanier();
    afficherPanier();

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
});

// ======================================
// BOUTONS D'AJOUT AU PANIER
// ======================================

function initialiserBoutonsPanier() {
    const boutons =
        document.querySelectorAll(".ajouter-panier");

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
        case "lard-sec": {
            const idPoids =
                reference === "viande-sechee"
                    ? "viandePoids"
                    : "lardPoids";

            const champPoids =
                document.getElementById(idPoids);

            const valeurPoids = champPoids
                ? String(champPoids.value || "")
                : "";

            const poidsChoisi = Number(valeurPoids);

            if (
                !Number.isInteger(poidsChoisi) ||
                poidsChoisi < 500 ||
                poidsChoisi > 3000 ||
                poidsChoisi % 100 !== 0
            ) {
                alert(
                    "Veuillez choisir un poids approximatif " +
                    "d’au moins 500 g (par tranches de 100 g) pour " +
                    (
                        reference === "viande-sechee"
                            ? "la viande séchée."
                            : "le lard sec."
                    )
                );
                return;
            }

            // Le poids sélectionné est une estimation.
            article.poidsMin = poidsChoisi;
            article.poidsMax = poidsChoisi;
            article.poids = poidsChoisi;
            article.quantite = 1;

            // Tarif dynamique chargé depuis l'administration.
            article.prixPar100g = produit.prix;

            article.prixIndicatif = Number(
                (
                    poidsChoisi *
                    article.prixPar100g / 100
                ).toFixed(2)
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
        reference !== "viande-sechee" &&
        reference !== "lard-sec" &&
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

    if (
        article.reference === "viande-sechee" ||
        article.reference === "lard-sec"
    ) {
        existant.prixPar100g = produits[article.reference].prix;
        existant.prixIndicatif = existant.prix;
    }
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
        const tarif = produit.prix;
        const poidsMin =
            Number(article.poidsMin || article.poids || 0);

        return Number(
            (poidsMin * tarif / 100).toFixed(2)
        );
    }

    if (article.reference === "saumon-fume") {
        return Number(
            (
                produit.prix *
                Number(article.poids) / 100
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
// RECETTE ET LECTURE DES CHAMPS
// ======================================

function getRecette(carte) {
    if (!carte) {
        return "";
    }

    const choix =
        carte.querySelector(".choix-recette input:checked");

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
    const champ =
        document.getElementById("saumonPoids");

    if (!champ) {
        return 0;
    }

    return Number(champ.value) || 0;
}

// ======================================
// AFFICHAGE DU PANIER
// ======================================

function afficherPanier() {
    const zone =
        document.getElementById("recapCommande");

    const totalZone =
        document.getElementById("total");

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
            quantiteAffichee =
                article.poidsMin === article.poidsMax
                    ? "Environ " + article.poidsMin + " g"
                    : article.poidsMin + "–" +
                      article.poidsMax + " g";
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

    if (
        article.reference === "saumon-fume" &&
        article.poids
    ) {
        texte += article.poids + " g";
    }

    if (
        (
            article.reference === "viande-sechee" ||
            article.reference === "lard-sec"
        ) &&
        article.poidsMin &&
        article.poidsMax
    ) {
        texte +=
            article.poidsMin === article.poidsMax
                ? "Poids souhaité : environ " +
                  article.poidsMin + " g"
                : "Fourchette choisie : " +
                  article.poidsMin + "–" +
                  article.poidsMax + " g";

        texte +=
            "<br>Prix estimatif : " +
            Number(
                article.prixIndicatif || article.prix || 0
            ).toFixed(2) +
            " CHF";
    }

    return texte;
}

// ======================================
// TITRE DU PANIER
// ======================================

function mettreAJourTitrePanier(nombre) {
    const titre =
        document.getElementById("titrePanier");

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

const URL_COMPTEUR_COMMANDES = URL_PRIX;

function obtenirNumeroCommande(nomClient, annee) {
    return new Promise((resolve, reject) => {
        const callback =
            "igNumeroCommande_" + Date.now() + "_" +
            Math.floor(Math.random() * 100000);

        const script = document.createElement("script");

        const timeout = setTimeout(() => {
            nettoyer();
            reject(
                new Error(
                    "Délai dépassé lors de la réservation du numéro."
                )
            );
        }, 15000);

        function nettoyer() {
            clearTimeout(timeout);
            delete window[callback];

            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        }

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

        script.src =
            URL_COMPTEUR_COMMANDES + "?" + params.toString();

        document.head.appendChild(script);
    });
}

// ======================================
// IDENTIFIANT STABLE POUR LES NOUVELLES TENTATIVES
// ======================================

const CLE_COMMANDE_EN_ATTENTE = "ig_commande_en_attente_v1";
let commandeEnAttenteMemoire = null;

function empreinteCommande(commande) {
    // Inclure les coordonnées, les produits et les montants : toute modification
    // réelle du contenu crée une nouvelle tentative distincte.
    return JSON.stringify({
        client: commande.client,
        produits: commande.produits,
        total: commande.total
    });
}

function lireTouteCommandeEnAttente() {
    try {
        const brut = localStorage.getItem(CLE_COMMANDE_EN_ATTENTE);
        const attente = brut
            ? JSON.parse(brut)
            : commandeEnAttenteMemoire;

        return attente &&
            typeof attente.empreinte === "string" &&
            typeof attente.idCommande === "string" &&
            typeof attente.numeroCommande === "string"
                ? attente
                : null;
    } catch (erreur) {
        console.warn("Lecture de la commande en attente impossible :", erreur);
        const attente = commandeEnAttenteMemoire;
        return attente &&
            typeof attente.empreinte === "string" &&
            typeof attente.idCommande === "string" &&
            typeof attente.numeroCommande === "string"
                ? attente
                : null;
    }
}

function lireCommandeEnAttente(empreinte) {
    const attente = lireTouteCommandeEnAttente();
    return attente && attente.empreinte === empreinte
        ? attente
        : null;
}

function sauvegarderCommandeEnAttente(attente) {
    const valeur = JSON.stringify(attente);
    try {
        localStorage.setItem(CLE_COMMANDE_EN_ATTENTE, valeur);
        if (localStorage.getItem(CLE_COMMANDE_EN_ATTENTE) !== valeur) {
            throw new Error("La commande en attente n'a pas pu être vérifiée dans le stockage local.");
        }
        commandeEnAttenteMemoire = attente;
        return true;
    } catch (erreur) {
        // Ne jamais transmettre une commande si son identifiant de reprise
        // ne survivra pas à un rechargement ou à la fermeture du navigateur.
        commandeEnAttenteMemoire = null;
        console.warn("Sauvegarde durable de la commande en attente impossible :", erreur);
        return false;
    }
}

function effacerCommandeEnAttente(idCommande) {
    if (
        commandeEnAttenteMemoire &&
        commandeEnAttenteMemoire.idCommande === idCommande
    ) {
        commandeEnAttenteMemoire = null;
    }
    try {
        const attente = JSON.parse(
            localStorage.getItem(CLE_COMMANDE_EN_ATTENTE) || "null"
        );
        if (attente && attente.idCommande === idCommande) {
            localStorage.removeItem(CLE_COMMANDE_EN_ATTENTE);
        }
    } catch (erreur) {
        console.warn("Nettoyage de la commande en attente impossible :", erreur);
    }
}

// ======================================
// ENVOYER LA COMMANDE
// ======================================

async function envoyerCommandeInterne(e) {
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
            nomExpediteurTwint:
                getValue("nomExpediteurTwint")
        },

        produits: panierCommande.map(article => ({ ...article })),

        total: panierCommande.reduce(
            (somme, article) =>
                somme + (Number(article.prix) || 0),
            0
        )
    };

    // Réutiliser l'identifiant ET le numéro si le même contenu est renvoyé.
    // Cela permet au récepteur de reconnaître une retransmission après une
    // interruption réseau, un rechargement ou une fermeture de Safari.
    const empreinte = empreinteCommande(commande);
    const commandeEnAttenteExistante = lireTouteCommandeEnAttente();

    // Une commande précédente non confirmée doit être réconciliée avant
    // toute modification du panier ou des coordonnées. Créer un nouvel ID
    // ici pourrait enregistrer une seconde commande alors que la première
    // a déjà atteint Sheets ou déclenché un e-mail.
    if (
        commandeEnAttenteExistante &&
        commandeEnAttenteExistante.empreinte !== empreinte
    ) {
        alert(
            "Une commande précédente est toujours en attente de vérification. " +
            "Pour éviter un doublon, aucune nouvelle commande n'a été créée. " +
            "Vérifiez d'abord la réception de la commande précédente."
        );
        return;
    }

    const commandeEnAttente = commandeEnAttenteExistante;

    if (commandeEnAttente) {
        commande.id = commandeEnAttente.idCommande;
        commande.numeroCommande = commandeEnAttente.numeroCommande;
        console.info("Reprise de la même commande :", commande.id);
    } else {
        commande.id =
            "IG-" + Date.now().toString(36).toUpperCase();

        // Numéro lisible et séquentiel : attribué une seule fois par commande.
        try {
            commande.numeroCommande =
                await obtenirNumeroCommande(
                    (
                        commande.client.prenom + " " +
                        commande.client.nom
                    ).trim() || "Commande",
                    new Date().getFullYear()
                );
        } catch (erreurNumero) {
            console.error(
                "Impossible d'obtenir le numéro de commande :",
                erreurNumero
            );

            alert(
                "Le numéro de commande n'a pas pu être attribué. " +
                "Aucune commande n'a été enregistrée. " +
                "Réessaie dans quelques instants."
            );
            return;
        }

        const sauvegardeDurable = sauvegarderCommandeEnAttente({
            empreinte: empreinte,
            idCommande: commande.id,
            numeroCommande: String(commande.numeroCommande)
        });
        if (!sauvegardeDurable) {
            alert(
                "La commande n'a pas été envoyée : le navigateur ne peut pas " +
                "conserver son identifiant de reprise. Libérez de l'espace ou " +
                "autorisez le stockage du site, puis réessayez. Aucun envoi " +
                "n'a été lancé."
            );
            return;
        }
    }

    console.log("COMMANDE PRÉPARÉE :", commande);

    // Le site public ne modifie jamais la base locale de l'appareil.
    // Les commandes, le stock et la production sont gérés par le module central.
    // La confirmation de réception repose sur le suivi Apps Script
    // dans genererPDFCommande(). En cas d'échec ou de statut incertain, le
    // panier reste intact et aucune déduction de stock locale n'est effectuée.
    // ==================================
    // PDF ET DEMANDE D'ENVOI PAR E-MAIL
    // ==================================

    let envoiOK = false;
    let erreurEnvoi = "";
    let receptionConfirmee = false;
    try {
        if (
            typeof window.genererPDFCommande !== "function"
        ) {
            throw new Error(
                "Le module PDF n'est pas chargé. " +
                "Vérifiez js/pdfcommande.js."
            );
        }

        const estIOS =
            /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

        const resultatEmail =
            await window.genererPDFCommande(commande, {
                envoyerEmail: true,
                typeEmail: "nouvelle-commande",
                telecharger: !estIOS,
                afficher: !estIOS
            });
        receptionConfirmee =
            resultatEmail &&
            resultatEmail.receptionConfirmee === true;
        envoiOK = Boolean(
            resultatEmail &&
            resultatEmail.ok &&
            resultatEmail.transmis &&
            resultatEmail.envoiConfirme === true
        );

        if (!envoiOK) {
            erreurEnvoi =
                resultatEmail && resultatEmail.message
                    ? resultatEmail.message
                    : "La transmission de la demande d'e-mail " +
                      "n'a pas été confirmée.";
        }
    } catch (erreur) {
        console.error("Erreur PDF / e-mail :", erreur);

        erreurEnvoi = erreur && erreur.message
            ? erreur.message
            : String(erreur);
    }

    if (envoiOK) {
        // Vider le panier uniquement après confirmation des deux e-mails.
        effacerCommandeEnAttente(commande.id);
        panierCommande.length = 0;
        window.panierCommande = panierCommande;
        afficherPanier();

        // Réinitialiser les champs du formulaire client.
    const formulaire = document.getElementById("formCommande");
    if (formulaire) {
        formulaire.reset();
    }
        
        alert(
            "Commande enregistrée. Apps Script confirme que les deux e-mails " +
            "ont été envoyés (entreprise et client)."
        );
    
} else {
    // Conserver les articles dans le panier.
    // Ne jamais affirmer que la commande est enregistrée sans statut Apps Script.
    alert(
        (
            receptionConfirmee
                ? "Votre demande a été reçue, mais les deux e-mails ne sont pas encore confirmés.\n\n"
                : "Attention : la réception de votre demande n'est pas confirmée.\n\n"
        ) +
        "Votre panier est conservé.\n\n" +
        (
            receptionConfirmee
                ? "Ne renvoyez pas la commande une seconde fois avant d'avoir vérifié les e-mails.\n\n"
                : "Ne renvoyez pas la commande avant d'avoir vérifié son statut dans Apps Script et Gmail.\n\n"
        ) +
        (
            erreurEnvoi ||
            "Vérifiez la configuration du service d'e-mail."
        )
    );
}

}

// Empêche les doubles clics pendant l'enregistrement et le suivi de l'envoi.
let commandeEnCours = false;

async function envoyerCommande(e) {
    if (commandeEnCours) {
        if (e && typeof e.preventDefault === "function") e.preventDefault();
        return;
    }

    commandeEnCours = true;
    try {
        await envoyerCommandeInterne(e);
    } finally {
        commandeEnCours = false;
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
