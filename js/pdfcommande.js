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

// ==============================
// LOGO
// ==============================

const logo =
new Image();

logo.src =
"images/logo.png";

doc.addImage(
    logo,
    "PNG",
    20,
    10,
    45,
    25
);

    let y = 45;


// ==============================
// TITRE
// ==============================

doc.setFontSize(18);

doc.text(
    "IDÉE GOURMANDE",
    20,
    y
);

y += 10;


doc.setFontSize(13);

doc.text(
    "Bon de commande",
    20,
    y
);

y += 15;




// ==============================
// CLIENT
// ==============================


doc.setFontSize(13);

doc.text(
    "Informations client",
    20,
    y
);


y += 8;


// cadre client

doc.rect(
    20,
    y,
    170,
    42
);


let clientY = y + 10;


doc.setFontSize(11);


doc.text(
    "Nom : " +
    commande.client.prenom +
    " " +
    commande.client.nom,
    25,
    clientY
);


clientY += 8;


doc.text(
    "Email : " +
    commande.client.email,
    25,
    clientY
);


clientY += 8;


doc.text(
    "Téléphone : " +
    commande.client.telephone,
    25,
    clientY
);


clientY += 8;


doc.text(
    "Adresse : " +
    commande.client.adresse,
    25,
    clientY
);


y += 55;



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


    // ==============================
// NOM DU FICHIER PDF
// ==============================

console.log(
    "CLIENT PDF :",
    commande.client
);
    
const nomClient =

(
    commande.client.nom
    ||
    "Client"
)

.toUpperCase()
.replace(
    /[^A-Z0-9]/g,
    ""
);



const prenomClient =

(
    commande.client.prenom
    ||
    ""
)

.trim()
.toUpperCase()
.replace(
    /[^A-Z0-9]/g,
    ""
);



const maintenant =
new Date();



const datePDF =

maintenant.getFullYear()
+
String(
    maintenant.getMonth() + 1
)
.padStart(2,"0")
+
String(
    maintenant.getDate()
)
.padStart(2,"0")
+
"_"
+
String(
    maintenant.getHours()
)
.padStart(2,"0")
+
String(
    maintenant.getMinutes()
)
.padStart(2,"0");



const fichier =

"Commande_"
+
nomClient
+
"_"
+
prenomClient
+
"_"
+
datePDF
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
