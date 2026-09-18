(() => {
    "use strict";

    const STORAGE_KEY = "ideegourmande_langue";
    const LEGACY_KEY = "langue";
    const SUPPORTED = ["fr", "de", "it"];

    function getLanguage() {
        const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
        return SUPPORTED.includes(saved) ? saved : "fr";
    }

    function addLanguageSelector() {
        if (document.querySelector(".language-selector")) return;

        const nav = document.querySelector("header nav");
        if (!nav) return;

        const selector = document.createElement("div");
        selector.className = "language-selector";
        selector.setAttribute("aria-label", "Choisir la langue");
        selector.innerHTML = `
            <button type="button" data-lang="fr" aria-label="Français">FR</button>
            <button type="button" data-lang="de" aria-label="Deutsch">DE</button>
            <button type="button" data-lang="it" aria-label="Italiano">IT</button>
        `;
        nav.appendChild(selector);
    }

    function translatePage(lang) {
        if (!window.translations || !translations[lang]) return;

        document.documentElement.lang = lang;

        document.querySelectorAll("[data-i18n]").forEach(element => {
            const key = element.dataset.i18n;
            if (Object.prototype.hasOwnProperty.call(translations[lang], key)) {
                element.textContent = translations[lang][key];
            }
        });

        document.querySelectorAll("[data-i18n-html]").forEach(element => {
            const key = element.dataset.i18nHtml;
            if (Object.prototype.hasOwnProperty.call(translations[lang], key)) {
                element.innerHTML = translations[lang][key];
            }
        });

        document.querySelectorAll("[data-i18n-alt]").forEach(element => {
            const key = element.dataset.i18nAlt;
            if (Object.prototype.hasOwnProperty.call(translations[lang], key)) {
                element.alt = translations[lang][key];
            }
        });

        const title = document.querySelector("title[data-i18n]");
        if (title) {
            const key = title.dataset.i18n;
            if (Object.prototype.hasOwnProperty.call(translations[lang], key)) {
                title.textContent = translations[lang][key];
            }
        }

        document.querySelectorAll("[data-lang]").forEach(button => {
            const active = button.dataset.lang === lang;
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", active ? "true" : "false");
        });

        localStorage.setItem(STORAGE_KEY, lang);
        localStorage.setItem(LEGACY_KEY, lang);
    }

    function init() {
        addLanguageSelector();

        document.querySelectorAll("[data-lang]").forEach(button => {
            button.addEventListener("click", () => {
                const lang = button.dataset.lang;
                if (SUPPORTED.includes(lang)) translatePage(lang);
            });
        });

        translatePage(getLanguage());
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
