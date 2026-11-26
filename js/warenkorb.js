/* Zapi! – Warenkorb im Browser (Demo, keine echte Bestellung).
   - Liegt im lokalen Speicher (localStorage) und übersteht Seitenwechsel, Neuladen und Schließen.
   - Gespeichert wird erst beim ersten Hinzufügen und nur die Artikel (Kennung, Name, Preis in Cent, Art, Menge);
     keine persönlichen Daten. Ist der Warenkorb leer, wird der Eintrag gelöscht.
   - Gerechnet wird in Cent (ganze Zahlen), angezeigt deutsch, z. B. „5,90 €“.
   - Name und Preis stehen fest im HTML am Knopf „In den Warenkorb“ (data-Attribute).
   Ohne JavaScript zeigt „In den Warenkorb“ weiter nur die Demo-Bestätigung. */
(function () {
  "use strict";

  var SCHLUESSEL = "zapi-warenkorb";
  var MAX_MENGE = 10;
  var geld = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
  function euro(cent) { return geld.format(cent / 100); }

  /* ---------- Speicher ---------- */
  function lies() {
    try {
      var daten = JSON.parse(localStorage.getItem(SCHLUESSEL) || "[]");
      return Array.isArray(daten) ? daten.filter(function (a) {
        return a && typeof a.id === "string" && Number.isInteger(a.cent) && Number.isInteger(a.menge) && a.menge > 0;
      }) : [];
    } catch (e) { return []; } // Speicher gesperrt oder Inhalt kaputt: leerer Warenkorb
  }
  function schreib(artikel) {
    try {
      if (artikel.length) localStorage.setItem(SCHLUESSEL, JSON.stringify(artikel));
      else localStorage.removeItem(SCHLUESSEL); // leer: nichts mehr gespeichert
    } catch (e) { /* z. B. privater Modus ohne Speicher: Warenkorb gilt dann nur bis zum Neuladen */ }
  }
  function anzahl(artikel) { return artikel.reduce(function (s, a) { return s + a.menge; }, 0); }
  function summe(artikel) { return artikel.reduce(function (s, a) { return s + a.cent * a.menge; }, 0); }

  /* ---------- Zähler im Kopf (alle Seiten) ---------- */
  function zeigeZaehler() {
    var n = anzahl(lies());
    document.querySelectorAll(".wk-zahl").forEach(function (el) { el.textContent = String(n); });
    document.querySelectorAll(".warenkorb, .warenkorb-mini").forEach(function (el) {
      el.setAttribute("aria-label", "Warenkorb, " + n + " Artikel");
    });
  }

  /* ---------- Meldung: sichtbar und für Screenreader (role="status" steht schon beim Laden in der Seite) ---------- */
  var meldung = document.querySelector(".wk-meldung"), meldungZeit = null;
  function melde(text) {
    if (!meldung) return;
    meldung.textContent = "";           // leeren, damit dieselbe Meldung erneut angesagt wird
    setTimeout(function () {
      meldung.textContent = text;
      meldung.classList.add("sichtbar");
      clearTimeout(meldungZeit);
      meldungZeit = setTimeout(function () { meldung.classList.remove("sichtbar"); }, 4000);
    }, 50);
  }

  /* ---------- Hinzufügen (Startseite und Produktseiten) ---------- */
  function fuegeHinzu(knopf) {
    var id = knopf.dataset.id, cent = parseInt(knopf.dataset.cent, 10);
    if (!id || !Number.isInteger(cent)) return;
    var artikel = lies();
    var vorhanden = artikel.find(function (a) { return a.id === id; });
    if (vorhanden) {
      if (vorhanden.menge >= MAX_MENGE) { melde("Mehr als " + MAX_MENGE + " Stück " + vorhanden.name + " gehen nicht in den Warenkorb."); return; }
      vorhanden.menge++;
    } else {
      artikel.push({ id: id, name: knopf.dataset.name, cent: cent, art: knopf.dataset.art === "versand" ? "versand" : "abholung", menge: 1 });
    }
    schreib(artikel);
    zeigeZaehler();
    var n = anzahl(artikel);
    melde(knopf.dataset.name + " liegt im Warenkorb. Insgesamt " + n + " Artikel.");
  }
  document.addEventListener("click", function (e) {
    var knopf = e.target.closest(".in-warenkorb");
    if (!knopf) return;
    e.preventDefault(); // statt der Demo-Bestätigung ohne JavaScript
    fuegeHinzu(knopf);
  });

  /* ---------- Warenkorb-Seite ---------- */
  var inhalt = document.querySelector(".wk-inhalt");

  function zeigeWarenkorb() {
    if (!inhalt) return;
    var artikel = lies();
    inhalt.setAttribute("aria-busy", "false");
    if (!artikel.length) {
      inhalt.innerHTML = '<div class="wk-leer"><p>Dein Warenkorb ist leer. Hunger?</p>' +
        '<a class="button gross" href="index.html#produkte">Zu den Zapis</a></div>';
      return;
    }
    var versand = artikel.some(function (a) { return a.art === "versand"; });
    var zeilen = artikel.map(function (a) {
      var hinweis = a.art === "versand" ? "Lieferung gekühlt, inkl. MwSt., zzgl. Versand" : "Abholung am Automaten, inkl. MwSt.";
      return '<li class="wk-zeile" data-id="' + a.id + '">' +
        '<div class="wk-name"><a href="produkte/' + a.id + '.html">' + text(a.name) + '</a>' +
          '<span class="klein">' + euro(a.cent) + ' je Stück · ' + hinweis + '</span></div>' +
        '<div class="wk-menge" role="group" aria-label="Menge ' + text(a.name) + '">' +
          '<button type="button" class="wk-knopf" data-aktion="minus" aria-label="Menge von ' + text(a.name) + ' verringern"' + (a.menge <= 1 ? " disabled" : "") + '>−</button>' +
          '<span class="wk-zahl-zeile" aria-live="off">' + a.menge + '</span>' +
          '<button type="button" class="wk-knopf" data-aktion="plus" aria-label="Menge von ' + text(a.name) + ' erhöhen"' + (a.menge >= MAX_MENGE ? " disabled" : "") + '>+</button>' +
        '</div>' +
        '<p class="wk-zeilensumme">' + euro(a.cent * a.menge) + '</p>' +
        '<button type="button" class="wk-entfernen" data-aktion="entfernen" aria-label="' + text(a.name) + ' entfernen">Entfernen</button>' +
        '</li>';
    }).join("");
    inhalt.innerHTML =
      '<ul class="wk-liste">' + zeilen + '</ul>' +
      '<div class="wk-summe">' +
        '<p><span>Summe</span> <strong>' + euro(summe(artikel)) + '</strong></p>' +
        '<p class="hinweis">' + (versand ? "inkl. MwSt., zzgl. Versand (Versandkosten: Demo, noch offen)" : "inkl. MwSt., Abholung am Automaten, keine Versandkosten") + '</p>' +
        '<button type="button" class="button gross" data-aktion="bestellen">Demo-Bestellung absenden</button>' +
        '<p class="klein">Das ist nur eine Demo: Es wird nichts bestellt und nichts bezahlt.</p>' +
        '<p><a href="index.html#produkte">Weiter einkaufen</a></p>' +
      '</div>';
  }
  function text(s) { var d = document.createElement("span"); d.textContent = s; return d.innerHTML; } // Namen sicher einsetzen

  if (inhalt) {
    inhalt.addEventListener("click", function (e) {
      var k = e.target.closest("[data-aktion]");
      if (!k) return;
      var aktion = k.dataset.aktion;
      var artikel = lies();
      if (aktion === "bestellen") {
        schreib([]);
        zeigeZaehler();
        zeigeWarenkorb();
        location.hash = "bestaetigung"; // Bestätigung anzeigen (:target)
        var dialog = document.getElementById("bestaetigung");
        if (dialog) dialog.focus();
        melde("Demo-Bestellung abgeschickt. Dein Warenkorb ist leer.");
        return;
      }
      var zeile = k.closest(".wk-zeile"), id = zeile && zeile.dataset.id;
      var a = artikel.find(function (x) { return x.id === id; });
      if (!a) return;
      var meldungText = "";
      if (aktion === "plus" && a.menge < MAX_MENGE) { a.menge++; meldungText = a.name + ": " + a.menge + " Stück."; }
      if (aktion === "minus" && a.menge > 1) { a.menge--; meldungText = a.name + ": " + a.menge + " Stück."; }
      if (aktion === "entfernen") { artikel = artikel.filter(function (x) { return x.id !== id; }); meldungText = a.name + " entfernt."; }
      schreib(artikel);
      zeigeZaehler();
      zeigeWarenkorb();
      melde(meldungText + " Summe " + euro(summe(artikel)) + ".");
      // Fokus an sinnvoller Stelle halten, damit Tastaturnutzer nicht am Seitenanfang landen
      var gleicherKnopf = inhalt.querySelector('.wk-zeile[data-id="' + id + '"] [data-aktion="' + aktion + '"]:not([disabled])');
      (gleicherKnopf || inhalt.querySelector('[data-aktion], .wk-leer a')).focus();
    });
  }

  /* ---------- Aktuell halten: Laden, Zurück-Taste (bfcache), anderer Tab ---------- */
  function aktualisiere() { zeigeZaehler(); zeigeWarenkorb(); }
  aktualisiere();
  window.addEventListener("pageshow", aktualisiere);
  window.addEventListener("storage", function (e) { if (e.key === SCHLUESSEL || e.key === null) aktualisiere(); });
})();
