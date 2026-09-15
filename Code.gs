/**
 * Idée Gourmande - Envoi automatique des commandes
 *
 * IMPORTANT : ce script doit être déployé comme application Web
 * avec le compte Gmail ideesgourmandesge@gmail.com.
 */

const EXPEDITEUR = 'ideesgourmandesge@gmail.com';
const NOM_EXPEDITEUR = 'Idée Gourmande';

function doPost(e) {
  try {
    const raw = e && e.parameter && e.parameter.payload;
    if (!raw) throw new Error('Payload manquant.');

    const data = JSON.parse(raw);
    const to = String(data.to || '').trim();
    if (!to) throw new Error('Destinataire manquant.');

    const subject = String(data.subject || 'Commande Idée Gourmande');
    const client = data.client || {};
    const produits = Array.isArray(data.produits) ? data.produits : [];
    const total = Number(data.total || 0).toFixed(2);

    const lignes = produits.map(function(article) {
      const q = article.quantite > 1 ? ' x' + article.quantite : '';
      const poids = article.poids ? ' (' + article.poids + ' g)' : '';
      return '- ' + (article.nom || 'Produit') + q + poids + ' : ' + Number(article.prix || 0).toFixed(2) + ' CHF';
    }).join('\n');

    const body = [
      'Bonjour,',
      '',
      'Voici une nouvelle commande Idée Gourmande.',
      '',
      'N° commande : ' + (data.numeroCommande || ''),
      'Client : ' + (client.prenom || '') + ' ' + (client.nom || ''),
      'Téléphone : ' + (client.telephone || ''),
      'E-mail client : ' + to,
      'Adresse : ' + (client.adresse || ''),
      '',
      'Produits commandés :',
      lignes,
      '',
      'Total : ' + total + ' CHF',
      '',
      'Commentaire : ' + (client.commentaire || 'Aucun'),
      '',
      'Le bon de commande PDF est joint à ce message.',
      '',
      'Idée Gourmande'
    ].join('\n');

    let attachments = [];
    if (data.pdfBase64) {
      const bytes = Utilities.base64Decode(data.pdfBase64);
      const blob = Utilities.newBlob(
        bytes,
        'application/pdf',
        String(data.pdfFilename || ('Commande_' + (data.numeroCommande || Date.now()) + '.pdf'))
      );
      attachments.push(blob);
    }

    GmailApp.sendEmail(to, subject, body, {
      attachments: attachments,
      name: NOM_EXPEDITEUR,
      replyTo: EXPEDITEUR
    });

    return ContentService
      .createTextOutput(JSON.stringify({ok: true}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error(error);
    return ContentService
      .createTextOutput(JSON.stringify({ok: false, error: String(error)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput('Idée Gourmande - service e-mail actif')
    .setMimeType(ContentService.MimeType.TEXT);
}
