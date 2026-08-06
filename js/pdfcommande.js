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
 
/* ==================================
   PRODUITS COMMANDÉS
================================== */


    y += 5;


    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(
        13
    );


    doc.text(
        "Produits commandés",
        20,
        y
    );


    y += 10;



    doc.setFont(
        "helvetica",
        "normal"
    );


    doc.setFontSize(
        11
    );



    if(
        !commande.produits ||
        commande.produits.length === 0
    ){


        doc.text(
            "Aucun produit.",
            20,
            y
        );


        y += 8;


    }
    else {



        commande.produits.forEach(

            function(article){



                /*
                   Gestion changement de page
                */

                if(y > 260){


                    doc.addPage();


                    y = 20;


                }




                doc.setFont(
                    "helvetica",
                    "bold"
                );


                doc.text(
                    article.nom,
                    20,
                    y
                );


                y += 6;



                doc.setFont(
                    "helvetica",
                    "normal"
                );



                /*
                   Recette
                */


                if(
                    article.recette &&
                    article.recette !== ""
                ){


                    doc.text(

                        "Recette : "
                        +
                        article.recette,

                        25,
                        y

                    );


                    y += 6;


                }




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
                else {


                    doc.text(

                        "Quantité : "
                        +
                        article.quantite,

                        25,
                        y

                    );


                }



                /*
                   Prix article
                */


                doc.text(

                    "Prix : "
                    +
                    Number(
                        article.prix
                    )
                    .toFixed(2)
                    +
                    " CHF",

                    120,
                    y

                );



                y += 10;



            }

        );


    }



/* ==================================
   TOTAL
================================== */


    y += 5;



    doc.line(
        20,
        y,
        190,
        y
    );


    y += 10;



    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(
        14
    );



    doc.text(
        "TOTAL : "
        +
        Number(
            commande.total
        )
        .toFixed(2)
        +
        " CHF",

        20,
        y
    );



    y += 15;
