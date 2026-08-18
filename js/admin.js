// ==================================
// IDÉE GOURMANDE
// Administration commandes
// Version 2.4.0
// ==================================


// ==================================
// CHARGEMENT DES COMMANDES
// ==================================

function obtenirCommandes(){

    if(!db.commandes){

        db.commandes = [];

    }

    return db.commandes;

}


// ==================================
// CHARGEMENT DES ARCHIVES
// ==================================

function obtenirArchives(){

    if(!db.archives){

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

    /*
        On utilise produitsListe car il contient
        les informations structurées :

        - nom
        - recette
        - quantite
        - poids
        - reference
        - prix
    */

    const produits =
        Array.isArray(cmd.produitsListe)
            ? cmd.produitsListe
            : [];


    // Si produitsListe n'existe pas,
    // on conserve l'ancien affichage
    // pour les anciennes commandes.

    if(produits.length === 0){

        return (cmd.produits || "")
            .replace(/\n/g,"<br>");

    }


    let html = "";


    produits.forEach(function(article){


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


    if(commandes.length === 0){

        zone.innerHTML =
            "<p>Aucune commande enregistrée.</p>";

        return;

    }


    let html = "";


    commandes.forEach(function(cmd,index){


        // ==================================
        // COULEUR DU STATUT
        // ==================================

        let classeStatut =
            "statut-nouvelle";


        if(cmd.statut === "En préparation"){

            classeStatut =
                "statut-preparation";

        }


        if(cmd.statut === "Prête"){

            classeStatut =
                "statut-prete";

        }


        if(cmd.statut === "Livrée"){

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


                    <option value="Nouvelle"
                    ${(cmd.statut || "Nouvelle")==="Nouvelle"?"selected":""}>
                        Nouvelle
                    </option>


                    <option value="En préparation"
                    ${cmd.statut==="En préparation"?"selected":""}>
                        En préparation
                    </option>


                    <option value="Prête"
                    ${cmd.statut==="Prête"?"selected":""}>
                        Prête
                    </option>


                    <option value="Livrée"
                    ${cmd.statut==="Livrée"?"selected":""}>
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
                    cmd.statut==="Livrée"
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

    let commandes =
        obtenirCommandes();


    if(commandes[index]){


        commandes[index].statut =
            valeur;


        sauvegarderDB();


        afficherCommandes();

        afficherStatistiques();

        afficherAlertes();

        afficherDernieresCommandes();

    }

}


// ==================================
// ARCHIVER COMMANDE
// ==================================

function archiverCommande(index){

    let commandes =
        obtenirCommandes();


    let archives =
        obtenirArchives();


    let cmd =
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


    let commandes =
        obtenirCommandes();


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

    let commandes =
        obtenirCommandes();


    let cmd =
        commandes[index];


    if(!cmd){

        return;

    }


    let noms =
        (cmd.client || "")
        .split(" ");


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
            cmd.produitsListe || [],


        total:
            Number(cmd.total) || 0

    });

}


// ==================================
// EMAIL CLIENT
// ==================================

function renvoyerEmail(index){

    let commandes =
        obtenirCommandes();


    let cmd =
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


    let sujet =
        "Votre commande Idée Gourmande";


    let message =

        "Bonjour " +
        cmd.client +
        ",\n\n" +

        "Nous vous confirmons le rappel de votre commande :\n\n" +

        (cmd.produits || "") +

        "\n\nTotal : " +

        cmd.total +

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

    let commandes =
        obtenirCommandes();


    let nb =
        document.getElementById(
            "nbCommandes"
        );


    let ca =
        document.getElementById(
            "caTotal"
        );


    let jour =
        document.getElementById(
            "commandeJour"
        );


    if(nb){

        nb.innerHTML =
            commandes.length;

    }


    let total = 0;


    commandes.forEach(function(cmd){

        total +=
            Number(cmd.total) || 0;

    });


    if(ca){

        ca.innerHTML =
            total.toFixed(2) + " CHF";

    }


    let aujourd_hui =
        new Date()
        .toLocaleDateString("fr-FR");


    let compteur = 0;


    commandes.forEach(function(cmd){

        if(
            cmd.date &&
            cmd.date.includes(aujourd_hui)
        ){

            compteur++;

        }

    });


    if(jour){

        jour.innerHTML =
            compteur;

    }


    // ==================================
    // STOCK ET ACHATS
    // ==================================

    if(typeof db !== "undefined"){

        let stockCritique = 0;


        (db.articles || []).forEach(function(article){

            if(
                article.stock > 0 &&
                article.stock <= article.minimum
            ){

                stockCritique++;

            }

        });


        let zoneStock =
            document.getElementById(
                "stockCritique"
            );


        if(zoneStock){

            zoneStock.innerHTML =
                stockCritique;

        }


        let achatsAttente = 0;


        (db.achats || []).forEach(function(achat){

            if(
                achat.statut !== "Réceptionné"
            ){

                achatsAttente++;

            }

        });


        let zoneAchats =
            document.getElementById(
                "nbAchats"
            );


        if(zoneAchats){

            zoneAchats.innerHTML =
                achatsAttente;

        }

    }

}


// ==================================
// RECHERCHE
// ==================================

function rechercherCommande(){

    let champ =
        document.getElementById(
            "rechercheCommande"
        );


    if(!champ){

        return;

    }


    let recherche =
        champ.value.toLowerCase();


    let commandes =
        obtenirCommandes();


    let filtre =
        commandes.filter(function(cmd){

            return (

                (cmd.client || "")
                .toLowerCase()
                .includes(recherche)

                ||

                (cmd.email || "")
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

    let zone =
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

    let commandes =
        obtenirCommandes();


    let commandesAttente =
        commandes.filter(function(cmd){

            return !cmd.statut ||
                cmd.statut === "Nouvelle" ||
                cmd.statut === "En préparation";

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
    // STOCK
    // ==================================

    if(typeof db !== "undefined"){

        let stockZero = 0;


        (db.articles || []).forEach(function(article){

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


        // ==================================
        // ACHATS
        // ==================================

        let achatsAttente =
            (db.achats || []).filter(function(achat){

                return achat.statut !== "Réceptionné";

            }).length;


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


        trierCommandes();

    }


    const zone =
        document.getElementById(
            "listeCommandes"
        );


    if(zone){

        zone.scrollIntoView({
            behavior:"smooth",
            block:"start"
        });

    }

}


// ==================================
// DERNIÈRES COMMANDES
// ==================================

function afficherDernieresCommandes(){

    let zone =
        document.getElementById(
            "dernieresCommandes"
        );


    if(!zone){

        return;

    }


    let commandes =
        obtenirCommandes();


    if(commandes.length === 0){

        zone.innerHTML =
            "<p>Aucune commande récente.</p>";

        return;

    }


    // prendre les 5 dernières

    let dernieres =
        commandes
        .slice(-5)
        .reverse();


    let html = "";


    dernieres.forEach(function(cmd){

        html += `

        <div class="commande-admin">

            <strong>
                📦 Commande ${cmd.id}
            </strong>

            <br>

            Client :
            ${cmd.client || "-"}

            <br>

            Total :
            ${cmd.total || 0} CHF

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
// RESUME STOCK TABLEAU DE BORD
// ==================================

function afficherResumeStock(){

    if(typeof db === "undefined"){

        return;

    }


    let articles =
        db.articles || [];


    let totalArticles =
        articles.length;


    let valeurStock = 0;

    let stockCritique = 0;


    articles.forEach(function(article){

        let stock =
            Number(article.stock) || 0;


        let prix =
            Number(article.prixAchatMoyen) || 0;


        valeurStock +=
            stock * prix;


        if(
            stock > 0 &&
            stock <= Number(article.minimum)
        ){

            stockCritique++;

        }

    });


    let zoneArticles =
        document.getElementById(
            "totalArticlesStock"
        );


    if(zoneArticles){

        zoneArticles.textContent =
            totalArticles;

    }


    let zoneValeur =
        document.getElementById(
            "valeurStock"
        );


    if(zoneValeur){

        zoneValeur.textContent =
            valeurStock.toFixed(2)
            + " CHF";

    }


    let zoneCritique =
        document.getElementById(
            "stockCritiqueStock"
        );


    if(zoneCritique){

        zoneCritique.textContent =
            stockCritique;

    }

}


// ==================================
// RESUME ACHATS TABLEAU DE BORD
// ==================================

function afficherResumeAchats(){

    if(typeof db === "undefined"){

        console.error(
            "❌ db n'est pas disponible"
        );

        return;

    }


    // Sécurité

    if(!Array.isArray(db.achats)){

        db.achats = [];

    }


    const achats =
        db.achats;


    let attente = 0;

    let receptionnes = 0;

    let montantAttente = 0;


    // ==================================
    // CALCUL ACHATS
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

            montantAttente +=
                Number(
                    achat.total
                ) || 0;

        }

    });


    // ==================================
    // FOURNISSEURS
    // ==================================

    const fournisseurs =
        (db.clients || [])
        .filter(function(client){

            return (
                client.type === "Fournisseur"
            );

        });


    // ==================================
    // AFFICHAGE
    // ==================================

    const zoneAttente =
        document.getElementById(
            "achatsEnAttente"
        );


    if(zoneAttente){

        zoneAttente.textContent =
            attente;

    }


    const zoneReception =
        document.getElementById(
            "achatsReceptionnes"
        );


    if(zoneReception){

        zoneReception.textContent =
            receptionnes;

    }


    const zoneFournisseurs =
        document.getElementById(
            "nombreFournisseurs"
        );


    if(zoneFournisseurs){

        zoneFournisseurs.textContent =
            fournisseurs.length;

    }


    const zoneMontant =
        document.getElementById(
            "montantAchatsAttente"
        );


    if(zoneMontant){

        zoneMontant.textContent =
            montantAttente.toFixed(2)
            +
            " CHF";

    }


    // ==================================
    // DEBUG
    // ==================================

    console.log(
        "📊 RÉSUMÉ ACHATS",
        {
            total: achats.length,
            attente: attente,
            receptionnes: receptionnes,
            montantAttente: montantAttente
        }
    );

}


// ==================================
// DECONNEXION ADMIN
// ==================================

function deconnexion(){

    localStorage.removeItem(
        "adminConnecte"
    );


    window.location.href =
        "admin-login.html";

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
window.addEventListener(
    "storage",
    function(e){

        if(
            e.key === "ideeGourmandeDB"
        ){

            console.log(
                "🔄 Base mise à jour depuis une autre page"
            );

            // Recharger la base

            db =
                JSON.parse(
                    localStorage.getItem(
                        "ideeGourmandeDB"
                    )
                ) || {};


            afficherResumeAchats();

            afficherResumeStock();

            afficherStatistiques();

            afficherAlertes();

            afficherDernieresCommandes();

            afficherCommandes();

        }

    }
);
