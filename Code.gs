/**
 * Idée Gourmande - Envoi automatique des commandes
 *
 * Déployer comme Application Web avec :
 * - Exécuter en tant que : Moi
 * - Qui a accès : Tout le monde
 *
 * Le compte propriétaire doit être :
 * ideesgourmandesge@gmail.com
 */

const EXPEDITEUR = 'ideesgourmandesge@gmail.com';
const NOM_EXPEDITEUR = 'Idée Gourmande';

function doPost(e) {
  try {
    let raw = '';

    // Nouvelle méthode : JSON brut envoyé en text/plain.
    if (e && e.postData && e.postData.contents) {
      raw = String(e.postData.contents || '');
    }

    // Compatibilité avec l'ancienne version du site.
    if (!raw && e && e.parameter && e.parameter.payload) {
      raw = String(e.parameter.payload || '');
    }

    if (!raw) {
      throw new Error('Payload manquant.');
    }

    const data = JSON.parse(raw);

    const to = String(data.to || '').trim();

    if (!to) {
      throw new Error('Destinataire manquant.');
    }

    const subject =
      String(
        data.subject ||
        'Commande Idée Gourmande'
      );

    const client =
      data.client || {};

    const produits =
      Array.isArray(data.produits)
        ? data.produits
        : [];

    const total =
      Number(data.total || 0).toFixed(2);

    const lignes =
      produits
        .map(function(article) {

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
        })
        .join('\n');

    const body = [
      'Bonjour,',
      '',
      'Voici votre commande Idée Gourmande.',
      '',
      'N° commande : ' +
        (data.numeroCommande || ''),
      '',
      'Client : ' +
        (client.prenom || '') +
        ' ' +
        (client.nom || ''),
      'Téléphone : ' +
        (client.telephone || ''),
      'E-mail : ' +
        to,
      'Adresse : ' +
        (client.adresse || ''),
      '',
      'Produits commandés :',
      lignes,
      '',
      'Total : ' +
        total +
        ' CHF',
      '',
      'Commentaire : ' +
        (client.commentaire || 'Aucun'),
      '',
      'Votre bon de commande PDF est joint à ce message.',
      '',
      'Idée Gourmande'
    ].join('\n');

    const attachments = [];

    if (data.pdfBase64) {

      const base64 =
        String(data.pdfBase64)
          .replace(/^data:application\/pdf;base64,/, '')
          .replace(/\s/g, '');

      if (!base64) {
        throw new Error('Le contenu PDF est vide.');
      }

      const bytes =
        Utilities.base64Decode(base64);

      const blob =
        Utilities.newBlob(
          bytes,
          'application/pdf',
          String(
            data.pdfFilename ||
            (
              'Commande_' +
              (data.numeroCommande || Date.now()) +
              '.pdf'
            )
          )
        );

      attachments.push(blob);
    } else {
      throw new Error('PDF absent du message reçu par Google Apps Script.');
    }

    GmailApp.sendEmail(
      to,
      subject,
      body,
      {
        attachments: attachments,
        name: NOM_EXPEDITEUR,
        replyTo: EXPEDITEUR
      }
    );

    console.log(
      'Commande envoyée à ' +
      to +
      ' avec ' +
      attachments.length +
      ' pièce jointe(s).'
    );

    return ContentService
      .createTextOutput(
        JSON.stringify({
          ok: true,
          attachment: attachments.length
        })
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );

  } catch (error) {

    console.error(
      'Erreur doPost :',
      error
    );

    return ContentService
      .createTextOutput(
        JSON.stringify({
          ok: false,
          error: String(error)
        })
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );
  }
}

function doGet() {

  return ContentService
    .createTextOutput(
      'Idée Gourmande - service e-mail actif'
    )
    .setMimeType(
      ContentService.MimeType.TEXT
    );
}
