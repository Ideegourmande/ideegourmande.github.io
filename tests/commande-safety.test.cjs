const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const commandeSource = fs.readFileSync("js/commande.js", "utf8");
const pdfSource = fs.readFileSync("js/pdfcommande.js", "utf8");

function chargerCommande(storage = new Map()) {
  const localStorage = {
    getItem(key) {
      if (storage.throwOnRead) throw new Error("storage indisponible");
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      if (storage.throwOnWrite) throw new Error("quota dépassé");
      storage.set(key, value);
    },
    removeItem(key) {
      storage.delete(key);
    }
  };
  const window = {};
  const document = {
    addEventListener() {},
    getElementById() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    head: { appendChild() {} }
  };
  const context = {
    window,
    document,
    localStorage,
    console: { log() {}, info() {}, warn() {}, error() {} },
    alert() {},
    URLSearchParams,
    Date,
    Math,
    setTimeout,
    clearTimeout,
    Promise
  };
  vm.createContext(context);
  vm.runInContext(commandeSource, context, { filename: "commande.js" });
  return { context, storage, window };
}

test("une commande en attente est relue avec la même empreinte", () => {
  const { context, storage } = chargerCommande();
  const commande = { client: { email: "test@example.invalid" }, produits: [{ reference: "magret", quantite: 1 }], total: 25 };
  const empreinte = context.empreinteCommande(commande);
  const attente = { empreinte, idCommande: "IG-TEST-1", numeroCommande: "2026-001" };

  context.sauvegarderCommandeEnAttente(attente);

  assert.equal(context.lireCommandeEnAttente(empreinte).idCommande, "IG-TEST-1");
  assert.equal(storage.size, 1);
});

test("un contenu de commande différent ne réutilise pas l'identifiant précédent", () => {
  const { context } = chargerCommande();
  const initiale = { client: { email: "a@example.invalid" }, produits: [], total: 0 };
  const modifiee = { client: { email: "b@example.invalid" }, produits: [], total: 0 };
  const empreinte = context.empreinteCommande(initiale);

  context.sauvegarderCommandeEnAttente({
    empreinte,
    idCommande: "IG-TEST-2",
    numeroCommande: "2026-002"
  });

  assert.equal(context.lireCommandeEnAttente(context.empreinteCommande(modifiee)), null);
});

test("le nettoyage ne supprime pas une autre commande en attente", () => {
  const { context, storage } = chargerCommande();
  const attente = {
    empreinte: "empreinte-test",
    idCommande: "IG-TEST-3",
    numeroCommande: "2026-003"
  };

  context.sauvegarderCommandeEnAttente(attente);
  context.effacerCommandeEnAttente("IG-AUTRE");

  assert.equal(context.lireCommandeEnAttente("empreinte-test").idCommande, "IG-TEST-3");

  context.effacerCommandeEnAttente("IG-TEST-3");
  assert.equal(storage.size, 0);
  assert.equal(context.lireCommandeEnAttente("empreinte-test"), null);
});

test("le repli mémoire fonctionne si localStorage est indisponible", () => {
  const storage = new Map();
  storage.throwOnRead = true;
  storage.throwOnWrite = true;
  const { context } = chargerCommande(storage);
  const attente = {
    empreinte: "empreinte-memoire",
    idCommande: "IG-MEMOIRE",
    numeroCommande: "2026-004"
  };

  context.sauvegarderCommandeEnAttente(attente);
  assert.equal(context.lireCommandeEnAttente("empreinte-memoire").idCommande, "IG-MEMOIRE");
});

test("le site public ne modifie pas directement la base locale des commandes", () => {
  assert.equal(commandeSource.includes("ajouterCommande("), false);
  assert.match(commandeSource, /envoiConfirme\s*===\s*true/);
  assert.match(commandeSource, /effacerCommandeEnAttente\(commande\.id\)/);
});

test("le panier n'est vidé qu'après confirmation des deux e-mails", () => {
  const blocSucces = commandeSource.match(/if\s*\(envoiOK\)\s*\{([\s\S]*?)\}\s*else\s*\{/);
  assert.ok(blocSucces, "branche de succès de la commande trouvée");
  assert.match(blocSucces[1], /effacerCommandeEnAttente/);
  assert.match(blocSucces[1], /panierCommande\.length\s*=\s*0/);
  assert.match(commandeSource, /resultatEmail\.envoiConfirme\s*===\s*true/);
});

test("les tarifs fixes du PDF restent inchangés", () => {
  assert.match(pdfSource, /TARIF_VIANDE_SECHEE_100G\s*=\s*9\s*;/);
  assert.match(pdfSource, /TARIF_LARD_SEC_100G\s*=\s*4\s*;/);
});

test("le suivi d'envoi utilise un identifiant stable et exige les deux statuts envoyés", () => {
  assert.match(pdfSource, /payload\.idCommande/);
  assert.match(pdfSource, /payload\.idEnvoi\s*=\s*idEnvoi/);
  assert.match(pdfSource, /statut\.entreprise\s*===\s*"envoye"/);
  assert.match(pdfSource, /statut\.client\s*===\s*"envoye"/);
  assert.match(pdfSource, /navigator\.sendBeacon/);
  assert.match(pdfSource, /window\.fetch\(URL_SCRIPT_GOOGLE/);
});
