const NOM_EXPEDITEUR = 'Idée Gourmande';
const EXPEDITEUR = 'ideesgourmandesge@gmail.com';

const FRAIS_LIVRAISON_SUISSE = 10.50;


/**
 * Réception de la commande depuis le site
 */
function doPost(e) {

  try {

    // ==============================
    // RÉCUPÉRATION DU PAYLOAD
    // ==============================

    let raw = '';

    if (e && e.parameter && e.parameter.payload) {
      raw = String(e.parameter.payload);
    }

    if (!raw && e && e.postData && e.postData.contents) {
      raw = String(e.postData.contents);
    }

    if (!raw) {
      throw new Error('Payload manquant.');
    }

    const data = JSON.parse(raw);

    // ==============================
    // DESTINATAIRE CLIENT
    // ==============================

    const emailClient = String(data.to || '').trim();

    if (!emailClient) {
      throw new Error('Adresse e-mail du client manquante.');
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailClient)) {
      throw new Error(
        'Adresse e-mail du client invalide : ' + emailClient
      );
    }

    // ==============================
    // PDF
    // ==============================

    if (!data.pdfBase64) {
      throw new Error('PDF absent du message reçu.');
    }

    let base64 = String(data.pdfBase64)
      .replace(/^data:application\/pdf;base64,/, '')
      .replace(/\s/g, '');

    if (base64.length < 100) {
      throw new Error('Le PDF reçu est vide ou invalide.');
    }

    const bytes = Utilities.base64Decode(base64);

    if (!bytes || bytes.length < 100) {
      throw new Error('Les données du PDF sont invalides.');
    }

    const filename = String(
      data.pdfFilename ||
      ('Commande_' + (data.numeroCommande || Date.now()) + '.pdf')
    );

    const pdfBlob = Utilities.newBlob(
      bytes,
      'application/pdf',
      filename
    );

    // ==============================
    // DONNÉES COMMANDE
    // ==============================

    const client = data.client || {};

    const produits = Array.isArray(data.produits)
      ? data.produits
      : [];

    const total = Number(data.total || 0).toFixed(2);

    const numeroCommande =
      data.numeroCommande || '';

    // ==============================
    // MODE DE RÉCEPTION
    // ==============================

    const modeLivraison =
      String(
        client.modeLivraison ||
        data.modeLivraison ||
        ''
      ).trim();

    const fraisLivraison =
      modeLivraison === 'Livraison en Suisse'
        ? FRAIS_LIVRAISON_SUISSE
        : 0;

    console.log(
      'MODE LIVRAISON REÇU PAR CODE.GS : ' +
      modeLivraison
    );

    console.log(
      'FRAIS LIVRAISON CALCULÉS POUR LE MAIL : ' +
      fraisLivraison.toFixed(2) +
      ' CHF'
    );

    // ==============================
    // LISTE DES PRODUITS
    // ==============================

    const lignes = produits.map(function(article) {

      const q =
        Number(article.quantite || 1) > 1
          ? ' x' + article.quantite
          : '';

      const poids =
        article.poids
          ? ' (' + article.poids + ' g)'
          : '';

      return (
        '- ' +
        (article.nom || 'Produit') +
        q +
        poids +
        ' : ' +
        Number(article.prix || 0).toFixed(2) +
        ' CHF'
      );

    }).join('\n');

    // ==============================
    // INFORMATIONS LIVRAISON
    // ==============================

    const informationsLivraison = [];

    if (modeLivraison) {

      informationsLivraison.push(
        'Mode de réception : ' + modeLivraison
      );

    } else {

      informationsLivraison.push(
        'Mode de réception : Non renseigné'
      );

    }

    if (fraisLivraison > 0) {

      informationsLivraison.push(
        'Frais d’expédition : ' +
        fraisLivraison.toFixed(2) +
        ' CHF'
      );

    } else {

      informationsLivraison.push(
        'Frais de livraison : 0.00 CHF'
      );

    }

    // ==============================
    // OBJET DES E-MAILS
    // ==============================

    const sujetCommande =
      'Nouvelle commande Idée Gourmande n°' +
      numeroCommande;

    const sujetClient =
      'Confirmation de votre commande Idée Gourmande n°' +
      numeroCommande;

    // ==============================
    // E-MAIL POUR IDÉE GOURMANDE
    // ==============================

    const corpsEntreprise = [
      'Bonjour,',
      '',
      'Une nouvelle commande a été reçue sur le site Idée Gourmande.',
      '',
      'N° commande : ' + numeroCommande,
      '',
      'CLIENT',
      'Nom : ' +
        (client.prenom || '') +
        ' ' +
        (client.nom || ''),
      'Téléphone : ' +
        (client.telephone || ''),
      'E-mail : ' +
        emailClient,
      'Adresse : ' +
        (client.adresse || ''),
      '',
      'PRODUITS COMMANDÉS',
      lignes,
      '',
      'MODE DE RÉCEPTION',
      ...informationsLivraison,
      '',
      'TOTAL : ' + total + ' CHF',
      '',
      'Paiement : TWINT',
      '',
      'Commentaire : ' +
        (client.commentaire || 'Aucun'),
      '',
      'Le bon de commande PDF est joint à cet e-mail.',
      '',
      'Idée Gourmande'
    ].join('\n');

    // ==============================
    // ENVOI À L'ENTREPRISE
    // ==============================

    GmailApp.sendEmail(
      EXPEDITEUR,
      sujetCommande,
      corpsEntreprise,
      {
        attachments: [pdfBlob],
        name: NOM_EXPEDITEUR,
        replyTo: emailClient
      }
    );

    // ==============================
    // E-MAIL DE CONFIRMATION CLIENT
    // ==============================

    const corpsClient = [
      'Bonjour ' +
        (client.prenom || '') +
        ',',
      '',
      'Nous vous remercions pour votre commande auprès d’Idée Gourmande.',
      '',
      'Votre commande n°' +
        numeroCommande +
        ' a bien été reçue.',
      '',
      'PRODUITS COMMANDÉS',
      lignes,
      '',
      'MODE DE RÉCEPTION',
      ...informationsLivraison,
      '',
      'TOTAL : ' + total + ' CHF',
      '',
      'Paiement : TWINT',
      '',
      'Adresse de livraison :',
      (client.adresse || ''),
      '',
      'Votre bon de commande PDF est joint à cet e-mail.',
      '',
      'Pour toute question, vous pouvez répondre directement à cet e-mail.',
      '',
      'Merci pour votre confiance.',
      '',
      'Idée Gourmande'
    ].join('\n');

    // ==============================
    // ENVOI AU CLIENT
    // ==============================

    GmailApp.sendEmail(
      emailClient,
      sujetClient,
      corpsClient,
      {
        attachments: [pdfBlob],
        name: NOM_EXPEDITEUR,
        replyTo: EXPEDITEUR
      }
    );

    // ==============================
    // RÉPONSE AU SITE
    // ==============================

    return ContentService
      .createTextOutput(
        JSON.stringify({
          ok: true,
          entreprise: EXPEDITEUR,
          client: emailClient,
          attachment: true,
          bytes: bytes.length,
          filename: filename,
          modeLivraison: modeLivraison,
          fraisLivraison: fraisLivraison
        })
      )
      .setMimeType(ContentService.MimeType.JSON);

  } catch (erreur) {

    console.error(erreur);

    return ContentService
      .createTextOutput(
        JSON.stringify({
          ok: false,
          error: String(erreur.message || erreur)
        })
      )
      .setMimeType(ContentService.MimeType.JSON);
  }
}


/**
 * Test simple du Web App
 */
function doGet() {

  return ContentService
    .createTextOutput(
      'Idée Gourmande - service e-mail actif'
    )
    .setMimeType(ContentService.MimeType.TEXT);
}
