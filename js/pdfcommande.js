const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycby5o5V0dRb9fPpnhmUYCeWB1LxXjGRXfQK0kQ2Tzw2gHK58GQn8VmxlDI1DFWzogAhI/exec";


// ============================================================
// GÉNÉRATION DU PDF DE COMMANDE
// ============================================================

async function genererPDFCommande(commande) {

    if (!window.jspdf || !window.jspdf.jsPDF) {
        throw new Error("jsPDF n'est pas chargé.");
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // ========================================================
    // INFORMATIONS
    // ========================================================

    const fichier =
        "Commande_" + commande.id + ".pdf";

    const client =
        commande.client || {};

    const produits =
        Array.isArray(commande.produits)
            ? commande.produits
            : [];

    const total =
        Number(commande.total || 0);


    // ========================================================
    // PALETTE GRAPHIQUE
    // ========================================================

    const OR =
        [184, 145, 34];

    const OR_FONCE =
        [145, 111, 24];

    const BRUN =
        [117, 75, 48];

    const BRUN_CLAIR =
        [139, 94, 60];

    const CREME =
        [248, 244, 236];

    const CREME_FONCE =
        [238, 231, 217];

    const GRIS =
        [105, 105, 105];

    const GRIS_CLAIR =
        [220, 220, 220];

    const NOIR =
        [45, 45, 45];

    const BLANC =
        [255, 255, 255];


    // ========================================================
    // DIMENSIONS
    // ========================================================

    const pageWidth =
        doc.internal.pageSize.getWidth();

    const pageHeight =
        doc.internal.pageSize.getHeight();

    const marge =
        20;

    const largeurContenu =
        pageWidth - (marge * 2);


    // ========================================================
    // OUTILS GRAPHIQUES
    // ========================================================

    function nouvellePageSiNecessaire(
        hauteurNecessaire
    ) {

        if (
            y + hauteurNecessaire >
            pageHeight - 25
        ) {

            doc.addPage();

            y = 20;

            dessinerBandeauPage();
        }
    }


    function dessinerBandeauPage() {

        doc.setFillColor(
            CREME[0],
            CREME[1],
            CREME[2]
        );

        doc.rect(
            0,
            0,
            pageWidth,
            10,
            "F"
        );

        doc.setDrawColor(
            OR[0],
            OR[1],
            OR[2]
        );

        doc.setLineWidth(0.8);

        doc.line(
            marge,
            12,
            pageWidth - marge,
            12
        );
    }


    function dessinerTitreSection(
        titre
    ) {

        nouvellePageSiNecessaire(18);

        doc.setFillColor(
            CREME[0],
            CREME[1],
            CREME[2]
        );

        doc.roundedRect(
            marge,
            y,
            largeurContenu,
            9,
            2,
            2,
            "F"
        );

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(10);

        doc.setTextColor(
            BRUN[0],
            BRUN[1],
            BRUN[2]
        );

        doc.text(
            titre,
            marge + 5,
            y + 6
        );

        doc.setTextColor(
            NOIR[0],
            NOIR[1],
            NOIR[2]
        );

        y += 14;
    }


    function texteMultiligne(
        texte,
        x,
        largeur,
        taille = 9,
        interligne = 5
    ) {

        doc.setFontSize(taille);

        const lignes =
            doc.splitTextToSize(
                String(texte || ""),
                largeur
            );

        doc.text(
            lignes,
            x,
            y
        );

        y +=
            lignes.length *
            interligne;

        return lignes.length;
    }


    // ========================================================
    // EN-TÊTE
    // ========================================================

    doc.setFillColor(
        BRUN[0],
        BRUN[1],
        BRUN[2]
    );

    doc.rect(
        0,
        0,
        pageWidth,
        38,
        "F"
    );

    // Ligne dorée

    doc.setFillColor(
        OR[0],
        OR[1],
        OR[2]
    );

    doc.rect(
        0,
        36,
        pageWidth,
        2,
        "F"
    );


    // Nom de la société

    doc.setTextColor(
        BLANC[0],
        BLANC[1],
        BLANC[2]
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(22);

    doc.text(
        "IDÉE GOURMANDE",
        marge,
        18
    );


    // Sous-titre

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(10);

    doc.text(
        "Bon de commande",
        marge,
        27
    );


    // Numéro / date à droite

    doc.setFontSize(9);

    doc.text(
        "Commande n° " + commande.id,
        pageWidth - marge,
        18,
        {
            align: "right"
        }
    );

    doc.text(
        new Date().toLocaleString("fr-CH"),
        pageWidth - marge,
        27,
        {
            align: "right"
        }
    );


    // ========================================================
    // POSITION DE DÉPART
    // ========================================================

    let y =
        50;


    // ========================================================
    // CLIENT
    // ========================================================

    dessinerTitreSection(
        "CLIENT"
    );

    const nomClient =
        (
            client.prenom || ""
        ) +
        " " +
        (
            client.nom || ""
        );

    const adresse =
        String(
            client.adresse || ""
        ).trim();

    const telephone =
        String(
            client.telephone || ""
        ).trim();

    const email =
        String(
            client.email || ""
        ).trim();


    const hauteurClient =
        43;

    nouvellePageSiNecessaire(
        hauteurClient
    );

    doc.setFillColor(
        BLANC[0],
        BLANC[1],
        BLANC[2]
    );

    doc.setDrawColor(
        GRIS_CLAIR[0],
        GRIS_CLAIR[1],
        GRIS_CLAIR[2]
    );

    doc.setLineWidth(0.4);

    doc.roundedRect(
        marge,
        y,
        largeurContenu,
        hauteurClient,
        3,
        3,
        "FD"
    );


    // Colonne gauche

    let clientY =
        y + 9;

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(9);

    doc.setTextColor(
        BRUN[0],
        BRUN[1],
        BRUN[2]
    );

    doc.text(
        "Nom",
        marge + 6,
        clientY
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setTextColor(
        NOIR[0],
        NOIR[1],
        NOIR[2]
    );

    doc.text(
        nomClient.trim() || "—",
        marge + 6,
        clientY + 6
    );


    // Colonne droite

    const colonneDroite =
        marge + 95;

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setTextColor(
        BRUN[0],
        BRUN[1],
        BRUN[2]
    );

    doc.text(
        "Téléphone",
        colonneDroite,
        clientY
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setTextColor(
        NOIR[0],
        NOIR[1],
        NOIR[2]
    );

    doc.text(
        telephone || "—",
        colonneDroite,
        clientY + 6
    );


    // E-mail

    clientY += 18;

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setTextColor(
        BRUN[0],
        BRUN[1],
        BRUN[2]
    );

    doc.text(
        "E-mail",
        marge + 6,
        clientY
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setTextColor(
        NOIR[0],
        NOIR[1],
        NOIR[2]
    );

    doc.text(
        email || "—",
        marge + 6,
        clientY + 6
    );


    // Adresse

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setTextColor(
        BRUN[0],
        BRUN[1],
        BRUN[2]
    );

    doc.text(
        "Adresse",
        colonneDroite,
        clientY
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setTextColor(
        NOIR[0],
        NOIR[1],
        NOIR[2]
    );

    const adresseLignes =
        doc.splitTextToSize(
            adresse || "—",
            72
        );

    doc.text(
        adresseLignes,
        colonneDroite,
        clientY + 6
    );

    y += hauteurClient + 12;


    // ========================================================
    // PRODUITS
    // ========================================================

    dessinerTitreSection(
        "PRODUITS COMMANDÉS"
    );


    // --------------------------------------------------------
    // En-tête du tableau
    // --------------------------------------------------------

    nouvellePageSiNecessaire(18);

    const hauteurEntete =
        10;

    doc.setFillColor(
        BRUN[0],
        BRUN[1],
        BRUN[2]
    );

    doc.roundedRect(
        marge,
        y,
        largeurContenu,
        hauteurEntete,
        2,
        2,
        "F"
    );

    doc.setTextColor(
        BLANC[0],
        BLANC[1],
        BLANC[2]
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(8.5);

    const colProduit =
        marge + 4;

    const colPoids =
        marge + 105;

    const colQuantite =
        marge + 132;

    const colPrix =
        pageWidth - marge - 4;

    doc.text(
        "PRODUIT",
        colProduit,
        y + 6.5
    );

    doc.text(
        "POIDS",
        colPoids,
        y + 6.5
    );

    doc.text(
        "QTÉ",
        colQuantite,
        y + 6.5
    );

    doc.text(
        "PRIX",
        colPrix,
        y + 6.5,
        {
            align: "right"
        }
    );

    y +=
        hauteurEntete;


    // --------------------------------------------------------
    // Produits
    // --------------------------------------------------------

    produits.forEach(
        function(article, index) {

            const nom =
                article.nom ||
                "Produit";

            const quantite =
                Number(
                    article.quantite || 1
                );

            const poids =
                article.poids
                    ? article.poids + " g"
                    : "—";

            const prix =
                Number(
                    article.prix || 0
                ).toFixed(2) +
                " CHF";


            const lignesNom =
                doc.splitTextToSize(
                    String(nom),
                    96
                );

            const hauteurLigne =
                Math.max(
                    10,
                    lignesNom.length * 5 + 5
                );


            nouvellePageSiNecessaire(
                hauteurLigne + 2
            );


            // Fond alterné

            if (index % 2 === 0) {

                doc.setFillColor(
                    252,
                    250,
                    246
                );

                doc.rect(
                    marge,
                    y,
                    largeurContenu,
                    hauteurLigne,
                    "F"
                );
            }


            // Lignes verticales discrètes

            doc.setDrawColor(
                GRIS_CLAIR[0],
                GRIS_CLAIR[1],
                GRIS_CLAIR[2]
            );

            doc.setLineWidth(0.2);

            doc.line(
                marge,
                y + hauteurLigne,
                pageWidth - marge,
                y + hauteurLigne
            );


            // Produit

            doc.setTextColor(
                NOIR[0],
                NOIR[1],
                NOIR[2]
            );

            doc.setFont(
                "helvetica",
                "normal"
            );

            doc.setFontSize(8.5);

            doc.text(
                lignesNom,
                colProduit,
                y + 6
            );


            // Poids

            doc.text(
                poids,
                colPoids,
                y + 6
            );


            // Quantité

            doc.text(
                String(quantite),
                colQuantite,
                y + 6
            );


            // Prix

            doc.text(
                prix,
                colPrix,
                y + 6,
                {
                    align: "right"
                }
            );


            y +=
                hauteurLigne;
        }
    );


    // ========================================================
    // TOTAL
    // ========================================================

    nouvellePageSiNecessaire(
        28
    );

    y += 5;

    doc.setFillColor(
        CREME[0],
        CREME[1],
        CREME[2]
    );

    doc.roundedRect(
        marge,
        y,
        largeurContenu,
        18,
        3,
        3,
        "F"
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(11);

    doc.setTextColor(
        BRUN[0],
        BRUN[1],
        BRUN[2]
    );

    doc.text(
        "TOTAL DE LA COMMANDE",
        marge + 6,
        y + 11
    );

    doc.setFontSize(14);

    doc.setTextColor(
        OR_FONCE[0],
        OR_FONCE[1],
        OR_FONCE[2]
    );

    doc.text(
        total.toFixed(2) + " CHF",
        pageWidth - marge - 6,
        y + 11,
        {
            align: "right"
        }
    );

    y += 28;


    // ========================================================
    // MODE DE RÉCEPTION
    // ========================================================

    dessinerTitreSection(
        "MODE DE RÉCEPTION"
    );


    const champModeLivraison =
        document.getElementById(
            "modeLivraison"
        );

    const modeDepuisCommande =
        client.modeLivraison
            ? String(
                client.modeLivraison
            ).trim()
            : "";

    const modeDepuisFormulaire =
        champModeLivraison
            ? String(
                champModeLivraison.value || ""
            ).trim()
            : "";

    const modeLivraisonPDF =
        modeDepuisCommande ||
        modeDepuisFormulaire ||
        "Non renseigné";


    console.log(
        "MODE DE RÉCEPTION - client.modeLivraison :",
        modeDepuisCommande
    );

    console.log(
        "MODE DE RÉCEPTION - formulaire :",
        modeDepuisFormulaire
    );

    console.log(
        "MODE DE RÉCEPTION - valeur finale PDF :",
        modeLivraisonPDF
    );


    nouvellePageSiNecessaire(
        28
    );

    doc.setFillColor(
        BLANC[0],
        BLANC[1],
        BLANC[2]
    );

    doc.setDrawColor(
        OR[0],
        OR[1],
        OR[2]
    );

    doc.setLineWidth(0.7);

    doc.roundedRect(
        marge,
        y,
        largeurContenu,
        20,
        3,
        3,
        "FD"
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(10);

    doc.setTextColor(
        BRUN[0],
        BRUN[1],
        BRUN[2]
    );

    doc.text(
        modeLivraisonPDF,
        marge + 7,
        y + 12
    );

    y += 28;


    // ========================================================
    // PAIEMENT TWINT
    // ========================================================

    dessinerTitreSection(
        "PAIEMENT TWINT"
    );


    const nomTwintPDF =
        String(
            client.nomExpediteurTwint ||
            (
                document.getElementById(
                    "nomExpediteurTwint"
                )
                    ? document.getElementById(
                        "nomExpediteurTwint"
                    ).value
                    : ""
            ) ||
            ""
        ).trim();


    console.log(
        "NOM TWINT LU POUR LE PDF :",
        nomTwintPDF
    );


    nouvellePageSiNecessaire(
        30
    );

    doc.setFillColor(
        CREME[0],
        CREME[1],
        CREME[2]
    );

    doc.roundedRect(
        marge,
        y,
        largeurContenu,
        27,
        3,
        3,
        "F"
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(9);

    doc.setTextColor(
        GRIS[0],
        GRIS[1],
        GRIS[2]
    );

    doc.text(
        "Paiement effectué au nom de :",
        marge + 7,
        y + 9
    );


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(10);

    doc.setTextColor(
        NOIR[0],
        NOIR[1],
        NOIR[2]
    );

    doc.text(
        nomTwintPDF || "Non renseigné",
        marge + 7,
        y + 17
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(8);

    doc.setTextColor(
        GRIS[0],
        GRIS[1],
        GRIS[2]
    );

    doc.text(
        "La commande sera confirmée après vérification du paiement.",
        marge + 7,
        y + 23
    );

    y += 35;


    // ========================================================
    // COMMENTAIRE
    // ========================================================

    if (
        client.commentaire &&
        String(
            client.commentaire
        ).trim()
    ) {

        dessinerTitreSection(
            "COMMENTAIRE"
        );

        const commentaire =
            String(
                client.commentaire
            ).trim();

        const commentaireLignes =
            doc.splitTextToSize(
                commentaire,
                largeurContenu - 12
            );

        const hauteurCommentaire =
            Math.max(
                20,
                commentaireLignes.length * 5 + 12
            );

        nouvellePageSiNecessaire(
            hauteurCommentaire
        );

        doc.setFillColor(
            BLANC[0],
            BLANC[1],
            BLANC[2]
        );

        doc.setDrawColor(
            GRIS_CLAIR[0],
            GRIS_CLAIR[1],
            GRIS_CLAIR[2]
        );

        doc.setLineWidth(0.4);

        doc.roundedRect(
            marge,
            y,
            largeurContenu,
            hauteurCommentaire,
            3,
            3,
            "FD"
        );

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(9);

        doc.setTextColor(
            NOIR[0],
            NOIR[1],
            NOIR[2]
        );

        doc.text(
            commentaireLignes,
            marge + 6,
            y + 8
        );

        y +=
            hauteurCommentaire + 10;
    }


    // ========================================================
    // PIED DE PAGE
    // ========================================================

    const nombrePages =
        doc.internal.getNumberOfPages();


    for (
        let page = 1;
        page <= nombrePages;
        page++
    ) {

        doc.setPage(page);

        doc.setDrawColor(
            GRIS_CLAIR[0],
            GRIS_CLAIR[1],
            GRIS_CLAIR[2]
        );

        doc.setLineWidth(0.4);

        doc.line(
            marge,
            pageHeight - 16,
            pageWidth - marge,
            pageHeight - 16
        );


        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(7.5);

        doc.setTextColor(
            GRIS[0],
            GRIS[1],
            GRIS[2]
        );

        doc.text(
            "Idée Gourmande · Merci pour votre commande",
            marge,
            pageHeight - 9
        );

        doc.text(
            "Page " +
            page +
            " / " +
            nombrePages,
            pageWidth - marge,
            pageHeight - 9,
            {
                align: "right"
            }
        );
    }


    // ========================================================
    // PDF EN MÉMOIRE
    // ========================================================

    const pdfBlob =
        doc.output("blob");

    console.log(
        "PDF généré :",
        fichier
    );


    // ========================================================
    // CONVERSION BASE64
    // ========================================================

    const pdfBase64 =
        await new Promise(
            function(resolve, reject) {

                const reader =
                    new FileReader();

                reader.onloadend =
                    function() {

                        resolve(
                            reader.result
                        );
                    };

                reader.onerror =
                    function() {

                        reject(
                            new Error(
                                "Impossible de convertir le PDF en Base64."
                            )
                        );
                    };

                reader.readAsDataURL(
                    pdfBlob
                );
            }
        );


    // ========================================================
    // VÉRIFICATION E-MAIL
    // ========================================================

    const emailClient =
        String(
            client.email || ""
        ).trim();

    if (!emailClient) {

        throw new Error(
            "L'adresse e-mail du client est manquante."
        );
    }


    // ========================================================
    // DONNÉES À ENVOYER
    // ========================================================

    const payload = {

        to:
            emailClient,

        numeroCommande:
            commande.id,

        pdfBase64:
            pdfBase64,

        pdfFilename:
            fichier,

        client:
            client,

        produits:
            produits,

        total:
            total,

        subject:
            "Commande Idée Gourmande n°" +
            commande.id
    };


    console.log(
        "Préparation de l'envoi vers Google Apps Script..."
    );


    // ========================================================
    // ENVOI COMPATIBLE MOBILE
    // ========================================================

    await envoyerCommandeGoogle(
        payload
    );


    // ========================================================
    // SAUVEGARDE LOCALE DU PDF
    // ========================================================

    const estMobile =
        /Android|iPhone|iPad|iPod/i.test(
            navigator.userAgent
        );

    if (!estMobile) {

        try {

            doc.save(
                fichier
            );

        } catch (erreur) {

            console.warn(
                "Téléchargement local du PDF impossible :",
                erreur
            );
        }
    }


    console.log(
        "Commande transmise à Google Apps Script."
    );


    return {

        blob:
            pdfBlob,

        filename:
            fichier,

        emailEnvoye:
            true
    };
}


// ============================================================
// ENVOI COMPATIBLE AVEC LES NAVIGATEURS MOBILES
// ============================================================

function envoyerCommandeGoogle(payload) {

    return new Promise(
        function(resolve, reject) {

            try {

                // ------------------------------------------------
                // IFRAME INVISIBLE
                // ------------------------------------------------

                const iframe =
                    document.createElement(
                        "iframe"
                    );

                iframe.style.display =
                    "none";

                iframe.name =
                    "googleAppsScript_" +
                    Date.now();

                document.body.appendChild(
                    iframe
                );


                // ------------------------------------------------
                // FORMULAIRE
                // ------------------------------------------------

                const form =
                    document.createElement(
                        "form"
                    );

                form.method =
                    "POST";

                form.action =
                    GOOGLE_APPS_SCRIPT_URL;

                form.target =
                    iframe.name;

                form.style.display =
                    "none";


                // ------------------------------------------------
                // PAYLOAD
                // ------------------------------------------------

                const input =
                    document.createElement(
                        "input"
                    );

                input.type =
                    "hidden";

                input.name =
                    "payload";

                input.value =
                    JSON.stringify(
                        payload
                    );

                form.appendChild(
                    input
                );


                document.body.appendChild(
                    form
                );


                console.log(
                    "Envoi de la commande vers Google..."
                );


                // ------------------------------------------------
                // ENVOI
                // ------------------------------------------------

                form.submit();


                // ------------------------------------------------
                // NETTOYAGE
                // ------------------------------------------------

                setTimeout(
                    function() {

                        form.remove();

                        iframe.remove();

                        console.log(
                            "Commande envoyée au Web App Google."
                        );

                        resolve();

                    },
                    3000
                );


            } catch (erreur) {

                reject(
                    new Error(
                        "Impossible d'envoyer la commande : " +
                        erreur.message
                    )
                );
            }
        }
    );
}


// ============================================================
// GARANTIT LA DISPONIBILITÉ DE LA FONCTION
// POUR commande.js
// ============================================================

window.genererPDFCommande =
    genererPDFCommande;
