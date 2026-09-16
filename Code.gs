```javascript
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


/**
 * Réception des commandes depuis le site.
 */
function doPost(e) {

  try {

    console.log('========== DEBUT doPost ==========');

    // ------------------------------------------
    // Vérification de la requête
    // ------------------------------------------

    if (!e) {
      throw new Error('Objet e absent.');
    }

    console.log(
      'e.parameter présent : ' +
      !!e.parameter
    );

    console.log(
      'e.postData présent : ' +
      !!e.postData
    );


    // ------------------------------------------
    // Récupération du JSON
    // ------------------------------------------

    let raw = '';

    /*
     * Format actuellement envoyé par pdfcommande.js :
     *
     * application/x-www-form-urlencoded
     *
     * payload = JSON.stringify(payload)
     */

    if (
      e.parameter &&
      e.parameter.payload
    ) {

      raw = String(
        e.parameter.payload
      );

      console.log(
        'Payload récupéré depuis e.parameter.payload'
      );

    }


    /*
     * Compatibilité avec un éventuel envoi
     * de JSON brut.
     */

    if (
      !raw &&
      e.postData &&
      e.postData.contents
    ) {

      raw = String(
        e.postData.contents
      );

      console.log(
        'Payload récupéré depuis e.postData.contents'
      );

    }


    // ------------------------------------------
    // Vérification payload
    // ------------------------------------------

    if (!raw) {

      console.error(
        'ERREUR : aucun payload reçu.'
      );

      /*
       * Informations utiles dans les journaux
       * Apps Script.
       */

      if (e.parameter) {

        console.log(
          'Paramètres reçus : ' +
          JSON.stringify(e.parameter)
        );

      }

      if (e.postData) {

        console.log(
          'postData type : ' +
          e.postData.type
        );

        console.log(
          'postData length : ' +
          (
            e.postData.contents
              ? e.postData.contents.length
              : 0
          )
        );

      }

      throw new Error(
        'Payload manquant. Aucun JSON reçu par doPost().'
      );

    }


    console.log(
      'Taille payload reçu : ' +
      raw.length +
      ' caractères'
    );


    // ------------------------------------------
    // Décodage JSON
    // ------------------------------------------

    let data;

    try {

      data = JSON.parse(raw);

    }
    catch (error) {

      console.error(
        'JSON invalide : ' +
        error
      );

      console.error(
        'Début du contenu reçu : ' +
        raw.substring(0, 500)
      );

      throw new Error(
        'Le payload reçu n’est pas un JSON valide.'
      );

    }


    // ------------------------------------------
    // DESTINATAIRE
    // ------------------------------------------

    const to =
      String(
        data.to || ''
      ).trim();


    if (!to) {

      throw new Error(
        'Destinataire manquant.'
      );

    }


    if (
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)
    ) {

      throw new Error(
        'Adresse e-mail destinataire invalide : ' +
        to
      );

    }


    console.log(
      'Destinataire : ' + to
    );


    // ------------------------------------------
    // PDF
    // ------------------------------------------

    if (!data.pdfBase64) {

      throw new Error(
        'PDF absent du message reçu.'
      );

    }


    let base64 =
      String(
        data.pdfBase64
      );


    /*
     * Accepte aussi bien :
     *
     * data:application/pdf;base64,XXXX
     *
     * que :
     *
     * XXXX
     */

    base64 =
      base64
        .replace(
          /^data:application\/pdf;base64,/,
          ''
        )
        .replace(
          /\s/g,
          ''
        );


    console.log(
      'Base64 PDF : ' +
      base64.length +
      ' caractères'
    );


    if (base64.length < 100) {

      throw new Error(
        'Le contenu PDF reçu est vide ou trop court.'
      );

    }


    // ------------------------------------------
    // DÉCODAGE PDF
    // ------------------------------------------

    let bytes;

    try {

      bytes =
        Utilities.base64Decode(
          base64
        );

    }
    catch (error) {

      console.error(
        'Erreur Base64 : ' +
        error
      );

      throw new Error(
        'Impossible de décoder le PDF Base64.'
      );

    }


    if (
      !bytes ||
      bytes.length < 100
    ) {

      throw new Error(
        'Le PDF décodé est vide ou invalide.'
      );

    }


    console.log(
      'PDF décodé : ' +
      bytes.length +
      ' octets'
    );


    // ------------------------------------------
    // NOM FICHIER
    // ------------------------------------------

    const filename =
      String(
        data.pdfFilename ||
        (
          'Commande_' +
          (
            data.numeroCommande ||
            Date.now()
          ) +
          '.pdf'
        )
      );


    // ------------------------------------------
    // CRÉATION BLOB PDF
    // ------------------------------------------

    const pdfBlob =
      Utilities.newBlob(
        bytes,
        'application/pdf',
        filename
      );


    // ------------------------------------------
    // DONNÉES CLIENT
    // ------------------------------------------

    const client =
      data.client || {};


    const produits =
      Array.isArray(data.produits)
        ? data.produits
        : [];


    const total =
      Number(
        data.total || 0
      ).toFixed(2);


    // ------------------------------------------
    // LIGNES PRODUITS
    // ------------------------------------------

    const lignes =
      produits
        .map(function(article) {

          const q =
            Number(
              article.quantite || 1
            ) > 1
              ? ' x' +
                article.quantite
              : '';


          const poids =
            article.poids
              ? ' (' +
                article.poids +
                ' g)'
              : '';


          return (
            '- ' +
            (
              article.nom ||
              'Produit'
            ) +
            q +
            poids +
            ' : ' +
            Number(
              article.prix || 0
            ).toFixed(2) +
            ' CHF'
          );

        })
        .join('\n');


    // ------------------------------------------
    // OBJET / SUJET DU MAIL
    // ------------------------------------------

    const subject =
      String(
        data.subject ||
        (
          'Commande Idée Gourmande n°' +
          (
            data.numeroCommande ||
            ''
          )
        )
      );


    // ------------------------------------------
    // CORPS DU MAIL
    // ------------------------------------------

    const body = [

      'Bonjour,',

      '',

      'Voici votre commande Idée Gourmande.',

      '',

      'N° commande : ' +
        (
          data.numeroCommande ||
          ''
        ),

      '',

      'Client : ' +
        (
          client.prenom ||
          ''
        ) +
        ' ' +
        (
          client.nom ||
          ''
        ),

      'Téléphone : ' +
        (
          client.telephone ||
          ''
        ),

      'E-mail : ' +
        to,

      'Adresse : ' +
        (
          client.adresse ||
          ''
        ),

      '',

      'Produits commandés:',

      lignes,

      '',

      'Total : ' +
        total +
        ' CHF',

      '',

      'Commentaire : ' +
        (
          client.commentaire ||
          'Aucun'
        ),

      '',

      'Votre bon de commande PDF est joint à ce message.',

      '',

      'Idée Gourmande'

    ].join('\n');


    // ------------------------------------------
    // ENVOI GMAIL
    // ------------------------------------------

    console.log(
      'Envoi Gmail vers : ' +
      to
    );

    console.log(
      'Pièce jointe : ' +
      filename +
      ' (' +
      bytes.length +
      ' octets)'
    );


    GmailApp.sendEmail(
      to,
      subject,
      body,
      {
        attachments: [
          pdfBlob
        ],

        name:
          NOM_EXPEDITEUR,

        replyTo:
          EXPEDITEUR
      }
    );


    // ------------------------------------------
    // SUCCÈS
    // ------------------------------------------

    console.log(
      '========== MAIL ENVOYÉ AVEC SUCCÈS =========='
    );


    return ContentService
      .createTextOutput(
        JSON.stringify({

          ok: true,

          attachment: true,

          bytes:
            bytes.length,

          filename:
            filename

        })
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );


  }
  catch (error) {

    console.error(
      '========== ERREUR doPost =========='
    );

    console.error(
      error
    );


    return ContentService
      .createTextOutput(
        JSON.stringify({

          ok: false,

          error:
            String(error),

          message:
            error &&
            error.message
              ? error.message
              : String(error)

        })
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );

  }

}


/**
 * Test du Web App.
 */
function doGet() {

  return ContentService
    .createTextOutput(
      'Idée Gourmande - service e-mail actif'
    )
    .setMimeType(
      ContentService.MimeType.TEXT
    );

}
```
