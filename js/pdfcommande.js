/* ==========================================================
   Idée Gourmande — PDF et e-mails des commandes
   Version 6.1.0

   - Nouvelle commande : prix indicatifs, aucun paiement demandé.
   - Confirmation du prix final : poids et prix réellement confirmés.
   - Le prix final d'une ligne ne doit pas dépasser son plafond.
   - PDF de confirmation joint à l'e-mail du client.
   - Copie de l'e-mail à Idée Gourmande.
   - Impression PDF seule : aucun e-mail envoyé automatiquement.
   - Les autres produits conservent leur fonctionnement habituel.
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

  function valeur(valeurInitiale, remplacement = "") {
    return valeurInitiale === undefined ||
      valeurInitiale === null ||
      valeurInitiale === ""
      ? remplacement
      : valeurInitiale;
  }

  function montantCHF(nombre) {
    const n = Number(nombre);

    return (
      (Number.isFinite(n) ? n : 0).toFixed(2) + " CHF"
    );
  }

  function echapperHTML(texte) {
    return String(texte ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function obtenirClient(commande) {
    const client = commande.client || {};

    return {
      prenom: valeur(client.prenom, commande.prenom || ""),
      nom: valeur(client.nom, commande.nom || ""),
      email: valeur(client.email, commande.email || ""),
      telephone: valeur(
        client.telephone,
        commande.telephone || ""
      ),
      adresse: valeur(client.adresse, commande.adresse || ""),
      commentaire: valeur(
        client.commentaire,
        commande.commentaire || ""
      ),
      modeLivraison: valeur(
        client.modeLivraison,
        commande.modeLivraison || ""
      )
    };
  }

  function obtenirProduits(commande) {
    if (Array.isArray(commande.produitsListe)) {
      return commande.produitsListe;
    }

    if (Array.isArray(commande.produits)) {
      return commande.produits;
    }

    return [];
  }

  function obtenirReference(article) {
    return String(
      article.reference || article.id || ""
    ).toLowerCase();
  }

  function obtenirNomNormalise(article) {
    return String(article.nom || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function estProduitAuPoidsReel(article) {
    const reference = obtenirReference(article);
    const nom = obtenirNomNormalise(article);

    return (
      reference.includes("viande-sechee") ||
      reference.includes("viande_sechee") ||
      reference.includes("lard-sec") ||
      reference.includes("lard_sec") ||
      nom.includes("viande sechee") ||
      nom.includes("lard sec")
    );
  }

  function estLardSec(article) {
    const reference = obtenirReference(article);
    const nom = obtenirNomNormalise(article);

    return (
      reference.includes("lard-sec") ||
      reference.includes("lard_sec") ||
      nom.includes("lard sec")
    );
  }

  function obtenirTarifAuPoids(article) {
    return estLardSec(article)
      ? TARIF_LARD_SEC_100G
      : TARIF_VIANDE_SECHEE_100G;
  }

  function obtenirPlafond(article) {
    const plafondEnregistre =
      article.prixPlafond ??
      article.prix_plafond ??
      article.plafondPrix ??
      article.plafond_prix;

    if (
      plafondEnregistre !== undefined &&
      plafondEnregistre !== null &&
      plafondEnregistre !== ""
    ) {
      const plafond = Number(plafondEnregistre);

      return Number.isFinite(plafond) && plafond >= 0
        ? plafond
        : null;
    }

    const poidsMax = Number(
      article.poidsMax ?? article.poids_max ?? 0
    );

    if (!Number.isFinite(poidsMax) || poidsMax <= 0) {
      return null;
    }

    return (
      poidsMax * obtenirTarifAuPoids(article) / 100
    );
  }

  function ligneProduit(article, index) {
    const nom = valeur(article.nom, "Article");
    const quantite = Number(article.quantite || 1);

    const prix = Number(
      article.prixFinal ??
      article.prix_final ??
      article.prix ??
      article.prixIndicatif ??
      article.prix_indicatif ??
      0
    );

    let detail = "";

    if (estProduitAuPoidsReel(article)) {
      if (
        article.poidsReel !== undefined &&
        article.poidsReel !== null &&
        article.poidsReel !== ""
      ) {
        detail =
          "Poids réel : " +
          formaterPoids(article.poidsReel);
      } else if (
        article.poidsMin !== undefined &&
        article.poidsMax !== undefined
      ) {
        detail =
          "Fourchette choisie : " +
          formaterPoids(article.poidsMin) +
          " à " +
          formaterPoids(article.poidsMax);
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
      prix,
      article
    };
  }

  function formaterPoids(poids) {
    const n = Number(poids);

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
  }

  function calculerFraisLivraison(client) {
    return client.modeLivraison === "Livraison en Suisse"
      ? FRAIS_LIVRAISON
      : 0;
  }

  function obtenirTotal(commande, client, typeEmail) {
    const totalEnregistre = Number(
      commande.totalFinal ??
      commande.total_final ??
      commande.total
    );

    if (
      Number.isFinite(totalEnregistre) &&
      (
        commande.totalFinal !== undefined ||
        commande.total_final !== undefined ||
        commande.total !== undefined
      )
    ) {
      return totalEnregistre;
    }

    const totalProduits = obtenirProduits(commande).reduce(
      (somme, article) => {
        const prix = Number(
          article.prixFinal ??
          article.prix_final ??
          article.prix ??
          article.prixIndicatif ??
          article.prix_indicatif ??
          0
        );

        return somme + (
          Number.isFinite(prix) ? prix : 0
        );
      },
      0
    );

    return totalProduits + calculerFraisLivraison(client);
  }

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

    doc.text(lignes, x, y);

    return y + lignes.length * 6;
  }

  function verifierPrixFinal(commande, produits) {
    if (!commande.prixConfirme) {
      throw new Error(
        "Le prix final doit être confirmé avant de créer la confirmation."
      );
    }

    produits.forEach((article) => {
      if (!estProduitAuPoidsReel(article)) {
        return;
      }

      const prixFinal = Number(
        article.prixFinal ??
        article.prix_final ??
        article.prix
      );

      if (!Number.isFinite(prixFinal) || prixFinal < 0) {
        throw new Error(
          "Le prix final d'un article au poids est absent ou invalide."
        );
      }

      const plafond = obtenirPlafond(article);

      if (plafond === null) {
        throw new Error(
          "Impossible de vérifier le plafond d'un article au poids. Vérifie la fourchette et le prix maximal enregistrés avant l'envoi."
        );
      }

      if (prixFinal > plafond + 0.001) {
        throw new Error(
          "Le prix final d'un article dépasse le plafond annoncé. L'e-mail n'a pas été envoyé."
        );
      }

      const poidsReel = Number(
        article.poidsReel ??
        article.poids_reel
      );

      if (!Number.isFinite(poidsReel) || poidsReel <= 0) {
        throw new Error(
          "Le poids réel d'un article doit être renseigné avant l'envoi."
        );
      }
    });
  }

  function creerPDF(commande, options = {}) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error(
        "La bibliothèque PDF n'est pas chargée. Vérifie le script jsPDF dans la page."
      );
    }

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

    const total = obtenirTotal(
      commande,
      client,
      typeEmail
    );

    const fraisLivraison = calculerFraisLivraison(client);

    const numero = valeur(
      commande.id || commande.numeroCommande,
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
      const libelle =
        ligne.quantite + " × " + ligne.nom;

      if (y > 255) {
        doc.addPage();
        y = 18;
      }

      y = ajouterTextePDF(
        doc,
        libelle,
        15,
        y
      );

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
        "Pour la viande séchée et le lard sec, le poids réel sera mesuré après préparation. Le prix final sera confirmé avant tout paiement et ne dépassera pas le plafond de la fourchette choisie.",
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
  }

  function obtenirBase64PDF(doc) {
    const uri = doc.output("datauristring");
    const separateur = uri.indexOf(",");

    return separateur >= 0
      ? uri.substring(separateur + 1)
      : uri;
  }

  function envoyerCommandeGoogle(payload) {
    return new Promise((resolve, reject) => {
      let iframe;
      let formulaire;
      let termine = false;
      let temporisateur;

      function nettoyage() {
        if (temporisateur) {
          window.clearTimeout(temporisateur);
        }

        if (formulaire && formulaire.parentNode) {
          formulaire.parentNode.removeChild(formulaire);
        }

        if (iframe && iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }

      function terminer(erreur) {
        if (termine) {
          return;
        }

        termine = true;
        nettoyage();

        if (erreur) {
          reject(erreur);
        } else {
          resolve({
            ok: true,
            message:
              "La requête d'envoi a été transmise au service e-mail. La livraison effective des e-mails doit être vérifiée séparément."
          });
        }
      }

      try {
        const identifiant = "ig-mail-" + Date.now();

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

        iframe.addEventListener(
          "load",
          () => {
            /*
             * Pour des raisons de sécurité du navigateur, la réponse
             * Google Apps Script ne peut pas être lue ici.
             * Un chargement ne prouve pas que les e-mails sont livrés.
             */
            temporisateur = window.setTimeout(
              () => terminer(),
              1200
            );
          },
          { once: true }
        );

        formulaire.submit();

        temporisateur = window.setTimeout(
          () => terminer(),
          8000
        );
      } catch (erreur) {
        nettoyage();
        reject(erreur);
      }
    });
  }

  async function genererPDFCommande(
    commande,
    options = {}
  ) {
    const optionsFinales = {
      envoyerEmail: options.envoyerEmail !== false,
      typeEmail:
        options.typeEmail || "nouvelle-commande",
      telecharger: options.telecharger === true
    };

    const resultat = creerPDF(
      commande,
      optionsFinales
    );

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
        pdf: resultat.doc,
        total: resultat.total,
        nomFichier
      };
    }

    if (
      !resultat.client.email ||
      !resultat.client.email.includes("@")
    ) {
      throw new Error(
        "L'adresse e-mail du client est absente ou invalide."
      );
    }

    const produitsPourEmail = resultat.produits.map(
      (article, index) => {
        const ligne = ligneProduit(article, index);

        return {
          nom: ligne.nom,
          reference: article.reference || article.id || "",
          quantite: ligne.quantite,
          poids: article.poids || "",
          poidsMin: article.poidsMin ?? null,
          poidsMax: article.poidsMax ?? null,
          poidsReel:
            article.poidsReel ??
            article.poids_reel ??
            null,
          prix: Number(
            article.prixFinal ??
            article.prix_final ??
            article.prix ??
            article.prixIndicatif ??
            article.prix_indicatif ??
            0
          ),
          prixFinal:
            article.prixFinal ??
            article.prix_final ??
            null,
          prixIndicatif:
            article.prixIndicatif ??
            article.prix_indicatif ??
            null,
          prixPlafond: obtenirPlafond(article),
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
  }

  async function envoyerEmailConfirmationPrix(commande) {
    if (!commande || !commande.prixConfirme) {
      throw new Error(
        "Le prix final doit être confirmé avant l'envoi de l'e-mail."
      );
    }

    return genererPDFCommande(commande, {
      envoyerEmail: true,
      typeEmail: "confirmation-prix",
      telecharger: false
    });
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

  window.genererPDFCommande = genererPDFCommande;
  window.envoyerCommandeGoogle = envoyerCommandeGoogle;
  window.envoyerEmailConfirmationPrix =
    envoyerEmailConfirmationPrix;
  window.imprimerPDFCommande = imprimerPDFCommande;
})();
