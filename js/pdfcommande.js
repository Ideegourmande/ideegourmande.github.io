console.log("PDFCOMMANDE.JS CHARGE");


// ==================================
// IDÉE GOURMANDE
// Génération PDF commande client
// ==================================


function genererPDFCommande(commande){


    if(!window.jspdf){

        console.error(
            "jsPDF non chargé"
        );

        return;

    }



    const { jsPDF } =
    window.jspdf;



    const doc =
    new jsPDF();



    let y = 20;



    // ==============================
    // TITRE
    // ==============================


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




    // ==============================
    // CLIENT
    // ==============================


    doc.setFontSize(12);


    doc.text(
        "Client",
        20,
        y
    );


    y += 8;


    doc.setFontSize(11);



    doc.text(
        commande.client.prenom
        +
        " "
        +
        commande.client.nom,
        20,
        y
    );


    y += 7;


    doc.text(
        commande.client.email,
        20,
        y
    );


    y += 7;


    doc.text(
        commande.client.telephone,
        20,
        y
    );


    y += 7;


    doc.text(
        commande.client.adresse,
        20,
        y
    );


    y += 15;




    // ==============================
    // PRODUITS
    // ==============================


    doc.setFontSize(12);


    doc.text(
        "Produits commandés",
        20,
        y
    );


    y += 10;


    doc.setFontSize(11);



    commande.produits.forEach(
        article => {


            let ligne =
            article.nom
            +
            " - ";


            if(article.poids){

                ligne +=
                article.poids
                +
                " g - ";

            }
            else {

                ligne +=
                "Qté "
                +
                article.quantite
                +
                " - ";

            }



            ligne +=
            article.prix.toFixed(2)
            +
            " CHF";



            doc.text(
                ligne,
                20,
                y
            );


            y += 7;


            if(article.recette){


                doc.text(
                    "   Recette : "
                    +
                    article.recette,
                    25,
                    y
                );


                y += 7;


            }



        }

    );






    y += 10;




    // ==============================
    // TOTAL
    // ==============================



    doc.setFontSize(13);


    doc.text(
        "TOTAL : "
        +
        commande.total.toFixed(2)
        +
        " CHF",
        20,
        y
    );


    y += 12;




    // ==============================
    // PAIEMENT
    // ==============================


    doc.setFontSize(11);


    doc.text(
        "Paiement : TWINT confirmé",
        20,
        y
    );


    y += 15;



    // ==============================
    // COMMENTAIRE
    // ==============================


    if(
        commande.client.commentaire
        &&
        commande.client.commentaire.trim() !== ""
    ){


        doc.setFontSize(12);


        doc.text(
            "Commentaire",
            20,
            y
        );


        y += 8;


        doc.setFontSize(11);


        const texte =
        doc.splitTextToSize(
            commande.client.commentaire,
            170
        );


        doc.text(
            texte,
            20,
            y
        );


    }



    // ==============================
    // SAUVEGARDE
    // ==============================


    const fichier =

    "Commande_Idee_Gourmande_"
    +
    Date.now()
    +
    ".pdf";



    doc.save(
        fichier
    );



    console.log(
        "PDF généré :",
        fichier
    );


}
