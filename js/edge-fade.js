(function () {
  var items = document.querySelectorAll('.gallery__item');
  if (!items.length) return;

  var firstItem = items[0];
  var lastItem = items[items.length - 1];

  var left = document.createElement('div');
  left.className = 'edge-fade edge-fade--left';
  left.setAttribute('aria-hidden', 'true');

  var right = document.createElement('div');
  right.className = 'edge-fade edge-fade--right';
  right.setAttribute('aria-hidden', 'true');

  document.body.appendChild(left);
  document.body.appendChild(right);

  var EDGE_THRESHOLD = 40;

  function update() {
    var firstRect = firstItem.getBoundingClientRect();
    var lastRect = lastItem.getBoundingClientRect();

    left.classList.toggle('is-hidden', firstRect.left > -EDGE_THRESHOLD);

    right.classList.toggle('is-hidden', lastRect.right < window.innerWidth + EDGE_THRESHOLD);

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
})();
