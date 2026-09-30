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
    // COULEURS
    // ========================================================

    const OR = [184, 145, 34];
    const OR_FONCE = [145, 111, 24];
    const BRUN = [117, 75, 48];
    const CREME = [248, 244, 236];
    const GRIS = [105, 105, 105];
    const GRIS_CLAIR = [220, 220, 220];
    const NOIR = [45, 45, 45];
    const BLANC = [255, 255, 255];


    // ========================================================
    // DIMENSIONS
    // ========================================================

    const pageWidth =
        doc.internal.pageSize.getWidth();

    const pageHeight =
        doc.internal.pageSize.getHeight();

    const marge = 18;

    const largeurContenu =
        pageWidth - (marge * 2);


    // ========================================================
    // OUTILS
    // ========================================================

    let y = 43;


    function nouvellePageSiNecessaire(
        hauteurNecessaire
    ) {

        if (
            y + hauteurNecessaire >
            pageHeight - 22
        ) {

            doc.addPage();

            y = 18;

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
            7,
            "F"
        );

        doc.setDrawColor(
            OR[0],
            OR[1],
            OR[2]
        );

        doc.setLineWidth(0.6);

        doc.line(
            marge,
            9,
            pageWidth - marge,
            9
        );
    }


    function dessinerTitreSection(titre) {

        nouvellePageSiNecessaire(14);

        doc.setFillColor(
            CREME[0],
            CREME[1],
            CREME[2]
        );

        doc.roundedRect(
            marge,
            y,
            largeurContenu,
            8,
            2,
            2,
            "F"
        );

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(8.5);

        doc.setTextColor(
            BRUN[0],
            BRUN[1],
            BRUN[2]
        );

        doc.text(
            titre,
            marge + 4,
            y + 5.7
        );

        doc.setTextColor(
            NOIR[0],
            NOIR[1],
            NOIR[2]
        );

        y += 11;
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
        32,
        "F"
    );

    doc.setFillColor(
        OR[0],
        OR[1],
        OR[2]
    );

    doc.rect(
        0,
        30,
        pageWidth,
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

    doc.setFontSize(19);

    doc.text(
        "IDÉE GOURMANDE",
        marge,
        16
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(9);

    doc.text(
        "Bon de commande",
        marge,
        24
    );


    doc.setFontSize(8);

    doc.text(
        "Commande n° " + commande.id,
        pageWidth - marge,
        15,
        {
            align: "right"
        }
    );

    doc.text(
        new Date().toLocaleString("fr-CH"),
        pageWidth - marge,
        23,
        {
            align: "right"
        }
    );


    // ========================================================
    // CLIENT
    // ========================================================

    dessinerTitreSection("CLIENT");

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


    const hauteurClient = 34;

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

    doc.setLineWidth(0.35);

    doc.roundedRect(
        marge,
        y,
        largeurContenu,
        hauteurClient,
        2.5,
        2.5,
        "FD"
    );


    const colonneDroite =
        marge + 92;

    let clientY =
        y + 7;


    // Nom

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(7.5);

    doc.setTextColor(
        BRUN[0],
        BRUN[1],
        BRUN[2]
    );

    doc.text(
        "Nom",
        marge + 5,
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
        marge + 5,
        clientY + 5
    );


    // Téléphone

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
        clientY + 5
    );


    // E-mail

    clientY += 14;

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
        marge + 5,
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
        marge + 5,
        clientY + 5
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
        clientY + 5
    );

    y += hauteurClient + 8;


    // ========================================================
    // PRODUITS
    // ========================================================

    dessinerTitreSection(
        "PRODUITS COMMANDÉS"
    );


    // En-tête du tableau

    nouvellePageSiNecessaire(9);

    const hauteurEntete = 8;

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
        1.5,
        1.5,
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

    doc.setFontSize(7.5);

    const colProduit =
        marge + 4;

    const colPoids =
        marge + 103;

    const colQuantite =
        marge + 132;

    const colPrix =
        pageWidth - marge - 4;

    doc.text(
        "PRODUIT",
        colProduit,
        y + 5.3
    );

    doc.text(
        "POIDS",
        colPoids,
        y + 5.3
    );

    doc.text(
        "QTÉ",
        colQuantite,
        y + 5.3
    );

    doc.text(
        "PRIX",
        colPrix,
        y + 5.3,
        {
            align: "right"
        }
    );

    y += hauteurEntete;


    // Produits

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
                    94
                );

            const hauteurLigne =
                Math.max(
                    9,
                    lignesNom.length * 4.5 + 4
                );


            nouvellePageSiNecessaire(
                hauteurLigne + 1
            );


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


            doc.setTextColor(
                NOIR[0],
                NOIR[1],
                NOIR[2]
            );

            doc.setFont(
                "helvetica",
                "normal"
            );

            doc.setFontSize(7.8);

            doc.text(
                lignesNom,
                colProduit,
                y + 5.5
            );

            doc.text(
                poids,
                colPoids,
                y + 5.5
            );

            doc.text(
                String(quantite),
                colQuantite,
                y + 5.5
            );

            doc.text(
                prix,
                colPrix,
                y + 5.5,
                {
                    align: "right"
                }
            );

            y += hauteurLigne;
        }
    );

// ========================================================
// FRAIS DE LIVRAISON
// ========================================================

const fraisLivraisonPDF =
    client.modeLivraison === "Livraison en Suisse"
        ? 10.50
        : 0;

if (fraisLivraisonPDF > 0) {

    nouvellePageSiNecessaire(10);

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(8);

    doc.setTextColor(
        NOIR[0],
        NOIR[1],
        NOIR[2]
    );

    doc.text(
        "Livraison en Suisse - expédition par la Poste",
        marge + 5,
        y + 5
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        fraisLivraisonPDF.toFixed(2) + " CHF",
        pageWidth - marge - 5,
        y + 5,
        {
            align: "right"
        }
    );

    y += 9;
}


    nouvellePageSiNecessaire(22);

    y += 4;

    doc.setFillColor(
        CREME[0],
        CREME[1],
        CREME[2]
    );

    doc.roundedRect(
        marge,
        y,
        largeurContenu,
        15,
        2.5,
        2.5,
        "F"
    );

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
        "TOTAL DE LA COMMANDE",
        marge + 5,
        y + 9.5
    );

    doc.setFontSize(12);

    doc.setTextColor(
        OR_FONCE[0],
        OR_FONCE[1],
        OR_FONCE[2]
    );

    doc.text(
        total.toFixed(2) + " CHF",
        pageWidth - marge - 5,
        y + 9.5,
        {
            align: "right"
        }
    );

    y += 22;


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
        "MODE DE RÉCEPTION - valeur finale PDF :",
        modeLivraisonPDF
    );


    nouvellePageSiNecessaire(19);

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

    doc.setLineWidth(0.6);

    doc.roundedRect(
        marge,
        y,
        largeurContenu,
        16,
        2.5,
        2.5,
        "FD"
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(8.5);

    doc.setTextColor(
        BRUN[0],
        BRUN[1],
        BRUN[2]
    );

    doc.text(
        modeLivraisonPDF,
        marge + 6,
        y + 10
    );

    y += 21;


    // ========================================================
    // PAIEMENT TWINT
    // ========================================================

    dessinerTitreSection(
        "PAIEMENT TWINT"
    );


    const champNomTwint =
        document.getElementById(
            "nomExpediteurTwint"
        );

    const nomTwintPDF =
        String(
            client.nomExpediteurTwint ||
            (
                champNomTwint
                    ? champNomTwint.value
                    : ""
            ) ||
            ""
        ).trim();


    console.log(
        "NOM TWINT LU POUR LE PDF :",
        nomTwintPDF
    );


    nouvellePageSiNecessaire(23);

    doc.setFillColor(
        CREME[0],
        CREME[1],
        CREME[2]
    );

    doc.roundedRect(
        marge,
        y,
        largeurContenu,
        21,
        2.5,
        2.5,
        "F"
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
        "Paiement effectué au nom de :",
        marge + 6,
        y + 7
    );


    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(9);

    doc.setTextColor(
        NOIR[0],
        NOIR[1],
        NOIR[2]
    );

    doc.text(
        nomTwintPDF || "Non renseigné",
        marge + 6,
        y + 13
    );


    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(6.8);

    doc.setTextColor(
        GRIS[0],
        GRIS[1],
        GRIS[2]
    );

    doc.text(
        "Confirmation après vérification du paiement.",
        marge + 6,
        y + 18
    );

    y += 26;


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
                largeurContenu - 10
            );

        const hauteurCommentaire =
            Math.max(
                16,
                commentaireLignes.length * 4.5 + 8
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

        doc.setLineWidth(0.35);

        doc.roundedRect(
            marge,
            y,
            largeurContenu,
            hauteurCommentaire,
            2.5,
            2.5,
            "FD"
        );

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(8);

        doc.setTextColor(
            NOIR[0],
            NOIR[1],
            NOIR[2]
        );

        doc.text(
            commentaireLignes,
            marge + 5,
            y + 7
        );

        y +=
            hauteurCommentaire + 5;
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

        doc.setLineWidth(0.35);

        doc.line(
            marge,
            pageHeight - 13,
            pageWidth - marge,
            pageHeight - 13
        );


        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(7);

        doc.setTextColor(
            GRIS[0],
            GRIS[1],
            GRIS[2]
        );

        doc.text(
            "Idée Gourmande · Merci pour votre commande",
            marge,
            pageHeight - 7
        );

        doc.text(
            "Page " +
            page +
            " / " +
            nombrePages,
            pageWidth - marge,
            pageHeight - 7,
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

console.log(
    "PAYLOAD ENVOYÉ À GOOGLE :",
    payload
);
                form.submit();


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
// DISPONIBILITÉ POUR commande.js
// ============================================================

window.genererPDFCommande =
    genererPDFCommande;
