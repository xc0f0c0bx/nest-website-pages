/* Entwurf 6: Methodik-Leiste, Maßstab-Balken, Presse-Filter mit Jahresleiste, Projektindex-Filter. */
(function () {
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Methodik: welcher der vier Schritte ist gerade dran? Große Ziffer schwarz, Leiste füllt sich.
  var weg = document.getElementById('weg'), leiste = document.querySelector('.e6-leiste');
  if (weg && leiste) {
    var schritte = [].slice.call(weg.children), nr = leiste.querySelector('.e6-leiste__nr');
    var buehne = document.querySelector('.e6-schritte'), haft = document.querySelector('.e6-schritte__haft');
    var setze = function () {
      var akt = -1, n = schritte.length;
      if (haft && getComputedStyle(haft).position === 'sticky') {
        // Reihe klebt: der Laufweg der Bühne verteilt sich gleichmäßig auf die Schritte
        var r = buehne.getBoundingClientRect(), oben = parseFloat(getComputedStyle(haft).top) || 0;
        var weg_ = r.height - haft.offsetHeight, t = (oben - r.top) / weg_;
        akt = r.top > innerHeight * 0.6 ? -1 : Math.max(0, Math.min(n - 1, Math.floor(t * n)));
      } else {
        // untereinander: der Schritt, der die Fenstermitte überschritten hat
        var mitte = innerHeight * 0.55;
        schritte.forEach(function (li, i) { if (li.getBoundingClientRect().top < mitte) akt = i; });
      }
      schritte.forEach(function (li, i) { li.classList.toggle('e6-aktiv', i === akt); });
      leiste.style.setProperty('--e6p', akt < 0 ? 0 : (akt + 1) / schritte.length);
      nr.textContent = (akt < 0 ? '00' : ('0' + (akt + 1))) + ' / 0' + schritte.length;
    };
    addEventListener('scroll', setze, { passive: true }); addEventListener('resize', setze); setze();
  }

  // Maßstab: Balken wachsen, sobald sie zu sehen sind
  var balken = [].slice.call(document.querySelectorAll('.e6-skala li'));
  if (balken.length) {
    if (ruhig || !('IntersectionObserver' in window)) balken.forEach(function (li) { li.classList.add('e6-an'); });
    else { var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('e6-an'); io.unobserve(e.target); } }); }, { threshold: 0.4 });
      balken.forEach(function (li) { io.observe(li); }); }
  }

  // Presse: Filter nach Art, Jahresleiste zeigt das aktuelle Jahr
  var pf = [].slice.call(document.querySelectorAll('[data-filter]'));
  if (pf.length) {
    var jahre = [].slice.call(document.querySelectorAll('.e6-jahr')), links = [].slice.call(document.querySelectorAll('.e6-jahresleiste a'));
    var filtern = function (k) {
      pf.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.filter === k)); });
      jahre.forEach(function (j) {
        var sicht = 0;
        [].forEach.call(j.querySelectorAll('.e6-eintrag'), function (e) { var an = k === 'alle' || e.dataset.kat === k; e.hidden = !an; if (an) sicht++; });
        j.hidden = !sicht;
        links.forEach(function (a) { if (a.dataset.jahr === j.dataset.jahr) a.classList.toggle('leer', !sicht); });
      });
    };
    pf.forEach(function (b) { b.addEventListener('click', function () { filtern(b.dataset.filter); }); });
    var markiere = function () {
      var akt = null;
      jahre.forEach(function (j) { if (!j.hidden && j.getBoundingClientRect().top < innerHeight * 0.35) akt = j.dataset.jahr; });
      links.forEach(function (a) { a.classList.toggle('aktiv', a.dataset.jahr === akt); });
    };
    addEventListener('scroll', markiere, { passive: true }); markiere();
  }

  // Projektindex: Filter nach Maßstab, auch über ?stufe=S
  var sf = [].slice.call(document.querySelectorAll('[data-stufe-filter]'));
  if (sf.length) {
    var zeilen = [].slice.call(document.querySelectorAll('.e6-index__z')), leer = document.querySelector('[data-leer]');
    var stufe = function (k) {
      var n = 0;
      sf.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.stufeFilter === k)); });
      zeilen.forEach(function (z) { var an = k === 'alle' || z.dataset.stufe === k; z.hidden = !an; if (an) n++; });
      if (leer) leer.hidden = n > 0;
    };
    sf.forEach(function (b) { b.addEventListener('click', function () { stufe(b.dataset.stufeFilter); history.replaceState(null, '', b.dataset.stufeFilter === 'alle' ? location.pathname : '?stufe=' + b.dataset.stufeFilter); }); });
    var q = new URLSearchParams(location.search).get('stufe');
    if (q && sf.some(function (b) { return b.dataset.stufeFilter === q; })) stufe(q);
  }
})();
