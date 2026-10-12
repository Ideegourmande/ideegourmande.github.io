/* =========================================================
IDEE GOURMANDE — BASE DE DONNEES CENTRALE
Version 3.3.2

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
const VERSION_DATABASE = "3.3.2";

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

function estObjetValide(valeur) {
return valeur !== null &&
typeof valeur === "object" &&
!Array.isArray(valeur);
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
// CHARGEMENT DE LA BASE
// =========================================================

let db = null;

try {
const contenu = localStorage.getItem(CLE_BASE);
if (contenu) db = JSON.parse(contenu);
} catch (erreur) {
console.error("Erreur de lecture de la base.", erreur);
}

if (!estObjetValide(db)) {
db = creerStructureDB();
}

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

function securiserTexte(texte) {
return String(texte || "")
.replace(/&/g, "&")
.replace(/</g, "<")
.replace(/>/g, ">")
.replace(/"/g, """)
.replace(/'/g, "'");
}

function obtenirDB() {
return db;
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

function obtenirIdentifiantCommandeMigration(commande) {
if (!commande || typeof commande !== "object") return "";
return String(commande.id || commande.numero || "").trim();
}

function commandeExisteDeja(liste, commande) {
if (!Array.isArray(liste) || !commande) return false;

```
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
```

}

// =========================================================
// MIGRATION DES ANCIENNES DONNEES
// =========================================================

function migrerAnciennesCommandes() {
let anciennes = [];

```
try {
    const contenu = localStorage.getItem(CLE_ANCIENNES_COMMANDES);
    if (!contenu) return 0;

    const donnees = JSON.parse(contenu);
    if (Array.isArray(donnees)) anciennes = donnees;
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

localStorage.removeItem(CLE_ANCIENNES_COMMANDES);
return ajoutees;
```

}

function migrerAnciennesArchives() {
let anciennes = [];

```
try {
    const contenu = localStorage.getItem(CLE_ANCIENNES_ARCHIVES);
    if (!contenu) return 0;

    const donnees = JSON.parse(contenu);
    if (Array.isArray(donnees)) anciennes = donnees;
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

localStorage.removeItem(CLE_ANCIENNES_ARCHIVES);
return ajoutees;
```

}

function migrerAnciennesDonnees() {
migrerAnciennesCommandes();
migrerAnciennesArchives();
db.parametres.versionDatabase = VERSION_DATABASE;
sauvegarderDB();

```
console.log("Migration terminée.", {
    commandes: db.commandes.length,
    archives: db.archives.length,
    version: VERSION_DATABASE
});
```

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
// PRODUITS DONT LE STOCK DEPEND DU POIDS REEL
// =========================================================

function estProduitAPoidsReel(articleCommande) {
const reference = normaliserReference(
articleCommande && articleCommande.reference
);

```
return reference === "viande-sechee" ||
    reference === "lard-sec";
```

}

// =========================================================
// RECHERCHE D'UN ARTICLE EN STOCK
// =========================================================

function trouverArticleStock(articleCommande) {
if (!articleCommande || !Array.isArray(db.articles)) return null;

```
const reference = normaliserReference(articleCommande.reference);
const recette = normaliserRecette(articleCommande.recette);
const nomCommande = normaliserNomArticle(articleCommande.nom);
const correspondance = correspondancesProduits[reference];

if (correspondance && typeof correspondance === "object") {
    const nomCorrespondant = correspondance[recette];

    if (nomCorrespondant) {
        const article = db.articles.find(function (element) {
            return normaliserNomArticle(element.nom) ===
                normaliserNomArticle(nomCorrespondant);
        });

        if (article) return article;
    }
}

if (typeof correspondance === "string") {
    const article = db.articles.find(function (element) {
        return normaliserNomArticle(element.nom) ===
            normaliserNomArticle(correspondance);
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
        if (recette.includes("figue")) {
            return (nom.includes("foie gras") || nom.includes("fois gras"))
                && nom.includes("figue");
        }

        return (nom.includes("foie gras") || nom.includes("fois gras"))
            && (nom.includes("piment") || nom.includes("pimet"));
    }

    if (reference === "magret") {
        if (recette.includes("herbe")) {
            return nom.includes("magret") && nom.includes("herbe");
        }

        return nom.includes("magret")
            && (nom.includes("piment") || nom.includes("pimet"));
    }

    if (reference === "saumon-fume") {
        if (recette.includes("aneth")) {
            return nom.includes("saumon") && nom.includes("aneth");
        }

        return nom.includes("saumon")
            && (nom.includes("piment") || nom.includes("pimet"));
    }

    return false;
}) || null;
```

}

// =========================================================
// CALCUL DES QUANTITES DE STOCK
// =========================================================

function calculerQuantiteCommande(articleCommande, articleStock) {
if (!articleCommande) return 0;

```
const reference = normaliserReference(articleCommande.reference);
const nomStock = normaliserNomArticle(articleStock ? articleStock.nom : "");
const quantite = Number(articleCommande.quantite) || 0;

if (reference === "viande-sechee" || reference === "lard-sec") {
    return Math.max(0, Number(articleCommande.poidsReel) || 0);
}

if (reference === "saumon-fume") {
    return Math.max(0, Number(articleCommande.poids) || 0);
}

if (nomStock.includes("foie gras") || nomStock.includes("fois gras")) {
    return quantite * 200;
}

if (nomStock.includes("magret")) {
    return quantite;
}

return quantite;
```

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

```
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
```

}

// =========================================================
// ACHATS AUTOMATIQUES
// =========================================================

function trouverAchatAutomatique(article) {
if (!article || !Array.isArray(db.achats)) return null;

```
return db.achats.find(function (achat) {
    return achat.automatique === true
        && achat.statut !== "Réceptionné"
        && Array.isArray(achat.articles)
        && achat.articles.some(function (ligne) {
            return normaliserNomArticle(ligne.article) ===
                normaliserNomArticle(article.nom);
        });
}) || null;
```

}

function recalculerTotalAchat(achat) {
if (!achat || !Array.isArray(achat.articles)) return;

```
achat.total = achat.articles.reduce(function (total, ligne) {
    return total
        + (Number(ligne.quantite) || 0)
        * (Number(ligne.prix) || 0);
}, 0);
```

}

function creerOuCompleterAchatAutomatique(article, quantite) {
if (!article || Number(quantite) <= 0) return null;

```
quantite = Number(quantite);
let achat = trouverAchatAutomatique(article);

if (achat) {
    if (!Array.isArray(achat.articles)) achat.articles = [];

    let ligne = achat.articles.find(function (element) {
        return normaliserNomArticle(element.article) ===
            normaliserNomArticle(article.nom);
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
```

}

// =========================================================
// TRAITEMENT DU STOCK PAR LIGNE
// =========================================================

function traiterStockCommande(commande) {
if (!commande) return false;

```
if (
    commande.stockTraite === true &&
    !Array.isArray(commande.stockLignesTraitees)
) {
    return true;
}

const produits = Array.isArray(commande.produitsListe)
    ? commande.produitsListe
    : (Array.isArray(commande.produits) ? commande.produits : []);

if (produits.length === 0) {
    commande.stockTraite = false;
    commande.stockErreur = true;
    commande.stockErreurMessage = "Aucun produit dans la commande.";
    commande.stockErreurDate = new Date().toLocaleString("fr-FR");
    sauvegarderDB();
    return false;
}

if (!Array.isArray(commande.stockLignesTraitees)) {
    commande.stockLignesTraitees = [];
}

let erreurRencontree = false;
let poidsEnAttente = false;

for (let index = 0; index < produits.length; index++) {
    const ligne = produits[index];

    if (!ligne) continue;
    if (commande.stockLignesTraitees.includes(index)) continue;

    if (estProduitAPoidsReel(ligne) && !(Number(ligne.poidsReel) > 0)) {
        poidsEnAttente = true;
        continue;
    }

    const articleStock = trouverArticleStock(ligne);

    if (!articleStock) {
        erreurRencontree = true;
        commande.stockErreurMessage =
            "Article introuvable dans le stock : " +
            (ligne.nom || ligne.reference || "Article inconnu");
        commande.stockErreurDate = new Date().toLocaleString("fr-FR");
        continue;
    }

    const demande = calculerQuantiteCommande(ligne, articleStock);

    if (!(demande > 0)) {
        commande.stockLignesTraitees.push(index);
        sauvegarderDB();
        continue;
    }

    const ancienStock = Number(articleStock.stock) || 0;
    const stockDisponible = Math.max(0, ancienStock);
    const consommation = Math.min(stockDisponible, demande);
    const manque = Math.max(0, demande - consommation);
    const nouveauStock = Math.max(0, ancienStock - consommation);

    articleStock.stock = nouveauStock;

    if (consommation > 0) {
        enregistrerMouvementCommande(
            articleStock,
            ancienStock,
            nouveauStock,
            consommation,
            commande
        );
    }

    if (manque > 0) {
        creerOuCompleterAchatAutomatique(articleStock, manque);
    }

    commande.stockLignesTraitees.push(index);
    sauvegarderDB();
}

commande.stockEnAttentePoids = poidsEnAttente;
commande.stockErreur = erreurRencontree;

if (erreurRencontree) {
    commande.stockTraite = false;
    sauvegarderDB();
    return false;
}

commande.stockErreurMessage = "";

commande.stockTraite =
    commande.stockLignesTraitees.length === produits.length &&
    !poidsEnAttente;

if (commande.stockTraite) {
    commande.stockTraiteDate = new Date().toLocaleString("fr-FR");
}

sauvegarderDB();
return true;
```

}

// =========================================================
// ENREGISTREMENT DU POIDS REEL ET DU PRIX FINAL MANUEL
// =========================================================
//
// Seuls la viande séchée et le lard sec sont concernés.
// Chaque prix doit respecter le plafond annoncé.
// Le stock d'une ligne déjà traitée ne peut pas être déduit
// une seconde fois ni modifié par cette fonction.
// =========================================================

function finaliserPoidsReelCommande(idCommande, poidsParLigne, prixParLigne) {
const commande = db.commandes.find(function (element) {
return String(element.id || element.numero || "") ===
String(idCommande);
});

```
if (!commande) {
    console.warn("Commande introuvable :", idCommande);
    return false;
}

const produits = Array.isArray(commande.produitsListe)
    ? commande.produitsListe
    : (Array.isArray(commande.produits) ? commande.produits : []);

if (!produits.length) {
    console.warn("La commande ne contient aucun article.");
    return false;
}

if (!estObjetValide(poidsParLigne) || !estObjetValide(prixParLigne)) {
    return false;
}

const lignesAValider = [];
const indicesSoumis = new Set();

for (const cle in poidsParLigne) {
    if (!Object.prototype.hasOwnProperty.call(poidsParLigne, cle)) {
        continue;
    }

    if (!/^(0|[1-9]\d*)$/.test(cle)) {
        return false;
    }

    const index = Number(cle);
    const poids = Number(poidsParLigne[cle]);

    if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= produits.length ||
        !estProduitAPoidsReel(produits[index]) ||
        !Number.isFinite(poids) ||
        poids <= 0
    ) {
        return false;
    }

    if (!Object.prototype.hasOwnProperty.call(prixParLigne, cle)) {
        console.warn("Prix final manquant pour la ligne", index);
        return false;
    }

    const prix = Number(prixParLigne[cle]);

    if (!Number.isFinite(prix) || prix < 0) {
        console.warn("Prix final invalide pour la ligne", index);
        return false;
    }

    const ligne = produits[index];
    const reference = normaliserReference(ligne.reference);
    const tarifPar100g = reference === "viande-sechee" ? 9 : 4;
    const quantite = Math.max(1, Number(ligne.quantite) || 1);

    const plafondAnnonce = Number(ligne.prixPlafond);
    const plafondPoids =
        (Number(ligne.poidsMax) || 0) / 100 *
        tarifPar100g *
        quantite;

    const plafond =
        Number.isFinite(plafondAnnonce) && plafondAnnonce > 0
            ? plafondAnnonce
            : plafondPoids;

    if (!(plafond > 0) || prix > plafond + 0.0001) {
        console.warn("Prix final supérieur au plafond autorisé.", {
            ligne: index,
            prix: prix,
            plafond: plafond
        });
        return false;
    }

    const dejaTraitee =
        Array.isArray(commande.stockLignesTraitees) &&
        commande.stockLignesTraitees.includes(index);

    const ancienPoids = Number(ligne.poidsReel) || 0;
    const ancienPrix = Number(
        ligne.prixFinal !== undefined && ligne.prixFinal !== null
            ? ligne.prixFinal
            : ligne.prix
    );

    if (
        dejaTraitee &&
        (
            Math.abs(ancienPoids - poids) > 0.0001 ||
            !Number.isFinite(ancienPrix) ||
            Math.abs(ancienPrix - prix) > 0.0001
        )
    ) {
        console.warn(
            "Modification refusée : le stock de cette ligne a déjà été traité.",
            index
        );
        return false;
    }

    lignesAValider.push({
        index: index,
        ligne: ligne,
        poids: poids,
        prix: Math.round(prix * 100) / 100
    });

    indicesSoumis.add(index);
}

if (lignesAValider.length === 0) {
    console.warn("Aucune ligne de poids réel à valider.");
    return false;
}

// Vérifier également les lignes déjà saisies précédemment.
// Une ligne déjà finalisée peut être omise du formulaire si ses
// données restent valides et que son stock a déjà été traité.
for (let index = 0; index < produits.length; index++) {
    const ligne = produits[index];

    if (!estProduitAPoidsReel(ligne) || indicesSoumis.has(index)) {
        continue;
    }

    const poidsExistant = Number(ligne.poidsReel);
    const prixExistant = Number(
        ligne.prixFinal !== undefined && ligne.prixFinal !== null
            ? ligne.prixFinal
            : ligne.prix
    );

    const dejaTraitee =
        Array.isArray(commande.stockLignesTraitees) &&
        commande.stockLignesTraitees.includes(index);

    const reference = normaliserReference(ligne.reference);
    const tarifPar100g = reference === "viande-sechee" ? 9 : 4;
    const quantite = Math.max(1, Number(ligne.quantite) || 1);
    const plafondAnnonce = Number(ligne.prixPlafond);
    const plafondPoids =
        (Number(ligne.poidsMax) || 0) / 100 *
        tarifPar100g *
        quantite;

    const plafond =
        Number.isFinite(plafondAnnonce) && plafondAnnonce > 0
            ? plafondAnnonce
            : plafondPoids;

    if (
        !dejaTraitee ||
        !Number.isFinite(poidsExistant) ||
        poidsExistant <= 0 ||
        !Number.isFinite(prixExistant) ||
        prixExistant < 0 ||
        !(plafond > 0) ||
        prixExistant > plafond + 0.0001
    ) {
        console.warn("Une ligne de poids réel reste à confirmer.", index);
        return false;
    }
}

// Vérifier la disponibilité des références de stock avant d'appliquer
// les nouveaux poids et prix aux lignes non encore traitées.
for (const element of lignesAValider) {
    const dejaTraitee =
        Array.isArray(commande.stockLignesTraitees) &&
        commande.stockLignesTraitees.includes(element.index);

    if (!dejaTraitee && !trouverArticleStock(element.ligne)) {
        commande.stockErreur = true;
        commande.stockErreurMessage =
            "Article introuvable dans le stock : " +
            (element.ligne.nom || element.ligne.reference || "Article inconnu");
        commande.stockErreurDate = new Date().toLocaleString("fr-FR");
        commande.prixConfirme = false;
        sauvegarderDB();
        console.warn(commande.stockErreurMessage);
        return false;
    }
}

// Toutes les nouvelles valeurs ont été validées.
lignesAValider.forEach(function (element) {
    element.ligne.poidsReel = element.poids;
    element.ligne.prixFinal = element.prix;
    element.ligne.prix = element.prix;
});

commande.prixConfirme = false;
commande.dateConfirmationPrix = null;

const resultatStock = traiterStockCommande(commande);

const poidsManquants = produits.some(function (ligne) {
    if (!estProduitAPoidsReel(ligne)) return false;

    const poids = Number(ligne.poidsReel);
    const prix = Number(
        ligne.prixFinal !== undefined && ligne.prixFinal !== null
            ? ligne.prixFinal
            : ligne.prix
    );

    return !Number.isFinite(poids) ||
        poids <= 0 ||
        !Number.isFinite(prix) ||
        prix < 0;
});

if (poidsManquants) {
    commande.prixConfirme = false;
    sauvegarderDB();
    return false;
}

if (resultatStock === false || commande.stockErreur === true) {
    commande.prixConfirme = false;
    sauvegarderDB();
    return false;
}

const totalProduits = produits.reduce(function (total, ligne) {
    const prixLigne = estProduitAPoidsReel(ligne)
        ? Number(ligne.prixFinal)
        : Number(ligne.prix);

    return total + (
        Number.isFinite(prixLigne) && prixLigne >= 0
            ? prixLigne
            : 0
    );
}, 0);

const fraisLivraison =
    commande.modeLivraison === "Livraison en Suisse" ? 10.50 : 0;

const totalFinal =
    Math.round((totalProduits + fraisLivraison) * 100) / 100;

if (!Number.isFinite(totalFinal) || totalFinal <= 0) {
    commande.prixConfirme = false;
    sauvegarderDB();
    return false;
}

// Synchroniser les champs de total pour éviter les divergences
// entre les différentes versions de l'administration et du PDF.
commande.total = totalFinal;
commande.totalFinal = totalFinal;
commande.total_final = totalFinal;
commande.fraisLivraison = fraisLivraison;
commande.prixConfirme = true;
commande.paiementConfirme = false;
commande.paiementEnAttente = true;
commande.dateConfirmationPrix = new Date().toISOString();

if (!sauvegarderDB()) {
    commande.prixConfirme = false;
    return false;
}

return true;
```

}

// =========================================================
// CLIENTS
// =========================================================

function enregistrerClientCommande(commande) {
if (!commande) return;
if (!Array.isArray(db.clients)) db.clients = [];

```
const email = String(commande.email || "").trim().toLowerCase();

const clientExiste = email
    ? db.clients.find(function (client) {
        return String(client.email || "").trim().toLowerCase() === email;
    })
    : null;

if (clientExiste) {
    if (commande.client) clientExiste.nom = commande.client;
    if (commande.telephone) clientExiste.telephone = commande.telephone;
    if (commande.adresse) clientExiste.adresse = commande.adresse;

    clientExiste.derniereCommande = commande.id || commande.numero || "";
    return;
}

db.clients.push({
    id: commande.id || commande.numero || Date.now(),
    nom: commande.client || "",
    telephone: commande.telephone || "",
    email: commande.email || "",
    adresse: commande.adresse || "",
    derniereCommande: commande.id || commande.numero || ""
});
```

}

// =========================================================
// AJOUT D'UNE COMMANDE
// =========================================================

function ajouterCommande(commande) {
if (!commande) {
console.error("Impossible d'ajouter une commande vide.");
return false;
}

```
if (!Array.isArray(db.commandes)) db.commandes = [];

if (commandeExisteDeja(db.commandes, commande)) {
    console.warn("Commande déjà présente :", commande.id || commande.numero);
    return false;
}

if (!Array.isArray(db.achats)) db.achats = [];
if (!Array.isArray(db.mouvements)) db.mouvements = [];
if (!Array.isArray(db.clients)) db.clients = [];

db.commandes.push(commande);
enregistrerClientCommande(commande);
sauvegarderDB();

const resultatStock = traiterStockCommande(commande);

if (resultatStock === false) {
    commande.stockTraite = false;
    commande.stockErreur = true;
    commande.stockErreurDate = new Date().toLocaleString("fr-FR");
}

sauvegarderDB();
return true;
```

}

// =========================================================
// RETRAITEMENT MANUEL DU STOCK
// =========================================================

function retraiterStockCommande(idCommande) {
const commande = db.commandes.find(function (element) {
return String(element.id || element.numero || "") ===
String(idCommande);
});

```
if (!commande) {
    console.warn("Commande introuvable :", idCommande);
    return false;
}

if (
    commande.stockTraite === true &&
    !Array.isArray(commande.stockLignesTraitees)
) {
    return false;
}

commande.stockErreur = false;
return traiterStockCommande(commande);
```

}

// =========================================================
// RETRAITEMENT AUTOMATIQUE DES ERREURS
// =========================================================

function retraiterAnciennesCommandesEnErreur() {
if (!Array.isArray(db.commandes)) return 0;

```
const commandesEnErreur = db.commandes.filter(function (commande) {
    return commande &&
        commande.stockErreur === true &&
        commande.stockTraite !== true;
});

let traitees = 0;

commandesEnErreur.forEach(function (commande) {
    try {
        commande.stockErreur = false;

        if (traiterStockCommande(commande)) {
            traitees++;
        }
    } catch (erreur) {
        commande.stockTraite = false;
        commande.stockErreur = true;
        commande.stockErreurMessage = erreur && erreur.message
            ? erreur.message
            : String(erreur);
        commande.stockErreurDate = new Date().toLocaleString("fr-FR");
    }
});

sauvegarderDB();
return traitees;
```

}

// =========================================================
// INITIALISATION ET EXPORTS
// =========================================================

migrerAnciennesDonnees();

window.db = db;
window.ajouterCommande = ajouterCommande;
window.sauvegarderDB = sauvegarderDB;
window.traiterStockCommande = traiterStockCommande;
window.retraiterStockCommande = retraiterStockCommande;
window.retraiterAnciennesCommandesEnErreur =
retraiterAnciennesCommandesEnErreur;
window.trouverArticleStock = trouverArticleStock;
window.calculerQuantiteCommande = calculerQuantiteCommande;
window.creerOuCompleterAchatAutomatique = creerOuCompleterAchatAutomatique;
window.normaliserNomArticle = normaliserNomArticle;
window.normaliserRecette = normaliserRecette;
window.normaliserReference = normaliserReference;
window.securiserTexte = securiserTexte;
window.obtenirDB = obtenirDB;
window.migrerAnciennesDonnees = migrerAnciennesDonnees;
window.migrerAnciennesCommandes = migrerAnciennesCommandes;
window.migrerAnciennesArchives = migrerAnciennesArchives;
window.estProduitAPoidsReel = estProduitAPoidsReel;
window.finaliserPoidsReelCommande = finaliserPoidsReelCommande;

retraiterAnciennesCommandesEnErreur();
sauvegarderDB();

console.log("DATABASE.JS CHARGE", {
version: db.parametres.versionDatabase,
commandes: db.commandes.length,
archives: db.archives.length,
articles: db.articles.length,
achats: db.achats.length,
clients: db.clients.length,
mouvements: db.mouvements.length
});
