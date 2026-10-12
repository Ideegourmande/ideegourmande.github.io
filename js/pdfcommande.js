/* ==========================================================
Idée Gourmande — PDF et e-mails des commandes
Version 6.2.0

* Nouvelle commande : prix indicatifs, aucun paiement demandé.
* Confirmation finale : poids réel et prix confirmé.
* Contrôle du plafond annoncé pour la viande séchée et le lard sec.
* PDF joint à l'e-mail du client et copie à Idée Gourmande.
* Impression seule : aucun e-mail envoyé automatiquement.
* Total final cohérent avec celui enregistré dans la commande.
* Aucun double ajout des frais de livraison au total enregistré.
* Les autres produits conservent leur fonctionnement habituel.
  ========================================================== */

(function () {
"use strict";

const URL_SCRIPT_GOOGLE =
"https://script.google.com/macros/s/AKfycby5o5V0dRb9fPpnhmUYCeWB1LxXjGRXfQK0kQ2Tzw2gHK58GQn8VmxlDI1DFWzogAhI/exec";

const NOM_ENTREPRISE = "Idée Gourmande";
const EMAIL_ENTREPRISE = "[ideesgourmandesge@gmail.com](mailto:ideesgourmandesge@gmail.com)";
const NUMERO_TWINT = "079 592 78 82";
const FRAIS_LIVRAISON = 10.50;

const TARIF_VIANDE_SECHEE_100G = 9;
const TARIF_LARD_SEC_100G = 4;

/* ---------- Utilitaires ---------- */

function valeur(valeurInitiale, remplacement = "") {
return valeurInitiale === undefined ||
valeurInitiale === null ||
valeurInitiale === ""
? remplacement
: valeurInitiale;
}

function nombreValide(v) {
if (
v === undefined ||
v === null ||
String(v).trim() === ""
) {
return null;
}

```
const n = Number(String(v).replace(",", "."));

return Number.isFinite(n) ? n : null;
```

}

function montantCHF(nombre) {
const n = Number(nombre);

```
return (
  (Number.isFinite(n) ? n : 0).toLocaleString("fr-CH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + " CHF"
);
```

}

function arrondirCentimes(nombre) {
return Math.round((Number(nombre) + Number.EPSILON) * 100) / 100;
}

function echapperHTML(texte) {
return String(texte ?? "")
.replace(/&/g, "&")
.replace(/</g, "<")
.replace(/>/g, ">")
.replace(/"/g, """)
.replace(/'/g, "'");
}

/* ---------- Données de la commande ---------- */

function obtenirClient(commande) {
const client =
commande.client && typeof commande.client === "object"
? commande.client
: {};

```
return {
  prenom: valeur(client.prenom, commande.prenom || ""),
  nom: valeur(
    client.nom,
    commande.nom || commande.nomClient || ""
  ),
  email: valeur(
    client.email,
    commande.email || commande.emailClient || ""
  ),
  telephone: valeur(
    client.telephone,
    commande.telephone || commande.phone || ""
  ),
  adresse: valeur(
    client.adresse,
    commande.adresse || ""
  ),
  commentaire: valeur(
    client.commentaire,
    commande.commentaire || ""
  ),
  modeLivraison: valeur(
    client.modeLivraison,
    commande.modeLivraison || ""
  )
};
```

}

function obtenirProduits(commande) {
if (Array.isArray(commande.produitsListe)) {
return commande.produitsListe;
}

```
if (Array.isArray(commande.produits)) {
  return commande.produits;
}

return [];
```

}

function obtenirReference(article) {
return String(
article.reference ||
article.id ||
article.slug ||
""
)
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g, "");
}

function obtenirNomNormalise(article) {
return String(
article.nom ||
article.nomProduit ||
article.produit ||
""
)
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g, "");
}

function estProduitAuPoidsReel(article) {
if (!article || typeof article !== "object") {
return false;
}

```
const reference = obtenirReference(article);
const nom = obtenirNomNormalise(article);
const texte = reference + " " + nom;

return (
  texte.includes("viande-sechee") ||
  texte.includes("viande_sechee") ||
  texte.includes("viande sechee") ||
  texte.includes("lard-sec") ||
  texte.includes("lard_sec") ||
  texte.includes("lard sec")
);
```

}

function estLardSec(article) {
const reference = obtenirReference(article);
const nom = obtenirNomNormalise(article);

```
return (
  reference.includes("lard-sec") ||
  reference.includes("lard_sec") ||
  nom.includes("lard sec")
);
```

}

function obtenirTarifAuPoids(article) {
return estLardSec(article)
? TARIF_LARD_SEC_100G
: TARIF_VIANDE_SECHEE_100G;
}

/* ---------- Vérification des plafonds ---------- */

function obtenirPlafond(article) {
const champsPlafond = [
article.prixPlafond,
article.prix_plafond,
article.plafondPrix,
article.plafond_prix
];

```
for (const champ of champsPlafond) {
  if (
    champ !== undefined &&
    champ !== null &&
    String(champ).trim() !== ""
  ) {
    const plafond = nombreValide(champ);

    return plafond !== null && plafond >= 0
      ? arrondirCentimes(plafond)
      : null;
  }
}

const poidsMax = nombreValide(
  article.poidsMax ?? article.poids_max
);

if (poidsMax === null || poidsMax <= 0) {
  return null;
}

return arrondirCentimes(
  poidsMax * obtenirTarifAuPoids(article) / 100
);
```

}

function obtenirPrixFinalArticle(article) {
const champs = [
article.prixFinal,
article.prix_final,
article.prix
];

```
for (const champ of champs) {
  if (
    champ !== undefined &&
    champ !== null &&
    String(champ).trim() !== ""
  ) {
    return nombreValide(champ);
  }
}

return null;
```

}

function obtenirPrixIndicatifArticle(article) {
const champs = [
article.prixIndicatif,
article.prix_indicatif,
article.prix
];

```
for (const champ of champs) {
  if (
    champ !== undefined &&
    champ !== null &&
    String(champ).trim() !== ""
  ) {
    return nombreValide(champ);
  }
}

return null;
```

}

function verifierPrixFinal(commande, produits) {
if (!commande || !commande.prixConfirme) {
throw new Error(
"Le prix final doit être confirmé avant de créer la confirmation."
);
}

```
produits.forEach(article => {
  if (!estProduitAuPoidsReel(article)) {
    return;
  }

  const prixFinal = obtenirPrixFinalArticle(article);

  if (
    prixFinal === null ||
    prixFinal < 0
  ) {
    throw new Error(
      "Le prix final d'un article au poids est absent ou invalide."
    );
  }

  const plafond = obtenirPlafond(article);

  if (plafond === null) {
    throw new Error(
      "Impossible de vérifier le plafond d'un article au poids. Vérifie le poids maximal et le prix plafond enregistrés."
    );
  }

  if (
    Math.round(prixFinal * 100) >
    Math.round(plafond * 100)
  ) {
    throw new Error(
      "Le prix final d'un article dépasse le plafond annoncé. L'e-mail n'a pas été demandé."
    );
  }

  const poidsReel = nombreValide(
    article.poidsReel ?? article.poids_reel
  );

  if (
    poidsReel === null ||
    poidsReel <= 0 ||
    !Number.isInteger(poidsReel)
  ) {
    throw new Error(
      "Le poids réel d'un article doit être renseigné en grammes entiers avant l'envoi."
    );
  }
});
```

}

/* ---------- Prix, poids et total ---------- */

function formaterPoids(poids) {
const n = Number(poids);

```
if (!Number.isFinite(n)) {
  return String(poids) + " g";
}

if (n >= 1000) {
  const kg = n / 1000;

  const valeurKg = Number.isInteger(kg)
    ? kg.toFixed(0)
    : kg.toFixed(2)
        .replace(/0+$/, "")
        .replace(/\.$/, "");

  return valeurKg + " kg";
}

return n + " g";
```

}

function ligneProduit(article, index) {
const nom = valeur(
article.nom || article.nomProduit || article.produit,
"Article"
);

```
const quantiteNombre = nombreValide(
  article.quantite ?? article.qte
);

const quantite =
  quantiteNombre !== null && quantiteNombre > 0
    ? quantiteNombre
    : 1;

const prix = estProduitAuPoidsReel(article)
  ? (
      article.poidsReel != null &&
      String(article.poidsReel).trim() !== ""
        ? obtenirPrixFinalArticle(article)
        : obtenirPrixIndicatifArticle(article)
    )
  : nombreValide(
      article.prixFinal ??
      article.prix_final ??
      article.prix
    );

let detail = "";

if (estProduitAuPoidsReel(article)) {
  const poidsReel = nombreValide(
    article.poidsReel ?? article.poids_reel
  );

  const poidsMin = nombreValide(
    article.poidsMin ?? article.poids_min
  );

  const poidsMax = nombreValide(
    article.poidsMax ?? article.poids_max
  );

  if (poidsReel !== null && poidsReel > 0) {
    detail =
      "Poids réel : " +
      formaterPoids(poidsReel);
  } else if (
    poidsMin !== null &&
    poidsMax !== null &&
    poidsMin > 0 &&
    poidsMax > 0
  ) {
    detail =
      "Fourchette choisie : " +
      formaterPoids(poidsMin) +
      " à " +
      formaterPoids(poidsMax);
  } else if (article.poids) {
    detail = "Poids : " + formaterPoids(article.poids);
  }
} else if (article.poids) {
  detail = "Poids : " + formaterPoids(article.poids);
}

if (article.recette) {
  detail +=
    (detail ? " — " : "") +
    "Recette : " +
    article.recette;
}

if (article.variante) {
  detail +=
    (detail ? " — " : "") +
    article.variante;
}

return {
  index,
  nom,
  quantite,
  detail,
  prix: prix === null ? 0 : prix,
  article
};
```

}

function calculerFraisLivraison(client) {
return client.modeLivraison === "Livraison en Suisse"
? FRAIS_LIVRAISON
: 0;
}

/*

* Si un total enregistré est disponible, il est considéré comme
* le total de référence et inclut déjà les frais de livraison.
*
* Les frais ne sont ajoutés qu'en l'absence de total enregistré.
* Cela évite de compter deux fois la livraison.
  */
  function obtenirTotal(commande, client) {
  const champsTotal = [
  commande.totalFinal,
  commande.total_final,
  commande.total
  ];

```
for (const champ of champsTotal) {
```

```
  if (
    champ !== undefined &&
    champ !== null &&
    String(champ).trim() !== ""
  ) {
    const total = nombreValide(champ);

    if (total !== null && total >= 0) {
      return arrondirCentimes(total);
    }
  }
}

const totalProduits = obtenirProduits(commande).reduce(
  (somme, article) => {
    const prix = estProduitAuPoidsReel(article)
      ? (
          article.poidsReel != null &&
          String(article.poidsReel).trim() !== ""
            ? obtenirPrixFinalArticle(article)
            : obtenirPrixIndicatifArticle(article)
        )
      : nombreValide(
          article.prixFinal ??
          article.prix_final ??
          article.prix
        );

    return somme + (
      prix !== null && prix >= 0
        ? prix
        : 0
    );
  },
  0
);

return arrondirCentimes(
  totalProduits + calculerFraisLivraison(client)
);
```

}

/* ---------- Génération du PDF ---------- */

function ajouterTextePDF(
doc,
texte,
x,
y,
largeur = 180
) {
const lignes = doc.splitTextToSize(
String(texte || ""),
largeur
);

```
doc.text(lignes, x, y);

return y + lignes.length * 6;
```

}

function creerPDF(commande, options = {}) {
if (!window.jspdf || !window.jspdf.jsPDF) {
throw new Error(
"La bibliothèque PDF n'est pas chargée. Vérifie le script jsPDF dans la page."
);
}

```
const doc = new window.jspdf.jsPDF();
const client = obtenirClient(commande);
const typeEmail =
  options.typeEmail || "nouvelle-commande";
const confirmationFinale =
  typeEmail === "confirmation-prix";
const produits = obtenirProduits(commande);

if (confirmationFinale) {
  verifierPrixFinal(commande, produits);
}

const total = obtenirTotal(commande, client);
const fraisLivraison = calculerFraisLivraison(client);

const numero = valeur(
  commande.id || commande.numeroCommande || commande.numero,
  "Sans numéro"
);

let y = 18;

doc.setFont("helvetica", "bold");
doc.setFontSize(18);
doc.text(NOM_ENTREPRISE, 15, y);
y += 9;

doc.setFontSize(14);
doc.text(
  confirmationFinale
    ? "Confirmation du prix final"
    : "Récapitulatif de commande",
  15,
  y
);
y += 9;

doc.setFont("helvetica", "normal");
doc.setFontSize(10);

doc.text("Commande : " + numero, 15, y);
y += 6;

doc.text(
  "Date : " + new Date().toLocaleDateString("fr-CH"),
  15,
  y
);
y += 10;

doc.setFont("helvetica", "bold");
doc.text("Coordonnées du client", 15, y);
y += 6;

doc.setFont("helvetica", "normal");

y = ajouterTextePDF(
  doc,
  "Client : " + client.prenom + " " + client.nom,
  15,
  y
);

y = ajouterTextePDF(
  doc,
  "Téléphone : " + client.telephone,
  15,
  y
);

y = ajouterTextePDF(
  doc,
  "E-mail : " + client.email,
  15,
  y
);

y = ajouterTextePDF(
  doc,
  "Adresse : " + client.adresse,
  15,
  y
);

y = ajouterTextePDF(
  doc,
  "Réception : " +
    valeur(client.modeLivraison, "À convenir"),
  15,
  y
);

y += 5;

doc.setFont("helvetica", "bold");
doc.text("Articles commandés", 15, y);
y += 7;

doc.setFont("helvetica", "normal");

produits.forEach((article, index) => {
  const ligne = ligneProduit(article, index);
  const libelle = ligne.quantite + " × " + ligne.nom;

  if (y > 255) {
    doc.addPage();
    y = 18;
  }

  y = ajouterTextePDF(doc, libelle, 15, y);

  if (ligne.detail) {
    y = ajouterTextePDF(
      doc,
      ligne.detail,
      20,
      y,
      170
    );
  }

  if (confirmationFinale) {
    y = ajouterTextePDF(
      doc,
      "Prix confirmé : " + montantCHF(ligne.prix),
      20,
      y
    );
  } else if (estProduitAuPoidsReel(article)) {
    y = ajouterTextePDF(
      doc,
      "Prix indicatif : " + montantCHF(ligne.prix),
      20,
      y
    );

    const plafond = obtenirPlafond(article);

    if (plafond !== null && plafond > 0) {
      y = ajouterTextePDF(
        doc,
        "Prix maximal selon la fourchette : " +
          montantCHF(plafond),
        20,
        y
      );
    }
  } else {
    y = ajouterTextePDF(
      doc,
      "Prix : " + montantCHF(ligne.prix),
      20,
      y
    );
  }

  y += 3;
});

if (y > 255) {
  doc.addPage();
  y = 18;
}

y += 3;
doc.setFont("helvetica", "normal");
doc.setFontSize(10);

if (fraisLivraison > 0) {
  doc.text(
    "Frais de livraison : " +
      montantCHF(fraisLivraison),
    15,
    y
  );
  y += 7;
}

doc.setFont("helvetica", "bold");
doc.setFontSize(12);

doc.text(
  confirmationFinale
    ? "PRIX FINAL À PAYER : " + montantCHF(total)
    : "TOTAL INDICATIF : " + montantCHF(total),
  15,
  y
);

y += 9;
doc.setFont("helvetica", "normal");
doc.setFontSize(10);

if (confirmationFinale) {
  y = ajouterTextePDF(
    doc,
    "Le prix final a été confirmé. Vous pouvez régler ce montant par TWINT au " +
      NUMERO_TWINT +
      ".",
    15,
    y,
    180
  );
} else {
  y = ajouterTextePDF(
    doc,
    "Ce récapitulatif ne constitue pas une demande de paiement.",
    15,
    y,
    180
  );

  y = ajouterTextePDF(
    doc,
    "Pour la viande séchée et le lard sec, le poids réel sera mesuré après préparation. Le prix final sera confirmé avant tout paiement et ne dépassera pas le plafond annoncé pour la fourchette choisie.",
    15,
    y,
    180
  );
}

if (client.commentaire) {
  if (y > 260) {
    doc.addPage();
    y = 18;
  }

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.text("Commentaire", 15, y);
  y += 6;

  doc.setFont("helvetica", "normal");

  ajouterTextePDF(
    doc,
    client.commentaire,
    15,
    y,
    180
  );
}

const nombrePages = doc.getNumberOfPages();

for (let page = 1; page <= nombrePages; page++) {
  doc.setPage(page);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    NOM_ENTREPRISE + " — Merci pour votre confiance !",
    15,
    285
  );
}

return {
  doc,
  client,
  produits,
  total,
  fraisLivraison,
  numero,
  typeEmail,
  confirmationFinale
};
```

}

/* ---------- Transmission à Google Apps Script ---------- */

function obtenirBase64PDF(doc) {
const uri = doc.output("datauristring");
const separateur = uri.indexOf(",");

```
return separateur >= 0
  ? uri.substring(separateur + 1)
  : uri;
```

}

/*

* Le navigateur ne peut pas lire la réponse du script Google dans
* l'iframe inter-origines. Cette fonction confirme uniquement que
* la requête a été transmise, pas que les e-mails ont été délivrés.
  */
  function envoyerCommandeGoogle(payload) {
  return new Promise((resolve, reject) => {
  let iframe = null;
  let formulaire = null;
  let termine = false;
  let temporisateur = null;
  let temporisateurSecours = null;

  function nettoyage() {
  if (temporisateur) {
  window.clearTimeout(temporisateur);
  }

  if (temporisateurSecours) {
  window.clearTimeout(temporisateurSecours);
  }

  if (formulaire && formulaire.parentNode) {
  formulaire.parentNode.removeChild(formulaire);
  }

  if (iframe && iframe.parentNode) {
  iframe.parentNode.removeChild(iframe);
  }
  }

  function terminer(erreur) {
  if (termine) return;

  termine = true;
  nettoyage();

  if (erreur) {
  reject(erreur);
  } else {
  resolve({
  ok: true,
  transmis: true,
  livraisonVerifiee: false,
  message:
  "La requête a été transmise. La livraison effective des e-mails doit être vérifiée séparément."
  });
  }
  }

  try {
  const identifiant =
  "ig-mail-" +
  Date.now() +
  "-" +
  Math.random().toString(36).slice(2);

  iframe = document.createElement("iframe");
  iframe.name = identifiant;
  iframe.style.display = "none";
  iframe.setAttribute("aria-hidden", "true");

  formulaire = document.createElement("form");
  formulaire.method = "POST";
  formulaire.action = URL_SCRIPT_GOOGLE;
  formulaire.target = identifiant;
  formulaire.style.display = "none";

  const champ = document.createElement("input");
  champ.type = "hidden";
  champ.name = "payload";
  champ.value = JSON.stringify(payload);

  formulaire.appendChild(champ);
  document.body.appendChild(iframe);
  document.body.appendChild(formulaire);

  iframe.addEventListener("load", function () {
  /*
  * Un événement load ne permet pas de vérifier le résultat
  * de MailApp.sendEmail côté serveur.
  */
  temporisateur = window.setTimeout(
  () => terminer(),
  1200
  );
  }, { once: true });

  formulaire.submit();

  temporisateurSecours = window.setTimeout(
  () => terminer(
  new Error(
  "Le délai d'attente est dépassé. Vérifie le script Google Apps Script et la réception des e-mails avant de recommencer."
  )
  ),
  8000
  );
  } catch (erreur) {
  nettoyage();
  reject(erreur);
  }
  });
  }

/* ---------- Création et envoi du PDF ---------- */

async function genererPDFCommande(
commande,
options = {}
) {
if (!commande || typeof commande !== "object") {
throw new Error("Les données de la commande sont absentes.");
}

```
const optionsFinales = {
  envoyerEmail: options.envoyerEmail !== false,
  typeEmail: options.typeEmail || "nouvelle-commande",
  telecharger: options.telecharger === true
};

const resultat = creerPDF(commande, optionsFinales);

const nomFichier =
  "commande-" +
  String(resultat.numero).replace(
    /[^a-zA-Z0-9_-]/g,
    ""
  ) +
  (
    resultat.confirmationFinale
      ? "-prix-final.pdf"
      : ".pdf"
  );

if (optionsFinales.telecharger) {
  resultat.doc.save(nomFichier);
}

if (!optionsFinales.envoyerEmail) {
  return {
    ok: true,
    emailDemande: false,
    pdf: resultat.doc,
    total: resultat.total,
    nomFichier
  };
}

if (
  !resultat.client.email ||
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resultat.client.email)
) {
  throw new Error(
    "L'adresse e-mail du client est absente ou invalide."
  );
}

if (
  resultat.confirmationFinale &&
  !commande.prixConfirme
) {
  throw new Error(
    "Le prix final doit être confirmé avant de demander l'envoi."
  );
}

const produitsPourEmail = resultat.produits.map(
  (article, index) => {
    const ligne = ligneProduit(article, index);
    const plafond = obtenirPlafond(article);

    return {
      nom: ligne.nom,
      reference:
        article.reference ||
        article.id ||
        article.slug ||
        "",
      quantite: ligne.quantite,
      poids: article.poids || "",
      poidsMin: article.poidsMin ?? article.poids_min ?? null,
      poidsMax: article.poidsMax ?? article.poids_max ?? null,
      poidsReel:
        article.poidsReel ??
        article.poids_reel ??
        null,
      prix: ligne.prix,
      prixFinal:
        article.prixFinal ??
        article.prix_final ??
        null,
      prixIndicatif:
        article.prixIndicatif ??
        article.prix_indicatif ??
        null,
      prixPlafond: plafond,
      prixPar100g:
        article.prixPar100g ??
        article.tarif100g ??
        obtenirTarifAuPoids(article),
      recette: article.recette || "",
      variante: article.variante || ""
    };
  }
);

const sujet = resultat.confirmationFinale
  ? "Idée Gourmande — Confirmation du prix final de la commande " +
    resultat.numero
  : "Idée Gourmande — Confirmation de réception de la commande " +
    resultat.numero;

const payload = {
  typeEmail: optionsFinales.typeEmail,
  to: resultat.client.email,
  emailEntreprise: EMAIL_ENTREPRISE,
  numeroCommande: resultat.numero,
  pdfBase64: obtenirBase64PDF(resultat.doc),
  pdfFilename: nomFichier,
  client: resultat.client,
  modeLivraison: resultat.client.modeLivraison,
  produits: produitsPourEmail,
  total: resultat.total,
  fraisLivraison: resultat.fraisLivraison,
  numeroTwint: NUMERO_TWINT,
  subject: sujet
};

return envoyerCommandeGoogle(payload);
```

}

async function envoyerEmailConfirmationPrix(commande) {
if (!commande || !commande.prixConfirme) {
throw new Error(
"Le prix final doit être confirmé avant l'envoi de l'e-mail."
);
}

```
return genererPDFCommande(commande, {
  envoyerEmail: true,
  typeEmail: "confirmation-prix",
  telecharger: false
});
```

}

async function imprimerPDFCommande(commande) {
return genererPDFCommande(commande, {
envoyerEmail: false,
typeEmail:
commande && commande.prixConfirme
? "confirmation-prix"
: "nouvelle-commande",
telecharger: true
});
}

/* ---------- Fonctions publiques ---------- */

window.genererPDFCommande = genererPDFCommande;
window.envoyerCommandeGoogle = envoyerCommandeGoogle;
window.envoyerEmailConfirmationPrix =
envoyerEmailConfirmationPrix;
window.imprimerPDFCommande = imprimerPDFCommande;
})();
