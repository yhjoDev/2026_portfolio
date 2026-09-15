(function () {
  var brand = document.querySelector('.site-brand');
  // 첫 번째 .gallery__text가 히어로 타이틀("2026 / Portfolio")이다 — 뒤쪽의
  // 장식용 gallery__text들(Tiffin/Skanky, Deasil/Zetetic)은 대상이 아니다.
  var heroText = document.querySelector('.gallery__text');
  if (!brand || !heroText || typeof gsap === 'undefined') return;

  gsap.set(brand, { opacity: 0 });

  if (typeof IntersectionObserver === 'undefined') {
    // 관찰 API를 못 쓰면 안전하게 그냥 보이는 상태로 둔다.
    gsap.set(brand, { opacity: 1 });
    return;
  }

  var isVisible = null; // 직전에 반영한 상태 — 같은 상태로 중복 트윈하지 않게

  function setBrandVisible(visible) {
    if (isVisible === visible) return;
    isVisible = visible;
    gsap.to(brand, { opacity: visible ? 1 : 0, duration: 0.4, ease: 'power1.out' });
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        // 히어로 타이틀이 화면에 보이는 동안(=맨 처음 화면)에는 브랜드 라벨을
        // 숨기고, 옆으로 스크롤해서 화면에서 완전히 사라지면 나타나게 한다.
        setBrandVisible(!entry.isIntersecting);
      });
    },
    { threshold: 0 }
  );

  observer.observe(heroText);
})();
