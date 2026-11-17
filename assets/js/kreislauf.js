/* Kreislauf (aus der Website 2027): Zwischennutzung → Planung → Verwaltung.
   Der Endzustand steht im CSS; dieses Skript dimmt, zeichnet die Pfeile beim Scrollen
   und hebt die passende Beschriftung hervor. Bei reduzierter Bewegung bleibt alles stehen.
   Richtung gemessen an den Pfeilen der Grafik (nest2027 assets/kreislauf/kreislauf-model.js). */
(function () {
  var ABGANG = [{ station: 'zwischennutzung', pfeil: 2 }, { station: 'planung', pfeil: 3 }, { station: 'verwaltung', pfeil: 1 }];
  var N = ABGANG.length, PFEIL_VON = 0.15, PFEIL_BIS = 0.75, SPITZE_VON = 0.75, BUCH_VON = 0.35, BUCH_BIS = 0.85;
  var klemme = function (w, a, b) { return Math.min(b, Math.max(a, w)); };
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('[data-kreislauf]').forEach(function (block) {
    var buehne = block.querySelector('.kr-buehne'), haft = block.querySelector('.kr-haft');
    var segmente = [].slice.call(block.querySelectorAll('.kr-segment[data-station]'));
    var schaefte = [].slice.call(block.querySelectorAll('.kr-pfeil[data-pfeil]'));
    var spitzen = [].slice.call(block.querySelectorAll('.kr-spitze[data-pfeil]'));
    var caps = [].slice.call(block.querySelectorAll('[data-kreislauf-caption]'));
    if (!buehne || !segmente.length || schaefte.length !== N) return;

    var stelle = {}; ABGANG.forEach(function (a, i) { stelle[a.station] = i; });
    var zaehl = {}, buch = [].slice.call(block.querySelectorAll('.kr-buchstabe[data-station]')).map(function (el) {
      var st = el.getAttribute('data-station'); zaehl[st] = (zaehl[st] || 0) + 1; return { el: el, st: st, pos: zaehl[st] - 1 };
    });
    var pfeile = schaefte.map(function (el) {
      var nr = +el.getAttribute('data-pfeil'), i = ABGANG.findIndex(function (a) { return a.pfeil === nr; });
      try { el.style.setProperty('--kr-len', el.getTotalLength().toFixed(2)); } catch (e) {}
      return { el: el, i: i, spitze: spitzen.filter(function (s) { return +s.getAttribute('data-pfeil') === nr; })[0] };
    });

    function fortschritt() {
      var r = buehne.getBoundingClientRect(), oben = haft ? parseFloat(getComputedStyle(haft).top) || 0 : 0;
      var weg = r.height - (haft ? haft.offsetHeight : 0);
      if (weg < 40) { var vh = innerHeight; return klemme((vh - r.top) / (vh + r.height) * 1.6 - 0.3, 0, 1); }
      return klemme((oben - r.top) / weg, 0, 1);
    }
    var ticking = false;
    function update() {
      ticking = false;
      if (ruhig.matches) { block.classList.remove('kr--animiert'); return; }
      block.classList.add('kr--animiert');
      var roh = fortschritt() * N, idx = Math.min(N - 1, Math.floor(roh)), t = klemme(roh - idx, 0, 1);
      segmente.forEach(function (el) { el.classList.toggle('kr-dran', stelle[el.getAttribute('data-station')] === idx); });
      buch.forEach(function (b) {
        var s = stelle[b.st], an = s < idx || (s === idx && t >= BUCH_VON + (BUCH_BIS - BUCH_VON) * (b.pos / zaehl[b.st]));
        b.el.classList.toggle('kr-dran', an);
      });
      pfeile.forEach(function (p) {
        var stand = p.i < idx ? 1 : p.i > idx ? 0 : klemme((t - PFEIL_VON) / (PFEIL_BIS - PFEIL_VON), 0, 1);
        p.el.style.setProperty('--kr-p', stand.toFixed(3));
        if (p.spitze) p.spitze.classList.toggle('kr-dran', p.i < idx || (p.i === idx && t >= SPITZE_VON));
      });
      caps.forEach(function (c) { c.classList.toggle('kr-cap--aktiv', c.getAttribute('data-station') === ABGANG[idx].station); });
    }
    var anfordern = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener('scroll', anfordern, { passive: true }); addEventListener('resize', anfordern);
    if (ruhig.addEventListener) ruhig.addEventListener('change', anfordern);
    update();
  });
})();
