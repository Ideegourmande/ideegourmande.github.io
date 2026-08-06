console.log("PDFCOMMANDE.JS CHARGE");


// ==================================
// IDÉE GOURMANDE
// Génération du bon de commande PDF
// Compatible commande.js nouvelle structure
// ==================================


function genererPDFCommande(commande){


    if(!commande){

        console.error(
            "Aucune commande reçue pour génération PDF"
        );

        return;

    }



    const { jsPDF } =
    window.jspdf;



    if(!jsPDF){

        console.error(
            "jsPDF non disponible"
        );

        return;

    }



    const doc =
    new jsPDF();



    let y = 20;



/* ==================================
   EN-TÊTE
================================== */


    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(
        20
    );


    doc.text(
        "IDÉE GOURMANDE",
        20,
        y
    );



    y += 10;



    doc.setFontSize(
        14
    );


    doc.text(
        "Bon de commande",
        20,
        y
    );



    y += 15;



    doc.setFont(
        "helvetica",
        "normal"
    );


    doc.setFontSize(
        11
    );


    doc.text(
        "Date : "
        +
        commande.date,
        20,
        y
    );



    y += 15;



/* ==================================
   INFORMATIONS CLIENT
================================== */


    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(
        13
    );


    doc.text(
        "Client",
        20,
        y
    );



    y += 8;



    doc.setFont(
        "helvetica",
        "normal"
    );


    doc.setFontSize(
        11
    );



    const client =
    commande.client;



    doc.text(
        client.prenom
        +
        " "
        +
        client.nom,

        20,
        y
    );



    y += 7;



    if(client.telephone){


        doc.text(
            "Téléphone : "
            +
            client.telephone,

            20,
            y
        );


        y += 7;


    }



    doc.text(
        "Email : "
        +
        client.email,

        20,
        y
    );


    y += 7;



    if(client.adresse){


        doc.text(
            "Adresse : "
            +
            client.adresse,

            20,
            y
        );


        y += 10;


    }
