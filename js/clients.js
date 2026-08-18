// ==================================
// IDEE GOURMANDE
// Gestion clients
// Version 2.8.0
// Clients + historique + archives
// ==================================


// ==================================
// CHARGEMENT CLIENTS
// ==================================

function obtenirClients(){

    if(
        typeof db === "undefined" ||
        !db
    ){

        return [];

    }


    if(
        !Array.isArray(db.clients)
    ){

        db.clients = [];

    }


    return db.clients;

}


// ==================================
// CHARGEMENT COMMANDES
// ==================================

function obtenirCommandesClients(){

    if(
        typeof db === "undefined" ||
        !db
    ){

        return [];

    }


    if(
        !Array.isArray(db.commandes)
    ){

        db.commandes = [];

    }


    return db.commandes;

}


// ==================================
// CHARGEMENT ARCHIVES
// ==================================

function obtenirArchivesClients(){

    if(
        typeof db === "undefined" ||
        !db
    ){

        return [];

    }


    if(
        !Array.isArray(db.archives)
    ){

        db.archives = [];

    }


    return db.archives;

}


// ==================================
// NORMALISATION EMAIL
// ==================================

function normaliserEmailClient(email){

    return String(
        email || ""
    )
    .trim()
    .toLowerCase();

}


// ==================================
// FORMAT DATE POUR TRI
// ==================================

function valeurDateClient(commande){

    if(
        !commande ||
        !commande.date
    ){

        return 0;

    }


    const date =
        new Date(
            commande.date
        );


    if(
        !isNaN(
            date.getTime()
        )
    ){

        return date.getTime();

    }


    return 0;

}


// ==================================
// OBTENIR TOUTES LES COMMANDES
// ACTIVES + ARCHIVEES
// ==================================

function obtenirToutesCommandesClient(){

    const commandes =
        obtenirCommandesClients();


    const archives =
        obtenirArchivesClients();


    const resultat = [];


    commandes.forEach(
        function(commande){

            if(!commande){

                return;

            }


            resultat.push({

                commande:
                    commande,

                archivee:
                    false

            });

        }
    );


    archives.forEach(
        function(commande){

            if(!commande){

                return;

            }


            resultat.push({

                commande:
                    commande,

                archivee:
                    true

            });

        }
    );


    return resultat;

}


// ==================================
// RECHERCHE COMMANDES D'UN CLIENT
// ==================================

function obtenirHistoriqueClient(email){

    const emailRecherche =
        normaliserEmailClient(
            email
        );


    if(
        !emailRecherche
    ){

        return [];

    }


    return obtenirToutesCommandesClient()

        .filter(
            function(element){

                const commande =
                    element.commande;


                return (
                    normaliserEmailClient(
                        commande.email
                    )
                    ===
                    emailRecherche
                );

            }
        )

        .sort(
            function(a,b){

                return (
                    valeurDateClient(
                        b.commande
                    )
                    -
                    valeurDateClient(
                        a.commande
                    )
                );

            }
        );

}


// ==================================
// FORMATAGE PRODUITS
// ==================================

function afficherProduitsClient(commande){

    if(!commande){

        return "-";

    }


    // ==================================
    // NOUVEAU FORMAT
    // ==================================

    if(
        Array.isArray(
            commande.produitsListe
        )
        &&
        commande.produitsListe.length > 0
    ){

        return commande.produitsListe

            .filter(
                function(article){

                    return !!article;

                }
            )

            .map(
                function(article){

                    let texte =
                        article.nom ||
                        "Produit";


                    if(
                        article.recette
                    ){

                        texte +=
                            " - " +
                            article.recette;

                    }


                    if(
                        article.reference ===
                        "saumon-fume"
                    ){

                        if(
                            article.poids
                        ){

                            texte +=
                                " : " +
                                article.poids +
                                " g";

                        }

                    }
                    else{

                        texte +=
                            " x " +
                            (
                                Number(
                                    article.quantite
                                ) || 1
                            );

                    }


                    return securiserTexteClient(
                        texte
                    );

                }
            )

            .join("<br>");

    }


    // ==================================
    // ANCIEN FORMAT
    // ==================================

    if(
        commande.produits
    ){

        return securiserTexteClient(
            String(
                commande.produits
            )
        )
        .replace(
            /\n/g,
            "<br>"
        );

    }


    return "-";

}


// ==================================
// SECURISATION TEXTE
// ==================================

function securiserTexteClient(texte){

    if(
        typeof securiserTexte === "function"
    ){

        return securiserTexte(
            texte
        );

    }


    return String(
        texte || ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


// ==================================
// AFFICHAGE CLIENTS
// ==================================

function afficherClients(
    clients = obtenirClients()
){

    const zone =
        document.getElementById(
            "listeClients"
        );


    if(!zone){

        return;

    }


    if(
        !Array.isArray(clients)
    ){

        clients = [];

    }


    if(
        clients.length === 0
    ){

        zone.innerHTML =
            "<p>Aucun client enregistré.</p>";

        return;

    }


    let html = "";


    clients.forEach(
        function(client){

            if(!client){

                return;

            }


            const email =
                normaliserEmailClient(
                    client.email
                );


            /*
                Si aucun email n'est disponible,
                on ne peut pas relier correctement
                l'historique du client.
            */

            const historique =
                email
                ?
                obtenirHistoriqueClient(
                    email
                )
                :
                [];


            const nbCommandes =
                historique.length;


            let total = 0;


            historique.forEach(
                function(element){

                    if(
                        !element ||
                        !element.commande
                    ){

                        return;

                    }


                    total +=
                        Number(
                            element.commande.total
                        ) || 0;

                }
            );


            let premiereCommande = "-";
            let derniereCommande = "-";


            if(
                historique.length > 0
            ){

                const dates =
                    historique

                    .map(
                        function(element){

                            return (
                                element.commande
                                &&
                                element.commande.date
                            )
                            ?
                            element.commande.date
                            :
                            null;

                        }
                    )

                    .filter(
                        function(date){

                            return !!date;

                        }
                    );


                if(
                    dates.length > 0
                ){

                    const datesTriees =
                        dates.slice().sort(
                            function(a,b){

                                return (
                                    valeurDateClient({
                                        date: a
                                    })
                                    -
                                    valeurDateClient({
                                        date: b
                                    })
                                );

                            }
                        );


                    premiereCommande =
                        datesTriees[0] || "-";


                    derniereCommande =
                        datesTriees[
                            datesTriees.length - 1
                        ]
                        || "-";

                }

            }


            const nom =
                securiserTexteClient(
                    client.nom || "-"
                );


            const telephone =
                securiserTexteClient(
                    client.telephone || "-"
                );


            const emailAffiche =
                securiserTexteClient(
                    client.email || "-"
                );


            const adresse =
                securiserTexteClient(
                    client.adresse || "-"
                );


            /*
                On utilise data-email plutôt
                qu'un email directement dans
                onclick.
            */

            html += `

                <div class="commande-admin">

                    <h3>
                        👤 ${nom}
                    </h3>


                    <p>

                        <strong>
                            Téléphone :
                        </strong>

                        <br>

                        ${telephone}

                    </p>


                    <p>

                        <strong>
                            Email :
                        </strong>

                        <br>

                        ${emailAffiche}

                    </p>


                    <p>

                        <strong>
                            Adresse :
                        </strong>

                        <br>

                        ${adresse}

                    </p>


                    <hr>


                    <p>

                        🛒

                        <strong>
                            Commandes :
                        </strong>

                        ${nbCommandes}

                    </p>


                    <p>

                        💰

                        <strong>
                            Total dépensé :
                        </strong>

                        ${total.toFixed(2)} CHF

                    </p>


                    <p>

                        📅

                        <strong>
                            Première commande :
                        </strong>

                        ${securiserTexteClient(
                            premiereCommande
                        )}

                    </p>


                    <p>

                        🕒

                        <strong>
                            Dernière commande :
                        </strong>

                        ${securiserTexteClient(
                            derniereCommande
                        )}

                    </p>


                    <br>


                    ${
                        email

                        ?

                        `

                        <button
                            type="button"
                            class="btn btn-historique-client"
                            data-email="${securiserTexteClient(email)}"
                        >

                            📂 Voir l'historique

                        </button>

                        `

                        :

                        `

                        <p>
                            ⚠️ Aucun email disponible pour
                            consulter l'historique.
                        </p>

                        `

                    }

                </div>

            `;

        }
    );


    zone.innerHTML =
        html;

}


// ==================================
// RECHERCHE CLIENT
// ==================================

function rechercherClient(){

    const champ =
        document.getElementById(
            "rechercheClient"
        );


    if(!champ){

        return;

    }


    const recherche =
        champ.value
        .toLowerCase()
        .trim();


    const resultat =
        obtenirClients()
        .filter(
            function(client){

                if(!client){

                    return false;

                }


                return (

                    String(
                        client.nom || ""
                    )
                    .toLowerCase()
                    .includes(
                        recherche
                    )

                    ||

                    String(
                        client.email || ""
                    )
                    .toLowerCase()
                    .includes(
                        recherche
                    )

                    ||

                    String(
                        client.telephone || ""
                    )
                    .toLowerCase()
                    .includes(
                        recherche
                    )

                    ||

                    String(
                        client.adresse || ""
                    )
                    .toLowerCase()
                    .includes(
                        recherche
                    )

                );

            }
        );


    afficherClients(
        resultat
    );

}


// ==================================
// HISTORIQUE CLIENT
// ==================================

function voirHistorique(email){

    const zone =
        document.getElementById(
            "contenuHistorique"
        );


    const fenetre =
        document.getElementById(
            "fenetreHistorique"
        );


    if(
        !zone ||
        !fenetre
    ){

        return;

    }


    const historique =
        obtenirHistoriqueClient(
            email
        );


    let html = `

        <h3>
            Historique des commandes
        </h3>

        <p>

            Total :
            <strong>
                ${historique.length}
            </strong>
            commande(s)

        </p>

    `;


    if(
        historique.length === 0
    ){

        html += `

            <p>
                Aucune commande trouvée.
            </p>

        `;

    }
    else{

        historique.forEach(
            function(element){

                const commande =
                    element.commande;


                const archivee =
                    element.archivee;


                if(!commande){

                    return;

                }


                const id =
                    securiserTexteClient(
                        commande.id || "-"
                    );


                const date =
                    securiserTexteClient(
                        commande.date || "-"
                    );


                const statut =
                    securiserTexteClient(
                        commande.statut ||
                        "Nouvelle"
                    );


                const total =
                    (
                        Number(
                            commande.total
                        ) || 0
                    )
                    .toFixed(2);


                html += `

                    <div class="commande-admin">

                        <strong>

                            📦 Commande ${id}

                        </strong>


                        <br>


                        📅 ${date}


                        <br>


                        💰 ${total} CHF


                        <br>


                        📦 Statut :
                        ${statut}


                        <br>


                        ${
                            archivee

                            ?

                            `

                            <br>

                            <span>

                                📁 Commande archivée

                            </span>

                            `

                            :

                            ""

                        }


                        <hr>


                        <strong>
                            Produits :
                        </strong>


                        <br>


                        ${afficherProduitsClient(
                            commande
                        )}

                    </div>

                    <br>

                `;

            }
        );

    }


    zone.innerHTML =
        html;


    fenetre.style.display =
        "block";

}


// ==================================
// FERMETURE HISTORIQUE
// ==================================

function fermerHistorique(){

    const fenetre =
        document.getElementById(
            "fenetreHistorique"
        );


    if(fenetre){

        fenetre.style.display =
            "none";

    }

}


// ==================================
// CLIC SUR HISTORIQUE
// ==================================

document.addEventListener(
    "click",
    function(event){

        const bouton =
            event.target.closest(
                ".btn-historique-client"
            );


        if(!bouton){

            return;

        }


        const email =
            bouton.getAttribute(
                "data-email"
            );


        if(!email){

            return;

        }


        voirHistorique(
            email
        );

    }
);


// ==================================
// FERMETURE AVEC CLIC HORS FENETRE
// ==================================

document.addEventListener(
    "click",
    function(event){

        const fenetre =
            document.getElementById(
                "fenetreHistorique"
            );


        if(
            !fenetre ||
            fenetre.style.display !== "block"
        ){

            return;

        }


        if(
            event.target === fenetre
        ){

            fermerHistorique();

        }

    }
);


// ==================================
// FERMETURE AVEC TOUCHE ESC
// ==================================

document.addEventListener(
    "keydown",
    function(event){

        if(
            event.key !== "Escape"
        ){

            return;

        }


        fermerHistorique();

    }
);


// ==================================
// SYNCHRONISATION ENTRE LES PAGES
// ==================================

window.addEventListener(
    "storage",
    function(event){

        if(
            event.key !== "ideeGourmandeDB"
        ){

            return;

        }


        try{

            const nouvelleBase =
                localStorage.getItem(
                    "ideeGourmandeDB"
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

                return;

            }


            db =
                baseChargee;


            const recherche =
                document.getElementById(
                    "rechercheClient"
                );


            if(
                recherche &&
                recherche.value.trim()
            ){

                rechercherClient();

            }
            else{

                afficherClients();

            }

        }
        catch(erreur){

            console.error(
                "❌ Impossible de synchroniser les clients :",
                erreur
            );

        }

    }
);


// ==================================
// INITIALISATION
// ==================================

document.addEventListener(
    "DOMContentLoaded",
    function(){

        afficherClients();

    }
);


// ==================================
// EXPORTS WINDOW
// ==================================

window.obtenirClients =
    obtenirClients;

window.obtenirCommandesClients =
    obtenirCommandesClients;

window.obtenirArchivesClients =
    obtenirArchivesClients;

window.obtenirToutesCommandesClient =
    obtenirToutesCommandesClient;

window.obtenirHistoriqueClient =
    obtenirHistoriqueClient;

window.afficherClients =
    afficherClients;

window.rechercherClient =
    rechercherClient;

window.voirHistorique =
    voirHistorique;

window.fermerHistorique =
    fermerHistorique;


console.log(
    "CLIENTS.JS 2.8.0 CHARGE"
);
