
/* ==========================================================
   Idée Gourmande — PDF et e-mails des commandes
   Version 6.2.3
   ========================================================== */

(function () {
  "use strict";

  const URL_SCRIPT_GOOGLE =
    "https://script.google.com/macros/s/AKfycby5o5V0dRb9fPpnhmUYCeWB1LxXjGRXfQK0kQ2Tzw2gHK58GQn8VmxlDI1DFWzogAhI/exec";

  const NOM_ENTREPRISE = "Idée Gourmande";
  const EMAIL_ENTREPRISE = "ideesgourmandesge@gmail.com";
  const NUMERO_TWINT = "079 592 78 82";
  const FRAIS_LIVRAISON = 10.50;

  const TARIF_VIANDE_SECHEE_100G = 9;
  const TARIF_LARD_SEC_100G = 4;

  function valeur(v, remplacement = "") {
    return v === undefined || v === null || v === ""
      ? remplacement
      : v;
  }

  function nombreValide(v) {
    if (v === undefined || v === null || String(v).trim() === "") {
      return null;
    }
    const n = Number(String(v).replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }

  function montantCHF(nombre) {
    const n = Number(nombre);
    return (Number.isFinite(n) ? n : 0).toLocaleString("fr-CH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + " CHF";
  }

  function arrondirCentimes(nombre) {
    return Math.round((Number(nombre) + Number.EPSILON) * 100) / 100;
  }

  function echapperHTML(texte) {
    return String(texte === undefined || texte === null ? "" : texte)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function obtenirClient(commande) {
    const client = commande.client && typeof commande.client === "object"
      ? commande.client
      : (commande.clientDetails && typeof commande.clientDetails === "object"
        ? commande.clientDetails
        : {});

    return {
      prenom: valeur(client.prenom, commande.prenom || ""),
      nom: valeur(client.nom, commande.nom || commande.nomClient || ""),
      email: valeur(client.email, commande.email || commande.emailClient || ""),
      telephone: valeur(client.telephone, commande.telephone || commande.phone || ""),
      adresse: valeur(client.adresse, commande.adresse || ""),
      commentaire: valeur(client.commentaire, commande.commentaire || ""),
      modeLivraison: valeur(client.modeLivraison, commande.modeLivraison || "")
    };
  }

  function obtenirProduits(commande) {
    if (Array.isArray(commande.produitsListe)) return commande.produitsListe;
    if (Array.isArray(commande.produits)) return commande.produits;
    return [];
  }

  function texteNormalise(texte) {
    return String(texte || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function obtenirReference(article) {
    return texteNormalise(article.reference || article.id || article.slug || "");
  }

  function obtenirNomNormalise(article) {
    return texteNormalise(article.nom || article.nomProduit || article.produit || "");
  }

  function estProduitAuPoidsReel(article) {
    if (!article || typeof article !== "object") return false;

    const texte = obtenirReference(article) + " " + obtenirNomNormalise(article);

    return texte.includes("viande-sechee") ||
      texte.includes("viande_sechee") ||
      texte.includes("viande sechee") ||
      texte.includes("lard-sec") ||
      texte.includes("lard_sec") ||
      texte.includes("lard sec");
  }

  function estLardSec(article) {
    const texte = obtenirReference(article) + " " + obtenirNomNormalise(article);
    return texte.includes("lard-sec") ||
      texte.includes("lard_sec") ||
      texte.includes("lard sec");
  }

  function obtenirTarifAuPoids(article) {
    return estLardSec(article)
      ? TARIF_LARD_SEC_100G
      : TARIF_VIANDE_SECHEE_100G;
  }

  function obtenirPlafond(article) {
    const champs = [
      article.prixPlafond,
      article.prix_plafond,
      article.plafondPrix,
      article.plafond_prix
    ];

    for (const champ of champs) {
      if (champ !== undefined && champ !== null && String(champ).trim() !== "") {
        const plafond = nombreValide(champ);
        return plafond !== null && plafond > 0
          ? arrondirCentimes(plafond)
          : null;
      }
    }

    const poidsMax = nombreValide(article.poidsMax ?? article.poids_max);
    if (poidsMax === null || poidsMax <= 0) return null;

    return arrondirCentimes(poidsMax * obtenirTarifAuPoids(article) / 100);
  }

  function obtenirPrixFinalArticle(article) {
    const champs = [
      article.prixFinal,
      article.prix_final,
      article.prixConfirme,
      article.prix_confirme
    ];

    for (const champ of champs) {
      if (champ !== undefined && champ !== null && String(champ).trim() !== "") {
        return nombreValide(champ);
      }
    }

    return null;
  }

  function obtenirPrixIndicatifArticle(article) {
    const champs = [
      article.prixIndicatif,
      article.prix_indicatif,
      article.prix
    ];

    for (const champ of champs) {
      if (champ !== undefined && champ !== null && String(champ).trim() !== "") {
        return nombreValide(champ);
      }
    }

    return null;
  }

  function verifierPrixFinal(commande, produits) {
    if (!commande || commande.prixConfirme !== true) {
      throw new Error("Le prix final doit être confirmé avant l'envoi.");
    }

    produits.forEach(article => {
      if (!estProduitAuPoidsReel(article)) return;

      const prixFinal = obtenirPrixFinalArticle(article);
      if (prixFinal === null || prixFinal < 0) {
        throw new Error("Le prix final d'un article au poids est absent ou invalide.");
      }

      const poidsReel = nombreValide(article.poidsReel ?? article.poids_reel);
      if (poidsReel === null || poidsReel <= 0 || !Number.isInteger(poidsReel)) {
        throw new Error("Le poids réel doit être renseigné en grammes entiers avant l'envoi.");
      }
    });
  }

  function formaterPoids(poids) {
    const n = Number(poids);
    if (!Number.isFinite(n)) return String(poids) + " g";

    if (n >= 1000) {
      const kg = n / 1000;
      const valeurKg = Number.isInteger(kg)
        ? kg.toFixed(0)
        : kg.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
      return valeurKg + " kg";
    }

    return n + " g";
  }

  function ligneProduit(article, index) {
    const nom = valeur(article.nom || article.nomProduit || article.produit, "Article");
    const qte = nombreValide(article.quantite ?? article.qte);
    const quantite = qte !== null && qte > 0 ? qte : 1;

    let prix;

    if (estProduitAuPoidsReel(article)) {
      const prixFinal = obtenirPrixFinalArticle(article);
      prix = prixFinal !== null ? prixFinal : obtenirPrixIndicatifArticle(article);
    } else {
      prix = nombreValide(article.prixFinal ?? article.prix_final ?? article.prix);
    }

    let detail = "";

    if (estProduitAuPoidsReel(article)) {
      const poidsReel = nombreValide(article.poidsReel ?? article.poids_reel);
      const poidsMin = nombreValide(article.poidsMin ?? article.poids_min);
      const poidsMax = nombreValide(article.poidsMax ?? article.poids_max);

      if (poidsReel !== null && poidsReel > 0) {
        detail = "Poids réel : " + formaterPoids(poidsReel);
      } else if (poidsMin !== null && poidsMax !== null && poidsMin > 0 && poidsMax > 0) {
        detail = poidsMin === poidsMax
          ? "Poids souhaité : environ " + formaterPoids(poidsMin)
          : "Fourchette choisie : " + formaterPoids(poidsMin) + " à " + formaterPoids(poidsMax);
      } else if (article.poids) {
        detail = "Poids : " + formaterPoids(article.poids);
      }
    } else if (article.poids) {
      detail = "Poids : " + formaterPoids(article.poids);
    }

    if (article.recette) detail += (detail ? " — " : "") + "Recette : " + article.recette;
    if (article.variante) detail += (detail ? " — " : "") + article.variante;

    return {
      index,
      nom,
      quantite,
      detail,
      prix: prix === null ? 0 : prix,
      article
    };
  }

  function calculerFraisLivraison(client) {
    return client.modeLivraison === "Livraison en Suisse" ? FRAIS_LIVRAISON : 0;
  }

  function obtenirTotal(commande, client) {
    const confirmationFinale = commande.prixConfirme === true;

    // Recalculer depuis les mêmes prix que ceux affichés sur les lignes,
    // plutôt que de réutiliser un ancien total pouvant exclure la livraison.
    const totalProduits = obtenirProduits(commande).reduce((somme, article) => {
      let prix;

      if (estProduitAuPoidsReel(article)) {
        const prixFinal = obtenirPrixFinalArticle(article);
        prix = confirmationFinale
          ? prixFinal
          : (prixFinal !== null ? prixFinal : obtenirPrixIndicatifArticle(article));
      } else {
        prix = nombreValide(
          article.prixFinal ?? article.prix_final ?? article.prix
        );
      }

      return somme + (prix !== null && prix >= 0 ? prix : 0);
    }, 0);

    return arrondirCentimes(totalProduits + calculerFraisLivraison(client));
  }

  function ajouterTextePDF(doc, texte, x, y, largeur = 180) {
    const lignes = doc.splitTextToSize(String(texte || ""), largeur);
    doc.text(lignes, x, y);
    return y + lignes.length * 6;
  }

  function creerPDF(commande, options = {}) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error("La bibliothèque PDF n'est pas chargée. Vérifie le script jsPDF dans la page.");
    }

    const doc = new window.jspdf.jsPDF();
    const client = obtenirClient(commande);
    const typeEmail = options.typeEmail || "nouvelle-commande";
    const confirmationFinale = typeEmail === "confirmation-prix";
    const produits = obtenirProduits(commande);

    if (confirmationFinale) verifierPrixFinal(commande, produits);

    const total = obtenirTotal(commande, client);
    const fraisLivraison = calculerFraisLivraison(client);
    const numero = valeur(commande.numeroCommande || commande.id || commande.numero, "Sans numéro");

    // Palette éditoriale : vert profond, ivoire et accent doré.
    const vert = [35, 68, 56];
    const or = [184, 145, 78];
    const ivoire = [249, 247, 240];
    const gris = [92, 96, 91];
    const largeurPage = doc.internal.pageSize.getWidth();
    const hauteurPage = doc.internal.pageSize.getHeight();
    const marge = 16;
    const largeurInterieure = largeurPage - marge * 2;
    const formatMontant = nombre => montantCHF(nombre);

    function nouvellePage() {
      doc.addPage();
      y = 20;
      doc.setFillColor(...ivoire);
      doc.rect(0, 0, largeurPage, hauteurPage, "F");
      doc.setFillColor(...vert);
      doc.rect(0, 0, largeurPage, 5, "F");
    }

    function titreSection(texte) {
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...vert);
      doc.text(String(texte).toUpperCase(), marge, y);
      y += 3;
      doc.setDrawColor(...or);
      doc.setLineWidth(0.45);
      doc.line(marge, y, marge + 22, y);
      y += 7;
      doc.setTextColor(40, 43, 40);
      doc.setFont("helvetica", "normal");
    }

    let y = 0;
    doc.setFillColor(...ivoire);
    doc.rect(0, 0, largeurPage, hauteurPage, "F");
    doc.setFillColor(...vert);
    doc.rect(0, 0, largeurPage, 53, "F");
    doc.setFillColor(...or);
    doc.rect(0, 53, largeurPage, 1.8, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(23);
    doc.text(NOM_ENTREPRISE, marge, 22);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(231, 235, 228);
    doc.text("ARTISANAT GOURMAND · GENÈVE", marge, 30);
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(confirmationFinale ? 15 : 12);
    doc.text(confirmationFinale ? "Confirmation du prix final" : "Récapitulatif de commande et de livraison avant paiement", marge, 43);
    doc.setFontSize(9);
    doc.setTextColor(231, 235, 228);
    doc.text("COMMANDE N° " + String(numero), largeurPage - marge, 22, { align: "right" });
    doc.text("Émise le " + new Date().toLocaleDateString("fr-CH"), largeurPage - marge, 30, { align: "right" });

    y = 66;
    doc.setTextColor(40, 43, 40);
    titreSection("Informations client");

    const colonneGauche = marge + 3;
    const colonneDroite = marge + largeurInterieure / 2 + 2;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(231, 227, 216);
    doc.roundedRect(marge, y - 3, largeurInterieure, 33, 2, 2, "FD");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...vert);
    doc.text("CLIENT", colonneGauche, y + 4);
    doc.text("CONTACT", colonneDroite, y + 4);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(45, 48, 45);
    doc.text((client.prenom + " " + client.nom).trim() || "—", colonneGauche, y + 10);
    doc.setFontSize(8);
    doc.setTextColor(...gris);
    doc.text(doc.splitTextToSize("Adresse : " + (client.adresse || "—"), largeurInterieure / 2 - 8), colonneGauche, y + 17);
    doc.setTextColor(45, 48, 45);
    doc.text("Tél. : " + (client.telephone || "—"), colonneDroite, y + 10);
    doc.text(doc.splitTextToSize("E-mail : " + (client.email || "—"), largeurInterieure / 2 - 8), colonneDroite, y + 17);
    doc.setTextColor(...gris);
    doc.text("Réception : " + valeur(client.modeLivraison, "À convenir"), colonneGauche, y + 26);
    y += 39;

    titreSection("Articles commandés");

    const xNom = marge + 3;
    const xPrix = largeurPage - marge - 3;
    produits.forEach((article, index) => {
      const ligne = ligneProduit(article, index);
      const detailLignes = ligne.detail ? doc.splitTextToSize(ligne.detail, largeurInterieure - 14) : [];
      const lignesPrix = 1;
      const hauteurBloc = Math.max(21, 11 + detailLignes.length * 4 + lignesPrix * 4.5);

      if (y + hauteurBloc > 263) nouvellePage();

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(231, 227, 216);
      doc.roundedRect(marge, y - 3, largeurInterieure, hauteurBloc, 2, 2, "FD");
      doc.setFillColor(...or);
      doc.roundedRect(marge, y - 3, 1.5, hauteurBloc, 0.7, 0.7, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...vert);
      doc.text(ligne.quantite + " × " + ligne.nom, xNom + 2, y + 3);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...gris);
      let yDetail = y + 8;
      if (detailLignes.length) {
        doc.text(detailLignes, xNom + 2, yDetail);
        yDetail += detailLignes.length * 4;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(45, 48, 45);
      const libellePrix = confirmationFinale
        ? "Prix confirmé"
        : (estProduitAuPoidsReel(article) ? "Prix indicatif" : "Prix");
      doc.text(libellePrix + " : " + formatMontant(ligne.prix), xPrix, yDetail + 1, { align: "right" });

      y += hauteurBloc + 3;
    });

    if (y > 252) nouvellePage();
    y += 3;

    const blocTotalH = fraisLivraison > 0 ? 32 : 24;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(231, 227, 216);
    doc.roundedRect(largeurPage - marge - 83, y, 83, blocTotalH, 2, 2, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...gris);
    let yTotal = y + 7;
    if (fraisLivraison > 0) {
      doc.text("Livraison", largeurPage - marge - 79, yTotal);
      doc.text(formatMontant(fraisLivraison), largeurPage - marge - 4, yTotal, { align: "right" });
      yTotal += 7;
    }
    doc.setDrawColor(...or);
    doc.line(largeurPage - marge - 79, yTotal - 3, largeurPage - marge - 4, yTotal - 3);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...vert);
    doc.text(confirmationFinale ? "TOTAL À PAYER" : "TOTAL INDICATIF", largeurPage - marge - 79, yTotal + 2);
    doc.setFontSize(11);
    doc.text(formatMontant(total), largeurPage - marge - 4, yTotal + 2, { align: "right" });
    y += blocTotalH + 8;

    if (y > 250) nouvellePage();
    doc.setFillColor(239, 235, 222);
    const texteInfo = confirmationFinale
      ? "Le prix final est confirmé. Vous pouvez régler ce montant par TWINT au " + NUMERO_TWINT + "."
      : "Récapitulatif de commande et de livraison avant paiement. Les poids et montants des produits vendus au poids sont estimatifs. Le poids réel et le prix définitif seront confirmés après préparation, avant tout paiement.";
    const infoLignes = doc.splitTextToSize(texteInfo, largeurInterieure - 12);
    const infoH = 10 + infoLignes.length * 4.2;
    doc.roundedRect(marge, y, largeurInterieure, infoH, 2, 2, "F");
    doc.setFillColor(...or);
    doc.rect(marge, y, 1.5, infoH, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(65, 67, 61);
    doc.text(infoLignes, marge + 6, y + 6);
    y += infoH + 5;

    if (client.commentaire) {
      if (y > 265) nouvellePage();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...vert);
      doc.text("COMMENTAIRE", marge, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(45, 48, 45);
      y = ajouterTextePDF(doc, client.commentaire, marge, y, largeurInterieure);
    }

    const nombrePages = doc.getNumberOfPages();
    for (let page = 1; page <= nombrePages; page++) {
      doc.setPage(page);
      doc.setFillColor(...vert);
      doc.rect(0, hauteurPage - 13, largeurPage, 13, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text("Idée Gourmande · Genève", marge, hauteurPage - 5);
      doc.text("Merci pour votre confiance", largeurPage - marge, hauteurPage - 5, { align: "right" });
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
  }

  function obtenirBase64PDF(doc) {
    const uri = doc.output("datauristring");
    const separateur = uri.indexOf(",");
    return separateur >= 0 ? uri.substring(separateur + 1) : uri;
  }

  function lireStatutEnvoiGoogle(idEnvoi) {
    return new Promise((resolve, reject) => {
      const nomCallback = "__igStatut_" + Date.now() + "_" + Math.random().toString(36).slice(2);
      const script = document.createElement("script");
      let termine = false;
      let temporisateur = null;
      function nettoyage() {
        if (temporisateur) window.clearTimeout(temporisateur);
        if (script.parentNode) script.parentNode.removeChild(script);
        try { delete window[nomCallback]; } catch (_) { window[nomCallback] = undefined; }
      }
      window[nomCallback] = function (donnees) {
        if (termine) return;
        termine = true; nettoyage(); resolve(donnees);
      };
      script.onerror = function () {
        if (termine) return;
        termine = true; nettoyage(); reject(new Error("Lecture du statut impossible."));
      };
      temporisateur = window.setTimeout(function () {
        if (termine) return;
        termine = true; nettoyage(); reject(new Error("Délai de lecture du statut dépassé."));
      }, 10000);
      script.src = URL_SCRIPT_GOOGLE + "?action=mailStatus&requestId=" +
        encodeURIComponent(idEnvoi) + "&callback=" + encodeURIComponent(nomCallback) + "&_=" + Date.now();
      (document.head || document.body).appendChild(script);
    });
  }

  async function attendreStatutEnvoiGoogle(idEnvoi) {
    const debut = Date.now();
    let derniereErreur = "";
    let dernierStatut = null;
    while (Date.now() - debut < 90000) {
      try {
        const statut = await lireStatutEnvoiGoogle(idEnvoi);
        if (statut && statut.found) {
          dernierStatut = statut;
          if (statut.status === "termine" || statut.status === "echec" || statut.status === "indetermine") {
            return statut;
          }
        }
      } catch (erreur) {
        derniereErreur = erreur && erreur.message ? erreur.message : String(erreur);
      }
      await new Promise((attendre) => window.setTimeout(attendre, 2000));
    }
    if (dernierStatut) {
      dernierStatut.timeout = true;
      return dernierStatut;
    }
    return { found: false, status: "inconnu", error: derniereErreur || "Aucun statut retrouvé après 90 secondes." };
  }

  async function envoyerCommandeGoogle(payload) {
    try {
      if (!payload || typeof payload !== "object") throw new Error("Les données de la commande sont absentes.");
      const aleatoire = window.crypto && typeof window.crypto.randomUUID === "function"
        ? window.crypto.randomUUID()
        : Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
      const idEnvoi = "IGM-" + aleatoire.replace(/[^a-zA-Z0-9-]/g, "");
      payload.idEnvoi = idEnvoi;

      const formulaire = new URLSearchParams();
      formulaire.set("payload", JSON.stringify(payload));
      console.info("[Idée Gourmande] Envoi suivi initialisé.", {
        plateforme: /iPad|iPhone|iPod/.test(navigator.userAgent) ? "iOS" : "autre",
        taillePayload: formulaire.toString().length,
        idEnvoi: idEnvoi
      });

      if (typeof window.fetch !== "function") throw new Error("Ce navigateur ne prend pas en charge l'envoi requis.");
      // La réponse no-cors est opaque : le statut JSONP confirme le traitement serveur.
      window.fetch(URL_SCRIPT_GOOGLE, {
        method: "POST", mode: "no-cors", credentials: "omit", body: formulaire
      }).catch(function (erreur) {
        console.warn("[Idée Gourmande] Réponse POST opaque ou réseau interrompu ; vérification du statut en cours.", erreur);
      });

      const statut = await attendreStatutEnvoiGoogle(idEnvoi);
      if (statut && statut.found && statut.status === "termine" &&
          statut.entreprise === "envoye" && statut.client === "envoye") {
        return {
          ok: true, transmis: true, envoiConfirme: true, livraisonVerifiee: false,
          idEnvoi: idEnvoi,
          message: "Apps Script confirme que les deux e-mails ont été envoyés."
        };
      }

      let message = "L'envoi des deux e-mails n'a pas pu être confirmé.";
      if (statut && statut.entreprise === "envoye" && statut.client !== "envoye") {
        message = "L'e-mail destiné à Idée Gourmande a été envoyé, mais celui du client n'est pas confirmé. Ne relance pas la commande ; vérifie Apps Script et Gmail. " + (statut.error || "");
      } else if (statut && statut.status === "echec") {
        message = "Apps Script a signalé un échec avant la fin des deux envois. Ne relance pas automatiquement la commande ; vérifie les statuts et les e-mails. " + (statut.error || "");
      } else if (statut && statut.status === "indetermine") {
        message = "Le résultat d'au moins un envoi est incertain. Aucun nouvel envoi automatique n'a été effectué pour éviter un doublon. Vérifie Gmail et les exécutions Apps Script. " + (statut.error || "");
      } else if (statut && statut.status === "en_cours") {
        message = "Apps Script a reçu la demande, mais le traitement est toujours en cours après 90 secondes. Les deux e-mails ne sont pas encore confirmés : ne renvoie pas la commande et vérifie les exécutions Apps Script.";
      } else if (statut && statut.status === "inconnu") {
        message = "Aucun statut vérifiable n'a été reçu dans les 90 secondes. La commande peut avoir été reçue : ne la renvoie pas avant vérification dans Apps Script et Gmail.";
      }
      return {
        ok: false, transmis: true, envoiConfirme: false, livraisonVerifiee: false,
        idEnvoi: idEnvoi, message: message
      };
    } catch (erreur) {
      return {
        ok: false, transmis: false, envoiConfirme: false, livraisonVerifiee: false,
        message: erreur && erreur.message ? erreur.message : String(erreur)
      };
    }
  }

  async function genererPDFCommande(commande, options = {}) {
    if (!commande || typeof commande !== "object") {
      throw new Error("Les données de la commande sont absentes.");
    }

    const optionsFinales = {
      envoyerEmail: options.envoyerEmail !== false,
      typeEmail: options.typeEmail || "nouvelle-commande",
      telecharger: options.telecharger === true,
      afficher: options.afficher === true
    };

    const resultat = creerPDF(commande, optionsFinales);

    if (optionsFinales.afficher) {
      try {
        const urlPDF = resultat.doc.output("bloburl");
        const fenetrePDF = window.open(urlPDF, "_blank");
        if (!fenetrePDF) {
          console.warn("Le navigateur a bloqué l’ouverture automatique du PDF.");
        }
      } catch (erreurPDF) {
        console.warn("Impossible d’ouvrir le PDF automatiquement :", erreurPDF);
      }
    }

    const nomFichier = "commande-" +
      String(resultat.numero).replace(/[^a-zA-Z0-9_-]/g, "") +
      (resultat.confirmationFinale ? "-prix-final.pdf" : ".pdf");

    if (optionsFinales.telecharger) resultat.doc.save(nomFichier);

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
      throw new Error("L'adresse e-mail du client est absente ou invalide.");
    }

    if (resultat.confirmationFinale && commande.prixConfirme !== true) {
      throw new Error("Le prix final doit être confirmé avant de demander l'envoi.");
    }

    const produitsPourEmail = resultat.produits.map((article, index) => {
      const ligne = ligneProduit(article, index);

      return {
        nom: ligne.nom,
        reference: article.reference || article.id || article.slug || "",
        quantite: ligne.quantite,
        poids: article.poids || "",
        poidsMin: article.poidsMin ?? article.poids_min ?? null,
        poidsMax: article.poidsMax ?? article.poids_max ?? null,
        poidsReel: article.poidsReel ?? article.poids_reel ?? null,
        prix: ligne.prix,
        prixFinal: article.prixFinal ?? article.prix_final ?? article.prixConfirme ?? article.prix_confirme ?? null,
        prixConfirme: article.prixConfirme ?? article.prix_confirme ?? null,
        prixIndicatif: article.prixIndicatif ?? article.prix_indicatif ?? null,
        prixPlafond: obtenirPlafond(article),
        prixPar100g: article.prixPar100g ?? article.tarif100g ?? obtenirTarifAuPoids(article),
        recette: article.recette || "",
        variante: article.variante || ""
      };
    });

    const sujet = resultat.confirmationFinale
      ? "Idée Gourmande — Confirmation du prix final de la commande " + resultat.numero
      : "Idée Gourmande — Confirmation de réception de la commande " + resultat.numero;

    const payload = {
      typeEmail: optionsFinales.typeEmail,
      idCommande: String(commande.id || commande.idCommande || ""),
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
      prixConfirme: commande.prixConfirme === true,
      subject: sujet
    };

    return envoyerCommandeGoogle(payload);
  }

  async function envoyerEmailConfirmationPrix(commande) {
    if (!commande || commande.prixConfirme !== true) {
      throw new Error("Le prix final doit être confirmé avant l'envoi de l'e-mail.");
    }

    return genererPDFCommande(commande, {
      envoyerEmail: true,
      typeEmail: "confirmation-prix",
      telecharger: true,
      afficher: true
    });
  }

  async function imprimerPDFCommande(commande) {
    return genererPDFCommande(commande, {
      envoyerEmail: false,
      typeEmail: commande && commande.prixConfirme === true
        ? "confirmation-prix"
        : "nouvelle-commande",
      telecharger: true
    });
  }

  window.genererPDFCommande = genererPDFCommande;
  window.envoyerCommandeGoogle = envoyerCommandeGoogle;
  window.envoyerEmailConfirmationPrix = envoyerEmailConfirmationPrix;
  window.imprimerPDFCommande = imprimerPDFCommande;
})();
