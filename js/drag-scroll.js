(function () {
  var container = document.querySelector('[data-scroll-container]');
  if (!container) return;

  var dragging = false;
  var captured = false;
  var activePointerId = null;
  var lastX = 0;
  var multiplier = 3;
  var totalMove = 0;
  var dragThreshold = 6;

  function pushDelta(dx) {
    var lscroll = window.__lscroll;
    if (!lscroll || !lscroll.scroll) return;
    if (typeof lscroll.scroll.updateDelta === 'function') {
      lscroll.scroll.updateDelta({ deltaX: 0, deltaY: dx * multiplier });
      if (!lscroll.scroll.isScrolling) lscroll.scroll.startScrolling();
    } else {
      window.scrollBy(-dx * multiplier, 0);
    }
  }

  function suppressNextClick(e) {
    e.stopPropagation();
    e.preventDefault();
    document.removeEventListener('click', suppressNextClick, true);
  }

  function onPointerDown(e) {
    if (e.pointerType === 'touch') return;
    dragging = true;
    captured = false;
    activePointerId = e.pointerId;
    totalMove = 0;
    lastX = e.clientX;
  }

  function onPointerMove(e) {
    if (!dragging || e.pointerId !== activePointerId) return;
    var dx = e.clientX - lastX;
    lastX = e.clientX;
    totalMove += Math.abs(dx);

    if (!captured && totalMove > dragThreshold) {
      captured = true;
      document.documentElement.classList.add('is-dragging');
      container.setPointerCapture(activePointerId);
    }

    if (captured) pushDelta(dx);
  }

  function onPointerUp(e) {
    if (!dragging || e.pointerId !== activePointerId) return;
    dragging = false;
    document.documentElement.classList.remove('is-dragging');
    if (captured && container.hasPointerCapture(activePointerId)) {
      container.releasePointerCapture(activePointerId);
    }
    if (captured) {
      document.addEventListener('click', suppressNextClick, true);
    }
    captured = false;
    activePointerId = null;
  }

  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerup', onPointerUp);
  container.addEventListener('pointercancel', onPointerUp);
})();
