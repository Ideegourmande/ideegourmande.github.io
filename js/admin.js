// ==================================
// IDÉE GOURMANDE
// Administration
// Version 2.8.0
// Commandes + Stock + Achats
// Sauvegarde + Restauration
// ==================================


// ==================================
// CONSTANTE BASE
// ==================================

const CLE_BASE = "ideeGourmandeDB";
const CLE_SECURITE_RESTAURATION =
    "ideeGourmandeDB_avant_restauration";


// ==================================
// CHARGEMENT DES COMMANDES
// ==================================

function obtenirCommandes(){

    if(
        typeof db === "undefined" ||
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
        typeof db === "undefined" ||
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
        ).replace(
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
            article.reference === "saumon-fume" &&
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
        !Array.isArray(commandes) ||
        commandes.length === 0
    ){

        zone.innerHTML =
            "<p>Aucune commande enregistrée.</p>";

        return;
    }

    let html = "";

    commandes.forEach(function(cmd, index){

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
                        onchange="changerStatut(${index}, this.value)"
                    >

                        <option
                            value="Nouvelle"
                            ${
                                (cmd.statut || "Nouvelle") === "Nouvelle"
                                ? "selected"
                                : ""
                            }
                        >
                            Nouvelle
                        </option>

                        <option
                            value="En préparation"
                            ${
                                cmd.statut === "En préparation"
                                ? "selected"
                                : ""
                            }
                        >
                            En préparation
                        </option>

                        <option
                            value="Prête"
                            ${
                                cmd.statut === "Prête"
                                ? "selected"
                                : ""
                            }
                        >
                            Prête
                        </option>

                        <option
                            value="Livrée"
                            ${
                                cmd.statut === "Livrée"
                                ? "selected"
                                : ""
                            }
                        >
                            Livrée
                        </option>

                    </select>

                </div>


                <div class="commande-admin-actions">

                    <button
                        type="button"
                        class="btn"
                        onclick="imprimerCommande(${index})"
                    >
                        🖨 PDF
                    </button>


                    <button
                        type="button"
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
                            type="button"
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
                        type="button"
                        class="btn"
                        onclick="supprimerCommande(${index})"
                    >
                        🗑 Supprimer
                    </button>

                </div>

            </div>
        `;
    });

    zone.innerHTML = html;
}


// ==================================
// CHANGER STATUT
// ==================================

function changerStatut(index, valeur){

    const commandes =
        obtenirCommandes();

    if(!commandes[index]){
        return;
    }

    commandes[index].statut =
        valeur;

    if(typeof sauvegarderDB === "function"){
        sauvegarderDB();
    }

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

    if(
        !confirm(
            "Archiver cette commande ?"
        )
    ){
        return;
    }

    archives.push(cmd);

    commandes.splice(
        index,
        1
    );

    if(typeof sauvegarderDB === "function"){
        sauvegarderDB();
    }

    afficherCommandes();
    afficherStatistiques();
    afficherAlertes();
    afficherDernieresCommandes();
}

// ==================================
// SUPPRIMER LES ACHATS AUTOMATIQUES
// LIÉS À UNE COMMANDE
// ==================================

function supprimerAchatsAutomatiquesCommande(cmd){

    if(
        !cmd ||
        typeof db === "undefined" ||
        !db
    ){
        return;
    }

    if(!Array.isArray(db.achats)){
        db.achats = [];
        return;
    }

    const idCommande =
        String(cmd.id || "").trim();

    if(!idCommande){
        return;
    }

    db.achats =
        db.achats.filter(function(achat){

            if(!achat){
                return false;
            }

            // Les achats manuels sont conservés
            if(achat.automatique !== true){
                return true;
            }

            const numeroAchat =
                String(
                    achat.numero ||
                    achat.commandeId ||
                    achat.idCommande ||
                    ""
                ).trim();

            // Supprime uniquement l'achat automatique
            // correspondant à cette commande
            return numeroAchat !== idCommande;
        });
}
// ==================================
// SUPPRIMER COMMANDE
// ==================================

function supprimerCommande(index){

    if(
        !confirm(
            "Supprimer cette commande ?\n\n" +
            "L'achat automatique associé sera également supprimé.\n" +
            "Les achats manuels seront conservés."
        )
    ){
        return;
    }

    const commandes =
        obtenirCommandes();

    const cmd =
        commandes[index];

    if(!cmd){
        return;
    }

    // Supprimer l'achat automatique lié
    supprimerAchatsAutomatiquesCommande(cmd);

    // Supprimer la commande
    commandes.splice(
        index,
        1
    );

    if(typeof sauvegarderDB === "function"){
        sauvegarderDB();
    }

    afficherCommandes();
    afficherStatistiques();
    afficherAlertes();
    afficherDernieresCommandes();
    afficherResumeAchats();
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

        (
            cmd.produits ||
            (
                Array.isArray(cmd.produitsListe)
                    ? cmd.produitsListe
                        .map(function(article){

                            if(!article){
                                return "";
                            }

                            return (
                                article.nom ||
                                "Produit"
                            ) +
                            " x " +
                            (
                                article.quantite ||
                                1
                            );
                        })
                        .join("\n")
                    : ""
            )
        ) +

        "\n\nTotal : " +

        (
            Number(cmd.total) || 0
        ).toFixed(2) +

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

        if(!cmd){
            return;
        }

        total +=
            Number(cmd.total) || 0;
    });

    if(ca){

        ca.textContent =
            total.toFixed(2) +
            " CHF";
    }


    // ==================================
    // COMMANDES DU JOUR
    // ==================================

    const aujourd_hui =
        new Date()
        .toLocaleDateString("fr-FR");

    let compteur = 0;

    commandes.forEach(function(cmd){

        if(
            cmd &&
            cmd.date &&
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
    // STOCK + ACHATS
    // ==================================

    if(
        typeof db !== "undefined" &&
        db
    ){

        let stockCritique = 0;

        (
            Array.isArray(db.articles)
                ? db.articles
                : []
        )
        .forEach(function(article){

            if(!article){
                return;
            }

            const stock =
                Number(article.stock) || 0;

            const minimum =
                Number(article.minimum) || 0;

            if(
                stock > 0 &&
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
                achat &&
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

            if(!cmd){
                return false;
            }

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

                ||

                String(
                    cmd.id || ""
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
// TRI DES COMMANDES
// ==================================

function trierCommandes(){

    const select =
        document.getElementById(
            "triCommandes"
        );

    if(!select){
        return;
    }

    const typeTri =
        select.value;

    let commandes =
        obtenirCommandes().slice();

    const recherche =
        (
            document.getElementById(
                "rechercheCommande"
            )?.value ||
            ""
        )
        .toLowerCase()
        .trim();


    // ==================================
    // RECHERCHE
    // ==================================

    if(recherche){

        commandes =
            commandes.filter(function(cmd){

                if(!cmd){
                    return false;
                }

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

                    ||

                    String(
                        cmd.id || ""
                    )
                    .toLowerCase()
                    .includes(recherche)
                );
            });
    }


    // ==================================
    // DATE
    // ==================================

    function valeurDate(cmd){

        if(!cmd || !cmd.date){
            return 0;
        }

        const date =
            new Date(cmd.date);

        if(!isNaN(date.getTime())){
            return date.getTime();
        }

        return 0;
    }


    // ==================================
    // TRI
    // ==================================

    if(typeTri === "anciennes"){

        commandes.sort(function(a,b){

            return valeurDate(a) -
                   valeurDate(b);
        });
    }


    else if(typeTri === "recentes"){

        commandes.sort(function(a,b){

            return valeurDate(b) -
                   valeurDate(a);
        });
    }


    else if(typeTri === "attente"){

        const ordre = {
            "Nouvelle": 1,
            "En préparation": 2,
            "Prête": 3,
            "Livrée": 4
        };

        commandes.sort(function(a,b){

            const statutA =
                ordre[a.statut || "Nouvelle"] || 1;

            const statutB =
                ordre[b.statut || "Nouvelle"] || 1;

            if(statutA !== statutB){
                return statutA - statutB;
            }

            return valeurDate(b) -
                   valeurDate(a);
        });

        commandes =
            commandes.filter(function(cmd){

                return (
                    !cmd.statut ||
                    cmd.statut === "Nouvelle" ||
                    cmd.statut === "En préparation"
                );
            });
    }


    else if(typeTri === "pretes"){

        commandes =
            commandes.filter(function(cmd){

                return (
                    cmd.statut === "Prête"
                );
            });

        commandes.sort(function(a,b){

            return valeurDate(b) -
                   valeurDate(a);
        });
    }


    else if(typeTri === "livrees"){

        commandes =
            commandes.filter(function(cmd){

                return (
                    cmd.statut === "Livrée"
                );
            });

        commandes.sort(function(a,b){

            return valeurDate(b) -
                   valeurDate(a);
        });
    }


    afficherListeCommandes(
        commandes
    );
}

// ==================================
// REMISE À ZÉRO TEST
// COMMANDES + ACHATS AUTOMATIQUES
// ==================================

function reinitialiserCommandesEtAchats(){

    if(
        typeof db === "undefined" ||
        !db
    ){
        alert(
            "❌ La base de données n'est pas disponible."
        );

        return;
    }


    const confirmation =
        confirm(

            "⚠️ REMISE À ZÉRO\n\n" +

            "Cette action va supprimer :\n" +
            "• toutes les commandes\n" +
            "• tous les achats automatiques\n" +
            "• les mouvements liés aux commandes\n\n" +

            "Les articles, le stock et les achats manuels " +
            "seront conservés.\n\n" +

            "Cette action est irréversible.\n\n" +

            "Voulez-vous continuer ?"
        );


    if(!confirmation){
        return;
    }


    // ==================================
    // COMMANDES
    // ==================================

    db.commandes = [];


    // ==================================
    // ACHATS AUTOMATIQUES UNIQUEMENT
    // ==================================

    db.achats =
        (
            Array.isArray(db.achats)
                ? db.achats
                : []
        )
        .filter(function(achat){

            return achat &&
                   achat.automatique !== true;

        });


    // ==================================
    // MOUVEMENTS
    // ==================================

    db.mouvements =
        (
            Array.isArray(db.mouvements)
                ? db.mouvements
                : []
        )
        .filter(function(mouvement){

            if(!mouvement){
                return false;
            }

            return (
                mouvement.origine !== "Commande client"
                &&
                mouvement.action !== "Commande client"
                &&
                mouvement.action !== "Création achat automatique"
                &&
                mouvement.action !== "Complément achat automatique"
            );

        });


    // ==================================
    // SAUVEGARDE
    // ==================================

    if(
        typeof sauvegarderDB === "function"
    ){

        sauvegarderDB();

    }


    // ==================================
    // RAFRAÎCHISSEMENT
    // ==================================

    if(
        typeof afficherCommandes === "function"
    ){
        afficherCommandes();
    }

    if(
        typeof afficherStatistiques === "function"
    ){
        afficherStatistiques();
    }

    if(
        typeof afficherAlertes === "function"
    ){
        afficherAlertes();
    }

    if(
        typeof afficherDernieresCommandes === "function"
    ){
        afficherDernieresCommandes();
    }

    if(
        typeof afficherResumeAchats === "function"
    ){
        afficherResumeAchats();
    }


    alert(
        "✅ Réinitialisation terminée.\n\n" +
        "Les commandes et achats automatiques ont été supprimés.\n" +
        "Le stock et les achats manuels ont été conservés."
    );

}
// ==================================
// DÉCONNEXION
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
                !cmd.statut ||
                cmd.statut === "Nouvelle" ||
                cmd.statut === "En préparation"
            );
        }).length;

    if(commandesAttente > 0){

        html += `
            <p
                class="alerte-cliquable"
                onclick="allerAuxCommandesApreparer()"
            >
                🟠 ${commandesAttente}
                commande(s) à préparer
            </p>
        `;
    }


    // ==================================
    // STOCK + ACHATS
    // ==================================

    if(
        typeof db !== "undefined" &&
        db
    ){

        let stockZero = 0;

        (
            Array.isArray(db.articles)
                ? db.articles
                : []
        )
        .forEach(function(article){

            if(!article){
                return;
            }

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
                    achat &&
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

        trierCommandes();
    }

    const zone =
        document.getElementById(
            "listeCommandes"
        );

    if(zone){

        zone.scrollIntoView({
            behavior: "smooth",
            block: "start"
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
                ${(Number(cmd.total) || 0).toFixed(2)} CHF

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
        typeof db === "undefined" ||
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
            stock > 0 &&
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
            valeurStock.toFixed(2) +
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
        typeof db === "undefined" ||
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
                client &&
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


// ======================================
// SAUVEGARDE DE LA BASE DANS UN FICHIER
// ======================================

function sauvegarderBaseFichier(){

    try{

        // ==================================
        // VÉRIFICATION DE LA BASE
        // ==================================

        if(
            typeof db === "undefined" ||
            !db ||
            typeof db !== "object"
        ){

            throw new Error(
                "La base de données n'est pas disponible."
            );
        }


        // ==================================
        // COPIE DE LA BASE ACTUELLE
        // ==================================

        const base =
            JSON.parse(
                JSON.stringify(db)
            );


        // ==================================
        // CONVERSION JSON
        // ==================================

        const contenu =
            JSON.stringify(
                base,
                null,
                4
            );


        // ==================================
        // CRÉATION FICHIER
        // ==================================

        const blob =
            new Blob(
                [contenu],
                {
                    type:
                        "application/json"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const lien =
            document.createElement(
                "a"
            );


        lien.href =
            url;


        // ==================================
        // NOM FICHIER
        // ==================================

        const date =
            new Date()
            .toISOString()
            .replace(
                /[:.]/g,
                "-"
            );


        lien.download =
            "idee-gourmande-sauvegarde-" +
            date +
            ".json";


        // ==================================
        // TÉLÉCHARGEMENT
        // ==================================

        document.body.appendChild(
            lien
        );

        lien.click();

        lien.remove();


        // ==================================
        // NETTOYAGE
        // ==================================

        setTimeout(function(){

            URL.revokeObjectURL(
                url
            );

        }, 1000);


        alert(
            "✅ Sauvegarde effectuée avec succès."
        );


        console.log(
            "💾 SAUVEGARDE EFFECTUÉE",
            base
        );

    }
    catch(erreur){

        console.error(
            "❌ ERREUR SAUVEGARDE :",
            erreur
        );

        alert(
            "❌ Impossible de créer la sauvegarde.\n\n" +
            erreur.message
        );
    }
}


// ======================================
// RESTAURATION DE LA BASE
// ======================================

function restaurerBaseFichier(event){

    const input =
        event &&
        event.target
            ? event.target
            : null;

    if(!input){
        return;
    }


    const fichier =
        input.files &&
        input.files[0]
            ? input.files[0]
            : null;


    if(!fichier){
        return;
    }


    // ==================================
    // VÉRIFICATION EXTENSION
    // ==================================

    if(
        !fichier.name
            .toLowerCase()
            .endsWith(".json")
    ){

        alert(
            "❌ Veuillez sélectionner un fichier JSON."
        );

        input.value = "";

        return;
    }


    // ==================================
    // CONFIRMATION
    // ==================================

    const confirmation =
        confirm(

            "⚠️ ATTENTION\n\n" +

            "La restauration va remplacer " +

            "la base actuellement utilisée.\n\n" +

            "Une copie de sécurité de la base actuelle " +
            "sera conservée avant le remplacement.\n\n" +

            "Voulez-vous continuer ?"
        );


    if(!confirmation){

        input.value = "";

        return;
    }


    // ==================================
    // LECTURE FICHIER
    // ==================================

    const lecteur =
        new FileReader();


    lecteur.onload =
        function(){

            try{

                // ==================================
                // LECTURE JSON
                // ==================================

                const baseRestauree =
                    JSON.parse(
                        lecteur.result
                    );


                // ==================================
                // VÉRIFICATION OBJET
                // ==================================

                if(
                    !baseRestauree ||
                    typeof baseRestauree !== "object" ||
                    Array.isArray(baseRestauree)
                ){

                    throw new Error(
                        "Fichier de sauvegarde invalide."
                    );
                }


                // ==================================
                // VÉRIFICATION STRUCTURE
                // ==================================

                if(
                    !Array.isArray(
                        baseRestauree.commandes
                    )
                ){

                    throw new Error(
                        "La sauvegarde ne contient pas de liste de commandes valide."
                    );
                }


                if(
                    !Array.isArray(
                        baseRestauree.articles
                    )
                ){

                    throw new Error(
                        "La sauvegarde ne contient pas de liste d'articles valide."
                    );
                }


                if(
                    !Array.isArray(
                        baseRestauree.achats
                    )
                ){

                    throw new Error(
                        "La sauvegarde ne contient pas de liste d'achats valide."
                    );
                }


                // ==================================
                // COPIE DE SÉCURITÉ
                // ==================================

                const ancienneBase =
                    localStorage.getItem(
                        CLE_BASE
                    );


                if(ancienneBase){

                    localStorage.setItem(
                        CLE_SECURITE_RESTAURATION,
                        ancienneBase
                    );

                    console.log(
                        "🛡️ Copie de sécurité créée avant restauration."
                    );
                }


                // ==================================
                // INSTALLATION NOUVELLE BASE
                // ==================================

                localStorage.setItem(
                    CLE_BASE,
                    JSON.stringify(
                        baseRestauree
                    )
                );


                // ==================================
                // MISE À JOUR DE DB
                // ==================================

                if(
                    typeof db !== "undefined"
                ){

                    db =
                        JSON.parse(
                            JSON.stringify(
                                baseRestauree
                            )
                        );
                }


                console.log(
                    "📥 BASE RESTAURÉE :",
                    baseRestauree
                );


                // ==================================
                // CONFIRMATION
                // ==================================

                alert(

                    "✅ Restauration terminée.\n\n" +

                    "La page va être rechargée."
                );


                // ==================================
                // RECHARGEMENT
                // ==================================

                window.location.reload();
            }


            catch(erreur){

                console.error(
                    "❌ ERREUR RESTAURATION :",
                    erreur
                );


                alert(

                    "❌ Impossible de restaurer cette sauvegarde.\n\n" +

                    erreur.message
                );
            }
            finally{

                input.value = "";
            }
        };


    // ==================================
    // ERREUR LECTURE
    // ==================================

    lecteur.onerror =
        function(){

            alert(
                "❌ Impossible de lire le fichier."
            );

            input.value = "";
        };


    lecteur.readAsText(
        fichier
    );
}


// ======================================
// INITIALISATION
// ======================================

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


// ======================================
// SYNCHRONISATION ENTRE LES PAGES
// ======================================

window.addEventListener(
    "storage",
    function(e){

        if(
            e.key !== CLE_BASE
        ){
            return;
        }


        console.log(
            "🔄 Base mise à jour depuis une autre page"
        );


        if(
            typeof localStorage === "undefined"
        ){
            return;
        }


        try{

            const nouvelleBase =
                localStorage.getItem(
                    CLE_BASE
                );


            if(!nouvelleBase){
                return;
            }


            const baseChargee =
                JSON.parse(
                    nouvelleBase
                );


            if(
                !baseChargee ||
                typeof baseChargee !== "object"
            ){

                throw new Error(
                    "Base reçue invalide."
                );
            }


            if(
                typeof db !== "undefined"
            ){

                db =
                    baseChargee;
            }


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


// ======================================
// EXPORTS WINDOW
// ======================================
// Les fonctions sont utilisées directement
// depuis admin.html avec onclick/onchange.
// ======================================

window.obtenirCommandes =
    obtenirCommandes;

window.obtenirArchives =
    obtenirArchives;

window.afficherCommandes =
    afficherCommandes;

window.afficherListeCommandes =
    afficherListeCommandes;

window.afficherProduitsCommande =
    afficherProduitsCommande;

window.changerStatut =
    changerStatut;

window.archiverCommande =
    archiverCommande;

window.supprimerCommande =
    supprimerCommande;

window.imprimerCommande =
    imprimerCommande;

window.renvoyerEmail =
    renvoyerEmail;

window.afficherStatistiques =
    afficherStatistiques;

window.rechercherCommande =
    rechercherCommande;

window.trierCommandes =
    trierCommandes;

window.deconnexion =
    deconnexion;

window.afficherAlertes =
    afficherAlertes;

window.allerAuxCommandesApreparer =
    allerAuxCommandesApreparer;

window.afficherDernieresCommandes =
    afficherDernieresCommandes;

window.afficherResumeStock =
    afficherResumeStock;

window.afficherResumeAchats =
    afficherResumeAchats;

window.sauvegarderBaseFichier =
    sauvegarderBaseFichier;

window.restaurerBaseFichier =
    restaurerBaseFichier;

window.reinitialiserCommandesEtAchats =
    reinitialiserCommandesEtAchats;

console.log(
    "TEST REMISE A ZERO :",
    typeof reinitialiserCommandesEtAchats
);
