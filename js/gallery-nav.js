(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('.gallery__item'));
  if (!items.length) return;

  var prevBtn = document.getElementById('galleryNavPrev');
  var nextBtn = document.getElementById('galleryNavNext');
  var homeBtn = document.getElementById('galleryNavHome');
  if (!prevBtn || !nextBtn || !homeBtn) return;

  function itemCenterX(item) {
    var rect = item.getBoundingClientRect();
    return rect.left + rect.width / 2;
  }

  function currentIndex() {
    var viewportCenter = window.innerWidth / 2;
    var closest = 0;
    var closestDist = Infinity;
    items.forEach(function (item, i) {
      var dist = Math.abs(itemCenterX(item) - viewportCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    return closest;
  }

  function isSmoothMode() {
    var lscroll = window.__lscroll;
    return !!(
      lscroll &&
      lscroll.scroll &&
      typeof lscroll.scroll.updateDelta === 'function' &&
      lscroll.scroll.instance
    );
  }

  function forceScrollTo(lscroll, axis, value) {
    lscroll.scroll.instance.scroll[axis] = value;
    lscroll.scroll.instance.delta[axis] = value;
    lscroll.scroll.update();
  }

  function goToSmooth(item) {
    var lscroll = window.__lscroll;
    var axis = lscroll.scroll.directionAxis || 'y';
    var limit = lscroll.scroll.instance.limit[axis];
    var start = lscroll.scroll.instance.scroll[axis];

    var targetCenter = window.innerWidth / 2;
    var x0 = itemCenterX(item);
    if (Math.abs(x0 - targetCenter) < 1) return;

    var probe = 80;
    var probeTarget = Math.max(0, Math.min(start + probe, limit));
    var appliedProbe = probeTarget - start;
    if (Math.abs(appliedProbe) < 1) {
      probeTarget = Math.max(0, Math.min(start - probe, limit));
      appliedProbe = probeTarget - start;
    }
    if (Math.abs(appliedProbe) < 1) return;

    forceScrollTo(lscroll, axis, probeTarget);
    var x1 = itemCenterX(item);
    var scale = (x1 - x0) / appliedProbe;

    var remainingScreen = targetCenter - x1;
    var neededDelta = scale !== 0 ? remainingScreen / scale : 0;
    var finalTarget = Math.max(0, Math.min(probeTarget + neededDelta, limit));

    forceScrollTo(lscroll, axis, start);
    lscroll.scroll.instance.delta[axis] = finalTarget;
    lscroll.scroll.startScrolling();
  }

  function goToNative(item) {
    var targetCenter = window.innerWidth / 2;
    var delta = itemCenterX(item) - targetCenter;
    if (Math.abs(delta) < 1) return;
    window.scrollBy({ left: delta, top: 0, behavior: 'smooth' });
  }

  function goTo(index) {
    index = Math.max(0, Math.min(index, items.length - 1));
    var item = items[index];
    if (isSmoothMode()) {
      goToSmooth(item);
    } else {
      goToNative(item);
    }
  }

  prevBtn.addEventListener('click', function () {
    goTo(currentIndex() - 1);
  });
  nextBtn.addEventListener('click', function () {
    goTo(currentIndex() + 1);
  });
  homeBtn.addEventListener('click', function () {
    goTo(0);
  });

  window.__galleryGoTo = goTo;
})();
