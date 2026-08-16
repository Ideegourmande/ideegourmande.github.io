console.log("PDFCOMMANDE.JS CHARGE");

// ==========================================
// IDÉE GOURMANDE
// Génération PDF professionnel
// ==========================================

function genererPDFCommande(commande) {

    // ==========================================
    // VÉRIFICATION jsPDF
    // ==========================================

    if (!window.jspdf) {

        console.error("jsPDF non chargé");

        return;
    }

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();


    // ==========================================
    // LOGO
    // ==========================================

    const logo = new Image();

    logo.src = "images/logo.png";


    // ==========================================
    // VARIABLES
    // ==========================================

    let y = 20;

    const margeGauche = 20;
    const largeurPage = 170;


    // ==========================================
    // EN-TÊTE
    // ==========================================

    doc.addImage(
        logo,
        "PNG",
        20,
        10,
        45,
        25
    );


    doc.setFontSize(18);

    doc.setFont(undefined, "bold");

    doc.text(
        "IDÉE GOURMANDE",
        75,
        18
    );


    doc.setFontSize(10);

    doc.setFont(undefined, "normal");

    doc.text(
        "Genève",
        75,
        25
    );


    doc.text(
        "TWINT : 079 592 78 82",
        75,
        31
    );


    // ==========================================
    // TITRE
    // ==========================================

    y = 50;


    doc.setFontSize(18);

    doc.setFont(undefined, "bold");

    doc.text(
        "BON DE COMMANDE",
        margeGauche,
        y
    );


    y += 10;


    // ==========================================
    // NUMÉRO ET DATE
    // ==========================================

    const maintenant = new Date();


    const dateTexte =
        maintenant.toLocaleDateString("fr-FR");


    const heureTexte =
        maintenant.toLocaleTimeString(
            "fr-FR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    const numeroCommande =
        commande.id ||
        (
            "IG-" +
            maintenant.getTime()
        );


    doc.setFontSize(10);

    doc.setFont(undefined, "normal");


    doc.text(
        "N° commande : " + numeroCommande,
        margeGauche,
        y
    );


    doc.text(
        "Date : " + dateTexte + " à " + heureTexte,
        120,
        y
    );


    y += 12;


    // ==========================================
    // CADRE CLIENT
    // ==========================================

    const hauteurClient = 48;


    doc.setDrawColor(100, 100, 100);

    doc.rect(
        margeGauche,
        y,
        largeurPage,
        hauteurClient
    );


    doc.setFontSize(12);

    doc.setFont(undefined, "bold");

    doc.text(
        "INFORMATIONS CLIENT",
        margeGauche + 5,
        y + 8
    );


    doc.setFontSize(10);

    doc.setFont(undefined, "normal");


    const nomClient =
        (
            commande.client?.prenom || ""
        ) +
        " " +
        (
            commande.client?.nom || ""
        );


    doc.text(
        "Client : " + nomClient.trim(),
        margeGauche + 5,
        y + 17
    );


    doc.text(
        "Email : " +
        (commande.client?.email || ""),
        margeGauche + 5,
        y + 25
    );


    doc.text(
        "Téléphone : " +
        (commande.client?.telephone || ""),
        margeGauche + 5,
        y + 33
    );


    doc.text(
        "Adresse : " +
        (commande.client?.adresse || ""),
        margeGauche + 5,
        y + 41
    );


    y += hauteurClient + 12;


    // ==========================================
    // PRODUITS
    // ==========================================

    doc.setFontSize(13);

    doc.setFont(undefined, "bold");

    doc.text(
        "PRODUITS COMMANDÉS",
        margeGauche,
        y
    );


    y += 8;


    // ==========================================
    // TABLEAU
    // ==========================================

    const xProduit = 20;
    const xRecette = 85;
    const xQuantite = 130;
    const xPrix = 165;


    doc.setFillColor(230, 230, 230);

    doc.rect(
        20,
        y - 5,
        170,
        10,
        "F"
    );


    doc.setFontSize(9);

    doc.setFont(undefined, "bold");


    doc.text(
        "Produit",
        xProduit + 3,
        y + 1
    );


    doc.text(
        "Recette",
        xRecette,
        y + 1
    );


    doc.text(
        "Qté / poids",
        xQuantite,
        y + 1
    );


    doc.text(
        "Prix",
        xPrix,
        y + 1
    );


    y += 10;


    doc.setFont(undefined, "normal");

    doc.setFontSize(9);


    // ==========================================
    // PRODUITS
    // ==========================================

    const produits =
        Array.isArray(commande.produits)
            ? commande.produits
            : [];


    produits.forEach(function(article) {

        // Nouvelle page si nécessaire
        if (y > 265) {

            ajouterPiedDePage(doc);

            doc.addPage();

            y = 25;

        }


        // Produit
        const nom =
            article.nom || "Produit";


        // Recette
        const recette =
            article.recette || "-";


        // Quantité / poids
        let quantite = "";


        if (article.poids) {

            quantite =
                article.poids + " g";

        }
        else {

            quantite =
                "x " +
                (
                    article.quantite || 1
                );

        }


        // Prix
        const prix =
            Number(article.prix) || 0;


        // Lignes multi-lignes
        const nomLignes =
            doc.splitTextToSize(
                nom,
                60
            );


        const recetteLignes =
            doc.splitTextToSize(
                recette,
                42
            );


        const hauteur =
            Math.max(
                nomLignes.length,
                recetteLignes.length
            ) * 5 + 5;


        doc.text(
            nomLignes,
            xProduit + 3,
            y
        );


        doc.text(
            recetteLignes,
            xRecette,
            y
        );


        doc.text(
            quantite,
            xQuantite,
            y
        );


        doc.text(
            prix.toFixed(2) + " CHF",
            xPrix,
            y
        );


// Pas de ligne entre les articles


        y += hauteur;

    });


    // ==========================================
    // TOTAL
    // ==========================================

    y += 5;


    doc.setDrawColor(80, 80, 80);


    doc.line(
        110,
        y,
        190,
        y
    );


    y += 8;


    doc.setFontSize(14);

    doc.setFont(undefined, "bold");


    const total =
        Number(commande.total) || 0;


    doc.text(
        "TOTAL",
        125,
        y
    );


    doc.text(
        total.toFixed(2) + " CHF",
        165,
        y
    );


    y += 12;


    // ==========================================
    // PAIEMENT
    // ==========================================

    doc.setFontSize(10);

    doc.setFont(undefined, "normal");


    doc.text(
        "Paiement : TWINT",
        margeGauche,
        y
    );


    doc.text(
        "079 592 78 82",
        margeGauche,
        y + 6
    );


    y += 16;


    // ==========================================
    // COMMENTAIRE
    // ==========================================

    if (
        commande.client?.commentaire &&
        commande.client.commentaire.trim() !== ""
    ) {

        if (y > 245) {

            ajouterPiedDePage(doc);

            doc.addPage();

            y = 25;

        }


        doc.setFontSize(11);

        doc.setFont(undefined, "bold");


        doc.text(
            "COMMENTAIRE",
            margeGauche,
            y
        );


        y += 7;


        doc.setFont(undefined, "normal");

        doc.setFontSize(10);


        const commentaire =
            doc.splitTextToSize(
                commande.client.commentaire,
                165
            );


        doc.text(
            commentaire,
            margeGauche,
            y
        );


        y +=
            commentaire.length * 5 +
            5;

    }


    // ==========================================
    // PIED DE PAGE
    // ==========================================

    ajouterPiedDePage(doc);


    // ==========================================
    // NOM DU FICHIER
    // ==========================================

    console.log(
        "CLIENT PDF :",
        commande.client
    );


    const nomClientFichier =
        (
            commande.client?.nom ||
            "Client"
        )
        .toUpperCase()
        .replace(
            /[^A-Z0-9]/g,
            ""
        );


    const prenomClientFichier =
        (
            commande.client?.prenom ||
            ""
        )
        .trim()
        .toUpperCase()
        .replace(
            /[^A-Z0-9]/g,
            ""
        );


    const datePDF =
        maintenant.getFullYear() +
        String(
            maintenant.getMonth() + 1
        ).padStart(2, "0") +
        String(
            maintenant.getDate()
        ).padStart(2, "0") +
        "_" +
        String(
            maintenant.getHours()
        ).padStart(2, "0") +
        String(
            maintenant.getMinutes()
        ).padStart(2, "0");


    const fichier =
        "Commande_" +
        nomClientFichier +
        "_" +
        prenomClientFichier +
        "_" +
        datePDF +
        ".pdf";


    // ==========================================
    // SAUVEGARDE
    // ==========================================

    doc.save(fichier);


    console.log(
        "PDF généré :",
        fichier
    );
}


// ==========================================
// PIED DE PAGE
// ==========================================

function ajouterPiedDePage(doc) {

    const nombrePages =
        doc.internal.getNumberOfPages();


    for (
        let page = 1;
        page <= nombrePages;
        page++
    ) {

        doc.setPage(page);


        doc.setFontSize(8);

        doc.setFont(undefined, "normal");


        doc.setDrawColor(
            180,
            180,
            180
        );


        doc.line(
            20,
            285,
            190,
            285
        );


        doc.text(
            "Idée Gourmande - Genève",
            20,
            291
        );


        doc.text(
            "TWINT : 079 592 78 82",
            85,
            291
        );


        doc.text(
            "Page " +
            page +
            " / " +
            nombrePages,
            160,
            291
        );

    }
}
