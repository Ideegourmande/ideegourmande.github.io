const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycby5o5V0dRb9fPpnhmUYCeWB1LxXjGRXfQK0kQ2Tzw2gHK58GQn8VmxlDI1DFWzogAhI/exec";


async function genererPDFCommande(commande) {

    if (!window.jspdf || !window.jspdf.jsPDF) {
        throw new Error("jsPDF n'est pas chargé.");
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // ==============================
    // INFORMATIONS
    // ==============================

    const fichier = "Commande_" + commande.id + ".pdf";

    const client = commande.client || {};

    const produits = Array.isArray(commande.produits)
        ? commande.produits
        : [];

    const total = Number(commande.total || 0);


    // ==============================
    // TITRE
    // ==============================

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("IDÉE GOURMANDE", 20, 20);

    doc.setFontSize(14);
    doc.text("Bon de commande", 20, 30);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text(
        "N° commande : " + commande.id,
        20,
        40
    );

    doc.text(
        "Date : " + new Date().toLocaleString("fr-CH"),
        20,
        47
    );


    // ==============================
    // CLIENT
    // ==============================

    let y = 60;

    doc.setFont("helvetica", "bold");
    doc.text("CLIENT", 20, y);

    doc.setFont("helvetica", "normal");

    y += 8;

    doc.text(
        "Nom : " +
        (client.prenom || "") +
        " " +
        (client.nom || ""),
        20,
        y
    );

    y += 7;

    doc.text(
        "Téléphone : " +
        (client.telephone || ""),
        20,
        y
    );

    y += 7;

    doc.text(
        "E-mail : " +
        (client.email || ""),
        20,
        y
    );

    y += 7;

    const adresse = String(client.adresse || "");

    const adresseLignes = doc.splitTextToSize(
        "Adresse : " + adresse,
        170
    );

    doc.text(
        adresseLignes,
        20,
        y
    );

    y += adresseLignes.length * 6 + 8;


    // ==============================
    // PRODUITS
    // ==============================

    doc.setFont("helvetica", "bold");
    doc.text(
        "PRODUITS COMMANDÉS",
        20,
        y
    );

    doc.setFont("helvetica", "normal");

    y += 10;

    produits.forEach(function(article) {

        const nom =
            article.nom || "Produit";

        const quantite =
            Number(article.quantite || 1);

        const poids =
            article.poids
                ? " (" + article.poids + " g)"
                : "";

        const prix =
            Number(article.prix || 0).toFixed(2);

        const ligne =
            "- " +
            nom +
            poids +
            " x" +
            quantite +
            " : " +
            prix +
            " CHF";

        const lignes =
            doc.splitTextToSize(
                ligne,
                170
            );

        doc.text(
            lignes,
            20,
            y
        );

        y += lignes.length * 6 + 2;


        // Nouvelle page si nécessaire

        if (y > 270) {

            doc.addPage();

            y = 20;
        }
    });


    // ==============================
    // TOTAL
    // ==============================

    y += 5;

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(13);

    doc.text(
        "TOTAL : " +
        total.toFixed(2) +
        " CHF",
        20,
        y
    );

    doc.setFontSize(10);

    doc.setFont(
        "helvetica",
        "normal"
    );

    y += 12;

    doc.text(
        "Paiement : TWINT",
        20,
        y
    );


    // ==============================
    // COMMENTAIRE
    // ==============================

    if (client.commentaire) {

        y += 12;

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.text(
            "COMMENTAIRE",
            20,
            y
        );

        doc.setFont(
            "helvetica",
            "normal"
        );

        y += 7;

        const commentaireLignes =
            doc.splitTextToSize(
                String(client.commentaire),
                170
            );

        doc.text(
            commentaireLignes,
            20,
            y
        );
    }


    // ==============================
    // PDF EN MÉMOIRE
    // ==============================

    const pdfBlob =
        doc.output("blob");

    console.log(
        "PDF généré :",
        fichier
    );


    // ==============================
    // CONVERSION BASE64
    // ==============================

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


    // ==============================
    // VÉRIFICATION E-MAIL
    // ==============================

    const emailClient =
        String(
            client.email || ""
        ).trim();

    if (!emailClient) {

        throw new Error(
            "L'adresse e-mail du client est manquante."
        );
    }


    // ==============================
    // DONNÉES À ENVOYER
    // ==============================

    const payload = {

        to: emailClient,

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


    // ==============================
    // ENVOI COMPATIBLE MOBILE
    // ==============================

    await envoyerCommandeGoogle(
        payload
    );


    // ==============================
    // SAUVEGARDE LOCALE DU PDF
    // ==============================

    // Sur ordinateur, on télécharge
    // également une copie du PDF.
    //
    // Sur mobile, on évite le téléchargement
    // automatique qui peut perturber le
    // navigateur pendant l'envoi.

    const estMobile =
        /Android|iPhone|iPad|iPod/i.test(
            navigator.userAgent
        );

    if (!estMobile) {

        try {

            doc.save(fichier);

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


/**
 * Envoi compatible avec les navigateurs mobiles.
 *
 * On utilise un formulaire HTML invisible
 * plutôt que fetch(), afin d'éviter les
 * problèmes CORS / Load failed sur mobile.
 */
function envoyerCommandeGoogle(payload) {

    return new Promise(
        function(resolve, reject) {

            try {

                // Création d'un iframe invisible

                const iframe =
                    document.createElement("iframe");

                iframe.style.display = "none";

                iframe.name =
                    "googleAppsScript_" +
                    Date.now();

                document.body.appendChild(
                    iframe
                );


                // Création du formulaire

                const form =
                    document.createElement("form");

                form.method =
                    "POST";

                form.action =
                    GOOGLE_APPS_SCRIPT_URL;

                form.target =
                    iframe.name;

                form.style.display =
                    "none";


                // Champ payload

                const input =
                    document.createElement("input");

                input.type =
                    "hidden";

                input.name =
                    "payload";

                input.value =
                    JSON.stringify(payload);

                form.appendChild(
                    input
                );


                document.body.appendChild(
                    form
                );


                console.log(
                    "Envoi de la commande vers Google..."
                );


                // Envoi

                form.submit();


                /*
                 * Le Web App Google reçoit
                 * la commande indépendamment
                 * de la réponse visible par
                 * le navigateur.
                 *
                 * On laisse quelques secondes
                 * au serveur pour recevoir le
                 * PDF et envoyer les deux e-mails.
                 */

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
