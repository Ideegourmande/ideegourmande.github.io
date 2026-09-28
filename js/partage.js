document.getElementById("partagerSite").addEventListener("click", async function(e) {
    e.preventDefault();

    const partage = {
        title: "Idée Gourmande",
        text: "Découvrez Idée Gourmande – spécialités artisanales préparées à Genève.",
        url: window.location.origin
    };

    if (navigator.share) {
        try {
            await navigator.share(partage);
        } catch (erreur) {
            // Partage annulé par l'utilisateur
        }
    } else {
        try {
            await navigator.clipboard.writeText(window.location.origin);
            alert("Le lien du site a été copié. Vous pouvez maintenant le partager.");
        } catch (erreur) {
            alert("Impossible de copier le lien du site.");
        }
    }
});
