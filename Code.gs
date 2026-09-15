/**
 * Idée Gourmande - Envoi automatique des commandes
 *
 * Déployer comme Application Web :
 * - Exécuter en tant que : Moi
 * - Qui a accès : Tout le monde
 *
 * Le projet doit appartenir au compte :
 * ideesgourmandesge@gmail.com
 */

const NOM_EXPEDITEUR = 'Idée Gourmande';
const EXPEDITEUR = 'ideesgourmandesge@gmail.com';

function doPost(e) {
  try {
    let raw = '';

    // Méthode principale : formulaire URL-encoded.
    // Le navigateur envoie le JSON complet dans e.parameter.payload.
    if (e && e.parameter && e.parameter.payload) {
      raw = String(e.parameter.payload);
    }

    // Compatibilité avec un éventuel ancien client JSON brut.
    if (!raw && e && e.postData && e.postData.contents) {
      raw = String(e.postData.contents);
    }

    if (!raw) {
      throw new Error('Payload manquant.');
    }

    const data = JSON.parse(raw);

    const to = String(data.to || '').trim();

    if (!to) {
      throw new Error('Destinataire manquant.');
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
      throw new Error('Adresse e-mail destinataire invalide.');
    }

    if (!data.pdfBase64) {
      throw new Error('PDF absent du message reçu.');
    }

    const base64 = String(data.pdfBase64)
      .replace(/^data:application\/pdf;base64,/, '')
      .replace(/\s/g, '');

    if (base64.length < 100) {
      throw new Error('Le contenu PDF reçu est vide ou trop court.');
    }

    const bytes = Utilities.base64Decode(base64);

    if (!bytes || bytes.length < 100) {
      throw new Error('Le PDF décodé est vide ou invalide.');
    }

    const filename =
      String(
        data.pdfFilename ||
        ('Commande_' + (data.numeroCommande || Date.now()) + '.pdf')
      );

    const pdfBlob = Utilities.newBlob(
      bytes,
      'application/pdf',
      filename
    );

    const client = data.client || {};
    const produits = Array.isArray(data.produits) ? data.produits : [];
    const total = Number(data.total || 0).toFixed(2);

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

    const subject =
      String(
        data.subject ||
        ('Commande Idée Gourmande n°' + (data.numeroCommande || ''))
      );

    const body = [
      'Bonjour,',
      '',
      'Voici votre commande Idée Gourmande.',
      '',
      'N° commande : ' + (data.numeroCommande || ''),
      '',
      'Client : ' + (client.prenom || '') + ' ' + (client.nom || ''),
      'Téléphone : ' + (client.telephone || ''),
      'E-mail : ' + to,
      'Adresse : ' + (client.adresse || ''),
      '',
      'Produits commandés :',
      lignes,
      '',
      'Total : ' + total + ' CHF',
      '',
      'Commentaire : ' + (client.commentaire || 'Aucun'),
      '',
      'Votre bon de commande PDF est joint à ce message.',
      '',
      'Idée Gourmande'
    ].join('\n');

    GmailApp.sendEmail(
      to,
      subject,
      body,
      {
        attachments: [pdfBlob],
        name: NOM_EXPEDITEUR,
        replyTo: EXPEDITEUR
      }
    );

    console.log(
      'OK : mail envoyé à ' + to +
      ' avec le PDF ' + filename +
      ' (' + bytes.length + ' octets).'
    );

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        attachment: true,
        bytes: bytes.length,
        filename: filename
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('ERREUR doPost : ' + error);

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        error: String(error)
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(
      'Idée Gourmande - service e-mail actif'
    )
    .setMimeType(ContentService.MimeType.TEXT);
}
