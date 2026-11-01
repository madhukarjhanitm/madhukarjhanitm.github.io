(function () {
  var card = document.getElementById('card');

  // Background orbs and how strongly each one reacts to the mouse
  var orbs = [['w1', 2], ['w2', -3], ['w3', 1.5]].map(function (o) {
    return { el: document.getElementById(o[0]), strength: o[1] };
  });

  // Only run the tilt on devices with a real mouse, and respect reduced motion
  var hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!hasMouse || reduceMotion) return;

  var targetX = 0, targetY = 0;   // where the mouse is (-0.5 to 0.5)
  var currentX = 0, currentY = 0; // eased values actually applied
  var frame = null;

  document.addEventListener('mousemove', function (e) {
    targetX = (window.innerWidth / 2 - e.clientX) / window.innerWidth;
    targetY = (window.innerHeight / 2 - e.clientY) / window.innerHeight;

    // Position of the cursor light inside the card
    var rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
    card.style.setProperty('--my', (e.clientY - rect.top) + 'px');

    if (!frame) frame = requestAnimationFrame(update);
  });

  // Ease everything back to center when the mouse leaves the window
  document.addEventListener('mouseleave', function () {
    targetX = 0;
    targetY = 0;
    if (!frame) frame = requestAnimationFrame(update);
  });

  function update() {
    // Smooth easing toward the target
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    // 3D tilt on the card
    card.style.transform =
      'rotateY(' + (currentX * -16) + 'deg) rotateX(' + (currentY * 16) + 'deg)';

    // Parallax on the background orbs
    orbs.forEach(function (o) {
      o.el.style.transform =
        'translate(' + (currentX * o.strength * 120) + 'px,' +
                       (currentY * o.strength * 120) + 'px)';
    });

    // Keep animating until we've settled on the target
    var settled = Math.abs(targetX - currentX) < 0.0005 &&
                  Math.abs(targetY - currentY) < 0.0005;
    frame = settled ? null : requestAnimationFrame(update);
  }
})();
