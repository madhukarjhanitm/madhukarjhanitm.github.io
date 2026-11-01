(function () {
  var card = document.getElementById('card');

  // strength = reaction to mouse; ax/ay = drift distance in px; sx/sy = drift speed (bigger = slower)
  var orbs = [
    { el: document.getElementById('w1'), strength: 2,   ax: 260, ay: 180, sx: 5200, sy: 6800 },
    { el: document.getElementById('w2'), strength: -3,  ax: 300, ay: 200, sx: 7000, sy: 5600 },
    { el: document.getElementById('w3'), strength: 1.5, ax: 220, ay: 240, sx: 6000, sy: 4800 }
  ];

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var targetX = 0, targetY = 0;   // pointer position (-0.5 to 0.5)
  var currentX = 0, currentY = 0; // eased values
  var active = false;

  function point(x, y) {
    targetX = (window.innerWidth / 2 - x) / window.innerWidth;
    targetY = (window.innerHeight / 2 - y) / window.innerHeight;
    var rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', (x - rect.left) + 'px');
    card.style.setProperty('--my', (y - rect.top) + 'px');
    active = true;
  }
  function release() { active = false; targetX = 0; targetY = 0; }

  if (hasMouse) {
    document.addEventListener('mousemove', function (e) { point(e.clientX, e.clientY); });
    document.addEventListener('mouseleave', release);
  } else {
    document.addEventListener('touchstart', function (e) { point(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    document.addEventListener('touchmove',  function (e) { point(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    document.addEventListener('touchend', release);
    document.addEventListener('touchcancel', release);
  }

  function update(t) {
    var goalX = targetX, goalY = targetY;

    // Phones: the card sways by itself when nobody is touching
    // (raise 0.35 for more movement, lower it for less)
    if (!hasMouse && !active) {
      goalX = Math.sin(t / 2200) * 0.35;
      goalY = Math.cos(t / 2800) * 0.35;
      var rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', (rect.width * (0.5 + Math.sin(t / 2200) * 0.35)) + 'px');
      card.style.setProperty('--my', (rect.height * (0.3 + Math.cos(t / 2800) * 0.2)) + 'px');
    }

    currentX += (goalX - currentX) * 0.08;
    currentY += (goalY - currentY) * 0.08;

    card.style.transform =
      'rotateY(' + (currentX * -16) + 'deg) rotateX(' + (currentY * 16) + 'deg)';

    // Orbs = automatic drift + mouse response
    orbs.forEach(function (o) {
      var driftX = Math.sin(t / o.sx) * o.ax;
      var driftY = Math.cos(t / o.sy) * o.ay;
      o.el.style.transform =
        'translate(' + (driftX + currentX * o.strength * 120) + 'px,' +
                       (driftY + currentY * o.strength * 120) + 'px)';
    });

    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
})();
