document.addEventListener("DOMContentLoaded", () => {

    const buttons = document.querySelectorAll("[data-lang]");


    function changerLangue(langue) {

        /*
         * Vérifie que la langue existe
         */

        if (!translations[langue]) {
            return;
        }


        /*
         * Change la langue déclarée de la page
         */

        document.documentElement.lang = langue;


        /*
         * Traduit les textes
         */

        document.querySelectorAll("[data-i18n]").forEach(element => {

            const key = element.dataset.i18n;

            if (translations[langue][key]) {

                element.textContent =
                    translations[langue][key];

            }

        });


        /*
         * Traduit les textes ALT des images
         */

        document.querySelectorAll("[data-i18n-alt]").forEach(element => {

            const key = element.dataset.i18nAlt;

            if (translations[langue][key]) {

                element.alt =
                    translations[langue][key];

            }

        });


        /*
         * Traduit le titre de l'onglet
         */

        const titrePage =
            document.querySelector("title[data-i18n]");

        if (titrePage) {

            const key =
                titrePage.dataset.i18n;

            if (translations[langue][key]) {

                titrePage.textContent =
                    translations[langue][key];

            }

        }


        /*
         * Mémorise la langue choisie
         */

        localStorage.setItem("langue", langue);


        /*
         * Met en évidence le bouton actif
         */

        buttons.forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.lang === langue
            );

        });

    }


    /*
     * Active les boutons FR / DE / IT
     */

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            changerLangue(
                button.dataset.lang
            );

        });

    });


    /*
     * Récupère la langue précédemment choisie.
     * Si aucune langue n'a encore été choisie,
     * le français est utilisé par défaut.
     */

    const langueSauvegardee =
        localStorage.getItem("langue") || "fr";


    /*
     * Applique la langue au chargement
     */

    changerLangue(langueSauvegardee);

});
