// ==================================
// IDÉE GOURMANDE
// Administration
// Version 2.6.0
// Commandes + Stock + Achats
// ==================================


// ==================================
// CHARGEMENT DES COMMANDES
// ==================================

function obtenirCommandes(){

    if(
        typeof db === "undefined"
        ||
        !db
    ){

        return [];

    }


    if(!Array.isArray(db.commandes)){

        db.commandes = [];

    }


    return db.commandes;

}


// ==================================
// CHARGEMENT DES ARCHIVES
// ==================================

function obtenirArchives(){

    if(
        typeof db === "undefined"
        ||
        !db
    ){

        return [];

    }


    if(!Array.isArray(db.archives)){

        db.archives = [];

    }


    return db.archives;

}


// ==================================
// AFFICHAGE DES COMMANDES
// ==================================

function afficherCommandes(){

    afficherListeCommandes(
        obtenirCommandes()
    );

}


// ==================================
// FORMATAGE PRODUITS ADMINISTRATION
// ==================================

function afficherProduitsCommande(cmd){

    if(!cmd){

        return "";

    }


    const produits =
        Array.isArray(cmd.produitsListe)
            ? cmd.produitsListe
            : [];


    // ==================================
    // ANCIENNES COMMANDES
    // ==================================

    if(produits.length === 0){

        return String(
            cmd.produits || ""
        )
        .replace(
            /\n/g,
            "<br>"
        );

    }


    let html = "";


    produits.forEach(function(article){

        if(!article){

            return;

        }


        const nom =
            article.nom || "Produit";


        html += `
            <div class="admin-produit">
        `;


        // ==================================
        // NOM
        // ==================================

        html += `
            <strong>
                ${nom}
            </strong>
        `;


        // ==================================
        // RECETTE
        // ==================================

        if(article.recette){

            html += `
                <br>
                <span>
                    Recette : ${article.recette}
                </span>
            `;

        }


        // ==================================
        // NOMBRE
        // ==================================

        if(
            article.reference !== "saumon-fume"
        ){

            html += `
                <br>
                <span>
                    Nombre : ${article.quantite || 1}
                </span>
            `;

        }


        // ==================================
        // POIDS SAUMON
        // ==================================

        if(
            article.reference === "saumon-fume"
            &&
            article.poids
        ){

            html += `
                <br>
                <span>
                    Poids : ${article.poids} g
                </span>
            `;

        }


        html += `
            </div>
        `;

    });


    return html;

}


// ==================================
// AFFICHAGE LISTE COMMANDES
// ==================================

function afficherListeCommandes(commandes){

    const zone =
        document.getElementById(
            "listeCommandes"
        );


    if(!zone){

        return;

    }


    if(
        !Array.isArray(commandes)
        ||
        commandes.length === 0
    ){

        zone.innerHTML =
            "<p>Aucune commande enregistrée.</p>";

        return;

    }


    let html = "";


    commandes.forEach(function(cmd,index){

        if(!cmd){

            return;

        }


        // ==================================
        // COULEUR DU STATUT
        // ==================================

        let classeStatut =
            "statut-nouvelle";


        if(
            cmd.statut === "En préparation"
        ){

            classeStatut =
                "statut-preparation";

        }


        if(
            cmd.statut === "Prête"
        ){

            classeStatut =
                "statut-prete";

        }


        if(
            cmd.statut === "Livrée"
        ){

            classeStatut =
                "statut-livree";

        }


        // ==================================
        // AFFICHAGE COMMANDE
        // ==================================

        html += `

        <div class="commande-admin">


            <div class="commande-admin-entete">

                <div>

                    <h3>
                        📦 Commande ${cmd.id || "-"}
                    </h3>

                    <span class="commande-date">
                        ${cmd.date || "-"}
                    </span>

                </div>


                <div class="commande-total">

                    ${Number(cmd.total || 0).toFixed(2)} CHF

                </div>

            </div>


            <div class="commande-admin-infos">


                <div>

                    <strong>👤 Client</strong>

                    <p>
                        ${cmd.client || "-"}
                    </p>

                </div>


                <div>

                    <strong>📞 Téléphone</strong>

                    <p>
                        ${cmd.telephone || "-"}
                    </p>

                </div>


                <div>

                    <strong>✉️ Email</strong>

                    <p>
                        ${cmd.email || "-"}
                    </p>

                </div>


                <div>

                    <strong>📍 Adresse</strong>

                    <p>
                        ${cmd.adresse || "-"}
                    </p>

                </div>

            </div>


            <div class="commande-admin-produits">

                <strong>🛒 Commande</strong>

                <div class="admin-liste-produits">

                    ${afficherProduitsCommande(cmd)}

                </div>

            </div>


            <div class="commande-admin-statut">

                <strong>Statut :</strong>


                <select
                    class="${classeStatut}"
                    onchange="changerStatut(${index},this.value)"
                >

                    <option
                        value="Nouvelle"
                        ${(cmd.statut || "Nouvelle")==="Nouvelle"?"selected":""}
                    >
                        Nouvelle
                    </option>


                    <option
                        value="En préparation"
                        ${cmd.statut==="En préparation"?"selected":""}
                    >
                        En préparation
                    </option>


                    <option
                        value="Prête"
                        ${cmd.statut==="Prête"?"selected":""}
                    >
                        Prête
                    </option>


                    <option
                        value="Livrée"
                        ${cmd.statut==="Livrée"?"selected":""}
                    >
                        Livrée
                    </option>

                </select>

            </div>


            <div class="commande-admin-actions">


                <button
                    class="btn"
                    onclick="imprimerCommande(${index})"
                >
                    🖨 PDF
                </button>


                <button
                    class="btn"
                    onclick="renvoyerEmail(${index})"
                >
                    📧 Email
                </button>


                ${
                    cmd.statut === "Livrée"
                    ?

                    `

                    <button
                        class="btn"
                        onclick="archiverCommande(${index})"
                    >
                        📁 Archiver
                    </button>

                    `

                    :

                    ""
                }


                <button
                    class="btn"
                    onclick="supprimerCommande(${index})"
                >
                    🗑 Supprimer
                </button>


            </div>


        </div>

        `;

    });


    zone.innerHTML =
        html;

}


// ==================================
// CHANGER STATUT
// ==================================

function changerStatut(index,valeur){

    const commandes =
        obtenirCommandes();


    if(!commandes[index]){

        return;

    }


    commandes[index].statut =
        valeur;


    sauvegarderDB();


    afficherCommandes();

    afficherStatistiques();

    afficherAlertes();

    afficherDernieresCommandes();

}


// ==================================
// ARCHIVER COMMANDE
// ==================================

function archiverCommande(index){

    const commandes =
        obtenirCommandes();


    const archives =
        obtenirArchives();


    const cmd =
        commandes[index];


    if(!cmd){

        return;

    }


    if(!confirm(
        "Archiver cette commande ?"
    )){

        return;

    }


    archives.push(cmd);


    commandes.splice(
        index,
        1
    );


    sauvegarderDB();


    afficherCommandes();

    afficherStatistiques();

    afficherAlertes();

    afficherDernieresCommandes();

}


// ==================================
// SUPPRIMER COMMANDE
// ==================================

function supprimerCommande(index){

    if(!confirm(
        "Supprimer cette commande ?"
    )){

        return;

    }


    const commandes =
        obtenirCommandes();


    if(!commandes[index]){

        return;

    }


    commandes.splice(
        index,
        1
    );


    sauvegarderDB();


    afficherCommandes();

    afficherStatistiques();

    afficherAlertes();

    afficherDernieresCommandes();

}


// ==================================
// IMPRIMER PDF
// ==================================

function imprimerCommande(index){

    const commandes =
        obtenirCommandes();


    const cmd =
        commandes[index];


    if(!cmd){

        return;

    }


    const noms =
        String(
            cmd.client || ""
        )
        .trim()
        .split(/\s+/);


    if(
        typeof genererPDFCommande !== "function"
    ){

        alert(
            "La fonction de génération PDF n'est pas disponible."
        );

        return;

    }


    genererPDFCommande({

        id:
            cmd.id,

        client:{

            prenom:
                noms[0] || "",

            nom:
                noms.slice(1).join(" ") || "",

            email:
                cmd.email || "",

            telephone:
                cmd.telephone || "",

            adresse:
                cmd.adresse || "",

            commentaire:
                cmd.commentaire || ""

        },

        produits:
            Array.isArray(cmd.produitsListe)
                ? cmd.produitsListe
                : [],

        total:
            Number(cmd.total) || 0

    });

}


// ==================================
// EMAIL CLIENT
// ==================================

function renvoyerEmail(index){

    const commandes =
        obtenirCommandes();


    const cmd =
        commandes[index];


    if(!cmd){

        return;

    }


    if(!cmd.email){

        alert(
            "Cette commande n'a pas d'adresse email."
        );

        return;

    }


    const sujet =
        "Votre commande Idée Gourmande";


    const message =

        "Bonjour " +
        (cmd.client || "") +
        ",\n\n" +

        "Nous vous confirmons le rappel de votre commande :\n\n" +

        (cmd.produits || "") +

        "\n\nTotal : " +

        (Number(cmd.total) || 0).toFixed(2) +

        " CHF\n\n" +

        "Merci pour votre confiance.\n\n" +

        "L'équipe Idée Gourmande";


    window.location.href =

        "mailto:" +

        cmd.email +

        "?subject=" +

        encodeURIComponent(sujet) +

        "&body=" +

        encodeURIComponent(message);

}


// ==================================
// STATISTIQUES
// ==================================

function afficherStatistiques(){

    const commandes =
        obtenirCommandes();


    const nb =
        document.getElementById(
            "nbCommandes"
        );


    const ca =
        document.getElementById(
            "caTotal"
        );


    const jour =
        document.getElementById(
            "commandeJour"
        );


    if(nb){

        nb.textContent =
            commandes.length;

    }


    let total = 0;


    commandes.forEach(function(cmd){

        total +=
            Number(cmd.total) || 0;

    });


    if(ca){

        ca.textContent =
            total.toFixed(2)
            +
            " CHF";

    }


    const aujourd_hui =
        new Date()
        .toLocaleDateString("fr-FR");


    let compteur = 0;


    commandes.forEach(function(cmd){

        if(
            cmd.date
            &&
            String(cmd.date).includes(
                aujourd_hui
            )
        ){

            compteur++;

        }

    });


    if(jour){

        jour.textContent =
            compteur;

    }


    // ==================================
    // STOCK
    // ==================================

    if(
        typeof db !== "undefined"
        &&
        db
    ){

        let stockCritique = 0;


        (
            Array.isArray(db.articles)
                ? db.articles
                : []
        )
        .forEach(function(article){

            const stock =
                Number(article.stock) || 0;


            const minimum =
                Number(article.minimum) || 0;


            if(
                stock > 0
                &&
                stock <= minimum
            ){

                stockCritique++;

            }

        });


        const zoneStock =
            document.getElementById(
                "stockCritique"
            );


        if(zoneStock){

            zoneStock.textContent =
                stockCritique;

        }


        // ==================================
        // ACHATS EN ATTENTE
        // ==================================

        let achatsAttente = 0;


        (
            Array.isArray(db.achats)
                ? db.achats
                : []
        )
        .forEach(function(achat){

            if(
                achat
                &&
                achat.statut !== "Réceptionné"
            ){

                achatsAttente++;

            }

        });


        const zoneAchats =
            document.getElementById(
                "nbAchats"
            );


        if(zoneAchats){

            zoneAchats.textContent =
                achatsAttente;

        }

    }

}


// ==================================
// RECHERCHE
// ==================================

function rechercherCommande(){

    const champ =
        document.getElementById(
            "rechercheCommande"
        );


    if(!champ){

        return;

    }


    const recherche =
        champ.value
        .toLowerCase()
        .trim();


    const commandes =
        obtenirCommandes();


    const filtre =
        commandes.filter(function(cmd){

            return (

                String(
                    cmd.client || ""
                )
                .toLowerCase()
                .includes(recherche)

                ||

                String(
                    cmd.email || ""
                )
                .toLowerCase()
                .includes(recherche)

            );

        });


    afficherListeCommandes(
        filtre
    );

}


// ==================================
// DECONNEXION
// ==================================

function deconnexion(){

    localStorage.removeItem(
        "adminConnecte"
    );


    window.location.href =
        "admin-login.html";

}


// ==================================
// ALERTES TABLEAU DE BORD
// ==================================

function afficherAlertes(){

    const zone =
        document.getElementById(
            "listeAlertes"
        );


    if(!zone){

        return;

    }


    let html = "";


    // ==================================
    // COMMANDES EN ATTENTE
    // ==================================

    const commandes =
        obtenirCommandes();


    const commandesAttente =
        commandes.filter(function(cmd){

            return (
                !cmd.statut
                ||
                cmd.statut === "Nouvelle"
                ||
                cmd.statut === "En préparation"
            );

        }).length;


    if(commandesAttente > 0){

        html +=
        `<p
            class="alerte-cliquable"
            onclick="allerAuxCommandesApreparer()"
        >
            🟠 ${commandesAttente} commande(s) à préparer
        </p>`;

    }


    // ==================================
    // STOCK + ACHATS
    // ==================================

    if(
        typeof db !== "undefined"
        &&
        db
    ){

        let stockZero = 0;


        (
            Array.isArray(db.articles)
                ? db.articles
                : []
        )
        .forEach(function(article){

            if(
                Number(article.stock) === 0
            ){

                stockZero++;

            }

        });


        if(stockZero > 0){

            html +=
                "<p>🔴 " +
                stockZero +
                " article(s) en rupture de stock</p>";

        }


        const achatsAttente =
            (
                Array.isArray(db.achats)
                    ? db.achats
                    : []
            )
            .filter(function(achat){

                return (
                    achat
                    &&
                    achat.statut !== "Réceptionné"
                );

            })
            .length;


        if(achatsAttente > 0){

            html +=
                "<p>🟡 " +
                achatsAttente +
                " achat(s) en attente de réception</p>";

        }

    }


    // ==================================
    // AUCUNE ALERTE
    // ==================================

    if(html === ""){

        html =
            "<p>✅ Tout fonctionne correctement.</p>";

    }


    zone.innerHTML =
        html;

}


// ==================================
// ALLER AUX COMMANDES À PRÉPARER
// ==================================

function allerAuxCommandesApreparer(){

    const select =
        document.getElementById(
            "triCommandes"
        );


    if(select){

        select.value =
            "attente";


        if(
            typeof trierCommandes === "function"
        ){

            trierCommandes();

        }

    }


    const zone =
        document.getElementById(
            "listeCommandes"
        );


    if(zone){

        zone.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

    }

}


// ==================================
// DERNIÈRES COMMANDES
// ==================================

function afficherDernieresCommandes(){

    const zone =
        document.getElementById(
            "dernieresCommandes"
        );


    if(!zone){

        return;

    }


    const commandes =
        obtenirCommandes();


    if(commandes.length === 0){

        zone.innerHTML =
            "<p>Aucune commande récente.</p>";

        return;

    }


    const dernieres =
        commandes
        .slice(-5)
        .reverse();


    let html = "";


    dernieres.forEach(function(cmd){

        if(!cmd){

            return;

        }


        html += `

        <div class="commande-admin">

            <strong>
                📦 Commande ${cmd.id || "-"}
            </strong>

            <br>

            Client :
            ${cmd.client || "-"}

            <br>

            Total :
            ${Number(cmd.total) || 0} CHF

            <br>

            Statut :
            ${cmd.statut || "Nouvelle"}

        </div>

        <hr>

        `;

    });


    zone.innerHTML =
        html;

}


// ==================================
// RÉSUMÉ STOCK TABLEAU DE BORD
// ==================================

function afficherResumeStock(){

    if(
        typeof db === "undefined"
        ||
        !db
    ){

        return;

    }


    const articles =
        Array.isArray(db.articles)
            ? db.articles
            : [];


    const totalArticles =
        articles.length;


    let valeurStock = 0;

    let stockCritique = 0;


    articles.forEach(function(article){

        if(!article){

            return;

        }


        const stock =
            Number(article.stock) || 0;


        const prix =
            Number(article.prixAchatMoyen) || 0;


        valeurStock +=
            stock * prix;


        const minimum =
            Number(article.minimum) || 0;


        if(
            stock > 0
            &&
            stock <= minimum
        ){

            stockCritique++;

        }

    });


    const zoneArticles =
        document.getElementById(
            "totalArticlesStock"
        );


    if(zoneArticles){

        zoneArticles.textContent =
            totalArticles;

    }


    const zoneValeur =
        document.getElementById(
            "valeurStock"
        );


    if(zoneValeur){

        zoneValeur.textContent =
            valeurStock.toFixed(2)
            +
            " CHF";

    }


    const zoneCritique =
        document.getElementById(
            "stockCritiqueStock"
        );


    if(zoneCritique){

        zoneCritique.textContent =
            stockCritique;

    }

}


// ==================================
// RÉSUMÉ ACHATS TABLEAU DE BORD
// ==================================

function afficherResumeAchats(){

    if(
        typeof db === "undefined"
        ||
        !db
    ){

        console.error(
            "❌ db n'est pas disponible"
        );

        return;

    }


    // ==================================
    // SÉCURITÉ
    // ==================================

    if(!Array.isArray(db.achats)){

        db.achats = [];

    }


    const achats =
        db.achats;


    let attente = 0;

    let receptionnes = 0;


    // ==================================
    // CALCUL
    // ==================================

    achats.forEach(function(achat){

        if(!achat){

            return;

        }


        const statut =
            achat.statut || "En attente";


        if(
            statut === "Réceptionné"
        ){

            receptionnes++;

        }
        else{

            attente++;

        }

    });


    // ==================================
    // FOURNISSEURS
    // ==================================

    const fournisseurs =
        (
            Array.isArray(db.clients)
                ? db.clients
                : []
        )
        .filter(function(client){

            return (
                client
                &&
                client.type === "Fournisseur"
            );

        });


    // ==================================
    // AFFICHAGE ACHATS EN ATTENTE
    // ==================================

    const zoneAttente =
        document.getElementById(
            "achatsEnAttente"
        );


    if(zoneAttente){

        zoneAttente.textContent =
            attente;

    }


    // ==================================
    // AFFICHAGE ACHATS RÉCEPTIONNÉS
    // ==================================

    const zoneReception =
        document.getElementById(
            "achatsReceptionnes"
        );


    if(zoneReception){

        zoneReception.textContent =
            receptionnes;

    }


    // ==================================
    // AFFICHAGE FOURNISSEURS
    // ==================================

    const zoneFournisseurs =
        document.getElementById(
            "nombreFournisseurs"
        );


    if(zoneFournisseurs){

        zoneFournisseurs.textContent =
            fournisseurs.length;

    }


    // ==================================
    // IMPORTANT
    // ==================================
    //
    // Aucun montant d'achat n'est calculé.
    //
    // Les prix d'achat peuvent varier selon
    // les fournisseurs et les commandes.
    //
    // L'ancien champ :
    //
    // montantAchatsAttente
    //
    // n'est donc volontairement PAS utilisé.
    //
    // ==================================


    console.log(
        "📊 RÉSUMÉ ACHATS",
        {
            total:
                achats.length,

            attente:
                attente,

            receptionnes:
                receptionnes,

            fournisseurs:
                fournisseurs.length
        }
    );

}


// ==================================
// INITIALISATION
// ==================================

document.addEventListener(
    "DOMContentLoaded",
    function(){

        afficherCommandes();

        afficherResumeStock();

        afficherResumeAchats();

        afficherStatistiques();

        afficherAlertes();

        afficherDernieresCommandes();

    }
);


// ==================================
// SYNCHRONISATION ENTRE LES PAGES
// ==================================

window.addEventListener(
    "storage",
    function(e){

        if(
            e.key !== "ideeGourmandeDB"
        ){

            return;

        }


        console.log(
            "🔄 Base mise à jour depuis une autre page"
        );


        // ==================================
        // RECHARGEMENT BASE
        // ==================================

        if(
            typeof localStorage === "undefined"
        ){

            return;

        }


        try{

            db =
                JSON.parse(
                    localStorage.getItem(
                        "ideeGourmandeDB"
                    )
                ) || {};

        }
        catch(erreur){

            console.error(
                "❌ Impossible de recharger la base :",
                erreur
            );

            return;

        }


        // ==================================
        // RAFRAÎCHISSEMENT
        // ==================================

        afficherResumeAchats();

        afficherResumeStock();

        afficherStatistiques();

        afficherAlertes();

        afficherDernieresCommandes();

        afficherCommandes();

    }
);
