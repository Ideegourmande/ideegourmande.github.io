```javascript
const NOM_EXPEDITEUR = 'Idée Gourmande';
const EXPEDITEUR = 'ideesgourmandesge@gmail.com';

const FRAIS_LIVRAISON_SUISSE = 10.50;


/**
 * Réception de la commande depuis le site
 */
function doPost(e) {

  try {

    // ============================================================
    // DIAGNOSTIC DE LA REQUÊTE REÇUE
    // ============================================================

    console.log('========================================');
    console.log('DÉBUT doPost');
    console.log('========================================');

    console.log(
      'Objet e présent : ' +
      Boolean(e)
    );

    if (e) {

      console.log(
        'contentLength : ' +
        (e.contentLength !== undefined
          ? e.contentLength
          : 'non disponible')
      );

      console.log(
        'queryString : ' +
        (e.queryString || 'vide')
      );

      console.log(
        'paramètres reçus : ' +
        JSON.stringify(e.parameter || {})
      );

      console.log(
        'noms des paramètres : ' +
        JSON.stringify(
          e.parameters
            ? Object.keys(e.parameters)
            : []
        )
      );

      if (e.postData) {

        console.log(
          'postData.type : ' +
          (e.postData.type || 'non disponible')
        );

        console.log(
          'postData.length : ' +
          (e.postData.length || 'non disponible')
        );

        const contenuPost =
          String(
            e.postData.contents || ''
          );

        console.log(
          'postData.contents longueur : ' +
          contenuPost.length
        );

        console.log(
          'postData.contents début : ' +
          contenuPost.substring(0, 200)
        );

      } else {

        console.log(
          'postData : ABSENT'
        );
      }

    } else {

      console.log(
        'ATTENTION : objet e ABSENT'
      );
    }


    // ============================================================
    // RÉCUPÉRATION DU PAYLOAD
    // ============================================================

    let raw = '';

    // ------------------------------------------------------------
    // MÉTHODE 1 : paramètre "payload"
    // ------------------------------------------------------------

    if (
      e &&
      e.parameter &&
      e.parameter.payload
    ) {

      raw =
        String(
          e.parameter.payload
        ).trim();

      console.log(
        'PAYLOAD TROUVÉ DANS e.parameter.payload'
      );

      console.log(
        'Longueur payload : ' +
        raw.length
      );
    }


    // ------------------------------------------------------------
    // MÉTHODE 2 : corps POST
    // ------------------------------------------------------------

    if (
      !raw &&
      e &&
      e.postData &&
      e.postData.contents
    ) {

      const contenu =
        String(
          e.postData.contents
        ).trim();

      console.log(
        'Aucun payload dans e.parameter.payload.'
      );

      console.log(
        'Analyse de e.postData.contents...'
      );

      // Cas où le navigateur envoie directement le JSON
      if (
        contenu.charAt(0) === '{'
      ) {

        raw = contenu;

        console.log(
          'PAYLOAD JSON DIRECT TROUVÉ DANS postData.contents'
        );

      }

      // Cas d'un formulaire :
      // payload=%7B%22to%22%3A...
      else if (
        contenu.indexOf('payload=') === 0
      ) {

        let valeurPayload =
          contenu.substring(
            'payload='.length
          );

        try {

          // Décodage du champ formulaire.
          // Le "+" représente normalement un espace
          // dans application/x-www-form-urlencoded.
          valeurPayload =
            decodeURIComponent(
              valeurPayload.replace(
                /\+/g,
                ' '
              )
            );

          raw =
            valeurPayload.trim();

          console.log(
            'PAYLOAD RÉCUPÉRÉ DEPUIS postData.contents'
          );

        } catch (erreurDecode) {

          console.error(
            'Erreur décodage payload : ' +
            erreurDecode.message
          );

          throw new Error(
            'Impossible de décoder le payload reçu.'
          );
        }

      }

      // Cas général : tentative de décodage
      else {

        console.log(
          'Format POST inattendu.'
        );

        console.log(
          'Début du contenu reçu : ' +
          contenu.substring(0, 500)
        );
      }
    }


    // ============================================================
    // VÉRIFICATION DU PAYLOAD
    // ============================================================

    if (!raw) {

      console.error(
        'PAYLOAD MANQUANT APRÈS TOUTES LES TENTATIVES.'
      );

      throw new Error(
        'Payload manquant.'
      );
    }


    console.log(
      'Payload final récupéré. Longueur : ' +
      raw.length
    );


    // ============================================================
    // PARSE JSON
    // ============================================================

    let data;

    try {

      data =
        JSON.parse(raw);

      console.log(
        'JSON DU PAYLOAD CORRECTEMENT PARSÉ.'
      );

    } catch (erreurJSON) {

      console.error(
        'ERREUR JSON : ' +
        erreurJSON.message
      );

      console.error(
        'Début du payload : ' +
        raw.substring(0, 500)
      );

      throw new Error(
        'Le payload reçu n’est pas un JSON valide.'
      );
    }


    // ============================================================
    // DESTINATAIRE CLIENT
    // ============================================================

    const emailClient =
      String(
        data.to || ''
      ).trim();

    if (!emailClient) {

      throw new Error(
        'Adresse e-mail du client manquante.'
      );
    }

    if (
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(
        emailClient
      )
    ) {

      throw new Error(
        'Adresse e-mail du client invalide : ' +
        emailClient
      );
    }


    // ============================================================
    // PDF
    // ============================================================

    if (!data.pdfBase64) {

      throw new Error(
        'PDF absent du message reçu.'
      );
    }

    let base64 =
      String(
        data.pdfBase64
      )
      .replace(
        /^data:application\/pdf;base64,/,
        ''
      )
      .replace(
        /\s/g,
        ''
      );

    if (base64.length < 100) {

      throw new Error(
        'Le PDF reçu est vide ou invalide.'
      );
    }

    const bytes =
      Utilities.base64Decode(
        base64
      );

    if (
      !bytes ||
      bytes.length < 100
    ) {

      throw new Error(
        'Les données du PDF sont invalides.'
      );
    }

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

    const pdfBlob =
      Utilities.newBlob(
        bytes,
        'application/pdf',
        filename
      );


    // ============================================================
    // DONNÉES COMMANDE
    // ============================================================

    const client =
      data.client || {};

    const produits =
      Array.isArray(data.produits)
        ? data.produits
        : [];

    const total =
      Number(
        data.total || 0
      );

    const numeroCommande =
      data.numeroCommande || '';


    // ============================================================
    // MODE DE RÉCEPTION
    // ============================================================

    const modeLivraison =
      String(
        client.modeLivraison ||
        data.modeLivraison ||
        ''
      ).trim();

    const fraisLivraison =
      modeLivraison ===
      'Livraison en Suisse'
        ? FRAIS_LIVRAISON_SUISSE
        : 0;

    // Total final utilisé dans les e-mails.
    // Le PDF reste inchangé.
    const totalAvecLivraison =
      total + fraisLivraison;


    console.log(
      'MODE LIVRAISON REÇU PAR CODE.GS : ' +
      modeLivraison
    );

    console.log(
      'FRAIS LIVRAISON CALCULÉS POUR LE MAIL : ' +
      fraisLivraison.toFixed(2) +
      ' CHF'
    );

    console.log(
      'TOTAL PRODUITS : ' +
      total.toFixed(2) +
      ' CHF'
    );

    console.log(
      'TOTAL AVEC LIVRAISON POUR LE MAIL : ' +
      totalAvecLivraison.toFixed(2) +
      ' CHF'
    );


    // ============================================================
    // LISTE DES PRODUITS
    // ============================================================

    const lignes =
      produits.map(
        function(article) {

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

        }
      ).join('\n');


    // ============================================================
    // INFORMATIONS LIVRAISON
    // ============================================================

    const informationsLivraison =
      [];

    if (modeLivraison) {

      informationsLivraison.push(
        'Mode de réception : ' +
        modeLivraison
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


    // ============================================================
    // OBJET DES E-MAILS
    // ============================================================

    const sujetCommande =
      'Nouvelle commande Idée Gourmande n°' +
      numeroCommande;

    const sujetClient =
      'Confirmation de votre commande Idée Gourmande n°' +
      numeroCommande;


    // ============================================================
    // E-MAIL POUR IDÉE GOURMANDE
    // ============================================================

    const corpsEntreprise = [

      'Bonjour,',
      '',

      'Une nouvelle commande a été reçue sur le site Idée Gourmande.',
      '',

      'N° commande : ' +
      numeroCommande,

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

      'TOTAL PRODUITS : ' +
      total.toFixed(2) +
      ' CHF',

      'FRAIS DE LIVRAISON : ' +
      fraisLivraison.toFixed(2) +
      ' CHF',

      'TOTAL À PAYER : ' +
      totalAvecLivraison.toFixed(2) +
      ' CHF',

      '',

      'Paiement : TWINT',

      '',

      'Commentaire : ' +
      (
        client.commentaire ||
        'Aucun'
      ),

      '',

      'Le bon de commande PDF est joint à cet e-mail.',

      '',

      'Idée Gourmande'

    ].join('\n');


    // ============================================================
    // ENVOI À L'ENTREPRISE
    // ============================================================

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


    console.log(
      'E-MAIL ENTREPRISE ENVOYÉ.'
    );


    // ============================================================
    // E-MAIL DE CONFIRMATION CLIENT
    // ============================================================

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

      'TOTAL PRODUITS : ' +
      total.toFixed(2) +
      ' CHF',

      'FRAIS DE LIVRAISON : ' +
      fraisLivraison.toFixed(2) +
      ' CHF',

      'TOTAL À PAYER : ' +
      totalAvecLivraison.toFixed(2) +
      ' CHF',

      '',

      'Paiement : TWINT',

      '',

      'Adresse de livraison:',

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


    // ============================================================
    // ENVOI AU CLIENT
    // ============================================================

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


    console.log(
      'E-MAIL CLIENT ENVOYÉ.'
    );


    // ============================================================
    // RÉPONSE AU SITE
    // ============================================================

    console.log(
      'COMMANDE TRAITÉE AVEC SUCCÈS.'
    );

    console.log(
      '========================================'
    );


    return ContentService
      .createTextOutput(
        JSON.stringify({

          ok: true,

          entreprise:
            EXPEDITEUR,

          client:
            emailClient,

          attachment:
            true,

          bytes:
            bytes.length,

          filename:
            filename,

          modeLivraison:
            modeLivraison,

          fraisLivraison:
            fraisLivraison

        })
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );


  } catch (erreur) {

    console.error(
      'ERREUR doPost : ' +
      String(
        erreur.message ||
        erreur
      )
    );

    console.error(
      'STACK : ' +
      (
        erreur.stack ||
        'non disponible'
      )
    );


    return ContentService
      .createTextOutput(
        JSON.stringify({

          ok: false,

          error:
            String(
              erreur.message ||
              erreur
            )

        })
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );
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
    .setMimeType(
      ContentService.MimeType.TEXT
    );
}
```
