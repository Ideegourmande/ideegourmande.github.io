const NOM_EXPEDITEUR = 'Idée Gourmande';
const EXPEDITEUR = 'ideesgourmandesge@gmail.com';

const FRAIS_LIVRAISON_SUISSE = 10.50;


/**
 * ============================================================
 * TEST TEMPORAIRE DE RÉCEPTION DU POST
 * ============================================================
 *
 * Cette version ne traite PAS encore la commande.
 * Elle sert uniquement à voir exactement ce que Google
 * Apps Script reçoit lorsque le site envoie la commande.
 */
function doPost(e) {

  console.log('========================================');
  console.log('DÉBUT DU TEST doPost');
  console.log('========================================');


  // ============================================================
  // 1. VÉRIFICATION DE L'OBJET e
  // ============================================================

  console.log(
    'Objet e présent : ' +
    Boolean(e)
  );


  if (!e) {

    console.error(
      'ERREUR : objet e absent.'
    );

    return ContentService
      .createTextOutput(
        JSON.stringify({
          ok: false,
          erreur: 'Objet e absent'
        })
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );
  }


  // ============================================================
  // 2. INFORMATIONS GÉNÉRALES SUR LA REQUÊTE
  // ============================================================

  console.log(
    'contentLength : ' +
    (
      e.contentLength !== undefined
        ? e.contentLength
        : 'non disponible'
    )
  );


  console.log(
    'queryString : ' +
    (
      e.queryString ||
      'vide'
    )
  );


  // ============================================================
  // 3. PARAMÈTRES REÇUS
  // ============================================================

  console.log(
    'paramètres reçus : ' +
    JSON.stringify(
      e.parameter || {}
    )
  );


  console.log(
    'noms des paramètres reçus : ' +
    JSON.stringify(
      e.parameters
        ? Object.keys(e.parameters)
        : []
    )
  );


  // ============================================================
  // 4. DONNÉES POST
  // ============================================================

  if (e.postData) {

    console.log(
      'postData présent : OUI'
    );


    console.log(
      'postData.type : ' +
      (
        e.postData.type ||
        'non disponible'
      )
    );


    console.log(
      'postData.length : ' +
      (
        e.postData.length ||
        'non disponible'
      )
    );


    const contenuPost =
      String(
        e.postData.contents ||
        ''
      );


    console.log(
      'postData.contents longueur : ' +
      contenuPost.length
    );


    // IMPORTANT :
    // On ne journalise que les 500 premiers caractères
    // pour éviter d'afficher tout le PDF Base64.

    console.log(
      'postData.contents début : ' +
      contenuPost.substring(
        0,
        500
      )
    );


  } else {

    console.log(
      'postData présent : NON'
    );
  }


  // ============================================================
  // 5. RECHERCHE DU PAYLOAD
  // ============================================================

  let payloadTrouve =
    false;


  if (
    e.parameter &&
    e.parameter.payload
  ) {

    payloadTrouve =
      true;

    console.log(
      '========================================'
    );

    console.log(
      'PAYLOAD TROUVÉ DANS e.parameter.payload'
    );

    console.log(
      'Longueur du payload : ' +
      String(
        e.parameter.payload
      ).length
    );

    console.log(
      '========================================'
    );
  }


  // ============================================================
  // 6. RECHERCHE DANS postData.contents
  // ============================================================

  if (
    e.postData &&
    e.postData.contents
  ) {

    const contenu =
      String(
        e.postData.contents
      );


    console.log(
      '========================================'
    );

    console.log(
      'ANALYSE DE postData.contents'
    );


    if (
      contenu.indexOf(
        'payload='
      ) === 0
    ) {

      console.log(
        'postData.contents COMMENCE PAR payload='
      );

      payloadTrouve =
        true;

    } else if (
      contenu.charAt(0) === '{'
    ) {

      console.log(
        'postData.contents COMMENCE DIRECTEMENT PAR JSON'
      );

      payloadTrouve =
        true;

    } else {

      console.log(
        'postData.contents NE COMMENCE PAS PAR payload='
      );

      console.log(
        'Début exact reçu : ' +
        contenu.substring(
          0,
          500
        )
      );
    }


    console.log(
      '========================================'
    );
  }


  // ============================================================
  // 7. RÉSULTAT FINAL DU TEST
  // ============================================================

  console.log(
    '========================================'
  );

  console.log(
    'RÉSULTAT DU TEST'
  );

  console.log(
    'Payload trouvé : ' +
    payloadTrouve
  );

  console.log(
    'FIN DU TEST doPost'
  );

  console.log(
    '========================================'
  );


  // ============================================================
  // 8. RÉPONSE AU NAVIGATEUR
  // ============================================================

  return ContentService
    .createTextOutput(
      JSON.stringify({

        ok: true,

        test: true,

        payloadTrouve:
          payloadTrouve,

        parameterPresent:
          Boolean(
            e.parameter
          ),

        payloadParameterPresent:
          Boolean(
            e.parameter &&
            e.parameter.payload
          ),

        postDataPresent:
          Boolean(
            e.postData
          ),

        postDataType:
          e.postData
            ? e.postData.type
            : null,

        postDataLength:
          e.postData
            ? e.postData.length
            : null

      })
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );
}


/**
 * ============================================================
 * TEST SIMPLE DU WEB APP
 * ============================================================
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
