/*
 * IDEE GOURMANDE — EXTENSIONS DU RECEPTEUR TEST
 *
 * À ajouter comme nouveau fichier .gs dans le projet Apps Script
 * « Idée Gourmande — Réception TEST ».
 *
 * Ne remplace pas le Code.gs existant. Deux petits branchements sont
 * nécessaires dans les fonctions doPost/doGet existantes (instructions
 * dans apps-script/RECEPTION-TEST-INTEGRATION.md).
 *
 * SECURITE : les deux e-mails de test sont envoyés UNIQUEMENT à l'adresse
 * définie dans la propriété de script TEST_EMAIL_DESTINATION. Le code ne
 * transmet jamais un e-mail à l'adresse réelle du client.
 */

const TEST_PRIX_DEFAUT_ = {
  "foie-gras": 35,
  "magret": 25,
  "viande-sechee": 9,
  "lard-sec": 4,
  "saumon-fume": 8
};

const TEST_PREFIXE_MAIL_ = "IG_TEST_MAIL_STATUS_";
const TEST_PREFIXE_COMPTEUR_ = "IG_TEST_COMPTEUR_";

function testRepondreJSONP_(callback, objet) {
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(String(callback || ""))) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false, error: "Callback JSONP invalide."
    })).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(
    String(callback) + "(" + JSON.stringify(objet) + ");"
  ).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function testLirePrix_() {
  const props = PropertiesService.getScriptProperties();
  const brut = props.getProperty("TEST_PRIX_PRODUITS");
  const prix = brut ? JSON.parse(brut) : TEST_PRIX_DEFAUT_;
  const resultat = {};
  Object.keys(TEST_PRIX_DEFAUT_).forEach(function(ref) {
    const n = prix[ref];
    if (typeof n !== "number" || !Number.isFinite(n) || n < 0) {
      throw new Error("Prix TEST invalide pour " + ref);
    }
    resultat[ref] = Math.round(n * 100) / 100;
  });
  return resultat;
}

function testTraiterGet_(e) {
  const p = e && e.parameter ? e.parameter : {};
  const action = String(p.action || "");

  if (action === "getPrices") {
    try {
      return testRepondreJSONP_(p.callback, {
        ok: true, prices: testLirePrix_()
      });
    } catch (err) {
      return testRepondreJSONP_(p.callback, {
        ok: false, error: String(err.message || err)
      });
    }
  }

  if (action === "nextOrderNumber") {
    try {
      const callback = String(p.callback || "");
      if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(callback)) {
        throw new Error("Callback JSONP invalide.");
      }
      const nom = String(p.nom || "Commande")
        .replace(/[<>]/g, "").trim().substring(0, 100) || "Commande";
      const annee = Number(p.annee);
      if (!Number.isInteger(annee) || annee < 2020 || annee > 2100) {
        throw new Error("Année invalide.");
      }

      const lock = LockService.getScriptLock();
      lock.waitLock(10000);
      let prochain;
      try {
        const props = PropertiesService.getScriptProperties();
        const cle = TEST_PREFIXE_COMPTEUR_ + annee;
        prochain = Number(props.getProperty(cle) || "0") + 1;
        if (prochain > 999) throw new Error("Compteur TEST supérieur à 999.");
        props.setProperty(cle, String(prochain));
      } finally {
        lock.releaseLock();
      }

      return testRepondreJSONP_(callback, {
        ok: true,
        numero: nom + " - " + annee + "-" + String(prochain).padStart(3, "0")
      });
    } catch (err) {
      return testRepondreJSONP_(p.callback, {
        ok: false, error: String(err.message || err)
      });
    }
  }

  if (action === "mailStatus") {
    const callback = String(p.callback || "");
    const id = String(p.requestId || "").trim();
    if (!/^[A-Za-z0-9_-]{8,100}$/.test(id)) {
      return testRepondreJSONP_(callback, {
        found: false, status: "inconnu", error: "Identifiant invalide."
      });
    }
    const raw = PropertiesService.getScriptProperties()
      .getProperty(TEST_PREFIXE_MAIL_ + id);
    if (!raw) {
      return testRepondreJSONP_(callback, {
        found: false, status: "inconnu"
      });
    }
    try {
      const suivi = JSON.parse(raw);
      suivi.found = true;
      return testRepondreJSONP_(callback, suivi);
    } catch (err) {
      return testRepondreJSONP_(callback, {
        found: false, status: "inconnu",
        error: "Suivi TEST illisible."
      });
    }
  }

  return null;
}

function testMettreAJourSuiviMail_(id, changements) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const props = PropertiesService.getScriptProperties();
    const cle = TEST_PREFIXE_MAIL_ + id;
    const raw = props.getProperty(cle);
    if (!raw) throw new Error("Suivi d'e-mail TEST introuvable.");
    const suivi = JSON.parse(raw);
    Object.keys(changements).forEach(function(k) {
      suivi[k] = changements[k];
    });
    suivi.updatedAt = Date.now();
    props.setProperty(cle, JSON.stringify(suivi));
  } finally {
    lock.releaseLock();
  }
}

function testTraiterEnvoiEmail_(e) {
  let id = "";
  let etape = "";
  let initialise = false;

  try {
    const raw = e && e.parameter ? String(e.parameter.payload || "") : "";
    if (!raw) throw new Error("Payload d'e-mail TEST absent.");
    const data = JSON.parse(raw);

    id = String(data.idEnvoi || "").trim();
    if (!/^[A-Za-z0-9_-]{8,100}$/.test(id)) {
      throw new Error("Identifiant d'envoi TEST invalide.");
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const props = PropertiesService.getScriptProperties();
      const cle = TEST_PREFIXE_MAIL_ + id;
      if (props.getProperty(cle)) {
        return ContentService.createTextOutput(JSON.stringify({
          ok: true, duplicate: true
        })).setMimeType(ContentService.MimeType.JSON);
      }
      props.setProperty(cle, JSON.stringify({
        requestId: id,
        orderId: String(data.idCommande || ""),
        numeroCommande: String(data.numeroCommande || ""),
        status: "en_cours",
        entreprise: "en_attente",
        client: "en_attente",
        error: "",
        createdAt: Date.now(),
        updatedAt: Date.now()
      }));
      initialise = true;
    } finally {
      lock.releaseLock();
    }

    const destinationTest = String(
      PropertiesService.getScriptProperties()
        .getProperty("TEST_EMAIL_DESTINATION") || ""
    ).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destinationTest)) {
      throw new Error(
        "TEST_EMAIL_DESTINATION doit contenir une adresse de test autorisée dans les propriétés du script."
      );
    }

    const emailClient = String(data.to || (data.client && data.client.email) || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClient)) {
      throw new Error("Adresse e-mail client absente ou invalide dans le payload.");
    }
    if (!data.pdfBase64) throw new Error("PDF absent du payload TEST.");

    const base64 = String(data.pdfBase64)
      .replace(/^data:application\/pdf;base64,/, "")
      .replace(/\s/g, "");
    const bytes = Utilities.base64Decode(base64);
    if (!bytes || bytes.length < 100) throw new Error("PDF TEST vide ou invalide.");

    const numero = String(data.numeroCommande || "TEST");
    const client = data.client || {};
    const produits = Array.isArray(data.produits) ? data.produits : [];
    if (!produits.length) throw new Error("Aucun produit dans le payload d'e-mail.");

    const type = String(data.typeEmail || "nouvelle-commande");
    const sujet = "[TEST] Idée Gourmande — " +
      (type === "confirmation-prix" ? "Prix final — " : "Commande — ") + numero;
    const lignes = produits.map(function(a) {
      const q = Number(a.quantite || 1);
      const poids = a.poids ? " (" + a.poids + " g)" : "";
      const prix = Number(
        type === "confirmation-prix"
          ? (a.prixFinal != null ? a.prixFinal : a.prix)
          : (a.prixIndicatif != null ? a.prixIndicatif : a.prix)
      );
      return "- " + String(a.nom || "Produit") +
        (q > 1 ? " x" + q : "") + poids +
        " : " + (Number.isFinite(prix) ? prix.toFixed(2) : "0.00") + " CHF";
    }).join("\n");

    const frais = Number(data.fraisLivraison || 0);
    const total = Number(data.total || 0) + frais;
    const corpsCommun = [
      "MESSAGE DE TEST — aucun e-mail n'a été envoyé au client réel.",
      "",
      "Commande : " + numero,
      "Client indiqué : " + String(client.prenom || "") + " " + String(client.nom || ""),
      "Adresse client indiquée : " + emailClient,
      "Mode de réception : " + String(client.modeLivraison || data.modeLivraison || ""),
      "",
      "Produits :",
      lignes,
      "",
      "Frais de livraison : " + frais.toFixed(2) + " CHF",
      "Total indiqué : " + total.toFixed(2) + " CHF",
      "",
      "Adresse de destination effective (boîte de test) : " + destinationTest
    ].join("\n");

    const nomFichier = String(data.pdfFilename || ("commande-TEST-" + numero + ".pdf"))
      .replace(/[\\/:*?"<>|]/g, "_").substring(0, 120);
    const blob = Utilities.newBlob(bytes, "application/pdf", nomFichier);

    etape = "entreprise";
    testMettreAJourSuiviMail_(id, { status: "en_cours", entreprise: "en_cours" });
    MailApp.sendEmail({
      to: destinationTest,
      subject: "[TEST ENTREPRISE] " + sujet,
      body: "Copie de test destinée à l'entreprise.\n\n" + corpsCommun,
      name: "Idée Gourmande — TEST",
      attachments: [blob],
      replyTo: destinationTest
    });
    testMettreAJourSuiviMail_(id, { entreprise: "envoye" });

    etape = "client";
    testMettreAJourSuiviMail_(id, { status: "en_cours", client: "en_cours" });
    MailApp.sendEmail({
      to: destinationTest,
      subject: "[TEST CLIENT] " + sujet,
      body: "Simulation de l'e-mail client, envoyée uniquement à la boîte de test.\n\n" + corpsCommun,
      name: "Idée Gourmande — TEST",
      attachments: [blob],
      replyTo: destinationTest
    });
    testMettreAJourSuiviMail_(id, {
      status: "termine", client: "envoye", ok: true, error: ""
    });

    return ContentService.createTextOutput(JSON.stringify({
      ok: true, testOnly: true, destination: destinationTest
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    const message = String(err && err.message ? err.message : err);
    if (initialise && id) {
      try {
        const changements = {
          status: "echec",
          error: message
        };
        if (etape === "entreprise") changements.entreprise = "echec";
        if (etape === "client") changements.client = "echec";
        testMettreAJourSuiviMail_(id, changements);
      } catch (suiviErr) {
        console.error("Impossible de mettre à jour le suivi TEST : " + suiviErr);
      }
    }
    console.error("Envoi e-mail TEST : " + message);
    return ContentService.createTextOutput(JSON.stringify({
      ok: false, testOnly: true, error: message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
