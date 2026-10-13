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

    const typeEmail = String(data.typeEmail || 'nouvelle-commande');
    let total = 0;

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
      Number.isFinite(Number(data.fraisLivraison))
        ? Math.max(0, Number(data.fraisLivraison))
        : (modeLivraison === 'Livraison en Suisse'
          ? FRAIS_LIVRAISON_SUISSE
          : 0);

    // Le total est recalculé à partir des prix des lignes affichées.
    // Pour une commande initiale, utiliser le prix indicatif du produit
    // au poids lorsqu'il est fourni; pour une confirmation, le prix final.
    const totalProduitsCalcules = produits.reduce(function(somme, article) {
      const valeurPrix = typeEmail === 'confirmation-prix'
        ? (article.prixFinal !== undefined && article.prixFinal !== null
            ? article.prixFinal
            : article.prix)
        : (article.prixIndicatif !== undefined && article.prixIndicatif !== null
            ? article.prixIndicatif
            : article.prix);
      const prix = Number(valeurPrix);
      return somme + (Number.isFinite(prix) && prix >= 0 ? prix : 0);
    }, 0);

    const totalProduits =
      Math.round(totalProduitsCalcules * 100) / 100;

    total = Math.round((totalProduits + fraisLivraison) * 100) / 100;

    const totalAvecLivraison =
      total;

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

          const estPoidsApproximatif =
            (article.reference === 'viande-sechee' || article.reference === 'lard-sec') &&
            Number(article.poidsMin || 0) > 0 &&
            Number(article.poidsMin) === Number(article.poidsMax);

          const poids =
            article.poids
              ? (estPoidsApproximatif
                  ? ' (environ ' + article.poids + ' g)'
                  : ' (' + article.poids + ' g)')
              : '';

          const prixAffiche =
            typeEmail === 'confirmation-prix' &&
            article.prixFinal !== undefined &&
            article.prixFinal !== null
              ? article.prixFinal
              : (typeEmail !== 'confirmation-prix' &&
                 article.prixIndicatif !== undefined &&
                 article.prixIndicatif !== null
                  ? article.prixIndicatif
                  : (article.prix || 0));

          return (
            '- ' +
            (
              article.nom ||
              'Produit'
            ) +
            q +
            poids +
            ' : ' +
            Number(prixAffiche).toFixed(2) +
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
      (typeEmail === 'confirmation-prix'
        ? 'Prix final confirmé — commande Idée Gourmande n°'
        : 'Nouvelle commande Idée Gourmande n°') +
      numeroCommande;

    const sujetClient =
      (typeEmail === 'confirmation-prix'
        ? 'Confirmation du prix final de votre commande Idée Gourmande n°'
        : 'Confirmation de votre commande Idée Gourmande n°') +
      numeroCommande;


    // ============================================================
    // E-MAIL POUR IDÉE GOURMANDE
    // ============================================================

    const corpsEntreprise = [

      'Bonjour,',
      '',

      (typeEmail === 'confirmation-prix'
        ? 'Le prix final de votre commande a été confirmé.'
        : 'Une nouvelle commande a été reçue sur le site Idée Gourmande.'),
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
      ...(typeEmail === 'confirmation-prix' ? [] : [
        'INFORMATION SUR LE POIDS ET LE PRIX',
        'Ce récapitulatif est indicatif et ne constitue pas une demande de paiement.',
        'Pour le cœur de saumon fumé, la viande séchée et le lard sec, le poids réel sera mesuré ou confirmé après préparation.',
        'Le prix final sera confirmé après pesée, avant paiement.',
        ''
      ]),

      'MODE DE RÉCEPTION',

      ...informationsLivraison,

      '',

      'TOTAL PRODUITS : ' +
totalProduits.toFixed(2) +
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
    // VÉRIFICATION DE L'ADRESSE D'EXPÉDITION
    // ============================================================

    const aliasAutorises = GmailApp.getAliases().map(function(alias) {
      return String(alias).trim().toLowerCase();
    });

    const compteEffectif = String(
      Session.getEffectiveUser().getEmail() || ''
    ).trim().toLowerCase();

    const expediteurDemande = EXPEDITEUR.trim().toLowerCase();

    if (
      compteEffectif !== expediteurDemande &&
      aliasAutorises.indexOf(expediteurDemande) === -1
    ) {
      throw new Error(
        'Adresse expéditeur non autorisée : ' + EXPEDITEUR +
        '. Connecte le déploiement Apps Script avec ce compte Gmail ou ajoute cette adresse comme alias d’envoi autorisé dans Gmail, puis redéploie le script.'
      );
    }

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
        from: EXPEDITEUR,
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

      (typeEmail === 'confirmation-prix'
        ? 'Le prix final de votre commande a été confirmé. Merci de régler le montant indiqué ci-dessous par TWINT.'
        : 'Nous vous remercions pour votre commande auprès d’Idée Gourmande.'),

      '',

      'Votre commande n°' +
      numeroCommande +
      ' a bien été reçue.',

      '',

      'PRODUITS COMMANDÉS',

      lignes,

      '',
      ...(typeEmail === 'confirmation-prix' ? [] : [
        'INFORMATION SUR LE POIDS ET LE PRIX',
        'Ce récapitulatif est indicatif et ne constitue pas une demande de paiement.',
        'Pour le cœur de saumon fumé, la viande séchée et le lard sec, le poids réel sera mesuré ou confirmé après préparation.',
        'Le prix final sera confirmé après pesée, avant paiement.',
        ''
      ]),

      'MODE DE RÉCEPTION',

      ...informationsLivraison,

      '',

      'TOTAL PRODUITS : ' +
totalProduits.toFixed(2) +
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
        from: EXPEDITEUR,
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
function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};

  // Attribution d'un numéro séquentiel, protégée contre les requêtes simultanées.
  if (params.action === 'nextOrderNumber') {
    const callback = String(params.callback || '');
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(callback)) {
      return ContentService
        .createTextOutput('Callback JSONP invalide.')
        .setMimeType(ContentService.MimeType.TEXT);
    }

    let resultat;
    try {
      const nom = String(params.nom || 'Commande')
        .replace(/[<>]/g, '')
        .trim()
        .substring(0, 100) || 'Commande';
      const annee = Number(params.annee);
      if (!Number.isInteger(annee) || annee < 2020 || annee > 2100) {
        throw new Error('Année invalide.');
      }

      const verrou = LockService.getScriptLock();
      verrou.waitLock(10000);
      try {
        const proprietes = PropertiesService.getScriptProperties();
        const cle = 'COMPTEUR_COMMANDES_' + annee;
        const prochain = Number(proprietes.getProperty(cle) || '0') + 1;
        if (prochain > 999) {
          throw new Error('Le compteur a dépassé 999 pour ' + annee + '.');
        }
        proprietes.setProperty(cle, String(prochain));
        resultat = {
          ok: true,
          numero: nom + ' - ' + annee + '-' + String(prochain).padStart(3, '0')
        };
      } finally {
        verrou.releaseLock();
      }
    } catch (erreur) {
      resultat = { ok: false, error: String(erreur.message || erreur) };
    }

    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(resultat) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput('Idée Gourmande - service e-mail actif')
    .setMimeType(ContentService.MimeType.TEXT);
}
