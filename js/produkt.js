/* Zapi! – Produktseite: Bildfenster an den Zutaten-Medaillons der Zeichnung; die Verbindungslinie zum Produkt wird dabei hervorgehoben.
   Maus: Mouseover öffnet, Verlassen schließt sofort.
   Tastatur: Fokus auf das Medaillon öffnet, Escape oder Weitertabben schließt.
   Touch: Antippen öffnet (mit ✕), Antippen daneben oder ✕ schließt.
   Ohne JavaScript bleiben Medaillons und Fenster aus; alle Infos stehen als Text in der Zutatenliste. */
(function () {
  "use strict";

  var buehne = document.querySelector(".produkt-raster");
  if (!buehne) return;
  document.documentElement.classList.add("js-zutaten"); // CSS zeigt Medaillon-Schaltflächen erst mit dieser Klasse

  var offen = null;         // gerade gewähltes Medaillon
  var zeiger = "maus";      // zuletzt benutztes Zeigegerät: "maus" oder "touch"

  function fensterVon(knopf) { return document.getElementById(knopf.getAttribute("aria-controls")); }
  function linieVon(knopf) { return document.getElementById(knopf.id.replace("knopf-", "linie-")); } // Verbindungslinie zum Produkt

  function oeffne(knopf, fest) {
    if (offen && offen !== knopf) schliesse();
    offen = knopf;
    var f = fensterVon(knopf);
    f.classList.add("offen");
    f.classList.toggle("fest", !!fest);
    knopf.setAttribute("aria-expanded", "true");
    var l = linieVon(knopf);
    if (l) l.classList.add("aktiv");
    // Handy/Tablet: Fenster liegt unter der Zeichnung; nach dem Antippen ins Bild holen
    if (fest && window.matchMedia("(max-width: 55.99rem)").matches) {
      var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      f.scrollIntoView({ block: "nearest", behavior: ruhig ? "auto" : "smooth" });
    }
  }

  function schliesse() {
    if (!offen) return;
    var f = fensterVon(offen);
    f.classList.remove("offen", "fest");
    offen.setAttribute("aria-expanded", "false");
    var l = linieVon(offen);
    if (l) l.classList.remove("aktiv");
    offen = null;
  }

  document.addEventListener("pointerdown", function (e) {
    zeiger = e.pointerType === "mouse" ? "maus" : "touch";
  }, true);

  Array.prototype.forEach.call(buehne.querySelectorAll(".medaillon"), function (knopf) {
    knopf.addEventListener("mouseenter", function () {
      if (zeiger === "maus") oeffne(knopf, false);
    });
    knopf.addEventListener("mouseleave", function () {
      if (zeiger === "maus" && offen === knopf && !fensterVon(knopf).classList.contains("fest")) schliesse(); // sofort zu
    });
    knopf.addEventListener("focus", function () {
      if (knopf.matches(":focus-visible")) oeffne(knopf, false); // nur Tastaturfokus, nicht Mausklick
    });
    knopf.addEventListener("blur", function () {
      if (offen === knopf && zeiger !== "touch") schliesse();
    });
    knopf.addEventListener("click", function () {
      if (zeiger === "touch") {
        if (offen === knopf) schliesse();
        else oeffne(knopf, true);
      } else if (offen !== knopf) {
        oeffne(knopf, false); // Enter/Leertaste ohne vorherigen Fokus-Effekt
      }
    });
    fensterVon(knopf).querySelector(".zu").addEventListener("click", function () {
      var k = offen;
      schliesse();
      if (k) k.focus({ preventScroll: true });
    });
  });

  // Escape schließt, Fokus bleibt auf dem Medaillon
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && offen) schliesse();
  });

  // Antippen daneben schließt
  document.addEventListener("click", function (e) {
    if (offen && !offen.contains(e.target) && !fensterVon(offen).contains(e.target)) schliesse();
  });
})();
