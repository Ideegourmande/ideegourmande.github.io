/* Multilingue public - FR / DE / IT
   Les pages d'administration restent volontairement en français.
*/
(function () {
  const DICT = {
    de: {
      "🚚 Commandes préparées artisanalement à Genève – La livraison s'effectue sous vide et, selon les produits, également congelée (saumon fumé et foie gras), afin de préserver les textures ainsi que toutes les qualités gustatives de nos préparations.":"🚚 In Genf handwerklich zubereitete Bestellungen – vakuumverpackte und je nach Produkt auch tiefgekühlte Lieferung (Räucherlachs und Gänseleber), um Textur und Geschmack unserer Zubereitungen zu bewahren.",
      "🚚 Commandes préparées artisanalement à Genève – Livraison sous vide ou congelée selon les produits pour préserver toute la qualité.":"🚚 In Genf handwerklich zubereitete Bestellungen – vakuumverpackte oder je nach Produkt tiefgekühlte Lieferung, um die Qualität zu bewahren.",
      "🚚 Commandes préparées artisanalement à Genève – Livraison congelée pour préserver toute la qualité de nos produits.":"🚚 In Genf handwerklich zubereitete Bestellungen – tiefgekühlte Lieferung, um die Qualität unserer Produkte zu bewahren.",
      "Accueil":"Startseite","Notre savoir-faire":"Unser Know-how","Nos produits":"Unsere Produkte","Nos spécialités":"Unsere Spezialitäten",
      "Commander":"Bestellen","Contact":"Kontakt","Mentions légales":"Impressum","Administration":"Administration",
      "Préparer ma commande":"Meine Bestellung vorbereiten","Choisissez vos spécialités artisanales, vos options et ajoutez vos produits au panier.":"Wählen Sie Ihre handwerklichen Spezialitäten und Optionen und legen Sie Ihre Produkte in den Warenkorb.",
      "Contactez-nous":"Kontaktieren Sie uns","Une question sur nos produits, une commande spéciale ou une demande particulière ?":"Haben Sie eine Frage zu unseren Produkten, eine Sonderbestellung oder einen besonderen Wunsch?",
      "Nous sommes à votre disposition.":"Wir sind gerne für Sie da.","Fabrication":"Herstellung","Fabrication artisanale à Genève":"Handwerkliche Herstellung in Genf",
      "E-mail":"E-Mail","WhatsApp":"WhatsApp","Contactez-nous directement pour vos demandes.":"Kontaktieren Sie uns direkt für Ihre Anfragen.",
      "Nous écrire sur WhatsApp":"Uns auf WhatsApp schreiben","Qualité et confiance":"Qualität und Vertrauen",
      "Nos produits sont préparés artisanalement et livrés congelés afin de préserver leurs saveurs, leur texture et leur qualité.":"Unsere Produkte werden handwerklich hergestellt und tiefgekühlt geliefert, um Geschmack, Textur und Qualität zu bewahren.",
      "À bientôt chez Idée Gourmande":"Bis bald bei Idée Gourmande","Produits artisanaux préparés avec soin à Genève.":"Sorgfältig in Genf hergestellte handwerkliche Produkte.",
      "Retour à l'accueil":"Zur Startseite","Merci pour votre commande !":"Vielen Dank für Ihre Bestellung!",
      "Votre demande a bien été préparée.":"Ihre Anfrage wurde erfolgreich vorbereitet.","Nous allons vérifier votre paiement TWINT et vous confirmer rapidement la préparation de votre commande.":"Wir prüfen Ihre TWINT-Zahlung und bestätigen Ihnen schnellstmöglich die Vorbereitung Ihrer Bestellung.",
      "Informations générales":"Allgemeine Informationen","Responsable du site":"Verantwortlich für die Website",
      "Commandes et paiement":"Bestellungen und Zahlung","Livraison et conservation":"Lieferung und Aufbewahrung",
      "Protection des données":"Datenschutz","Propriété du contenu":"Urheberrecht",
      "Le présent site présente les produits artisanaux proposés par Idée Gourmande, fabrication gastronomique artisanale à Genève.":"Diese Website präsentiert die von Idée Gourmande angebotenen handwerklichen Produkte und die gastronomische Herstellung in Genf.",
      "Les commandes effectuées via le site sont préparées après réception des informations nécessaires et confirmation du paiement.":"Über die Website aufgegebene Bestellungen werden nach Eingang der erforderlichen Angaben und Bestätigung der Zahlung vorbereitet.",
      "Le paiement est effectué par TWINT au numéro :":"Die Zahlung erfolgt per TWINT an die Nummer:",
      "Les produits sont préparés artisanalement et expédiés congelés afin de respecter la chaîne du froid et préserver leur qualité.":"Die Produkte werden handwerklich hergestellt und tiefgekühlt versendet, um die Kühlkette einzuhalten und ihre Qualität zu bewahren.",
      "Les informations transmises par les clients sont utilisées uniquement dans le cadre du traitement des commandes et de la communication avec Idée Gourmande.":"Die von Kunden übermittelten Informationen werden ausschließlich zur Bearbeitung von Bestellungen und zur Kommunikation mit Idée Gourmande verwendet.",
      "Aucune donnée personnelle n'est vendue ou transmise à des tiers.":"Personenbezogene Daten werden weder verkauft noch an Dritte weitergegeben.",
      "Les textes, images, éléments graphiques et contenus présents sur ce site sont destinés à la présentation des produits Idée Gourmande. Toute reproduction non autorisée est interdite.":"Texte, Bilder, grafische Elemente und Inhalte dieser Website dienen der Präsentation der Produkte von Idée Gourmande. Jede nicht autorisierte Vervielfältigung ist untersagt.",
      "Notre savoir-faire":"Unser Know-how","Une passion artisanale au cœur de Genève":"Handwerkliche Leidenschaft im Herzen von Genf",
      "Chez Idée Gourmande, nous mettons notre passion de la gastronomie au service de produits d’exception préparés avec soin.":"Bei Idée Gourmande widmen wir unsere Leidenschaft für Gastronomie außergewöhnlichen Produkten, die mit Sorgfalt hergestellt werden.",
      "Chaque recette est élaborée en petites quantités afin de garantir une qualité constante, des saveurs authentiques et une attention particulière portée à chaque étape de fabrication.":"Jedes Rezept wird in kleinen Mengen hergestellt, um eine gleichbleibende Qualität, authentische Aromen und besondere Sorgfalt in jedem Herstellungsschritt zu gewährleisten.",
      "Des produits d’exception":"Außergewöhnliche Produkte","Une fabrication artisanale":"Handwerkliche Herstellung","Une conservation maîtrisée":"Kontrollierte Aufbewahrung",
      "L’exigence du fait maison":"Der Anspruch an hausgemachte Qualität","Découvrir nos créations":"Unsere Kreationen entdecken",
      "La qualité avant tout":"Qualität steht an erster Stelle","Préparer ma commande":"Meine Bestellung vorbereiten",
      "Choisissez votre recette :":"Wählen Sie Ihr Rezept:","Quantité (200 g)":"Menge (200 g)","Ajouter au panier":"In den Warenkorb",
      "Quantité":"Menge","Nombre de portions":"Anzahl Portionen","Ajouter":"Hinzufügen","Votre panier":"Ihr Warenkorb",
      "Total":"Gesamt","Coordonnées":"Kontaktdaten","Prénom":"Vorname","Nom":"Nachname","Téléphone":"Telefon",
      "Adresse":"Adresse","Adresse e-mail":"E-Mail-Adresse","Commentaire":"Kommentar","Valider la commande":"Bestellung bestätigen",
      "Commande":"Bestellung","Payer par TWINT":"Mit TWINT bezahlen"
    },
    it: {
      "🚚 Commandes préparées artisanalement à Genève – La livraison s'effectue sous vide et, selon les produits, également congelée (saumon fumé et foie gras), afin de préserver les textures ainsi que toutes les qualités gustatives de nos préparations.":"🚚 Ordini preparati artigianalmente a Ginevra – consegna sottovuoto e, a seconda del prodotto, anche congelata (salmone affumicato e foie gras), per preservare consistenza e gusto.",
      "🚚 Commandes préparées artisanalement à Genève – Livraison sous vide ou congelée selon les produits pour préserver toute la qualité.":"🚚 Ordini preparati artigianalmente a Ginevra – consegna sottovuoto o, a seconda del prodotto, congelata per preservarne la qualità.",
      "🚚 Commandes préparées artisanalement à Genève – Livraison congelée pour préserver toute la qualité de nos produits.":"🚚 Ordini preparati artigianalmente a Ginevra – consegna congelata per preservare la qualità dei nostri prodotti.",
      "Accueil":"Home","Notre savoir-faire":"Il nostro savoir-faire","Nos produits":"I nostri prodotti","Nos spécialités":"Le nostre specialità",
      "Commander":"Ordinare","Contact":"Contatti","Mentions légales":"Note legali","Administration":"Amministrazione",
      "Préparer ma commande":"Preparare il mio ordine","Choisissez vos spécialités artisanales, vos options et ajoutez vos produits au panier.":"Scegliete le vostre specialità artigianali, le opzioni e aggiungete i prodotti al carrello.",
      "Contactez-nous":"Contattateci","Une question sur nos produits, une commande spéciale ou une demande particulière ?":"Una domanda sui nostri prodotti, un ordine speciale o una richiesta particolare?",
      "Nous sommes à votre disposition.":"Siamo a vostra disposizione.","Fabrication":"Produzione","Fabrication artisanale à Genève":"Produzione artigianale a Ginevra",
      "E-mail":"E-mail","Contactez-nous directement pour vos demandes.":"Contattateci direttamente per le vostre richieste.",
      "Nous écrire sur WhatsApp":"Scriveteci su WhatsApp","Qualité et confiance":"Qualità e fiducia",
      "Nos produits sont préparés artisanalement et livrés congelés afin de préserver leurs saveurs, leur texture et leur qualité.":"I nostri prodotti sono preparati artigianalmente e consegnati congelati per preservarne sapore, consistenza e qualità.",
      "À bientôt chez Idée Gourmande":"A presto da Idée Gourmande","Produits artisanaux préparés avec soin à Genève.":"Prodotti artigianali preparati con cura a Ginevra.",
      "Retour à l'accueil":"Torna alla home","Merci pour votre commande !":"Grazie per il vostro ordine!",
      "Votre demande a bien été préparée.":"La vostra richiesta è stata preparata correttamente.","Nous allons vérifier votre paiement TWINT et vous confirmer rapidement la préparation de votre commande.":"Verificheremo il vostro pagamento TWINT e vi confermeremo rapidamente la preparazione del vostro ordine.",
      "Informations générales":"Informazioni generali","Responsable du site":"Responsabile del sito",
      "Commandes et paiement":"Ordini e pagamento","Livraison et conservation":"Consegna e conservazione",
      "Protection des données":"Protezione dei dati","Propriété du contenu":"Proprietà dei contenuti",
      "Le présent site présente les produits artisanaux proposés par Idée Gourmande, fabrication gastronomique artisanale à Genève.":"Questo sito presenta i prodotti artigianali proposti da Idée Gourmande, produzione gastronomica artigianale a Ginevra.",
      "Les commandes effectuées via le site sont préparées après réception des informations nécessaires et confirmation du paiement.":"Gli ordini effettuati tramite il sito vengono preparati dopo aver ricevuto le informazioni necessarie e la conferma del pagamento.",
      "Le paiement est effectué par TWINT au numéro :":"Il pagamento viene effettuato tramite TWINT al numero:",
      "Les produits sont préparés artisanalement et expédiés congelés afin de respecter la chaîne du froid et préserver leur qualité.":"I prodotti sono preparati artigianalmente e spediti congelati per rispettare la catena del freddo e preservarne la qualità.",
      "Les informations transmises par les clients sont utilisées uniquement dans le cadre du traitement des commandes et de la communication avec Idée Gourmande.":"Le informazioni trasmesse dai clienti sono utilizzate esclusivamente per la gestione degli ordini e la comunicazione con Idée Gourmande.",
      "Aucune donnée personnelle n'est vendue ou transmise à des tiers.":"Nessun dato personale viene venduto o trasmesso a terzi.",
      "Les textes, images, éléments graphiques et contenus présents sur ce site sont destinés à la présentation des produits Idée Gourmande. Toute reproduction non autorisée est interdite.":"Testi, immagini, elementi grafici e contenuti presenti sul sito sono destinati alla presentazione dei prodotti Idée Gourmande. È vietata qualsiasi riproduzione non autorizzata.",
      "Une passion artisanale au cœur de Genève":"Una passione artigianale nel cuore di Ginevra",
      "Chez Idée Gourmande, nous mettons notre passion de la gastronomie au service de produits d’exception préparés avec soin.":"Da Idée Gourmande mettiamo la nostra passione per la gastronomia al servizio di prodotti d'eccellenza preparati con cura.",
      "Chaque recette est élaborée en petites quantités afin de garantir une qualité constante, des saveurs authentiques et une attention particulière portée à chaque étape de fabrication.":"Ogni ricetta è realizzata in piccole quantità per garantire qualità costante, sapori autentici e particolare cura in ogni fase della produzione.",
      "Des produits d’exception":"Prodotti d'eccellenza","Une fabrication artisanale":"Produzione artigianale","Une conservation maîtrisée":"Conservazione controllata",
      "L’exigence du fait maison":"L'esigenza del fatto in casa","Découvrir nos créations":"Scopri le nostre creazioni",
      "La qualité avant tout":"La qualità prima di tutto","Préparer ma commande":"Preparare il mio ordine",
      "Choisissez votre recette :":"Scegliete la vostra ricetta:","Quantité (200 g)":"Quantità (200 g)","Ajouter au panier":"Aggiungi al carrello",
      "Quantité":"Quantità","Nombre de portions":"Numero di porzioni","Ajouter":"Aggiungi","Votre panier":"Il vostro carrello",
      "Total":"Totale","Coordonnées":"Dati di contatto","Prénom":"Nome","Nom":"Cognome","Téléphone":"Telefono",
      "Adresse":"Indirizzo","Adresse e-mail":"Indirizzo e-mail","Commentaire":"Commento","Valider la commande":"Conferma ordine",
      "Commande":"Ordine","Payer par TWINT":"Pagare con TWINT"
    }
  };


  const PAGE_TITLES = {
    de: {
      "🚚 Commandes préparées artisanalement à Genève – La livraison s'effectue sous vide et, selon les produits, également congelée (saumon fumé et foie gras), afin de préserver les textures ainsi que toutes les qualités gustatives de nos préparations.":"🚚 In Genf handwerklich zubereitete Bestellungen – vakuumverpackte und je nach Produkt auch tiefgekühlte Lieferung (Räucherlachs und Gänseleber), um Textur und Geschmack unserer Zubereitungen zu bewahren.",
      "🚚 Commandes préparées artisanalement à Genève – Livraison sous vide ou congelée selon les produits pour préserver toute la qualité.":"🚚 In Genf handwerklich zubereitete Bestellungen – vakuumverpackte oder je nach Produkt tiefgekühlte Lieferung, um die Qualität zu bewahren.",
      "🚚 Commandes préparées artisanalement à Genève – Livraison congelée pour préserver toute la qualité de nos produits.":"🚚 In Genf handwerklich zubereitete Bestellungen – tiefgekühlte Lieferung, um die Qualität unserer Produkte zu bewahren.",
      "savoir-faire.html":"Unser Know-how | Idée Gourmande",
      "contact.html":"Kontakt | Idée Gourmande",
      "commande.html":"Meine Bestellung vorbereiten | Idée Gourmande",
      "confirmation.html":"Bestellung bestätigt | Idée Gourmande",
      "mentions-legales.html":"Impressum | Idée Gourmande"
    },
    it: {
      "🚚 Commandes préparées artisanalement à Genève – La livraison s'effectue sous vide et, selon les produits, également congelée (saumon fumé et foie gras), afin de préserver les textures ainsi que toutes les qualités gustatives de nos préparations.":"🚚 Ordini preparati artigianalmente a Ginevra – consegna sottovuoto e, a seconda del prodotto, anche congelata (salmone affumicato e foie gras), per preservare consistenza e gusto.",
      "🚚 Commandes préparées artisanalement à Genève – Livraison sous vide ou congelée selon les produits pour préserver toute la qualité.":"🚚 Ordini preparati artigianalmente a Ginevra – consegna sottovuoto o, a seconda del prodotto, congelata per preservarne la qualità.",
      "🚚 Commandes préparées artisanalement à Genève – Livraison congelée pour préserver toute la qualité de nos produits.":"🚚 Ordini preparati artigianalmente a Ginevra – consegna congelata per preservare la qualità dei nostri prodotti.",
      "savoir-faire.html":"Il nostro savoir-faire | Idée Gourmande",
      "contact.html":"Contatti | Idée Gourmande",
      "commande.html":"Preparare il mio ordine | Idée Gourmande",
      "confirmation.html":"Ordine confermato | Idée Gourmande",
      "mentions-legales.html":"Note legali | Idée Gourmande"
    }
  };

  function lang() { return localStorage.getItem("langue") || "fr"; }

  function translateNode(root, l) {
    if (!l || !DICT[l]) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(node => {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT","STYLE"].includes(parent.tagName)) return;
      const original = node.nodeValue.trim();
      if (!original) return;
      const translated = DICT[l][original];
      if (translated) {
        node.nodeValue = node.nodeValue.replace(original, translated);
      }
    });
    document.documentElement.lang = l;
    const file = location.pathname.split("/").pop() || "index.html";
    if (PAGE_TITLES[l] && PAGE_TITLES[l][file]) document.title = PAGE_TITLES[l][file];
    else document.title = translateString(document.title, l);
  }

  function translateString(s,l) {
    if (!s || !DICT[l]) return s;
    return DICT[l][s] || s;
  }

  function addSelector() {
    const nav = document.querySelector("nav");
    if (!nav || nav.querySelector(".language-selector")) return;
    const box = document.createElement("div");
    box.className = "language-selector";
    box.setAttribute("aria-label","Choisir la langue");
    box.innerHTML = '<button type="button" data-site-lang="fr">🇫🇷 FR</button><span>·</span><button type="button" data-site-lang="de">🇩🇪 DE</button><span>·</span><button type="button" data-site-lang="it">🇮🇹 IT</button>';
    nav.appendChild(box);
    box.querySelectorAll("[data-site-lang]").forEach(b => b.addEventListener("click",()=> {
      localStorage.setItem("langue", b.dataset.siteLang);
      location.reload();
    }));
  }

  document.addEventListener("DOMContentLoaded", () => {
    addSelector();
    const l = lang();
    if (l !== "fr") translateNode(document.body, l);
    const obs = new MutationObserver(muts => {
      if (lang() !== "fr") muts.forEach(m => m.addedNodes.forEach(n => {
        if (n.nodeType === 1) translateNode(n, lang());
      }));
    });
    obs.observe(document.body,{childList:true,subtree:true});
  });
})();