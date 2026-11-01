(function () {
  var card = document.getElementById('card');

  // Background orbs and how strongly each one reacts
  var orbs = [['w1', 2], ['w2', -3], ['w3', 1.5]].map(function (o) {
    return { el: document.getElementById(o[0]), strength: o[1] };
  });

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var targetX = 0, targetY = 0;   // pointer position (-0.5 to 0.5)
  var currentX = 0, currentY = 0; // eased values actually applied
  var active = false;             // is a mouse or finger interacting?
  var frame = null;

  function point(x, y) {
    targetX = (window.innerWidth / 2 - x) / window.innerWidth;
    targetY = (window.innerHeight / 2 - y) / window.innerHeight;
    var rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', (x - rect.left) + 'px');
    card.style.setProperty('--my', (y - rect.top) + 'px');
    active = true;
    start();
  }

  function release() {
    active = false;
    targetX = 0;
    targetY = 0;
    start();
  }

  if (hasMouse) {
    document.addEventListener('mousemove', function (e) { point(e.clientX, e.clientY); });
    document.addEventListener('mouseleave', release);
  } else {
    // Phones and tablets: finger drag
    document.addEventListener('touchstart', function (e) {
      point(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    document.addEventListener('touchmove', function (e) {
      point(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    document.addEventListener('touchend', release);
    document.addEventListener('touchcancel', release);
  }

  function start() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  function update(t) {
    var goalX = targetX, goalY = targetY;

    // Touch devices: slow automatic sway when nobody is touching
    if (!hasMouse && !active) {
      goalX = Math.sin(t / 2000) * 0.35;
      goalY = Math.cos(t / 2500) * 0.35;
      var rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', (rect.width * (0.5 + Math.sin(t / 2200) * 0.35)) + 'px');
      card.style.setProperty('--my', (rect.height * (0.3 + Math.cos(t / 2800) * 0.2)) + 'px');
    }

    // Smooth easing
    currentX += (goalX - currentX) * 0.08;
    currentY += (goalY - currentY) * 0.08;

    // 3D tilt on the card
    card.style.transform =
      'rotateY(' + (currentX * -16) + 'deg) rotateX(' + (currentY * 16) + 'deg)';

    // Parallax on the background orbs
    orbs.forEach(function (o) {
      o.el.style.transform =
        'translate(' + (currentX * o.strength * 120) + 'px,' +
                       (currentY * o.strength * 120) + 'px)';
    });

    // Phones keep animating; computers stop once settled
    var settled = Math.abs(goalX - currentX) < 0.0005 &&
                  Math.abs(goalY - currentY) < 0.0005;
    frame = (!hasMouse || !settled) ? requestAnimationFrame(update) : null;
  }

  if (!hasMouse) start();
})();