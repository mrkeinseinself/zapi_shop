/* Zapi! – Startseite: Handy-Menü und Weihnachtsoutfit.
   Ohne JavaScript funktioniert die Seite weiter: Navigation bleibt offen, keine Deko. */
(function () {
  "use strict";

  var html = document.documentElement;
  // Basis für Bildpfade aus der eigenen Einbindung ableiten: "js/app.js" -> "", "../js/app.js" -> "../"
  // So klappen die Pfade auf der Startseite und auf Unterseiten wie produkte/…; im Code bleiben sie relativ.
  var eigenesSkript = document.currentScript && document.currentScript.getAttribute("src");
  var basis = eigenesSkript ? eigenesSkript.replace(/js\/app\.js(\?.*)?$/, "") : "";
  html.classList.add("js"); // CSS klappt das Menü auf schmalen Bildschirmen erst mit dieser Klasse zu

  /* ===== Handy-Menü ===== */
  var kopf = document.querySelector(".kopf");
  var knopf = document.querySelector(".menue-knopf");
  var menue = document.getElementById("menue");

  function setzeMenue(offen) {
    kopf.classList.toggle("offen", offen);
    knopf.setAttribute("aria-expanded", offen ? "true" : "false");
  }

  if (kopf && knopf && menue) {
    knopf.addEventListener("click", function () {
      setzeMenue(knopf.getAttribute("aria-expanded") !== "true");
    });
    // Link im Menü gewählt: Menü schließen
    menue.addEventListener("click", function (e) {
      if (e.target.closest("a")) setzeMenue(false);
    });
    // Escape schließt und setzt den Fokus zurück auf den Knopf
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && kopf.classList.contains("offen")) {
        setzeMenue(false);
        knopf.focus();
      }
    });
  }

  /* ===== Aktiver Menüpunkt auf der Startseite: der Abschnitt, der gerade im Bild ist ===== */
  var abschnittsLinks = document.querySelectorAll('.kopf nav a[href^="#"]');
  if (abschnittsLinks.length && "IntersectionObserver" in window) {
    var linkZu = {};
    abschnittsLinks.forEach(function (a) { linkZu[a.getAttribute("href").slice(1)] = a; });
    var beobachter = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (!e.isIntersecting || !linkZu[e.target.id]) return;
        abschnittsLinks.forEach(function (a) { a.removeAttribute("aria-current"); });
        linkZu[e.target.id].setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" }); // zählt der Abschnitt in der Mitte des Bildschirms
    Object.keys(linkZu).forEach(function (id) { var el = document.getElementById(id); if (el) beobachter.observe(el); });
  }

  /* ===== Weihnachtsoutfit: 24.11. bis einschließlich 28.12. ===== */
  function istWeihnachtszeit(datum) {
    var monat = datum.getMonth() + 1; // 1–12
    var tag = datum.getDate();
    return (monat === 11 && tag >= 24) || (monat === 12 && tag <= 28);
  }

  if (!istWeihnachtszeit(new Date()) || !kopf) return;

  html.classList.add("weihnachten");

  // Kugeln hängen unten am Kopfbereich
  var kugeln = document.createElement("div");
  kugeln.className = "kugeln";
  kugeln.setAttribute("aria-hidden", "true");
  kopf.appendChild(kugeln);

  // Schneeriesel: kleine Flocken mit zufälliger Position, Größe und Geschwindigkeit
  var schnee = document.createElement("div");
  schnee.className = "schnee";
  schnee.setAttribute("aria-hidden", "true");
  var flockenZahl = window.innerWidth < 768 ? 16 : 26; // weniger Flocken: jede kostet Rechenzeit in jedem Bild
  for (var i = 0; i < flockenZahl; i++) {
    var flocke = document.createElement("span");
    flocke.className = "flocke";
    flocke.style.setProperty("--x", (Math.random() * 100).toFixed(1) + "vw");
    flocke.style.setProperty("--s", (3 + Math.random() * 4).toFixed(1) + "px");
    flocke.style.setProperty("--t", (8 + Math.random() * 10).toFixed(1) + "s");
    flocke.style.setProperty("--d", (-Math.random() * 18).toFixed(1) + "s"); // negativ: Schnee ist sofort überall
    schnee.appendChild(flocke);
  }
  document.body.appendChild(schnee);

  // Bunter Baum unten links (Platz je Bildschirm regelt style.css)
  var baum = document.createElement("div");
  baum.className = "baum";
  baum.setAttribute("aria-hidden", "true");
  var bild = document.createElement("img");
  bild.src = basis + "img/baum.svg";
  bild.alt = ""; // Deko, für Screenreader ohne Inhalt
  baum.appendChild(bild);
  (document.querySelector(".fuss") || document.body).appendChild(baum); // Handy: im Fußbereich, Desktop: fest unten links

  /* ===== Weihnachtsmann mit Schlitten =====
     Fährt oben (unterhalb der Kugeln) von links nach rechts aus dem Bild, dann unten von rechts nach links, und wieder von vorn.
     Oben wirft er ab und zu einen Mini-Zapi aus seinen Paketen auf eine Kugel; der fällt später unten aus dem Bild.
     Bei „Bewegung reduzieren“ steht der Schlitten still im Fußbereich. Sonst gibt es den Knopf „Deko anhalten“ (WCAG 2.2.2). */
  var schlitten = document.createElement("div");
  schlitten.className = "schlitten";
  schlitten.setAttribute("aria-hidden", "true");
  var sBild = document.createElement("img");
  sBild.src = basis + "img/schlitten.svg";
  sBild.alt = "";
  schlitten.appendChild(sBild);
  // SVG direkt in die Seite einsetzen: nur so lassen sich Beine, Winken usw. mit „Deko anhalten“ pausieren.
  // Klappt das Laden nicht (z. B. Seite als Datei geöffnet), bleibt das <img> stehen.
  if (window.fetch) {
    fetch(basis + "img/schlitten.svg")
      .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
      .then(function (text) {
        var huelle = document.createElement("div");
        huelle.innerHTML = text;
        var svgEl = huelle.querySelector("svg");
        if (svgEl) { svgEl.setAttribute("focusable", "false"); schlitten.replaceChild(svgEl, sBild); }
      })
      .catch(function () {});
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    schlitten.classList.add("schlitten-still");
    (document.querySelector(".fuss") || document.body).appendChild(schlitten);
    return;
  }
  // Eigene fixierte Ebene mit overflow: hidden, damit der Schlitten außerhalb des Bildes keine Scrollleiste erzeugt
  var dekoEbene = document.createElement("div");
  dekoEbene.className = "deko-ebene";
  dekoEbene.setAttribute("aria-hidden", "true");
  dekoEbene.appendChild(schlitten);
  document.body.appendChild(dekoEbene);

  // Kufenspuren: durchsichtige Zeichenfläche über dem Inhalt (unter Kopfbereich und Schlitten).
  // Gezeichnet wird nur, wo der Hintergrund Teig-Creme ist („Schnee“). Blass und multipliziert,
  // damit Text darüber lesbar bleibt; jede Spur verblasst nach 6 Sekunden.
  var spurFlaeche = document.createElement("canvas");
  spurFlaeche.className = "spuren";
  spurFlaeche.setAttribute("aria-hidden", "true");
  document.body.insertBefore(spurFlaeche, document.body.firstChild);
  var stift = spurFlaeche.getContext("2d");
  var spur = [], tritte = [], letzterTritt = null, trittNr = 0, SPUR_DAUER = 6000, uhr = 0;
  function flaechenGroesse() {
    var d = window.devicePixelRatio || 1;
    spurFlaeche.width = Math.round(window.innerWidth * d);
    spurFlaeche.height = Math.round(window.innerHeight * d);
    stift.setTransform(d, 0, 0, d, 0, 0);
    spur = []; tritte = [];
  }
  flaechenGroesse();
  window.addEventListener("resize", flaechenGroesse);

  // „Liegt hier Schnee?“ ohne den Browser in jedem Bild zu befragen: Einmal (und nach Scrollen, Größenänderung
  // oder Klick) werden die Flächen der Seite gesammelt; danach ist die Prüfung reine Rechnerei.
  // Vorher erzwang jede Prüfung per elementFromPoint eine Neuberechnung von Stil und Layout (~3 ms) – das ruckelte.
  var flaechen = null, sammelZeit = null;
  function sammleFlaechen() {
    flaechen = [];
    var alle = document.body.getElementsByTagName("*");
    for (var i = 0; i < alle.length; i++) {
      var el = alle[i];
      if (el.closest(".deko-ebene, .schnee, .spuren, .kugeln, .baum, .meldung")) continue;
      var hart = /^(IMG|SVG|CANVAS|BUTTON|A)$/i.test(el.tagName); // darauf nie Spuren
      var bg = hart ? "" : getComputedStyle(el).backgroundColor;
      if (!hart && (bg === "transparent" || bg === "rgba(0, 0, 0, 0)")) continue;
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height || r.bottom < 0 || r.top > window.innerHeight) continue;
      flaechen.push({ l: r.left, t: r.top, r: r.right, b: r.bottom, schnee: !hart && bg === "rgb(255, 248, 238)" });
    }
  }
  function flaechenVeraltet() { flaechen = null; clearTimeout(sammelZeit); sammelZeit = setTimeout(sammleFlaechen, 150); }
  window.addEventListener("scroll", flaechenVeraltet, { passive: true });
  window.addEventListener("resize", flaechenVeraltet);
  document.addEventListener("click", flaechenVeraltet);
  function aufSchnee(px, py) {
    if (!flaechen) return false; // während des Scrollens keine Spuren
    for (var i = flaechen.length - 1; i >= 0; i--) { // spätere Elemente liegen oben
      var f = flaechen[i];
      if (px >= f.l && px < f.r && py >= f.t && py < f.b) return f.schnee;
    }
    return true; // Seitenhintergrund ist Teig-Creme
  }
  setTimeout(sammleFlaechen, 300);

  function zeichneSpuren(x, y, richtung, b, h) {
    // Hinteres Ende der Kufe im Schlittenbild (x 6/260, y 73/100), passend zur Fahrtrichtung gedreht
    var u = (6 / 260 - 0.5) * b, v = (73 / 100 - 0.5) * h, px, py;
    if (richtung === "r") { px = u; py = v; }
    else { px = -u; py = v; } // nach links: Bild gespiegelt
    var letzter = spur[spur.length - 1];
    var neu = { x: x + px, y: y + py, t: uhr, r: richtung };
    if (!letzter || Math.abs(letzter.x - neu.x) + Math.abs(letzter.y - neu.y) > 3) {
      neu.schnee = aufSchnee(neu.x, neu.y);
      spur.push(neu);
    }
    while (spur.length && uhr - spur[0].t > SPUR_DAUER) spur.shift();

    // Hufabdrücke: etwa alle 18 px ein Paar Abdrücke unter jedem Rentier (Lage der Hufe im Schlittenbild)
    if (letzterTritt === null || Math.abs(x - letzterTritt) > 18) {
      letzterTritt = x; trittNr++;
      var RENTIERE = [[158 / 260, 89 / 100], [202 / 260, 80 / 100]];
      for (var r = 0; r < RENTIERE.length; r++) {
        var hx = (RENTIERE[r][0] - 0.5) * b + (trittNr % 2 ? -5 : 5);
        var hy = (RENTIERE[r][1] - 0.5) * h + (trittNr % 2 ? -2.5 : 2.5);
        var tx = x + (richtung === "r" ? hx : -hx), ty = y + hy;
        if (aufSchnee(tx, ty)) tritte.push({ x: tx, y: ty, t: uhr });
      }
    }
    while (tritte.length && uhr - tritte[0].t > SPUR_DAUER) tritte.shift();

    stift.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (var j = 0; j < tritte.length; j++) { // gespaltener Huf: zwei kleine Ovale
      var tr = tritte[j];
      stift.fillStyle = "rgba(110, 120, 140, " + (0.32 * (1 - (uhr - tr.t) / SPUR_DAUER)).toFixed(3) + ")";
      stift.beginPath();
      stift.ellipse(tr.x - 1.4, tr.y, 1.2, 2, 0, 0, Math.PI * 2);
      stift.moveTo(tr.x + 2.6, tr.y);
      stift.ellipse(tr.x + 1.4, tr.y, 1.2, 2, 0, 0, Math.PI * 2);
      stift.fill();
    }
    stift.lineWidth = 1.6;
    stift.lineCap = "round";
    for (var i = 1; i < spur.length; i++) {
      var a = spur[i - 1], c = spur[i];
      if (!a.schnee || !c.schnee || a.r !== c.r || Math.abs(a.x - c.x) + Math.abs(a.y - c.y) > 24) continue;
      stift.strokeStyle = "rgba(110, 120, 140, " + (0.3 * (1 - (uhr - c.t) / SPUR_DAUER)).toFixed(3) + ")";
      for (var seite = -1; seite <= 1; seite += 2) { // zwei Kufen nebeneinander
        var ox = 0, oy = seite * 3;
        stift.beginPath();
        stift.moveTo(a.x + ox, a.y + oy);
        stift.lineTo(c.x + ox, c.y + oy);
        stift.stroke();
      }
    }
  }

  // Zwei Knöpfe in einem Feld („Deko anhalten“, „Deko entfernen“), zusammen so groß wie früher der eine.
  // Stehen im Code direkt hinter „Zum Inhalt springen“, damit sie per Tab früh erreichbar sind.
  function dekoKnopf(zeile2) {
    var k = document.createElement("button");
    k.type = "button";
    k.className = "deko-knopf";
    k.innerHTML = "<span>Deko</span> <span></span>"; // zweizeilig, damit beide nebeneinander in das alte Maß passen
    k.lastChild.textContent = zeile2;
    return k;
  }
  var dekoFeld = document.createElement("div");
  dekoFeld.className = "deko-knoepfe";
  dekoFeld.setAttribute("role", "group");
  dekoFeld.setAttribute("aria-label", "Weihnachtsdeko");
  var pauseKnopf = dekoKnopf("anhalten");
  var entfernenKnopf = dekoKnopf("entfernen");
  dekoFeld.appendChild(pauseKnopf);
  dekoFeld.appendChild(entfernenKnopf);
  var springen = document.querySelector(".springen");
  if (springen) springen.insertAdjacentElement("afterend", dekoFeld);
  else document.body.insertBefore(dekoFeld, document.body.firstChild);

  var KUGELN = [[20, 19], [60, 31], [100, 15], [140, 25]]; // Mitte x und Oberkante y je Kugel, Muster wiederholt sich alle 160 px (img/kugeln.svg)
  var pausiert = false, entfernt = false, zuletzt = null, weg = 0, naechsterWurf = 0;
  var belegt = {}, anzahlAufKugeln = 0, animationen = [], kugelnOben = 0;
  var fallEbene = document.createElement("div"); // fest stehende Ebene nur für fallende Mini-Zapis
  fallEbene.className = "fall-ebene";
  fallEbene.setAttribute("aria-hidden", "true");
  document.body.appendChild(fallEbene);

  function merke(anim) {
    animationen.push(anim);
    anim.addEventListener("finish", function () { animationen.splice(animationen.indexOf(anim), 1); });
    if (pausiert) anim.pause();
    return anim;
  }

  pauseKnopf.addEventListener("click", function () {
    pausiert = !pausiert;
    html.classList.toggle("deko-pause", pausiert);
    pauseKnopf.lastChild.textContent = pausiert ? "weiter" : "anhalten";    animationen.forEach(function (a) { if (pausiert) a.pause(); else a.play(); });
    if (!pausiert) { zuletzt = null; requestAnimationFrame(schritt); }
  });

  // „Deko entfernen“: aller Weihnachtsschmuck verschwindet (Kugeln, Schlitten mit Rentieren, Spuren, Schnee,
  // Mini-Zapis, Baum), dazu die Knöpfe selbst. Gilt bis zum nächsten Laden der Seite.
  entfernenKnopf.addEventListener("click", function () {
    entfernt = true; pausiert = true;
    clearTimeout(neuBauen); clearTimeout(sammelZeit);
    animationen.slice().forEach(function (a) { a.cancel(); });
    window.removeEventListener("resize", flaechenGroesse);
    window.removeEventListener("resize", flaechenVeraltet);
    window.removeEventListener("scroll", flaechenVeraltet);
    document.removeEventListener("click", flaechenVeraltet);
    window.removeEventListener("resize", spaeterNeuBauen);
    window.removeEventListener("scroll", kugelnScroll);
    [kugeln, schnee, baum, dekoEbene, spurFlaeche, fallEbene, dekoFeld].forEach(function (el) { el.remove(); });
    html.classList.remove("weihnachten", "deko-pause");
    var inhalt = document.getElementById("inhalt"); // Fokus nicht im Nichts lassen
    if (inhalt) { inhalt.setAttribute("tabindex", "-1"); inhalt.focus({ preventScroll: true }); }
  });

  function wirf(sx, sy, kugelX, kugelOben, k) {
    var zapi = document.createElement("img");
    zapi.src = basis + "img/zapi-mini.svg";
    zapi.alt = "";
    zapi.className = "mini-zapi";
    var zielX = kugelX - 18, zielY = kugelOben - 12; // 36 × 13 px, liegt oben auf der Kugel
    zapi.style.left = zielX + "px";
    zapi.style.top = zielY + "px";
    kugeln.appendChild(zapi);
    var dx = sx - k.left - zielX, dy = sy - k.top - zielY;
    var schluessel = String(kugelX);
    belegt[schluessel] = true; anzahlAufKugeln++;

    // 1. Aus dem Paket hoch auf die Kugel werfen
    merke(zapi.animate([
      { transform: "translate(" + dx + "px," + dy + "px) rotate(-40deg) scale(.5)" },
      { transform: "translate(" + dx * 0.4 + "px," + (Math.min(dy, 0) - 30) + "px) rotate(180deg) scale(.9)", offset: 0.6 },
      { transform: "translate(0,0) rotate(360deg) scale(1)" }
    ], { duration: 900, easing: "ease-out" })).addEventListener("finish", function () {
      // 2. Eine Weile auf der Kugel wackeln
      merke(zapi.animate([
        { transform: "rotate(-5deg)" }, { transform: "rotate(5deg)" }
      ], { duration: 700, iterations: 4 + Math.floor(Math.random() * 6), direction: "alternate", easing: "ease-in-out" })).addEventListener("finish", function () {
        // 3. Herunterfallen und unten aus dem Bild verschwinden
        belegt[schluessel] = false; anzahlAufKugeln--;
        // Zum Fallen in eine eigene, fest stehende Ebene umziehen: Fiel der Zapi innerhalb des klebenden Kopfbereichs,
        // wuchs dessen Ebene bis an den unteren Rand und musste in jedem Bild neu gezeichnet werden – das ruckelte.
        var x0 = parseFloat(zapi.style.left), y0 = kugelnOben + parseFloat(zapi.style.top);
        zapi.style.left = x0 + "px"; zapi.style.top = y0 + "px";
        fallEbene.appendChild(zapi);
        var tiefe = window.innerHeight - y0 + 40;
        var seite = Math.random() < 0.5 ? -1 : 1;
        merke(zapi.animate([
          { transform: "translate(0,0) rotate(0deg)" },
          { transform: "translate(" + seite * 30 + "px," + tiefe + "px) rotate(" + seite * 220 + "deg)" }
        ], { duration: 1600, easing: "cubic-bezier(.5,0,1,1)" })).addEventListener("finish", function () {
          zapi.remove();
        });
      });
    });
  }

  /* Fahrt des Schlittens als Web-Animation: läuft im Compositor des Browsers und bleibt flüssig,
     auch wenn die Seite gerade beschäftigt ist (vorher setzte JavaScript in jedem Bild die Position – das ruckelte).
     Die Schleife unten liest nur noch die Zeit der Animation und zeichnet Spuren und Würfe; sie schreibt nichts ins Layout. */
  var bahn = null, mass = null;
  function miss() { // alle Messungen gesammelt, nur bei Start, Scrollen und Größenänderung
    var k = kugeln.getBoundingClientRect();
    var b = schlitten.offsetWidth, h = schlitten.offsetHeight, rand = 8;
    var links = -b / 2, rechts = window.innerWidth + b / 2; // Start und Ziel jeweils ganz außerhalb des Bildes
    return { k: k, b: b, h: h, links: links, rechts: rechts, breite: rechts - links,
      oben: k.bottom + 6 + h / 2, unten: window.innerHeight - rand - h / 2,
      tempo: window.innerWidth < 768 ? 70 : 110 };
  }
  function baueBahn() {
    var fortschritt = bahn && mass ? (bahn.currentTime % (2 * mass.breite / mass.tempo * 1000)) / (2 * mass.breite / mass.tempo * 1000) : 0;
    if (bahn) { animationen.splice(animationen.indexOf(bahn), 1); bahn.cancel(); }
    mass = miss();
    kugelnOben = mass.k.top;
    if (mass.breite <= 0 || mass.unten <= mass.oben) { bahn = null; schlitten.style.visibility = "hidden"; return; }
    schlitten.style.visibility = "";
    var m = mass, xl = m.links - m.b / 2, xr = m.rechts - m.b / 2, yo = m.oben - m.h / 2, yu = m.unten - m.h / 2;
    var dauer = 2 * m.breite / m.tempo * 1000; // oben hin, unten zurück
    bahn = schlitten.animate([
      { offset: 0,   transform: "translate(" + xl + "px," + yo + "px)" },
      { offset: 0.5, transform: "translate(" + xr + "px," + yo + "px)" },
      { offset: 0.5, transform: "translate(" + xr + "px," + yu + "px) scaleX(-1)" }, // unten nach links: gespiegelt
      { offset: 1,   transform: "translate(" + xl + "px," + yu + "px) scaleX(-1)" }
    ], { duration: dauer, iterations: Infinity, easing: "linear" });
    bahn.currentTime = fortschritt * dauer;
    animationen.push(bahn);
    if (pausiert) bahn.pause();
  }
  var neuBauen = null;
  function spaeterNeuBauen() { clearTimeout(neuBauen); neuBauen = setTimeout(baueBahn, 150); }
  window.addEventListener("resize", spaeterNeuBauen);
  function kugelnScroll() { // Kopfbereich klebt oben: Kugeln wandern nur bis dahin mit
    if (!mass) return;
    var neu = kugeln.getBoundingClientRect();
    kugelnOben = neu.top;
    if (Math.abs(neu.bottom - mass.k.bottom) > 4) spaeterNeuBauen();
  }
  window.addEventListener("scroll", kugelnScroll, { passive: true });
  baueBahn();
  if (window.fetch) setTimeout(function () { if (!entfernt) baueBahn(); }, 1200); // nach dem Einsetzen der Schlitten-SVG stimmt die Höhe

  var bildNr = 0;
  function schritt(jetzt) {
    if (pausiert) return;
    var dt = zuletzt === null ? 0 : Math.min((jetzt - zuletzt) / 1000, 0.1);
    zuletzt = jetzt;
    uhr += dt * 1000; // eigene Uhr: steht bei „Deko anhalten“ still, Spuren frieren mit ein
    if (!bahn || !mass) { requestAnimationFrame(schritt); return; }

    var m = mass, dauer = 2 * m.breite / m.tempo * 1000;
    var weg = ((bahn.currentTime || 0) % dauer) / dauer * 2 * m.breite; // gleiche Lage wie die Animation
    var x, y, richtung;
    if (weg < m.breite) { x = m.links + weg; y = m.oben; richtung = "r"; }
    else { x = m.rechts - (weg - m.breite); y = m.unten; richtung = "l"; }
    if (++bildNr % 2 === 0) zeichneSpuren(x, y, richtung, m.b, m.h); // Spuren mit halber Bildrate reichen

    // Oben unterwegs: ab und zu einen Zapi auf eine freie Kugel kurz vor dem Schlitten legen
    var k = m.k;
    if (richtung === "r" && jetzt >= naechsterWurf && anzahlAufKugeln < (window.innerWidth < 768 ? 2 : 4)) {
      var santaX = x - m.b / 2 + m.b * 0.27, santaY = y - m.h / 2 + m.h * 0.2;
      var muster = Math.floor(k.width / 160);                                     // so viele ganze Muster passen hinein
      var takt = muster > 1 ? 160 + (k.width - muster * 160) / (muster - 1) : 160; // Abstand von Muster zu Muster
      var start = Math.floor((santaX - k.left) / takt) - 1;
      for (var t = Math.max(start, 0); t <= start + 2 && t < muster; t++) {
        for (var i = 0; i < KUGELN.length; i++) {
          var kx = Math.round(t * takt + KUGELN[i][0]), abstand = kx + k.left - santaX;
          if (abstand > 20 && abstand < 60 && kx + k.left + 18 < window.innerWidth && !belegt[String(kx)] && Math.random() < 0.5) {
            wirf(santaX, santaY, kx, KUGELN[i][1], { left: k.left, top: kugelnOben });
            naechsterWurf = jetzt + 1500 + Math.random() * 2500;
            t = start + 3; break;
          }
        }
      }
    }
    requestAnimationFrame(schritt);
  }
  requestAnimationFrame(schritt);
})();
