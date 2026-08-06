// ===================================================
// IDÉE GOURMANDE
// pdfcommande.js
// Partie 1 / 3
// ===================================================

console.log("PDFCOMMANDE.JS CHARGE");

/* ===================================================
   GENERATION PDF
   =================================================== */

function genererPDFCommande(commande){

    if(!commande){

        console.error("Commande absente.");

        return;

    }

    if(!window.jspdf){

        console.error("jsPDF non chargé.");

        return;

    }

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({

        orientation: "portrait",

        unit: "mm",

        format: "a4"

    });

    let y = 18;

    /* ===================================================
       EN-TETE
       =================================================== */

    doc.setFont("helvetica","bold");
    doc.setFontSize(20);

    doc.text(
        "IDÉE GOURMANDE",
        20,
        y
    );

    y += 8;

    doc.setFontSize(14);

    doc.text(
        "Bon de commande",
        20,
        y
    );

    y += 10;

    doc.setFont("helvetica","normal");
    doc.setFontSize(10);

    doc.text(
        "Date : " + commande.date,
        20,
        y
    );

    y += 6;

    const numeroCommande =
    "CMD-" +
    new Date().getFullYear() +
    "-" +
    Date.now().toString().slice(-6);

    doc.text(
        "Commande : " + numeroCommande,
        20,
        y
    );

    y += 12;

    /* ===================================================
       CLIENT
       =================================================== */

    doc.setFont("helvetica","bold");
    doc.setFontSize(13);

    doc.text(
        "Client",
        20,
        y
    );

    y += 8;

    doc.setFont("helvetica","normal");
    doc.setFontSize(11);

    doc.text(
        commande.client.prenom +
        " " +
        commande.client.nom,
        20,
        y
    );

    y += 6;

    doc.text(
        commande.client.telephone,
        20,
        y
    );

    y += 6;

    doc.text(
        commande.client.email,
        20,
        y
    );

    y += 6;

    const adresse =
    doc.splitTextToSize(
        commande.client.adresse,
        160
    );

    doc.text(
        adresse,
        20,
        y
    );

    y +=
    adresse.length * 6 +
    8;

    /* ===================================================
       PRODUITS
       =================================================== */

    doc.setFont("helvetica","bold");
    doc.setFontSize(13);

    doc.text(
        "Produits commandés",
        20,
        y
    );

    y += 8;

    doc.setFontSize(11);

/* ===================================================
   LISTE DES PRODUITS
   =================================================== */

    commande.produits.forEach(
        function(article){

            let description =
            article.nom;

            if(article.recette){

                description +=
                " (" +
                article.recette +
                ")";

            }

            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.text(
                description,
                20,
                y
            );

            y += 6;

            doc.setFont(
                "helvetica",
                "normal"
            );

            /*
               Quantité ou poids
            */

            if(
                article.reference ===
                "saumon-fume"
            ){

                doc.text(

                    "Poids : "
                    +
                    article.poids
                    +
                    " g",

                    25,
                    y

                );

            }
            else{

                doc.text(

                    "Quantité : "
                    +
                    article.quantite,

                    25,
                    y

                );

            }

            /*
               Prix
            */

            doc.text(

                article.prix.toFixed(2)
                +
                " CHF",

                165,
                y,
                {
                    align:"right"
                }

            );

            y += 8;

            /*
               Nouvelle page
            */

            if(y > 265){

                doc.addPage();

                y = 20;

            }

        }

    );



/* ===================================================
   TOTAL
   =================================================== */

    y += 4;

    doc.setDrawColor(
        180
    );

    doc.line(
        20,
        y,
        190,
        y
    );

    y += 8;

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(
        14
    );

    doc.text(

        "TOTAL",

        20,

        y

    );

    doc.text(

        commande.total.toFixed(2)
        +
        " CHF",

        190,

        y,

        {
            align:"right"
        }

    );

    y += 15;
    /* ===================================================
   PAIEMENT
   =================================================== */

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(
        12
    );

    doc.text(
        "Paiement",
        20,
        y
    );

    y += 8;

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.text(
        "TWINT : confirmé",
        20,
        y
    );

    y += 12;


/* ===================================================
   COMMENTAIRE CLIENT
   =================================================== */

    if(
        commande.client.commentaire &&
        commande.client.commentaire.trim() !== ""
    ){

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.text(
            "Commentaire",
            20,
            y
        );

        y += 8;

        doc.setFont(
            "helvetica",
            "normal"
        );

        const commentaire =
        doc.splitTextToSize(
            commande.client.commentaire,
            170
        );

        doc.text(
            commentaire,
            20,
            y
        );

        y +=
        commentaire.length * 6 +
        10;

    }


/* ===================================================
   REMERCIEMENTS
   =================================================== */

    doc.setDrawColor(
        180
    );

    doc.line(
        20,
        y,
        190,
        y
    );

    y += 10;

    doc.setFont(
        "helvetica",
        "italic"
    );

    doc.setFontSize(
        11
    );

    doc.text(
        "Merci pour votre confiance.",
        20,
        y
    );

    y += 6;

    doc.text(
        "Votre commande sera préparée artisanalement.",
        20,
        y
    );

    y += 6;

    doc.text(
        "Idée Gourmande - Genève",
        20,
        y
    );


/* ===================================================
   ENREGISTREMENT
   =================================================== */

    const maintenant =
    new Date();

    const nomFichier =
        "Commande_" +
        maintenant.getFullYear() +
        String(maintenant.getMonth()+1).padStart(2,"0") +
        String(maintenant.getDate()).padStart(2,"0") +
        "_" +
        String(maintenant.getHours()).padStart(2,"0") +
        String(maintenant.getMinutes()).padStart(2,"0") +
        String(maintenant.getSeconds()).padStart(2,"0") +
        ".pdf";

    doc.save(
        nomFichier
    );

    return true;

}
