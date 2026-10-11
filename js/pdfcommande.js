/* ==========================================================
   Idée Gourmande — PDF et e-mails des commandes
   Version 6.0.0

   - Nouvelle commande : prix indicatifs, aucun paiement demandé.
   - Confirmation du prix final : montant définitif et instructions TWINT.
   - Impression PDF seule : n'envoie pas automatiquement d'e-mail.
   ========================================================== */

(function () {
  "use strict";

  const URL_SCRIPT_GOOGLE =
    "https://script.google.com/macros/s/AKfycby5o5V0dRb9fPpnhmUYCeWB1LxXjGRXfQK0kQ2Tzw2gHK58GQn8VmxlDI1DFWzogAhI/exec";

  const NOM_ENTREPRISE = "Idée Gourmande";
  const EMAIL_ENTREPRISE = "ideesgourmandesge@gmail.com";
  const NUMERO_TWINT = "079 592 78 82";
  const FRAIS_LIVRAISON = 10.50;

  function valeur(valeur, remplacement = "") {
    return valeur === undefined || valeur === null || valeur === ""
      ? remplacement
      : valeur;
  }

  function montantCHF(nombre) {
    const n = Number(nombre);
    return (Number.isFinite(n) ? n : 0).toFixed(2) + " CHF";
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
      telephone: valeur(client.telephone, commande.telephone || ""),
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

  function estProduitAuPoidsReel(article) {
    const reference = String(
      article.reference || article.id || ""
    ).toLowerCase();

    const nom = String(article.nom || "").toLowerCase();

    return (
      reference.includes("viande-sechee") ||
      reference.includes("lard-sec") ||
      nom.includes("viande séchée") ||
      nom.includes("viande sechee") ||
      nom.includes("lard sec")
    );
  }

  function ligneProduit(article, index) {
    const nom = valeur(article.nom, "Article");
    const quantite = Number(article.quantite || 1);
    const prix = Number(
      article.prixFinal ?? article.prix ?? article.prixIndicatif ?? 0
    );

    let detail = "";

    if (estProduitAuPoidsReel(article)) {
      if (article.poidsReel) {
        detail = "Poids réel : " + article.poidsReel + " g";
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
        detail = "Poids : " + article.poids + " g";
      }
    } else if (article.poids) {
      detail = "Poids : " + article.poids + " g";
    }

    if (article.recette) {
      detail += (detail ? " — " : "") + "Recette : " + article.recette;
    }

    if (article.variante) {
      detail += (detail ? " — " : "") + article.variante;
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
      return (Number.isInteger(kg) ? kg.toFixed(0) : kg.toFixed(2)
        .replace(/0+$/, "")
        .replace(/\.$/, "")) + " kg";
    }

    return n + " g";
  }

  function calculerFraisLivraison(client) {
    return client.modeLivraison === "Livraison en Suisse"
      ? FRAIS_LIVRAISON
      : 0;
  }

  function obtenirTotal(commande, client, typeEmail) {
    if (
      typeEmail === "confirmation-prix" &&
      Number.isFinite(Number(commande.total))
    ) {
      return Number(commande.total);
    }

    if (Number.isFinite(Number(commande.total))) {
      return Number(commande.total);
    }

    return obtenirProduits(commande).reduce((somme, article) => {
      return somme + Number(
        article.prixFinal ?? article.prix ?? article.prixIndicatif ?? 0
      );
    }, 0) + calculerFraisLivraison(client);
  }

  function ajouterTextePDF(doc, texte, x, y, largeur = 180) {
    const lignes = doc.splitTextToSize(String(texte || ""), largeur);
    doc.text(lignes, x, y);
    return y + lignes.length * 6;
  }

  function creerPDF(commande, options = {}) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error(
        "La bibliothèque PDF n'est pas chargée. Vérifie le script jsPDF dans la page."
      );
    }

    const doc = new window.jspdf.jsPDF();
    const client = obtenirClient(commande);
    const typeEmail = options.typeEmail || "nouvelle-commande";
    const confirmationFinale = typeEmail === "confirmation-prix";
    const produits = obtenirProduits(commande);
    const total = obtenirTotal(commande, client, typeEmail);
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
    y = ajouterTextePDF(doc, "Téléphone : " + client.telephone, 15, y);
    y = ajouterTextePDF(doc, "E-mail : " + client.email, 15, y);
    y = ajouterTextePDF(doc, "Adresse : " + client.adresse, 15, y);
    y = ajouterTextePDF(
      doc,
      "Réception : " + valeur(client.modeLivraison, "À convenir"),
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
      y = ajouterTextePDF(
        doc,
        ligne.detail || " ",
        20,
        y,
        170
      );

      if (confirmationFinale) {
        y = ajouterTextePDF(
          doc,
          "Prix : " + montantCHF(ligne.prix),
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

        const plafond = Number(
          article.prixPlafond ??
          (
            Number(article.poidsMax || 0) *
            (String(article.reference || "").includes("lard-sec") ? 4 : 9) /
            100
          )
        );

        if (plafond > 0) {
          y = ajouterTextePDF(
            doc,
            "Prix maximal selon la fourchette : " + montantCHF(plafond),
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

    if (fraisLivraison > 0) {
      doc.text(
        "Frais de livraison : " + montantCHF(fraisLivraison),
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
        "Le prix final a été confirmé. Vous pouvez maintenant régler ce montant par TWINT au 079 592 78 82.",
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
        "Pour la viande séchée et le lard sec, le poids réel sera mesuré après préparation. Le prix final sera confirmé avant tout paiement. Le prix ne dépassera pas le plafond de la fourchette choisie.",
        15,
        y,
        180
      );
    }

    if (client.commentaire) {
      y += 5;
      doc.setFont("helvetica", "bold");
      doc.text("Commentaire", 15, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      ajouterTextePDF(doc, client.commentaire, 15, y, 180);
    }

    doc.setFontSize(8);
    doc.text(
      NOM_ENTREPRISE + " — Merci pour votre confiance !",
      15,
      285
    );

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

  function envoyerCommandeGoogle(payload) {
    return new Promise((resolve, reject) => {
      let iframe;
      let formulaire;

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

        let termine = false;

        const nettoyage = () => {
          if (formulaire && formulaire.parentNode) {
            formulaire.parentNode.removeChild(formulaire);
          }

          if (iframe && iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        };

        const terminer = (erreur) => {
          if (termine) return;
          termine = true;
          nettoyage();

          if (erreur) {
            reject(erreur);
          } else {
            resolve({
              ok: true,
              message:
                "La requête d'envoi a été transmise au service e-mail. L'envoi effectif doit être vérifié."
            });
          }
        };

        iframe.addEventListener("load", () => {
          // Le navigateur ne permet pas de lire la réponse du service
          // externe dans cet iframe. Le chargement ne garantit donc pas
          // que l'e-mail a effectivement été livré.
          window.setTimeout(() => terminer(), 1200);
        }, { once: true });

        formulaire.submit();

        // Délai de secours si l'événement load ne survient pas.
        window.setTimeout(() => terminer(), 8000);
      } catch (erreur) {
        if (formulaire && formulaire.parentNode) {
          formulaire.parentNode.removeChild(formulaire);
        }
        if (iframe && iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
        reject(erreur);
      }
    });
  }

  async function genererPDFCommande(commande, options = {}) {
    const optionsFinales = {
      envoyerEmail: options.envoyerEmail !== false,
      typeEmail: options.typeEmail || "nouvelle-commande",
      telecharger: options.telecharger === true
    };

    const resultat = creerPDF(commande, optionsFinales);
    const nomFichier =
      "commande-" + String(resultat.numero).replace(/[^a-zA-Z0-9_-]/g, "") +
      (resultat.confirmationFinale ? "-prix-final.pdf" : ".pdf");

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

    if (!resultat.client.email || !resultat.client.email.includes("@")) {
      throw new Error(
        "L'adresse e-mail du client est absente ou invalide."
      );
    }

    const produitsPourEmail = resultat.produits.map((article, index) => {
      const ligne = ligneProduit(article, index);

      return {
        nom: ligne.nom,
        reference: article.reference || article.id || "",
        quantite: ligne.quantite,
        poids: article.poids || "",
        poidsMin: article.poidsMin ?? null,
        poidsMax: article.poidsMax ?? null,
        poidsReel: article.poidsReel ?? null,
        prix: Number(article.prixFinal ?? article.prix ?? article.prixIndicatif ?? 0),
        prixIndicatif: article.prixIndicatif ?? null,
        prixPlafond: article.prixPlafond ?? null,
        recette: article.recette || "",
        variante: article.variante || ""
      };
    });

    const sujet = resultat.confirmationFinale
      ? "Idée Gourmande — Confirmation du prix final de la commande " + resultat.numero
      : "Idée Gourmande — Confirmation de réception de la commande " + resultat.numero;

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
      typeEmail: commande && commande.prixConfirme
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
