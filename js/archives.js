// ==================================
// IDEE GOURMANDE
// Archives des commandes
// Version 2.8.1
// Base centrale : ideeGourmandeDB
// ==================================


// ==================================
// CONSTANTE BASE
// ==================================

const CLE_BASE_ARCHIVES =
    "ideeGourmandeDB";


// ==================================
// SECURITE TEXTE
// ==================================

function texteArchive(texte){

    if(
        typeof securiserTexte === "function"
    ){

        return securiserTexte(
            texte
        );

    }


    return String(
        texte ?? ""
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
// VERIFICATION BASE
// ==================================

function obtenirBaseArchives(){

    if(
        typeof db === "undefined" ||
        !db ||
        typeof db !== "object"
    ){

        return null;

    }


    return db;

}


// ==================================
// CHARGEMENT DES ARCHIVES
// ==================================

function obtenirArchives(){

    const base =
        obtenirBaseArchives();


    if(!base){

        return [];

    }


    if(
        !Array.isArray(
            base.archives
        )
    ){

        base.archives = [];

    }


    return base.archives;

}


// ==================================
// CHARGEMENT COMMANDES
// ==================================

function obtenirCommandesArchives(){

    const base =
        obtenirBaseArchives();


    if(!base){

        return [];

    }


    if(
        !Array.isArray(
            base.commandes
        )
    ){

        base.commandes = [];

    }


    return base.commandes;

}


// ==================================
// SAUVEGARDE BASE
// ==================================

function sauvegarderBaseArchives(){

    const base =
        obtenirBaseArchives();


    if(!base){

        console.error(
            "❌ Base de données indisponible."
        );

        return false;

    }


    try{

        if(
            typeof sauvegarderDB === "function"
        ){

            sauvegarderDB();

        }
        else{

            localStorage.setItem(
                CLE_BASE_ARCHIVES,
                JSON.stringify(
                    base
                )
            );

        }


        return true;

    }
    catch(erreur){

        console.error(
            "❌ Erreur sauvegarde archives :",
            erreur
        );

        return false;

    }

}


// ==================================
// PRODUITS D'UNE COMMANDE
// ==================================

function obtenirProduitsCommande(
    commande
){

    if(!commande){

        return "";

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
                function(produit){

                    return !!produit;

                }
            )

            .map(
                function(produit){

                    const nom =
                        produit.nom ||
                        produit.article ||
                        produit.produit ||
                        "Article";


                    let texte =
                        texteArchive(
                            nom
                        );


                    // ==================================
                    // RECETTE
                    // ==================================

                    if(
                        produit.recette
                    ){

                        texte +=
                            " - " +
                            texteArchive(
                                produit.recette
                            );

                    }


                    // ==================================
                    // SAUMON FUME
                    // ==================================

                    if(
                        produit.reference ===
                        "saumon-fume"
                    ){

                        if(
                            produit.poids
                        ){

                            texte +=
                                " : " +
                                texteArchive(
                                    produit.poids
                                ) +
                                " g";

                        }

                        return texte;

                    }


                    // ==================================
                    // QUANTITE
                    // ==================================

                    const quantite =
                        Number(
                            produit.quantite
                        ) || 1;


                    texte +=
                        " x " +
                        quantite;


                    return texte;

                }
            )

            .filter(Boolean)

            .join("<br>");

    }


    // ==================================
    // ANCIEN FORMAT TABLEAU
    // ==================================

    if(
        Array.isArray(
            commande.produits
        )
    ){

        return commande.produits

            .map(
                function(produit){

                    if(
                        typeof produit ===
                        "string"
                    ){

                        return texteArchive(
                            produit
                        );

                    }


                    if(!produit){

                        return "";

                    }


                    const nom =
                        produit.nom ||
                        produit.article ||
                        produit.produit ||
                        "Article";


                    const quantite =
                        Number(
                            produit.quantite
                        ) || 1;


                    return (
                        texteArchive(
                            nom
                        )
                        +
                        " x " +
                        quantite
                    );

                }
            )

            .filter(Boolean)

            .join("<br>");

    }


    // ==================================
    // ANCIEN FORMAT TEXTE
    // ==================================

    if(
        typeof commande.produits ===
        "string"
    ){

        return texteArchive(
            commande.produits
        )
        .replace(
            /\n/g,
            "<br>"
        );

    }


    return "Aucun produit";

}


// ==================================
// DATE POUR TRI
// ==================================

function valeurDateArchive(
    commande
){

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
// AFFICHAGE DES ARCHIVES
// ==================================

function afficherArchives(){

    afficherListeArchives(
        obtenirArchives()
    );

}


// ==================================
// AFFICHAGE LISTE
// ==================================

function afficherListeArchives(
    archives
){

    const zone =
        document.getElementById(
            "listeArchives"
        );


    if(!zone){

        return;

    }


    if(
        !Array.isArray(
            archives
        )
        ||
        archives.length === 0
    ){

        zone.innerHTML = `

            <p>
                📂 Aucune archive.
            </p>

        `;

        return;

    }


    // ==================================
    // CREATION LISTE AVEC INDEX REEL
    // ==================================

    const liste =
        archives

        .map(
            function(commande){

                const index =
                    db.archives.indexOf(
                        commande
                    );


                return {

                    commande:
                        commande,

                    index:
                        index

                };

            }
        )

        .filter(
            function(element){

                return (
                    element.commande &&
                    element.index >= 0
                );

            }
        )

        .sort(
            function(a,b){

                return (
                    valeurDateArchive(
                        b.commande
                    )
                    -
                    valeurDateArchive(
                        a.commande
                    )
                );

            }
        );


    if(
        liste.length === 0
    ){

        zone.innerHTML =
            "<p>📂 Aucune archive.</p>";

        return;

    }


    let html = "";


    liste.forEach(
        function(element){

            const cmd =
                element.commande;


            const index =
                element.index;


            const id =
                cmd.id ||
                cmd.numero ||
                "-";


            const client =
                cmd.client ||
                cmd.nomClient ||
                "-";


            const email =
                cmd.email ||
                "-";


            const telephone =
                cmd.telephone ||
                "-";


            const adresse =
                cmd.adresse ||
                "-";


            const total =
                Number(
                    cmd.total
                ) || 0;


            const statut =
                cmd.statut ||
                "Archivée";


            const produits =
                obtenirProduitsCommande(
                    cmd
                );


            html += `

                <div class="commande-admin">

                    <div
                        class="commande-admin-entete"
                    >

                        <div>

                            <h3>

                                📦 Commande
                                ${texteArchive(id)}

                            </h3>

                            <span
                                class="commande-date"
                            >

                                ${texteArchive(
                                    cmd.date || "-"
                                )}

                            </span>

                        </div>


                        <div
                            class="commande-total"
                        >

                            ${total.toFixed(2)}
                            CHF

                        </div>

                    </div>


                    <div
                        class="commande-admin-infos"
                    >

                        <div>

                            <strong>
                                👤 Client
                            </strong>

                            <p>
                                ${texteArchive(
                                    client
                                )}
                            </p>

                        </div>


                        <div>

                            <strong>
                                📞 Téléphone
                            </strong>

                            <p>
                                ${texteArchive(
                                    telephone
                                )}
                            </p>

                        </div>


                        <div>

                            <strong>
                                ✉️ Email
                            </strong>

                            <p>
                                ${texteArchive(
                                    email
                                )}
                            </p>

                        </div>


                        <div>

                            <strong>
                                📍 Adresse
                            </strong>

                            <p>
                                ${texteArchive(
                                    adresse
                                )}
                            </p>

                        </div>

                    </div>


                    <div
                        class="commande-admin-produits"
                    >

                        <strong>
                            🛒 Commande
                        </strong>


                        <div
                            class="admin-liste-produits"
                        >

                            ${produits}

                        </div>

                    </div>


                    <p>

                        <strong>
                            📦 Statut :
                        </strong>

                        ${texteArchive(
                            statut
                        )}

                    </p>


                    <div
                        class="commande-admin-actions"
                    >

                        <button
                            type="button"
                            class="btn"
                            onclick="restaurerCommande(${index})"
                        >

                            ♻ Restaurer

                        </button>


                        <button
                            type="button"
                            class="btn"
                            onclick="supprimerArchive(${index})"
                        >

                            🗑 Supprimer

                        </button>

                    </div>


                    <hr>

                </div>

            `;

        }
    );


    zone.innerHTML =
        html ||
        "<p>📂 Aucune archive.</p>";

}


// ==================================
// RESTAURER UNE COMMANDE
// ==================================

function restaurerCommande(
    index
){

    const archives =
        obtenirArchives();


    const commandes =
        obtenirCommandesArchives();


    if(
        !archives[index]
    ){

        return;

    }


    const confirmation =
        confirm(

            "Restaurer cette commande ?\n\n" +

            "Elle sera replacée dans les commandes " +
            "actives avec le statut « Nouvelle »."

        );


    if(!confirmation){

        return;

    }


    // ==================================
    // COPIE DE SECURITE
    // ==================================

    let commande;


    try{

        commande =
            JSON.parse(
                JSON.stringify(
                    archives[index]
                )
            );

    }
    catch(erreur){

        console.error(
            "❌ Impossible de copier la commande :",
            erreur
        );

        alert(
            "❌ Impossible de restaurer cette commande."
        );

        return;

    }


    // ==================================
    // NOUVEL ETAT
    // ==================================

    commande.statut =
        "Nouvelle";


    commande.stockTraite =
        false;


    commande.stockErreur =
        false;


    commande.stockErreurMessage =
        "";


    commande.stockTraiteDate =
        null;


    // ==================================
    // AJOUT COMMANDES
    // ==================================

    commandes.push(
        commande
    );


    // ==================================
    // SUPPRESSION ARCHIVE
    // ==================================

    archives.splice(
        index,
        1
    );


    // ==================================
    // SAUVEGARDE
    // ==================================

    if(
        !sauvegarderBaseArchives()
    ){

        // Annulation locale si la sauvegarde échoue

        archives.splice(
            index,
            0,
            commande
        );


        commandes.pop();


        alert(
            "❌ La restauration n'a pas pu être sauvegardée."
        );

        return;

    }


    // ==================================
    // RAFRAICHISSEMENT
    // ==================================

    afficherArchives();


    // ==================================
    // MESSAGE
    // ==================================

    alert(
        "✅ La commande a été restaurée."
    );

}


// ==================================
// SUPPRIMER UNE ARCHIVE
// ==================================

function supprimerArchive(
    index
){

    const archives =
        obtenirArchives();


    if(
        !archives[index]
    ){

        return;

    }


    const confirmation =
        confirm(

            "Supprimer définitivement cette archive ?\n\n" +

            "Cette action est irréversible."

        );


    if(!confirmation){

        return;

    }


    // ==================================
    // COPIE AVANT SUPPRESSION
    // ==================================

    const archiveSupprimee =
        archives[index];


    archives.splice(
        index,
        1
    );


    // ==================================
    // SAUVEGARDE
    // ==================================

    if(
        !sauvegarderBaseArchives()
    ){

        archives.splice(
            index,
            0,
            archiveSupprimee
        );


        alert(
            "❌ La suppression n'a pas pu être sauvegardée."
        );

        return;

    }


    afficherArchives();


    alert(
        "🗑 Archive supprimée définitivement."
    );

}


// ==================================
// RECHERCHE ARCHIVES
// ==================================

function rechercherArchive(){

    const champ =
        document.getElementById(
            "rechercheArchive"
        );


    if(!champ){

        return;

    }


    const recherche =
        champ.value
        .toLowerCase()
        .trim();


    const archives =
        obtenirArchives();


    if(!recherche){

        afficherListeArchives(
            archives
        );

        return;

    }


    const resultat =
        archives.filter(
            function(cmd){

                if(!cmd){

                    return false;

                }


                const client =
                    String(
                        cmd.client ||
                        cmd.nomClient ||
                        ""
                    )
                    .toLowerCase();


                const email =
                    String(
                        cmd.email ||
                        ""
                    )
                    .toLowerCase();


                const telephone =
                    String(
                        cmd.telephone ||
                        ""
                    )
                    .toLowerCase();


                const id =
                    String(
                        cmd.id ||
                        cmd.numero ||
                        ""
                    )
                    .toLowerCase();


                const adresse =
                    String(
                        cmd.adresse ||
                        ""
                    )
                    .toLowerCase();


                return (

                    client.includes(
                        recherche
                    )

                    ||

                    email.includes(
                        recherche
                    )

                    ||

                    telephone.includes(
                        recherche
                    )

                    ||

                    id.includes(
                        recherche
                    )

                    ||

                    adresse.includes(
                        recherche
                    )

                );

            }
        );


    afficherListeArchives(
        resultat
    );

}


// ==================================
// SYNCHRONISATION ENTRE LES PAGES
// ==================================

window.addEventListener(
    "storage",
    function(event){

        if(
            event.key !==
            CLE_BASE_ARCHIVES
        ){

            return;

        }


        try{

            if(
                !event.newValue
            ){

                return;

            }


            const baseChargee =
                JSON.parse(
                    event.newValue
                );


            if(
                !baseChargee ||
                typeof baseChargee !==
                "object"
            ){

                return;

            }


            if(
                typeof db !==
                "undefined"
            ){

                db =
                    baseChargee;

            }


            const champ =
                document.getElementById(
                    "rechercheArchive"
                );


            if(
                champ &&
                champ.value.trim()
            ){

                rechercherArchive();

            }
            else{

                afficherArchives();

            }

        }
        catch(erreur){

            console.error(
                "❌ Impossible de synchroniser les archives :",
                erreur
            );

        }

    }
);


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
// INITIALISATION
// ==================================

document.addEventListener(
    "DOMContentLoaded",
    function(){

        afficherArchives();

    }
);


// ==================================
// EXPORTS WINDOW
// ==================================

window.obtenirArchives =
    obtenirArchives;


window.obtenirCommandesArchives =
    obtenirCommandesArchives;


window.afficherArchives =
    afficherArchives;


window.afficherListeArchives =
    afficherListeArchives;


window.obtenirProduitsCommande =
    obtenirProduitsCommande;


window.restaurerCommande =
    restaurerCommande;


window.supprimerArchive =
    supprimerArchive;


window.rechercherArchive =
    rechercherArchive;


window.deconnexion =
    deconnexion;


console.log(
    "ARCHIVES.JS 2.8.1 CHARGE - BASE CENTRALE",
    typeof db !== "undefined"
        ? db
        : null
);
