
/* ============================================================
   Idée Gourmande — Administration — Version 3.0.0
   Pesée réelle, prix final plafonné, e-mail de confirmation,
   SMS prérempli à envoyer manuellement, impression PDF sans e-mail.
   ============================================================ */
"use strict";

const CLE_SECURITE_RESTAURATION = "ideeGourmandeDB_avant_restauration";
const NUMERO_TWINT_ADMIN = "079 592 78 82";
const TARIFS_POIDS_REEL = { "viande-sechee": 9, "lard-sec": 4 };

function obtenirDBAdmin() {
  if (typeof db !== "undefined" && db) return db;
  try {
    if (typeof chargerDB === "function") {
      const base = chargerDB();
      if (base) return base;
    }
  } catch (e) {}
  return {};
}

function enregistrerDBAdmin() {
  try {
    if (typeof sauvegarderDB === "function") sauvegarderDB();
    else if (typeof sauvegarderBase === "function") sauvegarderBase();
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

function texteSecurise(v) {
  return String(v == null ? "" : v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function valeurNombre(v) {
  const n = Number(String(v == null ? "" : v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function formatCHF(v) {
  return valeurNombre(v).toLocaleString("fr-CH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + " CHF";
}

function identifiantCommande(cmd, i) {
  return String((cmd && (cmd.id || cmd.numero || cmd.reference)) || ("commande-" + i));
}

function obtenirNomClient(cmd) {
  if (cmd && cmd.client && typeof cmd.client === "object") {
    return [cmd.client.prenom, cmd.client.nom].filter(Boolean).join(" ").trim() || "Client";
  }
  return String((cmd && (cmd.nomClient || cmd.client)) || "Client");
}

function obtenirEmailClient(cmd) {
  return (cmd && cmd.client && typeof cmd.client === "object" && cmd.client.email) ||
    (cmd && (cmd.email || cmd.emailClient)) || "";
}

function obtenirTelephoneClient(cmd) {
  return (cmd && cmd.client && typeof cmd.client === "object" && cmd.client.telephone) ||
    (cmd && (cmd.telephone || cmd.phone)) || "";
}

function obtenirAdresseClient(cmd) {
  return (cmd && cmd.client && typeof cmd.client === "object" && cmd.client.adresse) ||
    (cmd && cmd.adresse) || "";
}

function obtenirLignesCommande(cmd) {
  if (Array.isArray(cmd && cmd.produitsListe)) return cmd.produitsListe;
  if (Array.isArray(cmd && cmd.produits)) return cmd.produits;
  return [];
}

function estLignePoidsReel(ligne) {
  if (!ligne) return false;

  if (typeof estProduitAPoidsReel === "function") {
    try {
      return estProduitAPoidsReel(ligne);
    } catch (e) {}
  }

  const ref = String(
    ligne.reference || ligne.id || ligne.slug || ligne.nom || ligne.nomProduit || ""
  ).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  return ref.includes("viande-sechee") ||
    ref.includes("lard-sec") ||
    (ref.includes("viande") && ref.includes("sechee")) ||
    (ref.includes("lard") && ref.includes("sec"));
}

function cleProduitPoids(ligne) {
  const ref = String(
    ligne && (ligne.reference || ligne.id || ligne.slug || ligne.nom || "") || ""
  ).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  return ref.includes("lard") ? "lard-sec" : "viande-sechee";
}

function tarifLignePoids(ligne) {
  const tarif = valeurNombre(ligne && (ligne.prixPar100g || ligne.tarif100g));
  return tarif > 0 ? tarif : TARIFS_POIDS_REEL[cleProduitPoids(ligne)];
}

function lirePrixPlafond(ligne) {
  const plafond = valeurNombre(ligne && (ligne.prixPlafond || ligne.prix_plafond));
  if (plafond > 0) return plafond;

  const max = valeurNombre(ligne && (ligne.poidsMax || ligne.poids_max));
  return max > 0 ? max / 100 * tarifLignePoids(ligne) : 0;
}

function libelleFourchette(ligne) {
  const min = valeurNombre(ligne && (ligne.poidsMin || ligne.poids_min));
  const max = valeurNombre(ligne && (ligne.poidsMax || ligne.poids_max));

  if (!(min > 0 && max > 0)) return "Fourchette choisie par le client";

  const f = g => g >= 1000
    ? (g % 1000 === 0 ? (g / 1000) + " kg" : (g / 1000).toLocaleString("fr-CH") + " kg")
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
  if (!lignes.length) return "<p>Aucun détail de produit disponible.</p>";

  return "<ul class=\"admin-produits\">" + lignes.map(ligne => {
    const nom = texteSecurise(
      ligne.nom || ligne.nomProduit || ligne.produit || ligne.reference || "Produit"
    );
    const qte = valeurNombre(ligne.quantite || ligne.qte || 1) || 1;
    let details = "";

    if (estLignePoidsReel(ligne)) {
      details = '<div class="admin-poids-details">' +
        '<span>Fourchette : ' + texteSecurise(libelleFourchette(ligne)) + '</span>' +
        '<br><span>Tarif : ' + formatCHF(tarifLignePoids(ligne)) + ' / 100 g</span>';

      if (valeurNombre(ligne.poidsReel) > 0) {
        details += '<br><strong>Poids réel : ' + valeurNombre(ligne.poidsReel) + ' g</strong>' +
          '<br><strong>Prix final : ' +
          formatCHF(ligne.prixFinal != null ? ligne.prixFinal : ligne.prix) +
          '</strong>';
      } else {
        details += '<br><span>Prix indicatif : ' +
          formatCHF(ligne.prixIndicatif != null ? ligne.prixIndicatif : ligne.prix) +
          ' — plafond : ' + formatCHF(lirePrixPlafond(ligne)) + '</span>';
      }

      details += "</div>";
    } else if (ligne.poids) {
      details = '<div class="admin-poids-details">Poids : ' +
        texteSecurise(ligne.poids) + ' g</div>';
    }

    const prix = valeurNombre(ligne.prixFinal != null ? ligne.prixFinal : ligne.prix);

    return '<li><strong>' + nom + '</strong> × ' + qte +
      (prix > 0 ? ' — ' + formatCHF(prix) : '') + details + '</li>';
  }).join("") + "</ul>";
}

function commandeNecessitePoidsReel(cmd) {
  return obtenirLignesCommande(cmd).some(
    l => estLignePoidsReel(l) && !(valeurNombre(l.poidsReel) > 0)
  );
}

/* ---------- Saisie du poids réel ---------- */

function rendreZonePoidsReel(cmd, indexCommande) {
  const lignes = obtenirLignesCommande(cmd);

  const aPeser = lignes.map((ligne, indexLigne) => ({ ligne, indexLigne }))
    .filter(x => estLignePoidsReel(x.ligne) && !(valeurNombre(x.ligne.poidsReel) > 0));

  if (!aPeser.length) {
    return lignes.some(estLignePoidsReel) && cmd.prixConfirme
      ? '<div class="admin-prix-confirme"><strong>Prix final confirmé</strong><br>' +
        (cmd.paiementConfirme ? "Paiement confirmé." : "En attente du paiement.") +
        "</div>"
      : "";
  }

  return '<section class="admin-finalisation-poids" style="margin-top:12px;padding:12px;border:1px solid #d9c8a8;border-radius:8px">' +
    '<h4 style="margin:0 0 8px">Finaliser le poids et le prix</h4>' +
    '<p style="margin:0 0 10px">Saisis le poids réellement mesuré en grammes. Si le poids dépasse la limite choisie, le surplus est offert : le prix ne dépassera jamais le plafond annoncé.</p>' +

    aPeser.map(x =>
      '<label for="poids-reel-' + indexCommande + '-' + x.indexLigne +
      '" style="display:block;margin:8px 0 4px"><strong>' +
      texteSecurise(x.ligne.nom || x.ligne.nomProduit || x.ligne.reference || "Produit") +
      '</strong> (' + texteSecurise(libelleFourchette(x.ligne)) +
      ') — plafond ' + formatCHF(lirePrixPlafond(x.ligne)) + '</label>' +

      '<input id="poids-reel-' + indexCommande + '-' + x.indexLigne +
      '" class="champ-poids-reel" type="number" min="1" step="1" inputmode="numeric"' +
      ' data-commande-index="' + indexCommande +
      '" data-ligne-index="' + x.indexLigne +
      '" placeholder="Poids réel en grammes" style="max-width:240px;width:100%;padding:8px">'
    ).join("") +

    '<div style="margin-top:12px">' +
    '<button type="button" onclick="confirmerPrixCommande(' + indexCommande + ')">' +
    'Calculer et confirmer le prix final</button></div></section>';
}

/* ---------- Préparation du SMS ---------- */

function boutonSMSCommande(cmd, index) {
  if (!cmd || !cmd.prixConfirme) return "";

  const tel = obtenirTelephoneClient(cmd);
  if (!tel) return "<p>Numéro de téléphone absent : impossible de préparer le SMS.</p>";

  const msg = "Bonjour " + obtenirNomClient(cmd) +
    ", le prix final de votre commande " + identifiantCommande(cmd, index) +
    " chez Idée Gourmande est de " + formatCHF(cmd.total) +
    ". Vous pouvez régler par TWINT au " + NUMERO_TWINT_ADMIN +
    ". Merci et belle journée !";

  const lien = "sms:" + tel.replace(/[^\d+]/g, "") +
    "&body=" + encodeURIComponent(msg);

  return '<p style="margin-top:10px"><a href="' + texteSecurise(lien) +
    '" style="display:inline-block;padding:9px 12px;border-radius:6px;background:#237b59;color:white;text-decoration:none">' +
    "Préparer le SMS de confirmation</a></p>" +
    "<small>Le SMS n’est pas envoyé automatiquement : ouvre ce lien sur l’iPhone puis appuie sur Envoyer.</small>";
}

/* ---------- Liste des commandes ---------- */

function afficherListeCommandes(commandes) {
  const conteneur = document.getElementById("listeCommandes");
  if (!conteneur) return;

  if (!Array.isArray(commandes) || !commandes.length) {
    conteneur.innerHTML = '<p class="message-vide">Aucune commande pour le moment.</p>';
    return;
  }

  conteneur.innerHTML = commandes.map((cmd, index) => {
    const nom = obtenirNomClient(cmd);
    const email = obtenirEmailClient(cmd);
    const tel = obtenirTelephoneClient(cmd);
    const adresse = obtenirAdresseClient(cmd);
    const id = identifiantCommande(cmd, index);
    const statut = cmd.statut || "Nouvelle";
    const date = cmd.date || cmd.dateCommande || "";

    return '<article class="commande-admin" style="border:1px solid #ddd;border-radius:10px;padding:16px;margin:12px 0">' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between">' +
      '<h3 style="margin:0">Commande ' + texteSecurise(id) + '</h3>' +
      '<span>' + texteSecurise(date) + '</span></div>' +

      '<p><strong>Client :</strong> ' + texteSecurise(nom) + '</p>' +
      (email ? '<p><strong>E-mail :</strong> <a href="mailto:' +
        texteSecurise(email) + '">' + texteSecurise(email) + '</a></p>' : "") +
      (tel ? '<p><strong>Téléphone :</strong> ' + texteSecurise(tel) + '</p>' : "") +
      (adresse ? '<p><strong>Adresse :</strong> ' + texteSecurise(adresse) + '</p>' : "") +
      (cmd.commentaire ? '<p><strong>Commentaire :</strong> ' +
        texteSecurise(cmd.commentaire) + '</p>' : "") +

      "<h4>Produits</h4>" + afficherProduitsCommande(cmd, index) +

      '<p><strong>' + (cmd.prixConfirme ? "Prix final confirmé :" : "Total actuel :") +
      "</strong> " + formatCHF(cmd.total) +
      (commandeNecessitePoidsReel(cmd) ? " <span>(prix à confirmer après pesée)</span>" : "") +
      "</p>" +

      rendreZonePoidsReel(cmd, index) +
      boutonSMSCommande(cmd, index) +

      '<p><label for="statut-' + index + '"><strong>Statut :</strong> </label>' +
      '<select id="statut-' + index + '" onchange="changerStatut(' + index + ',this.value)">' +
      ["Nouvelle", "En préparation", "Prête", "Livrée", "Annulée"].map(s =>
        '<option value="' + s + '"' + (s === statut ? " selected" : "") + ">" + s + "</option>"
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
  const c = obtenirCommandes();
  if (!c[index]) return;

  c[index].statut = valeur;
  c[index].dateModification = new Date().toISOString();

  enregistrerDBAdmin();
  afficherCommandes();
  afficherStatistiques();
}

/* ---------- PDF et e-mail ---------- */

function normaliserCommandePourPDF(cmd) {
  const c = cmd.client && typeof cmd.client === "object" ? cmd.client : {};

  return Object.assign({}, cmd, {
    id: cmd.id || cmd.numero || "",
    client: {
      prenom: c.prenom || cmd.prenom || "",
      nom: c.nom || cmd.nom || cmd.nomClient || "",
      email: c.email || cmd.email || "",
      telephone: c.telephone || cmd.telephone || "",
      adresse: c.adresse || cmd.adresse || "",
      commentaire: c.commentaire || cmd.commentaire || "",
      modeLivraison: c.modeLivraison || cmd.modeLivraison || ""
    },
    produits: obtenirLignesCommande(cmd),
    total: valeurNombre(cmd.total),
    prixConfirme: !!cmd.prixConfirme
  });
}

function imprimerCommande(index) {
  const cmd = obtenirCommandes()[index];
  if (!cmd) return alert("Commande introuvable.");

  try {
    const pdf = normaliserCommandePourPDF(cmd);

    if (typeof genererPDFCommande === "function") {
      genererPDFCommande(pdf, { envoyerEmail: false, telecharger: true });
    } else if (typeof imprimerPDFCommande === "function") {
      imprimerPDFCommande(pdf);
    } else {
      alert("Le module PDF n’est pas chargé. Vérifie js/pdfcommande.js dans admin.html.");
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
  if (!email) return alert("Aucune adresse e-mail enregistrée pour ce client.");

  const sujet = cmd.prixConfirme
    ? "Confirmation du prix final — commande " + identifiantCommande(cmd, index)
    : "Votre commande Idée Gourmande — " + identifiantCommande(cmd, index);

  const corps = cmd.prixConfirme
    ? "Bonjour " + obtenirNomClient(cmd) +
      ",\r\n\r\nLe prix final de votre commande est de " + formatCHF(cmd.total) +
      ". Vous pouvez régler par TWINT au " + NUMERO_TWINT_ADMIN +
      ".\r\n\r\nMerci, Idée Gourmande."
    : "Bonjour " + obtenirNomClient(cmd) +
      ",\r\n\r\nNous vous confirmerons le prix final après la pesée des produits concernés." +
      "\r\n\r\nMerci, Idée Gourmande.";

  window.location.href = "mailto:" + encodeURIComponent(email) +
    "?subject=" + encodeURIComponent(sujet) +
    "&body=" + encodeURIComponent(corps);
}

function obtenirCommandeParIdentifiant(id) {
  return obtenirCommandes().find(c => String(c.id) === String(id)) || null;
}

/* ---------- Confirmation du poids et du prix final ---------- */

async function confirmerPrixCommande(index) {
  const commandes = obtenirCommandes();
  const cmd = commandes[index];

  if (!cmd) return alert("Commande introuvable.");
  if (cmd.prixConfirme) return alert("Le prix de cette commande est déjà confirmé.");

  const poidsParLigne = {};
  let erreur = "";

  const inputs = document.querySelectorAll(
    '.champ-poids-reel[data-commande-index="' + index + '"]'
  );

  inputs.forEach(input => {
    const poids = Math.round(valeurNombre(input.value));
    const li = input.getAttribute("data-ligne-index");

    if (!(poids > 0)) {
      erreur = "Saisis un poids réel positif pour chaque produit concerné.";
    } else {
      poidsParLigne[li] = poids;
    }
  });

  if (erreur) return alert(erreur);

  const attendu = obtenirLignesCommande(cmd).filter(
    l => estLignePoidsReel(l) && !(valeurNombre(l.poidsReel) > 0)
  ).length;

  if (Object.keys(poidsParLigne).length !== attendu) {
    return alert("Saisis le poids réel pour chaque ligne de viande séchée et de lard sec.");
  }

  if (!confirm(
    "Confirmer les poids saisis, calculer le prix final et mettre à jour le stock ? " +
    "Le prix restera plafonné au montant annoncé au client."
  )) return;

  try {
    if (typeof finaliserPoidsReelCommande !== "function") {
      return alert(
        "La fonction de finalisation est absente. Vérifie que js/database.js version 3.3.0 est chargé."
      );
    }

    const resultat = finaliserPoidsReelCommande(cmd.id, poidsParLigne);
    if (resultat === false) {
      return alert("La base de données n’a pas pu finaliser cette commande.");
    }

    enregistrerDBAdmin();

    const actualisee = obtenirCommandeParIdentifiant(cmd.id) || cmd;

    if (!actualisee.prixConfirme) {
      afficherCommandes();
      return alert(
        "Les poids ont été enregistrés, mais la commande n’est pas marquée comme confirmée. Vérifie la base de données."
      );
    }

    let statutEmail = "";

    if (typeof envoyerEmailConfirmationPrix === "function") {
      try {
        const r = await envoyerEmailConfirmationPrix(normaliserCommandePourPDF(actualisee));
        statutEmail = r === false
          ? "L’envoi de l’e-mail n’a pas été confirmé."
          : "La demande d’envoi de l’e-mail de confirmation a été lancée.";
      } catch (e) {
        console.error(e);
        statutEmail = "L’e-mail n’a pas pu être lancé : " + e.message;
      }
    } else {
      statutEmail = "La fonction d’e-mail de confirmation est absente de js/pdfcommande.js.";
    }

    afficherCommandes();

    if (typeof afficherResumeStock === "function") afficherResumeStock();
    if (typeof afficherStatistiques === "function") afficherStatistiques();

    alert(
      "Prix final confirmé : " + formatCHF(actualisee.total) + ".\n" +
      statutEmail +
      "\n\nPour le SMS, utilise le bouton « Préparer le SMS de confirmation ». " +
      "Le SMS devra être envoyé manuellement depuis l’iPhone."
    );
  } catch (e) {
    console.error(e);
    alert("Erreur pendant la confirmation du prix : " + e.message);
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
  const c = obtenirCommandes();
  const cmd = c[index];
  if (!cmd) return;

  if (!confirm("Archiver cette commande ?")) return;

  const base = obtenirDBAdmin();
  if (!Array.isArray(base.archives)) base.archives = [];

  cmd.dateArchivage = new Date().toISOString();
  base.archives.push(cmd);

  supprimerAchatsAutomatiquesCommande(cmd);
  c.splice(index, 1);

  enregistrerDBAdmin();
  afficherCommandes();
  afficherStatistiques();
  afficherResumeStock();
  afficherResumeAchats();
}

function supprimerCommande(index) {
  const c = obtenirCommandes();
  const cmd = c[index];
  if (!cmd) return;

  if (!confirm("Supprimer définitivement cette commande ? Cette action est irréversible.")) return;

  supprimerAchatsAutomatiquesCommande(cmd);
  c.splice(index, 1);

  enregistrerDBAdmin();
  afficherCommandes();
  afficherStatistiques();
  afficherResumeStock();
  afficherResumeAchats();
}

/* ---------- Statistiques et tableaux de bord ---------- */

function afficherStatistiques() {
  const c = obtenirCommandes();
  const auj = new Date().toLocaleDateString("fr-CH");

  const jour = c.filter(x => {
    const d = x.date || x.dateCommande || "";
    return d && (
      d.includes(auj) ||
      d.slice(0, 10) === new Date().toISOString().slice(0, 10)
    );
  });

  const ca = c.filter(x => x.paiementConfirme || x.statut === "Livrée")
    .reduce((s, x) => s + valeurNombre(x.total), 0);

  definirTexte("nbCommandes", c.length);
  definirTexte("caTotal", formatCHF(ca));
  definirTexte("commandeJour", jour.length);
  definirTexte(
    "nbAchats",
    Array.isArray(obtenirDBAdmin().achats) ? obtenirDBAdmin().achats.length : 0
  );
  definirTexte("sessionActive", "Active");

  afficherDernieresCommandes();
}

function afficherDernieresCommandes() {
  const el = document.getElementById("dernieresCommandes");
  if (!el) return;

  const c = obtenirCommandes().slice().reverse().slice(0, 5);

  el.innerHTML = c.length
    ? c.map(cmd =>
        "<li><strong>" + texteSecurise(identifiantCommande(cmd, 0)) +
        "</strong> — " + texteSecurise(obtenirNomClient(cmd)) +
        " — " + formatCHF(cmd.total) + "</li>"
      ).join("")
    : "<li>Aucune commande.</li>";
}

function afficherResumeStock() {
  const base = obtenirDBAdmin();
  const p = Array.isArray(base.produits)
    ? base.produits
    : (Array.isArray(base.stock) ? base.stock : []);

  const q = p.reduce(
    (s, x) => s + valeurNombre(x.quantite || x.stock || x.quantiteStock), 0
  );

  const crit = p.filter(x =>
    valeurNombre(x.quantite || x.stock || x.quantiteStock) <=
    valeurNombre(x.seuilAlerte || x.stockMinimum || x.seuil)
  );

  definirTexte("totalArticlesStock", q);

  definirTexte("valeurStock", formatCHF(p.reduce(
    (s, x) =>
      s + valeurNombre(x.quantite || x.stock || x.quantiteStock) *
      valeurNombre(x.prixAchat || x.prixUnitaire || x.prix),
    0
  )));

  definirTexte("stockCritiqueStock", crit.length);
  definirTexte("stockCritique", crit.length);

  const liste = document.getElementById("listeAlertes");

  if (liste) {
    liste.innerHTML = crit.length
      ? crit.map(x =>
          "<li>" + texteSecurise(x.nom || x.nomProduit || "Article") +
          " — stock : " + valeurNombre(x.quantite || x.stock || x.quantiteStock) +
          "</li>"
        ).join("")
      : "<li>Aucune alerte de stock.</li>";
  }
}

function afficherAlertes() {
  afficherResumeStock();
}

function afficherResumeAchats() {
  const a = Array.isArray(obtenirDBAdmin().achats) ? obtenirDBAdmin().achats : [];

  definirTexte(
    "achatsEnAttente",
    a.filter(x => !x.receptionne && x.statut !== "Réceptionné").length
  );

  definirTexte(
    "achatsReceptionnes",
    a.filter(x => x.receptionne || x.statut === "Réceptionné").length
  );

  definirTexte(
    "nombreFournisseurs",
    new Set(a.map(x => x.fournisseur).filter(Boolean)).size
  );
}

/* ---------- Sauvegarde et restauration ---------- */

function sauvegarderBaseFichier() {
  const blob = new Blob(
    [JSON.stringify(obtenirDBAdmin(), null, 2)],
    { type: "application/json;charset=utf-8" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "idee-gourmande-sauvegarde-" +
    new Date().toISOString().slice(0, 10) + ".json";

  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

function restaurerBaseFichier(event) {
  const fichier = event && event.target && event.target.files && event.target.files[0];
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

      if (!base || typeof base !== "object" || !Array.isArray(base.commandes)) {
        throw new Error("Fichier de sauvegarde Idée Gourmande invalide.");
      }

      const cle = typeof CLE_BASE !== "undefined" ? CLE_BASE : "ideeGourmandeDB";

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

  lecteur.readAsText(fichier);
}

function reinitialiserCommandesEtAchats() {
  if (!confirm(
    "ATTENTION : supprimer toutes les commandes et tous les achats ? " +
    "Fais une sauvegarde avant de continuer. Cette action est irréversible."
  )) return;

  const b = obtenirDBAdmin();
  b.commandes = [];
  b.achats = [];

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
    document.getElementById("rechercheCommandes") ||
    document.getElementById("recherche");

  if (!champ) return;

  const t = champ.value.toLowerCase().trim();

  const c = obtenirCommandes().filter(cmd =>
    [
      identifiantCommande(cmd, 0),
      obtenirNomClient(cmd),
      obtenirEmailClient(cmd),
      obtenirTelephoneClient(cmd),
      cmd.statut,
      ...obtenirLignesCommande(cmd).map(l => l.nom || l.reference)
    ].join(" ").toLowerCase().includes(t)
  );

  afficherListeCommandes(c);
}

function trierCommandes(critere) {
  const c = obtenirCommandes().slice();

  if (critere === "date") {
    c.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  } else if (critere === "total") {
    c.sort((a, b) => valeurNombre(b.total) - valeurNombre(a.total));
  } else if (critere === "client") {
    c.sort((a, b) => obtenirNomClient(a).localeCompare(obtenirNomClient(b), "fr"));
  }

  afficherListeCommandes(c);
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
    console.error("Erreur d’initialisation de l’administration :", e);
  }
});

window.addEventListener("storage", function (event) {
  try {
    if (typeof CLE_BASE !== "undefined" && event.key && event.key !== CLE_BASE) return;

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
