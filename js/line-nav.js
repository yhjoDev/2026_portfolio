(function () {

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
