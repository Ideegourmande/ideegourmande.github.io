// ==================================
// IDEE GOURMANDE
// Archives des commandes
// Version 2.8.0
// Base centrale : ideeGourmandeDB
// ==================================


// ==================================
// SECURITE
// ==================================

function texteArchive(texte){

    if(typeof securiserTexte === "function"){

        return securiserTexte(texte);

    }

    return String(texte || "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


// ==================================
// CHARGEMENT DES ARCHIVES
// ==================================

function obtenirArchives(){

    if(
        typeof db === "undefined"
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
// PRODUITS D'UNE COMMANDE
// ==================================

function obtenirProduitsCommande(commande){

    if(!commande){

        return "";

    }


    // Nouvelle structure

    if(
        Array.isArray(
            commande.produitsListe
        )
    ){

        return commande.produitsListe
            .map(function(produit){

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
                    ) || 0;


                const poids =
                    Number(
                        produit.poids
                    ) || 0;


                if(
                    poids > 0
                ){

                    return (
                        nom +
                        " - " +
                        poids +
                        " kg"
                    );

                }


                if(
                    quantite > 0
                ){

                    return (
                        nom +
                        " x " +
                        quantite
                    );

                }


                return nom;

            })
            .filter(Boolean)
            .join("<br>");

    }


    // Ancienne structure sous forme de tableau

    if(
        Array.isArray(
            commande.produits
        )
    ){

        return commande.produits
            .map(function(produit){

                if(
                    typeof produit === "string"
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
                    ) || 0;


                return texteArchive(
                    nom
                )
                +
                (
                    quantite > 0
                    ?
                    " x " + quantite
                    :
                    ""
                );

            })
            .filter(Boolean)
            .join("<br>");

    }


    // Ancienne structure texte

    if(
        typeof commande.produits === "string"
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
        !Array.isArray(archives)
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
    // TRI : PLUS RECENT EN PREMIER
    // ==================================

    const liste =
        [...archives].sort(
            function(a,b){

                const dateA =
                    new Date(
                        a.date || 0
                    ).getTime();

                const dateB =
                    new Date(
                        b.date || 0
                    ).getTime();


                return dateB - dateA;

            }
        );


    let html = "";


    liste.forEach(
        function(cmd){

            if(!cmd){

                return;

            }


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


            /*
             * On récupère l'index réel
             * dans db.archives.
             */

            const index =
                db.archives.indexOf(
                    cmd
                );


            html += `

                <div class="commande-admin">

                    <h3>

                        📦 Commande
                        ${texteArchive(id)}

                    </h3>


                    <p>

                        <strong>
                            Date :
                        </strong>

                        <br>

                        ${texteArchive(
                            cmd.date || "-"
                        )}

                    </p>


                    <p>

                        <strong>
                            Client :
                        </strong>

                        <br>

                        ${texteArchive(
                            client
                        )}

                    </p>


                    <p>

                        <strong>
                            Email :
                        </strong>

                        <br>

                        ${texteArchive(
                            email
                        )}

                    </p>


                    <p>

                        <strong>
                            Téléphone :
                        </strong>

                        <br>

                        ${texteArchive(
                            telephone
                        )}

                    </p>


                    <p>

                        <strong>
                            Adresse :
                        </strong>

                        <br>

                        ${texteArchive(
                            adresse
                        )}

                    </p>


                    <p>

                        <strong>
                            Commande :
                        </strong>

                        <br>

                        ${produits}

                    </p>


                    <p>

                        <strong>
                            Total :
                        </strong>

                        ${total.toFixed(2)}
                        CHF

                    </p>


                    <p>

                        <strong>
                            Statut :
                        </strong>

                        ${texteArchive(
                            statut
                        )}

                    </p>


                    ${
                        index >= 0

                        ?

                        `

                        <button
                            class="btn"
                            onclick="restaurerCommande(${index})">

                            ♻ Restaurer

                        </button>


                        <button
                            class="btn"
                            onclick="supprimerArchive(${index})">

                            🗑 Supprimer

                        </button>

                        `

                        :

                        ""

                    }


                    <hr>

                </div>

            `;

        }
    );


    zone.innerHTML =
        html ||
        "<p>Aucune archive.</p>";

}


// ==================================
// RESTAURER UNE COMMANDE
// ==================================

function restaurerCommande(
    index
){

    if(
        !Array.isArray(
            db.archives
        )
    ){

        return;

    }


    const archive =
        db.archives[index];


    if(!archive){

        return;

    }


    const confirmation =
        confirm(
            "Restaurer cette commande ?"
        );


    if(!confirmation){

        return;

    }


    // ==================================
    // SECURISATION COMMANDES
    // ==================================

    if(
        !Array.isArray(
            db.commandes
        )
    ){

        db.commandes = [];

    }


    // ==================================
    // COPIE DE LA COMMANDE
    // ==================================

    const commande =
        JSON.parse(
            JSON.stringify(
                archive
            )
        );


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

    db.commandes.push(
        commande
    );


    // ==================================
    // SUPPRESSION ARCHIVE
    // ==================================

    db.archives.splice(
        index,
        1
    );


    // ==================================
    // SAUVEGARDE
    // ==================================

    if(
        typeof sauvegarderDB === "function"
    ){

        sauvegarderDB();

    }
    else{

        localStorage.setItem(
            "ideeGourmandeDB",
            JSON.stringify(db)
        );

    }


    afficherArchives();


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

    if(
        !Array.isArray(
            db.archives
        )
    ){

        return;

    }


    const archive =
        db.archives[index];


    if(!archive){

        return;

    }


    const confirmation =
        confirm(
            "Supprimer définitivement cette archive ?"
        );


    if(!confirmation){

        return;

    }


    db.archives.splice(
        index,
        1
    );


    if(
        typeof sauvegarderDB === "function"
    ){

        sauvegarderDB();

    }
    else{

        localStorage.setItem(
            "ideeGourmandeDB",
            JSON.stringify(db)
        );

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
    function(e){

        if(
            e.key !==
            "ideeGourmandeDB"
        ){

            return;

        }


        try{

            db =
                JSON.parse(
                    e.newValue
                )
                || {};

        }
        catch(error){

            console.error(
                "Erreur rechargement DB :",
                error
            );

            return;

        }


        afficherArchives();

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
// EXPORTS
// ==================================

window.obtenirArchives =
    obtenirArchives;


window.afficherArchives =
    afficherArchives;


window.afficherListeArchives =
    afficherListeArchives;


window.restaurerCommande =
    restaurerCommande;


window.supprimerArchive =
    supprimerArchive;


window.rechercherArchive =
    rechercherArchive;


window.deconnexion =
    deconnexion;


// ==================================
// FIN
// ==================================

console.log(
    "ARCHIVES.JS 2.8.0 CHARGE - BASE CENTRALE",
    db
);
