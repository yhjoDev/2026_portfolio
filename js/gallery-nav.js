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

  // 지금 화면 중앙에 가장 가까운 슬라이드를 "현재 위치"로 간주한다 — 휠/드래그로
  // 임의 위치까지 스크롤해둔 상태에서 버튼을 눌러도 항상 정확한 이웃 슬라이드로
  // 이동하도록, 별도 상태값을 들고 있지 않고 매번 실측한다.
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

  // Locomotive Smooth 모듈은 scroll/delta 값을 바꿔도 다음 애니메이션 프레임에서만
  // 실제 transform을 다시 그린다 — 아래 캘리브레이션에서는 값을 바꾼 즉시
  // getBoundingClientRect()로 결과를 재야 하므로, 공개 update() 메서드를 직접
  // 호출해 그 프레임을 기다리지 않고 동기적으로 화면에 반영시킨다.
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

    // 1) 이 페이지의 실제 스크롤→화면 이동 관계(회전된 레이아웃이라 단순
    //    1:1이 아니다)를 매번 다시 유도하지 않고, 작은 테스트 이동으로
    //    직접 실측한다 — 내부 구현이 뭐든 항상 정확하다.
    var probe = 80;
    var probeTarget = Math.max(0, Math.min(start + probe, limit));
    var appliedProbe = probeTarget - start;
    if (Math.abs(appliedProbe) < 1) {
      probeTarget = Math.max(0, Math.min(start - probe, limit));
      appliedProbe = probeTarget - start;
    }
    if (Math.abs(appliedProbe) < 1) return; // 스크롤 여지가 없음

    forceScrollTo(lscroll, axis, probeTarget);
    var x1 = itemCenterX(item);
    var scale = (x1 - x0) / appliedProbe; // 내부 스크롤 1 단위당 화면 이동 픽셀

    // 2) 실측 비율로 남은 거리를 계산해 최종 목표 스크롤값을 구한다.
    var remainingScreen = targetCenter - x1;
    var neededDelta = scale !== 0 ? remainingScreen / scale : 0;
    var finalTarget = Math.max(0, Math.min(probeTarget + neededDelta, limit));

    // 3) 테스트 이동은 원위치로 되돌리고(사용자 눈에는 안 보임 — 다음
    //    페인트 전에 즉시 되돌려짐), 최종 목표까지는 Locomotive 자체의
    //    부드러운 관성 애니메이션으로 자연스럽게 이동시킨다.
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

  // line-nav.js(좌측 세로 프로젝트 목차)에서 동일한 이동 로직을 재사용할 수 있게 노출.
  window.__galleryGoTo = goTo;
})();
