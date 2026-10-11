
/* =========================================================
   IDEE GOURMANDE — BASE DE DONNEES CENTRALE
   Version 3.2.0

   Commandes, stock, achats automatiques, clients, archives,
   migrations et traitement différé des poids réels.
   Stockage : localStorage du navigateur.
   ========================================================= */

"use strict";

// =========================================================
// CONSTANTES ET STRUCTURE
// =========================================================

const CLE_BASE = "ideeGourmandeDB";
const CLE_ANCIENNES_COMMANDES = "commandes";
const CLE_ANCIENNES_ARCHIVES = "commandesArchivees";
const VERSION_DATABASE = "3.2.0";

const emplacementsDefaut = [
    "Congélateur du réduit",
    "Congélateur bahut",
    "Congélateur GI",
    "Chambre froide",
    "Cave",
    "Réserve sèche"
];

const structureDB = {
    commandes: [],
    articles: [],
    emplacements: [...emplacementsDefaut],
    mouvements: [],
    achats: [],
    sessions: [],
    archives: [],
    clients: [],
    statistiques: {},
    parametres: { versionDatabase: VERSION_DATABASE }
};

function estObjetValide(v) {
    return v !== null && typeof v === "object" && !Array.isArray(v);
}

function creerStructureDB() {
    return {
        commandes: [],
        articles: [],
        emplacements: [...emplacementsDefaut],
        mouvements: [],
        achats: [],
        sessions: [],
        archives: [],
        clients: [],
        statistiques: {},
        parametres: { versionDatabase: VERSION_DATABASE }
    };
}

// =========================================================
// CHARGEMENT ET SECURISATION
// =========================================================

let db = null;

try {
    const contenu = localStorage.getItem(CLE_BASE);
    if (contenu) db = JSON.parse(contenu);
} catch (erreur) {
    console.error("Erreur de lecture de la base principale.", erreur);
}

if (!estObjetValide(db)) db = creerStructureDB();

Object.keys(structureDB).forEach(function (cle) {
    if (db[cle] === undefined || db[cle] === null) {
        db[cle] = Array.isArray(structureDB[cle])
            ? [...structureDB[cle]]
            : { ...structureDB[cle] };
    }
});

[
    "commandes", "articles", "emplacements", "mouvements",
    "achats", "sessions", "archives", "clients"
].forEach(function (cle) {
    if (!Array.isArray(db[cle])) db[cle] = [];
});

if (!estObjetValide(db.statistiques)) db.statistiques = {};
if (!estObjetValide(db.parametres)) db.parametres = {};

db.parametres.versionDatabase = VERSION_DATABASE;

if (db.emplacements.length === 0) {
    db.emplacements = [...emplacementsDefaut];
}

// =========================================================
// OUTILS
// =========================================================

function normaliserNomArticle(nom) {
    return String(nom || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function normaliserRecette(recette) {
    return normaliserNomArticle(recette)
        .replace(/\bpimets\b/g, "piments")
        .trim();
}

function normaliserReference(reference) {
    return String(reference || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
}

function obtenirIdentifiantCommandeMigration(commande) {
    if (!commande || typeof commande !== "object") return "";
    return String(commande.id || commande.numero || "").trim();
}

function commandeExisteDeja(liste, commande) {
    if (!Array.isArray(liste) || !commande) return false;

    const id = obtenirIdentifiantCommandeMigration(commande);

    if (id) {
        return liste.some(function (element) {
            return obtenirIdentifiantCommandeMigration(element) === id;
        });
    }

    return liste.some(function (element) {
        if (!element) return false;

        return String(element.client || "").trim().toLowerCase()
                === String(commande.client || "").trim().toLowerCase()
            && String(element.email || "").trim().toLowerCase()
                === String(commande.email || "").trim().toLowerCase()
            && String(element.date || "") === String(commande.date || "")
            && Number(element.total || 0) === Number(commande.total || 0);
    });
}

function sauvegarderDB() {
    try {
        localStorage.setItem(CLE_BASE, JSON.stringify(db));
        return true;
    } catch (erreur) {
        console.error("Erreur de sauvegarde de la base.", erreur);
        return false;
    }
}

function obtenirDB() {
    return db;
}

function securiserTexte(texte) {
    return String(texte || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// =========================================================
// MIGRATIONS ANCIENNES COMMANDES ET ARCHIVES
// =========================================================

function migrerAnciennesCommandes() {
    let anciennes = [];

    try {
        const contenu = localStorage.getItem(CLE_ANCIENNES_COMMANDES);
        if (contenu) {
            const donnees = JSON.parse(contenu);
            if (Array.isArray(donnees)) anciennes = donnees;
        }
    } catch (erreur) {
        console.error("Erreur de lecture des anciennes commandes.", erreur);
        return 0;
    }

    let ajoutees = 0;

    anciennes.forEach(function (commande) {
        if (commande && !commandeExisteDeja(db.commandes, commande)) {
            db.commandes.push(commande);
            ajoutees++;
        }
    });

    if (anciennes.length > 0) {
        localStorage.removeItem(CLE_ANCIENNES_COMMANDES);
    }

    return ajoutees;
}

function migrerAnciennesArchives() {
    let anciennes = [];

    try {
        const contenu = localStorage.getItem(CLE_ANCIENNES_ARCHIVES);
        if (contenu) {
            const donnees = JSON.parse(contenu);
            if (Array.isArray(donnees)) anciennes = donnees;
        }
    } catch (erreur) {
        console.error("Erreur de lecture des anciennes archives.", erreur);
        return 0;
    }

    let ajoutees = 0;

    anciennes.forEach(function (archive) {
        if (archive && !commandeExisteDeja(db.archives, archive)) {
            db.archives.push(archive);
            ajoutees++;
        }
    });

    if (anciennes.length > 0) {
        localStorage.removeItem(CLE_ANCIENNES_ARCHIVES);
    }

    return ajoutees;
}

function migrerAnciennesDonnees() {
    migrerAnciennesCommandes();
    migrerAnciennesArchives();
    db.parametres.versionDatabase = VERSION_DATABASE;
    sauvegarderDB();

    console.log("Migration terminée.", {
        commandes: db.commandes.length,
        archives: db.archives.length,
        version: VERSION_DATABASE
    });
}

// =========================================================
// CORRESPONDANCES DES PRODUITS
// =========================================================

const correspondancesProduits = {
    "foie-gras": {
        piment: "foie gras aux piments",
        piments: "foie gras aux piments",
        pimets: "foie gras aux piments",
        "aux piment": "foie gras aux piments",
        "aux piments": "foie gras aux piments",
        "aux pimets": "foie gras aux piments",
        figue: "fois gras aux figues",
        figues: "fois gras aux figues",
        "aux figues": "fois gras aux figues"
    },
    "magret": {
        herbe: "magret aux herbes",
        herbes: "magret aux herbes",
        "aux herbe": "magret aux herbes",
        "aux herbes": "magret aux herbes",
        "au herbe": "magret aux herbes",
        "au herbes": "magret aux herbes",
        piment: "magret aux piments",
        piments: "magret aux piments",
        pimets: "magret aux piments",
        "aux piment": "magret aux piments",
        "aux piments": "magret aux piments",
        "aux pimets": "magret aux piments"
    },
    "viande-sechee": "viande séchée",
    "lard-sec": "lard sec fumé",
    "saumon-fume": {
        piment: "saumon aux piments",
        piments: "saumon aux piments",
        pimets: "saumon aux piments",
        "aux piment": "saumon aux piments",
        "aux piments": "saumon aux piments",
        "aux pimets": "saumon aux piments",
        aneth: "saumon à l'aneth",
        "a l'aneth": "saumon à l'aneth",
        "à l'aneth": "saumon à l'aneth"
    }
};

// =========================================================
// RECHERCHE D'UN ARTICLE EN STOCK
// =========================================================

function trouverArticleStock(articleCommande) {
    if (!articleCommande || !Array.isArray(db.articles)) return null;

    const reference = normaliserReference(articleCommande.reference);
    const recette = normaliserRecette(articleCommande.recette);
    const nomCommande = normaliserNomArticle(articleCommande.nom);
    const correspondance = correspondancesProduits[reference];

    if (correspondance && typeof correspondance === "object") {
        const nomCorrespondant = correspondance[recette];

        if (nomCorrespondant) {
            const article = db.articles.find(function (element) {
                return normaliserNomArticle(element.nom)
                    === normaliserNomArticle(nomCorrespondant);
            });
            if (article) return article;
        }
    }

    if (typeof correspondance === "string") {
        const article = db.articles.find(function (element) {
            return normaliserNomArticle(element.nom)
                === normaliserNomArticle(correspondance);
        });
        if (article) return article;
    }

    const exact = db.articles.find(function (element) {
        return normaliserNomArticle(element.nom) === nomCommande;
    });
    if (exact) return exact;

    return db.articles.find(function (element) {
        const nom = normaliserNomArticle(element.nom);

        if (reference === "viande-sechee") {
            return nom === "viande sechee";
        }

        if (reference === "lard-sec") {
            return nom === "lard sec fume";
        }

        if (reference === "foie-gras") {
            return nom.includes("foie gras") || nom.includes("fois gras");
        }

        if (reference === "magret") {
            return nom.includes("magret");
        }

        if (reference === "saumon-fume") {
            return nom.includes("saumon");
        }

        return false;
    }) || null;
}

// =========================================================
// CALCUL DE LA QUANTITE DE STOCK
// =========================================================
//
// Foie gras : 200 g par pièce
// Viande séchée et lard sec : poids réel traité séparément
// Saumon : poids sélectionné
// Magret : nombre de pièces
// =========================================================

function calculerQuantiteCommande(articleCommande, articleStock) {
    if (!articleCommande) return 0;

    const reference = normaliserReference(articleCommande.reference);
    const nomStock = normaliserNomArticle(articleStock ? articleStock.nom : "");
    const quantite = Number(articleCommande.quantite) || 0;

    if (reference === "viande-sechee" || reference === "lard-sec") {
        return 0;
    }

    if (reference === "saumon-fume") {
        return Number(articleCommande.poids) || 0;
    }

    if (
        nomStock.includes("foie gras") ||
        nomStock.includes("fois gras")
    ) {
        return quantite * 200;
    }

    if (nomStock.includes("magret")) {
        return quantite;
    }

    return quantite;
}

// =========================================================
// MOUVEMENTS DE STOCK
// =========================================================

function enregistrerMouvementCommande(
    article,
    ancienStock,
    nouveauStock,
    consommation,
    commande
) {
    if (!article) return;

    db.mouvements.push({
        id: Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        date: new Date().toLocaleString("fr-FR"),
        action: "Commande client",
        article: article.nom,
        commande: commande ? (commande.id || commande.numero || "") : "",
        ancienStock: ancienStock,
        nouveauStock: nouveauStock,
        difference: -consommation,
        origine: "Commande client"
    });
}

// =========================================================
// ACHATS AUTOMATIQUES
// =========================================================

function trouverAchatAutomatique(article) {
    if (!article || !Array.isArray(db.achats)) return null;

    return db.achats.find(function (achat) {
        return achat.automatique === true
            && achat.statut !== "Réceptionné"
            && Array.isArray(achat.articles)
            && achat.articles.some(function (ligne) {
                return normaliserNomArticle(ligne.article)
                    === normaliserNomArticle(article.nom);
            });
    }) || null;
}

function recalculerTotalAchat(achat) {
    if (!achat || !Array.isArray(achat.articles)) return;

    achat.total = achat.articles.reduce(function (total, ligne) {
        return total
            + (Number(ligne.quantite) || 0)
            * (Number(ligne.prix) || 0);
    }, 0);
}

function creerOuCompleterAchatAutomatique(article, quantite) {
    if (!article || Number(quantite) <= 0) return null;

    quantite = Number(quantite);

    let achat = trouverAchatAutomatique(article);

    if (achat) {
        if (!Array.isArray(achat.articles)) achat.articles = [];

        let ligne = achat.articles.find(function (element) {
            return normaliserNomArticle(element.article)
                === normaliserNomArticle(article.nom);
        });

        if (ligne) {
            ligne.quantite = (Number(ligne.quantite) || 0) + quantite;
        } else {
            achat.articles.push({
                article: article.nom,
                reference: article.reference || "",
                quantite: quantite,
                prix: Number(article.prixAchatMoyen) || 0
            });
        }

        recalculerTotalAchat(achat);
        sauvegarderDB();
        return achat;
    }

    const id = Date.now();

    achat = {
        id: id,
        numero: "ACH-" + id,
        date: new Date().toISOString().split("T")[0],
        fournisseur: "À définir",
        fournisseurId: null,
        articles: [{
            article: article.nom,
            reference: article.reference || "",
            quantite: quantite,
            prix: Number(article.prixAchatMoyen) || 0
        }],
        total: 0,
        statut: "En attente",
        dateReception: null,
        automatique: true,
        origine: "Commande client"
    };

    recalculerTotalAchat(achat);
    db.achats.push(achat);
    sauvegarderDB();

    return achat;
}

// =========================================================
// IDENTIFICATION DES LIGNES A POIDS REEL
// =========================================================

function estProduitA poidsReel(articleCommande) {
    const reference = normaliserReference(articleCommande && articleCommande.reference);
    return reference === "viande-sechee" || reference === "lard-sec";
}
