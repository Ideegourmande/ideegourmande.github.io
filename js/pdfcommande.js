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

    doc.text("N° commande : " + commande.id, 20, 40);
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
        "Nom : " + (client.prenom || "") + " " + (client.nom || ""),
        20,
        y
    );

    y += 7;
    doc.text(
        "Téléphone : " + (client.telephone || ""),
        20,
        y
    );

    y += 7;
    doc.text(
        "E-mail : " + (client.email || ""),
        20,
        y
    );

    y += 7;

    const adresse = String(client.adresse || "");
    const adresseLignes = doc.splitTextToSize(
        "Adresse : " + adresse,
        170
    );

    doc.text(adresseLignes, 20, y);
    y += adresseLignes.length * 6 + 8;

    // ==============================
    // PRODUITS
    // ==============================

    doc.setFont("helvetica", "bold");
    doc.text("PRODUITS COMMANDÉS", 20, y);

    doc.setFont("helvetica", "normal");
    y += 10;

    produits.forEach(function(article) {

        const nom = article.nom || "Produit";
        const quantite = Number(article.quantite || 1);
        const poids = article.poids
            ? " (" + article.poids + " g)"
            : "";

        const prix = Number(article.prix || 0).toFixed(2);

        const ligne =
            "- " +
            nom +
            poids +
            " x" +
            quantite +
            " : " +
            prix +
            " CHF";

        const lignes = doc.splitTextToSize(ligne, 170);

        doc.text(lignes, 20, y);

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

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);

    doc.text(
        "TOTAL : " + total.toFixed(2) + " CHF",
        20,
        y
    );

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

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

        doc.setFont("helvetica", "bold");
        doc.text("COMMENTAIRE", 20, y);

        doc.setFont("helvetica", "normal");
        y += 7;

        const commentaireLignes = doc.splitTextToSize(
            String(client.commentaire),
            170
        );

        doc.text(commentaireLignes, 20, y);
    }

    // ==============================
    // SAUVEGARDE LOCALE DU PDF
    // ==============================

    doc.save(fichier);

    // PDF en mémoire
    const pdfBlob = doc.output("blob");

    console.log("PDF généré :", fichier);

    // ==============================
    // CONVERSION DU PDF EN BASE64
    // ==============================

    const pdfBase64 = await new Promise(function(resolve, reject) {

        const reader = new FileReader();

        reader.onloadend = function() {
            resolve(reader.result);
        };

        reader.onerror = function() {
            reject(new Error(
                "Impossible de convertir le PDF en Base64."
            ));
        };

        reader.readAsDataURL(pdfBlob);
    });

    // ==============================
    // DONNÉES ENVOYÉES À GOOGLE
    // ==============================

    const payload = {

        to: client.email || "",

        numeroCommande: commande.id,

        pdfBase64: pdfBase64,

        pdfFilename: fichier,

        client: client,

        produits: produits,

        total: total,

        subject:
            "Commande Idée Gourmande n°" +
            commande.id
    };

    if (!payload.to) {
        throw new Error(
            "L'adresse e-mail du client est manquante."
        );
    }

    console.log(
        "Envoi du PDF à Google Apps Script..."
    );

    // ==============================
    // ENVOI À GOOGLE APPS SCRIPT
    // ==============================

    const response = await fetch(
        GOOGLE_APPS_SCRIPT_URL,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded;charset=UTF-8"
            },

            body: new URLSearchParams({
                payload: JSON.stringify(payload)
            })
        }
    );

    const texteReponse = await response.text();

    console.log(
        "Réponse Google Apps Script :",
        texteReponse
    );

    let resultat;

    try {
        resultat = JSON.parse(texteReponse);
    } catch (erreur) {

        throw new Error(
            "Réponse Google Apps Script invalide : " +
            texteReponse
        );
    }

    if (!resultat.ok) {

        throw new Error(
            resultat.message ||
            resultat.error ||
            "Google Apps Script n'a pas confirmé l'envoi."
        );
    }

    console.log(
        "E-mail envoyé avec succès par Gmail.",
        resultat
    );

    return {
        blob: pdfBlob,
        filename: fichier,
        emailEnvoye: true
    };
}
