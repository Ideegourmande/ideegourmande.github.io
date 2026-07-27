// ==================================
// IDÉE GOURMANDE
// Génération du bon de commande PDF
// ==================================

function genererPDFCommande(data) {


    const { jsPDF } = window.jspdf;


    const doc = new jsPDF();


    let y = 20;


    // Titre

    doc.setFontSize(20);

    doc.text(
        "IDÉE GOURMANDE",
        20,
        y
    );


    y += 12;


    doc.setFontSize(14);

    doc.text(
        "Bon de commande",
        20,
        y
    );


    y += 15;


    doc.setFontSize(11);


    doc.text(
        "Date : " + new Date().toLocaleDateString("fr-FR"),
        20,
        y
    );


    y += 15;


    // Client

    doc.setFontSize(13);

    doc.text(
        "Client",
        20,
        y
    );


    y += 8;


    doc.setFontSize(11);

    doc.text(
        data.nom,
        20,
        y
    );


    y += 7;


    doc.text(
        data.email,
        20,
        y
    );


    y += 7;


    doc.text(
        data.adresse,
        20,
        y
    );


    y += 15;


    // Commande

    doc.setFontSize(13);

    doc.text(
        "Produits commandés",
        20,
        y
    );


    y += 10;


    doc.setFontSize(11);


    data.recap.split("\n").forEach(function(ligne){

        doc.text(
            ligne,
            20,
            y
        );

        y += 7;

    });


    y += 10;


    doc.setFontSize(14);


    doc.text(
        "TOTAL : " + data.total + " CHF",
        20,
        y
    );


    y += 12;


    doc.setFontSize(11);


    doc.text(
        "Paiement : TWINT confirmé",
        20,
        y
    );


    // Création du fichier

    doc.save(
        "Bon_de_commande_Idee_Gourmande.pdf"
    );

}
