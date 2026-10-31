
/* ============================================================
   Idée Gourmande — Administration — Version 3.2.1
   Pesée réelle, prix final ajustable, e-mail, SMS et PDF.
   Correction de l'échappement HTML, de l'affichage et des index.
   ============================================================ */
"use strict";

const CLE_SECURITE_RESTAURATION = "ideeGourmandeDB_avant_restauration";
const NUMERO_TWINT_ADMIN = "079 592 78 82";
const TARIFS_POIDS_REEL = {
  "viande-sechee": 9,
  "lard-sec": 4
};

/* ---------- Accès à la base ---------- */

function obtenirDBAdmin() {
  if (typeof db !== "undefined" && db) return db;

  try {
    if (typeof chargerDB === "function") {
      const base = chargerDB();
      if (base) return base;
    }
  } catch (e) {
    console.error("Erreur de lecture de la base :", e);
  }

  return {};
}

function enregistrerDBAdmin() {
  try {
    if (typeof sauvegarderDB === "function") {
      sauvegarderDB();
    } else if (typeof sauvegarderBase === "function") {
      sauvegarderBase();
    }
  } catch (e) {
    console.error("Erreur de sauvegarde :", e);
  }
}

function obtenirCommandes() {
  const base = obtenirDBAdmin();
  if (!Array.isArray(base.commandes)) base.commandes = [];
  return base.commandes;
}

function obtenirArchives() {
  const base = obtenirDBAdmin();
  if (!Array.isArray(base.archives)) base.archives = [];
  return base.archives;
}

/* ---------- Utilitaires ---------- */

function texteSecurise(v) {
  return String(v == null ? "" : v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function valeurNombre(v) {
  if (v === null || v === undefined || String(v).trim() === "") {
    return 0;
  }

  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function obtenirTotalCommandeAdmin(cmd) {
  if (!cmd) return 0;

  const champs = [
    cmd.totalFinal,
    cmd.total_final,
    cmd.total
  ];

  for (const champ of champs) {
    if (
      champ !== null &&
      champ !== undefined &&
      String(champ).trim() !== "" &&
      Number.isFinite(Number(String(champ).replace(",", ".")))
    ) {
      return Math.max(0, valeurNombre(champ));
    }
  }

  return 0;
}

function formatCHF(v) {
  return valeurNombre(v).toLocaleString("fr-CH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + " CHF";
}

function identifiantCommande(cmd, i) {
  return String(
    (cmd && (cmd.numeroCommande || cmd.id || cmd.numero || cmd.reference)) ||
    ("commande-" + i)
  );
}

function obtenirNomClient(cmd) {
  if (cmd && cmd.client && typeof cmd.client === "object") {
    return [
      cmd.client.prenom,
      cmd.client.nom
    ].filter(Boolean).join(" ").trim() || "Client";
  }

  return String((cmd && (cmd.nomClient || cmd.client)) || "Client");
}

function obtenirEmailClient(cmd) {
  return (
    (cmd && cmd.client && typeof cmd.client === "object" &&
      cmd.client.email) ||
    (cmd && (cmd.email || cmd.emailClient)) ||
    ""
  );
}

function obtenirTelephoneClient(cmd) {
  return (
    (cmd && cmd.client && typeof cmd.client === "object" &&
      cmd.client.telephone) ||
    (cmd && (cmd.telephone || cmd.phone)) ||
    ""
  );
}

function obtenirAdresseClient(cmd) {
  return (
    (cmd && cmd.client && typeof cmd.client === "object" &&
      cmd.client.adresse) ||
    (cmd && cmd.adresse) ||
    ""
  );
}

function obtenirLignesCommande(cmd) {
  if (Array.isArray(cmd && cmd.produitsListe)) {
    return cmd.produitsListe;
  }

  if (Array.isArray(cmd && cmd.produits)) {
    return cmd.produits;
  }

  return [];
}

/* ---------- Produits au poids réel ---------- */

function estLignePoidsReel(ligne) {
  if (!ligne) return false;

  if (typeof estProduitAPoidsReel === "function") {
    try {
      return estProduitAPoidsReel(ligne);
    } catch (e) {
      console.error("Erreur de détection du produit au poids :", e);
    }
  }

  const ref = String(
    ligne.reference ||
    ligne.id ||
    ligne.slug ||
    ligne.nom ||
    ligne.nomProduit ||
    ""
  ).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  return ref.includes("viande-sechee") ||
    ref.includes("lard-sec") ||
    (ref.includes("viande") && ref.includes("sechee")) ||
    (ref.includes("lard") && ref.includes("sec"));
}

function cleProduitPoids(ligne) {
  const ref = String(
    ligne && (
      ligne.reference ||
      ligne.id ||
      ligne.slug ||
      ligne.nom ||
      ligne.nomProduit ||
      ""
    ) || ""
  ).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  return ref.includes("lard") ? "lard-sec" : "viande-sechee";
}

function tarifLignePoids(ligne) {
  const tarif = valeurNombre(
    ligne && (ligne.prixPar100g || ligne.tarif100g)
  );

  return tarif > 0
    ? tarif
    : TARIFS_POIDS_REEL[cleProduitPoids(ligne)];
}

function libelleFourchette(ligne) {
  const min = valeurNombre(ligne && (ligne.poidsMin || ligne.poids_min));
  const max = valeurNombre(ligne && (ligne.poidsMax || ligne.poids_max));

  if (!(min > 0 && max > 0)) {
    return "Fourchette choisie par le client";
  }

  const f = g => g >= 1000
    ? (
      g % 1000 === 0
        ? (g / 1000) + " kg"
        : (g / 1000).toLocaleString("fr-CH") + " kg"
    )
    : g + " g";

  return f(min) + " – " + f(max);
}

function definirTexte(id, valeur) {
  const el = document.getElementById(id);
  if (el) el.textContent = valeur;
}

/* ---------- Affichage des produits ---------- */

function afficherProduitsCommande(cmd, indexCommande) {
  const lignes = obtenirLignesCommande(cmd);

  if (!lignes.length) {
    return "<p>Aucun détail de produit disponible.</p>";
  }

  return '<ul class="admin-produits">' + lignes.map(ligne => {
    const nom = texteSecurise(
      ligne.nom ||
      ligne.nomProduit ||
      ligne.produit ||
      ligne.reference ||
      "Produit"
    );

    const qte = valeurNombre(ligne.quantite || ligne.qte || 1) || 1;
    let details = "";

    if (estLignePoidsReel(ligne)) {
      details = '<div class="admin-poids-details">' +
        '<span>Fourchette : ' +
        texteSecurise(libelleFourchette(ligne)) +
        '</span>' +
        '<br><span>Tarif indicatif : ' +
        formatCHF(tarifLignePoids(ligne)) +
        ' / 100 g</span>';

      if (valeurNombre(ligne.poidsReel) > 0) {
        details +=
          '<br><strong>Poids réel : ' +
          valeurNombre(ligne.poidsReel) +
          ' g</strong>' +
          '<br><strong>Prix final : ' +
          formatCHF(
            ligne.prixFinal != null ? ligne.prixFinal : ligne.prix
          ) +
          '</strong>';
      } else {
        details +=
          '<br><span>Prix indicatif : ' +
          formatCHF(
            ligne.prixIndicatif != null
              ? ligne.prixIndicatif
              : ligne.prix
          ) +
          ' — montant indicatif avant pesée' +
          '</span>';
      }

      details += "</div>";
    } else if (ligne.poids) {
      details =
        '<div class="admin-poids-details">Poids : ' +
        texteSecurise(ligne.poids) +
        ' g</div>';
    }

    const prix = valeurNombre(
      ligne.prixFinal != null ? ligne.prixFinal : ligne.prix
    );

    return "<li><strong>" + nom + "</strong> × " + qte +
      (prix > 0 ? " — " + formatCHF(prix) : "") +
      details +
      "</li>";
  }).join("") + "</ul>";
}

function commandeNecessitePoidsReel(cmd) {
  return obtenirLignesCommande(cmd).some(
    ligne =>
      estLignePoidsReel(ligne) &&
      !(valeurNombre(ligne.poidsReel) > 0)
  );
}

/* ---------- Calcul automatique du prix selon le poids ---------- */

function calculerPrixAutomatiquePoids(champPoids) {
  if (!champPoids) return;

  const commandeIndex = champPoids.getAttribute("data-commande-index");
  const ligneIndex = champPoids.getAttribute("data-ligne-index");
  const prixChamp = document.getElementById(
    "prix-reel-" + commandeIndex + "-" + ligneIndex
  );
  if (!prixChamp) return;

  const poids = valeurNombre(champPoids.value);
  const tarif = valeurNombre(prixChamp.getAttribute("data-tarif"));

  if (!(poids > 0) || !Number.isInteger(poids) || !(tarif > 0)) {
    prixChamp.value = "";
    prixChamp.setCustomValidity("Saisis d'abord un poids réel entier en grammes.");
    return;
  }

  const prix = Math.round((poids * tarif / 100 + Number.EPSILON) * 100) / 100;
  prixChamp.value = prix.toFixed(2);
  prixChamp.setCustomValidity("");
}

/* ---------- Saisie du poids et du prix réels ---------- */

function rendreZonePoidsReel(cmd, indexCommande) {
  const lignes = obtenirLignesCommande(cmd);

  const aPeser = lignes
    .map((ligne, indexLigne) => ({ ligne, indexLigne }))
    .filter(x =>
      estLignePoidsReel(x.ligne) &&
      !(valeurNombre(x.ligne.poidsReel) > 0)
    );

  if (!aPeser.length) {
    return lignes.some(estLignePoidsReel) && cmd.prixConfirme
      ? '<div class="admin-prix-confirme" style="margin-top:12px;padding:12px;border:1px solid #9bc7a9;border-radius:8px">' +
        '<strong>Prix final confirmé : ' +
        formatCHF(obtenirTotalCommandeAdmin(cmd)) +
        '</strong><br>' +
        (cmd.paiementConfirme
          ? "Paiement confirmé."
          : "En attente du paiement.") +
        "</div>"
      : "";
  }

  let html =
    '<section class="admin-finalisation-poids" ' +
    'style="margin-top:12px;padding:12px;border:1px solid #d9c8a8;border-radius:8px">' +
    '<h4 style="margin:0 0 8px">Finaliser le poids et le prix</h4>' +
    '<p style="margin:0 0 10px">' +
    "Saisis le poids réellement mesuré en grammes. Le prix est calculé automatiquement " +
    "selon le tarif indicatif, mais tu peux le modifier librement pour appliquer un ajustement commercial." +
    "</p>";

  html += aPeser.map(x => {
    const nom = texteSecurise(
      x.ligne.nom ||
      x.ligne.nomProduit ||
      x.ligne.reference ||
      "Produit"
    );

    return (
      '<div style="margin:12px 0;padding:10px;background:#faf8f3;border-radius:6px">' +

      '<label for="poids-reel-' + indexCommande + '-' + x.indexLigne +
      '" style="display:block;margin:4px 0">' +
      '<strong>' + nom + '</strong><br>' +
      texteSecurise(libelleFourchette(x.ligne)) +
      "</label>" +

      '<label for="poids-reel-' + indexCommande + '-' + x.indexLigne +
      '" style="display:block;margin:6px 0 4px">Poids réel (grammes)</label>' +

      '<input id="poids-reel-' + indexCommande + '-' + x.indexLigne +
      '" class="champ-poids-reel" type="number" min="1" step="1" ' +
      'inputmode="numeric" required ' +
      'data-commande-index="' + indexCommande +
      '" data-ligne-index="' + x.indexLigne +
      '" oninput="calculerPrixAutomatiquePoids(this)" ' +
      'placeholder="Saisis le poids en grammes" ' +
      'style="max-width:260px;width:100%;padding:8px">' +

      '<label for="prix-reel-' + indexCommande + '-' + x.indexLigne +
      '" style="display:block;margin:10px 0 4px">Prix final (CHF) — modifiable</label>' +

      '<input id="prix-reel-' + indexCommande + '-' + x.indexLigne +
      '" class="champ-prix-reel" type="number" min="0" step="0.01" ' +
      'inputmode="decimal" required ' +
      'data-commande-index="' + indexCommande +
      '" data-ligne-index="' + x.indexLigne +
      '" data-tarif="' + tarifLignePoids(x.ligne) +
      '" placeholder="Saisis le poids pour calculer le prix" ' +
      'style="max-width:260px;width:100%;padding:8px">' +

      '<small style="display:block;margin-top:5px">Le montant calculé peut être ajusté manuellement à la hausse ou à la baisse.</small>' +

      "</div>"
    );
  }).join("");

  html +=
    '<div style="margin-top:12px">' +
    '<button type="button" onclick="confirmerPrixCommande(' +
    indexCommande +
    ')">Confirmer les poids et les prix saisis</button>' +
    "</div>" +
    "</section>";

  return html;
}

/* ---------- Préparation du SMS ---------- */

function boutonSMSCommande(cmd, index) {
  if (!cmd) return "";
  if (!cmd.prixConfirme) {
    return '<p class="sms-en-attente" style="margin-top:10px;color:#555">Le SMS de confirmation sera disponible après la pesée et la confirmation du prix final.</p>';
  }

  const tel = obtenirTelephoneClient(cmd);

  if (!tel) {
    return "<p>Numéro de téléphone absent : impossible de préparer le SMS.</p>";
  }

  const msg =
    "Bonjour " + obtenirNomClient(cmd) +
    ", le prix final de votre commande " +
    identifiantCommande(cmd, index) +
    " chez Idée Gourmande est de " +
    formatCHF(obtenirTotalCommandeAdmin(cmd)) +
    ". Vous pouvez régler par TWINT au " +
    NUMERO_TWINT_ADMIN +
    ". Merci et belle journée !";

  const separateurSMS = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? "&" : "?";
  const lien = "sms:" + tel.replace(/[^\d+]/g, "") +
    separateurSMS + "body=" + encodeURIComponent(msg);

  return '<p style="margin-top:10px">' +
    '<a href="' + texteSecurise(lien) +
    '" style="display:inline-block;padding:9px 12px;border-radius:6px;background:#237b59;color:white;text-decoration:none">' +
    "Préparer le SMS de confirmation</a></p>" +
    "<small>Le SMS n’est pas envoyé automatiquement : le lien ouvre l’application de messages de ton appareil. Vérifie le numéro et le texte, puis appuie sur Envoyer.</small>";
}

/* ---------- Liste des commandes ---------- */

function afficherListeCommandes(commandes) {
  const conteneur = document.getElementById("listeCommandes");
  if (!conteneur) return;

  if (!Array.isArray(commandes) || !commandes.length) {
    conteneur.innerHTML =
      '<p class="message-vide">Aucune commande pour le moment.</p>';
    return;
  }

  const commandesBase = obtenirCommandes();

  conteneur.innerHTML = commandes.map((cmd, indexAffiche) => {
    const indexBase = commandesBase.indexOf(cmd);
    const index = indexBase >= 0 ? indexBase : indexAffiche;

    const nom = obtenirNomClient(cmd);
    const email = obtenirEmailClient(cmd);
    const tel = obtenirTelephoneClient(cmd);
    const adresse = obtenirAdresseClient(cmd);
    const id = identifiantCommande(cmd, index);
    const statut = cmd.statut || "Nouvelle";
    const date = cmd.date || cmd.dateCommande || "";
    const total = obtenirTotalCommandeAdmin(cmd);

    return '<article class="commande-admin" style="border:1px solid #ddd;border-radius:10px;padding:16px;margin:12px 0">' +

      '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between">' +
      '<h3 style="margin:0">Commande ' + texteSecurise(id) + '</h3>' +
      '<span>' + texteSecurise(date) + '</span></div>' +

      '<p><strong>Client :</strong> ' + texteSecurise(nom) + '</p>' +

      (email
        ? '<p><strong>E-mail :</strong> <a href="mailto:' +
          texteSecurise(email) + '">' +
          texteSecurise(email) + '</a></p>'
        : "") +

      (tel
        ? '<p><strong>Téléphone :</strong> ' +
          texteSecurise(tel) + '</p>'
        : "") +

      (adresse
        ? '<p><strong>Adresse :</strong> ' +
          texteSecurise(adresse) + '</p>'
        : "") +

      (cmd.commentaire
        ? '<p><strong>Commentaire :</strong> ' +
          texteSecurise(cmd.commentaire) + '</p>'
        : "") +

      "<h4>Produits</h4>" +
      afficherProduitsCommande(cmd, index) +

      '<p><strong>' +
      (cmd.prixConfirme ? "Prix final confirmé :" : "Total actuel :") +
      "</strong> " + formatCHF(total) +
      (commandeNecessitePoidsReel(cmd)
        ? " <span>(prix à confirmer après pesée)</span>"
        : "") +
      "</p>" +

      rendreZonePoidsReel(cmd, index) +
      boutonSMSCommande(cmd, index) +

      '<p><label for="statut-' + index +
      '"><strong>Statut :</strong> </label>' +
      '<select id="statut-' + index +
      '" onchange="changerStatut(' + index + ',this.value)">' +

      ["Nouvelle", "En préparation", "Prête", "Livrée", "Annulée"].map(s =>
        '<option value="' + texteSecurise(s) + '"' +
        (s === statut ? " selected" : "") +
        ">" + texteSecurise(s) + "</option>"
      ).join("") +

      "</select></p>" +

      '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px">' +
      '<button type="button" onclick="imprimerCommande(' + index + ')">Télécharger / imprimer PDF</button>' +
      '<button type="button" onclick="renvoyerEmail(' + index + ')">Préparer un e-mail</button>' +
      '<button type="button" onclick="archiverCommande(' + index + ')">Archiver</button>' +
      '<button type="button" onclick="supprimerCommande(' + index + ')">Supprimer</button>' +
      "</div></article>";
  }).join("");
}

function afficherCommandes() {
  afficherListeCommandes(obtenirCommandes());
}

function changerStatut(index, valeur) {
  const commandes = obtenirCommandes();
  if (!commandes[index]) return;

  commandes[index].statut = valeur;
  commandes[index].dateModification = new Date().toISOString();

  enregistrerDBAdmin();
  afficherCommandes();
  afficherStatistiques();
}

/* ---------- PDF et e-mail ---------- */

function normaliserCommandePourPDF(cmd) {
  const c = cmd.client && typeof cmd.client === "object"
    ? cmd.client
    : (cmd.clientDetails && typeof cmd.clientDetails === "object"
      ? cmd.clientDetails
      : {});
  const nomComplet = typeof cmd.client === "string"
    ? cmd.client.trim().split(/\\s+/)
    : [];

  return Object.assign({}, cmd, {
    id: cmd.id || cmd.numero || cmd.reference || "",
    numeroCommande: cmd.numeroCommande || cmd.id || cmd.numero || cmd.reference || "",
    client: {
      prenom: c.prenom || cmd.prenom || nomComplet.shift() || "",
      nom: c.nom || cmd.nom || cmd.nomClient || nomComplet.join(" "),
      email: c.email || cmd.email || cmd.emailClient || "",
      telephone: c.telephone || cmd.telephone || cmd.phone || "",
      adresse: c.adresse || cmd.adresse || "",
      commentaire: c.commentaire || cmd.commentaire || "",
      modeLivraison: c.modeLivraison || cmd.modeLivraison || ""
    },
    produits: obtenirLignesCommande(cmd),
    total: obtenirTotalCommandeAdmin(cmd),
    totalFinal: obtenirTotalCommandeAdmin(cmd),
    total_final: obtenirTotalCommandeAdmin(cmd),
    prixConfirme: !!cmd.prixConfirme
  });
}

function imprimerCommande(index) {
  const cmd = obtenirCommandes()[index];
  if (!cmd) return alert("Commande introuvable.");

  try {
    const pdf = normaliserCommandePourPDF(cmd);

    if (typeof genererPDFCommande === "function") {
      genererPDFCommande(pdf, {
        envoyerEmail: false,
        telecharger: true,
        afficher: true
      });
    } else if (typeof imprimerPDFCommande === "function") {
      imprimerPDFCommande(pdf);
    } else {
      alert(
        "Le module PDF n’est pas chargé. Vérifie js/pdfcommande.js dans admin.html."
      );
    }
  } catch (e) {
    console.error(e);
    alert("Impossible de générer le PDF : " + e.message);
  }
}

function renvoyerEmail(index) {
  const cmd = obtenirCommandes()[index];
  if (!cmd) return alert("Commande introuvable.");

  const email = obtenirEmailClient(cmd);

  if (!email) {
    return alert("Aucune adresse e-mail enregistrée pour ce client.");
  }

  const total = obtenirTotalCommandeAdmin(cmd);

  const sujet = cmd.prixConfirme
    ? "Confirmation du prix final — commande " +
      identifiantCommande(cmd, index)
    : "Votre commande Idée Gourmande — " +
      identifiantCommande(cmd, index);

  const corps = cmd.prixConfirme
    ? "Bonjour " + obtenirNomClient(cmd) +
      ",\r\n\r\nLe prix final de votre commande est de " +
      formatCHF(total) +
      ". Vous pouvez régler par TWINT au " +
      NUMERO_TWINT_ADMIN +
      ".\r\n\r\nMerci, Idée Gourmande."
    : "Bonjour " + obtenirNomClient(cmd) +
      ",\r\n\r\nNous vous confirmerons le prix final après la pesée des produits concernés." +
      "\r\n\r\nMerci, Idée Gourmande.";

  // Ouvre la fenêtre de rédaction Gmail en ciblant le compte Idée Gourmande.
  // L'expéditeur sera ce compte si la session Gmail est ouverte dessus
  // (ou si cette adresse est configurée comme alias d'envoi).
  const compteGmail = "ideesgourmandesge@gmail.com";
  const urlGmail = "https://mail.google.com/mail/?view=cm&fs=1" +
    "&authuser=" + encodeURIComponent(compteGmail) +
    "&to=" + encodeURIComponent(email) +
    "&su=" + encodeURIComponent(sujet) +
    "&body=" + encodeURIComponent(corps);

  window.open(urlGmail, "_blank", "noopener");
}

function obtenirCommandeParIdentifiant(id) {
  return obtenirCommandes().find(
    c => String(c.id) === String(id)
  ) || null;
}

/* ---------- Confirmation du poids et du prix final ---------- */

async function obtenirNumeroCommandeCentralAdmin(nomClient, annee) {
  const url = "https://script.google.com/macros/s/AKfycby5o5V0dRb9fPpnhmUYCeWB1LxXjGRXfQK0kQ2Tzw2gHK58GQn8VmxlDI1DFWzogAhI/exec";
  return new Promise((resolve, reject) => {
    const callback = "igNumeroAdmin_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
    const script = document.createElement("script");
    const timeout = setTimeout(() => {
      nettoyer();
      reject(new Error("Délai dépassé lors de l'attribution du numéro."));
    }, 15000);
    function nettoyer() {
      clearTimeout(timeout);
      delete window[callback];
      if (script.parentNode) script.parentNode.removeChild(script);
    }
    window[callback] = reponse => {
      nettoyer();
      if (!reponse || reponse.ok !== true || !reponse.numero) {
        reject(new Error(reponse && reponse.error || "Réponse invalide du compteur."));
        return;
      }
      resolve(reponse.numero);
    };
    script.onerror = () => {
      nettoyer();
      reject(new Error("Le service de numérotation est inaccessible."));
    };
    const params = new URLSearchParams({
      action: "nextOrderNumber",
      nom: nomClient || "Commande",
      annee: String(annee),
      callback
    });
    script.src = url + "?" + params.toString();
    document.head.appendChild(script);
  });
}



async function confirmerPrixCommande(index) {
  const commandes = obtenirCommandes();
  const cmd = commandes[index];

  if (!cmd) {
    return alert("Commande introuvable.");
  }

  if (cmd.prixConfirme) {
    return alert("Le prix de cette commande est déjà confirmé.");
  }

  const lignes = obtenirLignesCommande(cmd);
  const poidsParLigne = {};
  const prixParLigne = {};
  let erreur = "";

  const inputsPoids = document.querySelectorAll(
    '.champ-poids-reel[data-commande-index="' + index + '"]'
  );

  const inputsPrix = document.querySelectorAll(
    '.champ-prix-reel[data-commande-index="' + index + '"]'
  );

  inputsPoids.forEach(input => {
    const poids = valeurNombre(input.value);
    const ligneIndex = input.getAttribute("data-ligne-index");

    if (!(poids > 0) || !Number.isInteger(poids)) {
      erreur =
        "Saisis un poids réel positif, en grammes entiers, pour chaque produit.";
      return;
    }

    poidsParLigne[ligneIndex] = poids;
  });

  inputsPrix.forEach(input => {
    const ligneIndex = input.getAttribute("data-ligne-index");
    const poids = poidsParLigne[ligneIndex];
    const prixSaisi = valeurNombre(input.value);

    if (!(poids > 0) || !Number.isFinite(prixSaisi) || prixSaisi < 0) {
      erreur = "Saisis un poids réel valide et un prix final positif ou nul pour chaque produit.";
      return;
    }

    prixParLigne[ligneIndex] = Math.round((prixSaisi + Number.EPSILON) * 100) / 100;
  });

  if (erreur) return alert(erreur);

  const nombreLignesAConfirmer = lignes.filter(
    ligne =>
      estLignePoidsReel(ligne) &&
      !(valeurNombre(ligne.poidsReel) > 0)
  ).length;

  if (
    Object.keys(poidsParLigne).length !== nombreLignesAConfirmer ||
    Object.keys(prixParLigne).length !== nombreLignesAConfirmer
  ) {
    return alert(
      "Saisis le poids réel et le prix final pour chaque ligne de viande séchée et de lard sec."
    );
  }

  const resume = lignes
    .map((ligne, i) => {
      if (poidsParLigne[i] == null || prixParLigne[i] == null) {
        return "";
      }

      return (
        (ligne.nom || ligne.nomProduit || ligne.reference || "Produit") +
        " : " + poidsParLigne[i] + " g — " +
        formatCHF(prixParLigne[i]) +
        " (tarif indicatif : " + formatCHF(tarifLignePoids(ligne)) + " / 100 g)"
      );
    })
    .filter(Boolean)
    .join("\n");

  if (!confirm(
    "Vérifie les poids et les prix saisis :\n\n" +
    resume +
    "\n\nConfirmer ces valeurs et mettre à jour le stock ?"
  )) {
    return;
  }

  try {
    if (typeof finaliserPoidsReelCommande !== "function") {
      return alert(
        "La fonction de finalisation est absente. Vérifie que js/database.js est chargé et à jour."
      );
    }

    const resultat = finaliserPoidsReelCommande(
      cmd.id || cmd.numero || cmd.reference,
      poidsParLigne,
      prixParLigne
    );

    if (resultat === false) {
      afficherCommandes();

      return alert(
        "La base de données n’a pas pu finaliser cette commande. " +
        "Vérifie le stock et les données de la commande avant de réessayer. " +
        "Ne relance pas la confirmation sans avoir vérifié l’état de la commande."
      );
    }

    enregistrerDBAdmin();

    const actualisee =
      obtenirCommandeParIdentifiant(cmd.id || cmd.numero || cmd.reference) ||
      obtenirCommandes().find(c => c === cmd) ||
      cmd;

    if (!actualisee.prixConfirme) {
      afficherCommandes();

      return alert(
        "La finalisation n’a pas confirmé le prix dans la base de données. " +
        "Aucun e-mail de confirmation n’a été lancé. Vérifie la commande et le stock."
      );
    }

    // Marquer la confirmation du prix comme modification à synchroniser entre appareils.
    actualisee.dateModification = new Date().toISOString();
    cmd.dateModification = actualisee.dateModification;
    enregistrerDBAdmin();

    const totalFinal = obtenirTotalCommandeAdmin(actualisee);

    if (!(totalFinal >= 0)) {
      afficherCommandes();

      return alert(
        "Le total final est invalide. Aucun e-mail de confirmation n’a été lancé."
      );
    }

    // Les anciennes commandes n'avaient pas encore de numéro séquentiel.
    // On leur en attribue un au moment de la confirmation finale.
    if (!actualisee.numeroCommande) {
      try {
        actualisee.numeroCommande = await obtenirNumeroCommandeCentralAdmin(
          obtenirNomClient(actualisee),
          new Date().getFullYear()
        );
        cmd.numeroCommande = actualisee.numeroCommande;
        enregistrerDBAdmin();
      } catch (erreurNumero) {
        console.error("Attribution du numéro de commande impossible :", erreurNumero);
        afficherCommandes();
        return alert(
          "Le prix a été enregistré, mais aucun numéro de commande n'a pu être attribué. " +
          "Aucun e-mail de confirmation n'a été envoyé. Réessaie plus tard."
        );
      }
    }

    let statutEmail = "";

    if (typeof envoyerEmailConfirmationPrix === "function") {
      try {
        const resultatEmail = await envoyerEmailConfirmationPrix(
          normaliserCommandePourPDF(actualisee)
        );

        if (
          resultatEmail === false ||
          (resultatEmail && resultatEmail.ok === false)
        ) {
          statutEmail =
            "La demande d’envoi de l’e-mail a échoué. Vérifie la configuration du module PDF et du script Google.";
        } else {
          statutEmail =
            "La demande d’envoi de l’e-mail de confirmation a été lancée. Vérifie également la réception du message.";
        }
      } catch (e) {
        console.error("Erreur d’envoi de l’e-mail :", e);
        statutEmail =
          "L’e-mail n’a pas pu être lancé : " + e.message;
      }
    } else {
      statutEmail =
        "La fonction d’e-mail de confirmation est absente de js/pdfcommande.js.";
    }

    afficherCommandes();

    if (typeof afficherResumeStock === "function") {
      afficherResumeStock();
    }

    if (typeof afficherStatistiques === "function") {
      afficherStatistiques();
    }

    if (typeof afficherResumeAchats === "function") {
      afficherResumeAchats();
    }

    alert(
      "Prix final confirmé : " + formatCHF(totalFinal) + ".\n\n" +
      statutEmail +
      "\n\nPour le SMS, utilise le bouton « Préparer le SMS de confirmation ». " +
      "Le SMS doit être envoyé manuellement depuis l’iPhone."
    );
  } catch (e) {
    console.error("Erreur pendant la confirmation du prix :", e);

    alert(
      "Une erreur est survenue pendant la confirmation du prix : " +
      e.message +
      "\n\nVérifie l’état de la commande et du stock avant de recommencer."
    );
  }
}

/* ---------- Archives et suppression ---------- */

function supprimerAchatsAutomatiquesCommande(cmd) {
  const base = obtenirDBAdmin();
  if (!Array.isArray(base.achats)) return;

  const id = String(cmd && cmd.id || "");

  base.achats = base.achats.filter(a =>
    !(a && a.automatique &&
      String(a.commandeId || a.idCommande || "") === id)
  );
}

function archiverCommande(index) {
  const commandes = obtenirCommandes();
  const cmd = commandes[index];

  if (!cmd) return;

  if (!confirm("Archiver cette commande ?")) return;

  const base = obtenirDBAdmin();
  if (!Array.isArray(base.archives)) base.archives = [];

  cmd.dateArchivage = new Date().toISOString();
  base.archives.push(cmd);

  supprimerAchatsAutomatiquesCommande(cmd);
  commandes.splice(index, 1);

  enregistrerDBAdmin();
  afficherCommandes();
  afficherStatistiques();
  afficherResumeStock();
  afficherResumeAchats();
}

function supprimerCommande(index) {
  const commandes = obtenirCommandes();
  const cmd = commandes[index];

  if (!cmd) return;

  if (!confirm(
    "Supprimer définitivement cette commande ? Cette action est irréversible."
  )) {
    return;
  }

  supprimerAchatsAutomatiquesCommande(cmd);
  commandes.splice(index, 1);

  enregistrerDBAdmin();
  afficherCommandes();
  afficherStatistiques();
  afficherResumeStock();
  afficherResumeAchats();
}

/* ---------- Statistiques et tableaux de bord ---------- */

function afficherStatistiques() {
  const commandes = obtenirCommandes();
  const auj = new Date().toLocaleDateString("fr-CH");
  const aujISO = new Date().toISOString().slice(0, 10);

  const jour = commandes.filter(x => {
    const date = String(x.date || x.dateCommande || "");

    return date && (
      date.includes(auj) ||
      date.slice(0, 10) === aujISO
    );
  });

  const ca = commandes
    .filter(x => x.paiementConfirme || x.statut === "Livrée")
    .reduce((s, x) => s + obtenirTotalCommandeAdmin(x), 0);

  definirTexte("nbCommandes", commandes.length);
  definirTexte("caTotal", formatCHF(ca));
  definirTexte("commandeJour", jour.length);

  const achats = obtenirDBAdmin().achats;
  definirTexte("nbAchats", Array.isArray(achats) ? achats.length : 0);
  definirTexte("sessionActive", "Active");

  afficherDernieresCommandes();
}

function afficherDernieresCommandes() {
  const el = document.getElementById("dernieresCommandes");
  if (!el) return;

  const commandes = obtenirCommandes().slice().reverse().slice(0, 5);

  el.innerHTML = commandes.length
    ? commandes.map(cmd =>
      "<li><strong>" +
      texteSecurise(identifiantCommande(cmd, 0)) +
      "</strong> — " +
      texteSecurise(obtenirNomClient(cmd)) +
      " — " + formatCHF(obtenirTotalCommandeAdmin(cmd)) +
      "</li>"
    ).join("")
    : "<li>Aucune commande.</li>";
}

function afficherResumeStock() {
  const base = obtenirDBAdmin();

  const produits = Array.isArray(base.produits)
    ? base.produits
    : (Array.isArray(base.stock) ? base.stock : []);

  const quantiteStock = produit =>
    valeurNombre(
      produit.quantite ||
      produit.stock ||
      produit.quantiteStock
    );

  const total = produits.reduce(
    (s, produit) => s + quantiteStock(produit),
    0
  );

  const critiques = produits.filter(produit =>
    quantiteStock(produit) <=
    valeurNombre(
      produit.seuilAlerte ||
      produit.stockMinimum ||
      produit.seuil
    )
  );

  definirTexte("totalArticlesStock", total);

  definirTexte("valeurStock", formatCHF(produits.reduce(
    (s, produit) =>
      s + quantiteStock(produit) *
      valeurNombre(
        produit.prixAchat ||
        produit.prixUnitaire ||
        produit.prix
      ),
    0
  )));

  definirTexte("stockCritiqueStock", critiques.length);
  definirTexte("stockCritique", critiques.length);

  const liste = document.getElementById("listeAlertes");

  if (liste) {
    liste.innerHTML = critiques.length
      ? critiques.map(produit =>
        "<li>" +
        texteSecurise(produit.nom || produit.nomProduit || "Article") +
        " — stock : " + quantiteStock(produit) +
        "</li>"
      ).join("")
      : "<li>Aucune alerte de stock.</li>";
  }
}

function afficherAlertes() {
  afficherResumeStock();
}

function afficherResumeAchats() {
  const base = obtenirDBAdmin();
  const achats = Array.isArray(base.achats) ? base.achats : [];

  definirTexte(
    "achatsEnAttente",
    achats.filter(
      x => !x.receptionne && x.statut !== "Réceptionné"
    ).length
  );

  definirTexte(
    "achatsReceptionnes",
    achats.filter(
      x => x.receptionne || x.statut === "Réceptionné"
    ).length
  );

  definirTexte(
    "nombreFournisseurs",
    new Set(achats.map(x => x.fournisseur).filter(Boolean)).size
  );
}

/* ---------- Sauvegarde et restauration ---------- */

function sauvegarderBaseFichier() {
  const blob = new Blob(
    [JSON.stringify(obtenirDBAdmin(), null, 2)],
    { type: "application/json;charset=utf-8" }
  );

  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");

  lien.href = url;
  lien.download = "idee-gourmande-sauvegarde-" +
    new Date().toISOString().slice(0, 10) + ".json";

  document.body.appendChild(lien);
  lien.click();
  lien.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function restaurerBaseFichier(event) {
  const fichier = event &&
    event.target &&
    event.target.files &&
    event.target.files[0];

  if (!fichier) return;

  if (!confirm(
    "Restaurer cette sauvegarde remplacera les données locales actuelles. Continuer ?"
  )) {
    event.target.value = "";
    return;
  }

  const lecteur = new FileReader();

  lecteur.onload = function () {
    try {
      const base = JSON.parse(lecteur.result);

      if (
        !base ||
        typeof base !== "object" ||
        !Array.isArray(base.commandes)
      ) {
        throw new Error(
          "Fichier de sauvegarde Idée Gourmande invalide."
        );
      }

      const cle = typeof CLE_BASE !== "undefined"
        ? CLE_BASE
        : "ideeGourmandeDB";

      localStorage.setItem(
        CLE_SECURITE_RESTAURATION,
        localStorage.getItem(cle) || ""
      );

      localStorage.setItem(cle, JSON.stringify(base));

      alert("Sauvegarde restaurée. La page va se recharger.");
      location.reload();
    } catch (e) {
      alert("Impossible de restaurer la sauvegarde : " + e.message);
    }
  };

  lecteur.onerror = function () {
    alert("Impossible de lire le fichier de sauvegarde.");
  };

  lecteur.readAsText(fichier);
}

function reinitialiserCommandesEtAchats() {
  if (!confirm(
    "ATTENTION : supprimer toutes les commandes et tous les achats ? " +
    "Fais une sauvegarde avant de continuer. Cette action est irréversible."
  )) {
    return;
  }

  const base = obtenirDBAdmin();
  base.commandes = [];
  base.achats = [];

  enregistrerDBAdmin();
  afficherCommandes();
  afficherStatistiques();
  afficherResumeStock();
  afficherResumeAchats();

  alert("Les commandes et les achats ont été réinitialisés.");
}

function deconnexion() {
  localStorage.removeItem("adminConnecte");
  window.location.href = "admin-login.html";
}

/* ---------- Recherche et tri ---------- */

function rechercherCommandes() {
  const champ =
    document.getElementById("rechercheCommande") ||
    document.getElementById("rechercheCommandes") ||
    document.getElementById("recherche");

  if (!champ) return;

  const terme = champ.value.toLowerCase().trim();

  const commandes = obtenirCommandes().filter(cmd => {
    const valeurs = [
      identifiantCommande(cmd, 0),
      obtenirNomClient(cmd),
      obtenirEmailClient(cmd),
      obtenirTelephoneClient(cmd),
      cmd.statut || "",
      ...obtenirLignesCommande(cmd).map(
        ligne => ligne.nom || ligne.nomProduit || ligne.reference || ""
      )
    ];

    return valeurs.join(" ").toLowerCase().includes(terme);
  });

  afficherListeCommandes(commandes);
}

function rechercherCommande() {
  rechercherCommandes();
}

function trierCommandes(critere) {
  const select = document.getElementById("triCommandes");

  if (!critere && select) critere = select.value;

  const commandes = obtenirCommandes().slice();

  if (critere === "date") {
    commandes.sort((a, b) =>
      String(b.date || b.dateCommande || "")
        .localeCompare(String(a.date || a.dateCommande || ""))
    );
  } else if (critere === "total") {
    commandes.sort(
      (a, b) =>
        obtenirTotalCommandeAdmin(b) - obtenirTotalCommandeAdmin(a)
    );
  } else if (critere === "client") {
    commandes.sort((a, b) =>
      obtenirNomClient(a).localeCompare(obtenirNomClient(b), "fr")
    );
  }

  afficherListeCommandes(commandes);
}

/* ---------- Fonctions accessibles depuis le HTML ---------- */

Object.assign(window, {
  obtenirCommandes,
  obtenirArchives,
  afficherCommandes,
  afficherListeCommandes,
  afficherProduitsCommande,
  changerStatut,
  archiverCommande,
  supprimerCommande,
  imprimerCommande,
  renvoyerEmail,
  confirmerPrixCommande,
  sauvegarderBaseFichier,
  restaurerBaseFichier,
  reinitialiserCommandesEtAchats,
  deconnexion,
  rechercherCommandes,
  rechercherCommande,
  trierCommandes,
  afficherResumeStock,
  afficherResumeAchats,
  afficherStatistiques,
  afficherAlertes
});

/* ---------- Initialisation ---------- */

document.addEventListener("DOMContentLoaded", function () {
  try {
    afficherCommandes();
    afficherResumeStock();
    afficherResumeAchats();
    afficherStatistiques();
    afficherAlertes();
    afficherDernieresCommandes();
  } catch (e) {
    console.error(
      "Erreur d’initialisation de l’administration :",
      e
    );
  }
});

window.addEventListener("storage", function (event) {
  try {
    if (
      typeof CLE_BASE !== "undefined" &&
      event.key &&
      event.key !== CLE_BASE
    ) {
      return;
    }

    if (typeof chargerDB === "function") chargerDB();

    afficherCommandes();
    afficherResumeStock();
    afficherResumeAchats();
    afficherStatistiques();
    afficherAlertes();
  } catch (e) {
    console.error("Erreur de synchronisation locale :", e);
  }
});
