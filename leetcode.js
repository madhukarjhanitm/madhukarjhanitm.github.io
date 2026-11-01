(function () {
  var box = document.getElementById('lc');
  if (!box) return;

  var C = 2 * Math.PI * 44;          // ring length (radius 44)
  var KEY = 'lc-stats-cache';
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };
  var n = function (v) { return +v || 0; };

  function show(d) {
    var e = n(d.easySolved), m = n(d.mediumSolved), h = n(d.hardSolved);
    var t = n(d.totalSolved) || e + m + h;
    if (!t) return;                                   // nothing to show yet
    box.hidden = false;

    // Count-up for the big number
    var el = $('lc-total'), t0 = performance.now();
    (function step(now) {
      var p = calm ? 1 : Math.min(1, (now - t0) / 1200);
      el.textContent = Math.round(t * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(t0);

    // Three coloured arcs in the ring (share of Easy / Medium / Hard)
    var parts = [['lc-se', e], ['lc-sm', m], ['lc-sh', h]];
    var used = parts.filter(function (p) { return p[1] > 0; }).length;
    var gap = used > 1 ? 3 : 0, start = 0;
    parts.forEach(function (p) {
      var seg = $(p[0]), len = p[1] / t * C;
      seg.style.strokeDashoffset = -start;
      requestAnimationFrame(function () {
        seg.style.strokeDasharray = Math.max(0, len - gap) + ' ' + C;
      });
      start += len;
    });

    // Progress bars + numbers per difficulty
    [['e', e, d.totalEasy], ['m', m, d.totalMedium], ['h', h, d.totalHard]].forEach(function (r) {
      var total = n(r[2]);
      $('lc-' + r[0]).textContent = r[1];
      $('lc-' + r[0] + 't').textContent = total ? '/ ' + total : '';
      var pct = total ? Math.max(r[1] ? 3 : 0, r[1] / total * 100) : 0;
      requestAnimationFrame(function () { $('lc-' + r[0] + 'b').style.width = pct + '%'; });
    });
  }

  fetch('stats.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error('no file'); return r.json(); })
    .then(function (d) {
      try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {}
      show(d);
    })
    .catch(function () {
      try { var old = JSON.parse(localStorage.getItem(KEY)); if (old) show(old); } catch (e) {}
    });
})();
