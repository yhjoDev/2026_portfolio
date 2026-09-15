(function () {
  // shadcn 레지스트리의 ncdai/line-nav(https://chanhdai.com/components/line-nav)를
  // 프레임워크 없는 순수 HTML/CSS/JS로 재구현 — 항목 사이에 장식용 구분선 2개를
  // 넣어 눈금자 같은 리듬을 주고, hover/active 시 선이 24px→40px로 늘어나며
  // 밝아지는 구조를 그대로 따른다.
  var items = Array.prototype.slice.call(document.querySelectorAll('.gallery__item'));
  var nav = document.getElementById('lineNav');
  if (!items.length || !nav) return;

  function itemLabel(item) {
    var dataEl = item.querySelector('.gallery__item-data');
    if (dataEl) {
      try {
        var data = JSON.parse(dataEl.textContent);
        if (data.title) return data.title;
      } catch (e) {}
    }
    var title = item.querySelector('.gallery__item-title');
    return title ? title.textContent.replace(/\s*\n\s*/g, ' ').trim() : '';
  }

  var links = [];

  items.forEach(function (item, index) {
    var a = document.createElement('a');
    a.className = 'line-nav__item';
    a.href = '#';

    var line = document.createElement('span');
    line.className = 'line-nav__line';
    a.appendChild(line);

    var label = document.createElement('span');
    label.className = 'line-nav__label';
    label.textContent = itemLabel(item);
    a.appendChild(label);

    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (typeof window.__galleryGoTo === 'function') {
        window.__galleryGoTo(index);
      }
    });

    nav.appendChild(a);
    links.push(a);

    if (index < items.length - 1) {
      var d1 = document.createElement('span');
      d1.className = 'line-nav__divider';
      nav.appendChild(d1);
      var d2 = document.createElement('span');
      d2.className = 'line-nav__divider';
      nav.appendChild(d2);
    }
  });

  // 화면 정중앙의 아주 좁은 세로 밴드(rootMargin으로 좌우를 크게 깎아 만든다)에
  // 걸치는 슬라이드만 "현재 위치"로 표시 — 버튼 클릭 이동이든 휠/드래그로
  // 자유 스크롤하든 항상 실제 화면 위치 기준으로 정확하게 갱신된다.
  if (typeof IntersectionObserver !== 'undefined') {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var index = items.indexOf(entry.target);
          if (index === -1) return;
          links[index].classList.toggle('is-active', entry.isIntersecting);
        });
      },
      { threshold: 0, rootMargin: '0px -48% 0px -48%' }
    );
    items.forEach(function (item) {
      observer.observe(item);
    });
  }
})();
