

(function () {
  var toggleBtn = document.getElementById('sitemapToggle');
  var sitemap = document.getElementById('sitemap');
  var columnsWrap = document.getElementById('sitemapColumns');
  if (!toggleBtn || !sitemap || !columnsWrap) return;

  var items = Array.prototype.slice.call(document.querySelectorAll('.gallery__item'));

  items.forEach(function (item, index) {
    var titleEl = item.querySelector('.gallery__item-title');
    var tagEl = item.querySelector('.gallery__item-tags span');
    var imgInner = item.querySelector('.gallery__item-imginner');
    var dataEl = item.querySelector('.gallery__item-data');

    var title = '';
    if (dataEl) {
      try {
        var data = JSON.parse(dataEl.textContent);
        if (data && data.title) title = data.title;
      } catch (e) {

      }
    }
    if (!title) title = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';

    var tag = tagEl ? tagEl.textContent.trim() : '';
    var bgImage = imgInner ? getComputedStyle(imgInner).backgroundImage : '';

    var col = document.createElement('button');
    col.type = 'button';
    col.className = 'sitemap__col';
    col.setAttribute('aria-label', title);

    var media = document.createElement('span');
    media.className = 'sitemap__media';
    media.style.backgroundImage = bgImage;
    col.appendChild(media);

    var labelRow = document.createElement('span');
    labelRow.className = 'sitemap__label-row';

    var titleSpan = document.createElement('span');
    titleSpan.className = 'sitemap__title';
    titleSpan.textContent = title;
    labelRow.appendChild(titleSpan);

    var tagSpan = document.createElement('span');
    tagSpan.className = 'sitemap__tag';
    tagSpan.textContent = tag;
    labelRow.appendChild(tagSpan);

    col.appendChild(labelRow);

    col.addEventListener('click', function () {
      openProject(index);
    });

    columnsWrap.appendChild(col);
  });

  function openProject(index) {
    closeSitemap();
    if (typeof window.__openProjectModal === 'function') {
      window.__openProjectModal(items[index]);
    }
  }

  function pinScroll(lscroll) {
    if (!lscroll.scroll || !lscroll.scroll.instance) return;
    var current = lscroll.scroll.instance.scroll;
    lscroll.setScroll(current.x, current.y);
  }

  function lockBackgroundScroll() {
    var lscroll = window.__lscroll;
    if (!lscroll) return;
    lscroll.stop();
    pinScroll(lscroll);

    var frames = 0;
    var holdFrame = function () {
      if (frames >= 20 || !sitemap.classList.contains('is-open')) return;
      frames += 1;
      pinScroll(lscroll);
      requestAnimationFrame(holdFrame);
    };
    requestAnimationFrame(holdFrame);
  }

  function unlockBackgroundScroll() {
    var lscroll = window.__lscroll;
    if (lscroll) lscroll.start();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') closeSitemap();
  }

  function openSitemap() {
    sitemap.classList.add('is-open');
    sitemap.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('sitemap-open');
    lockBackgroundScroll();
    document.addEventListener('keydown', onKeydown);
  }

  function closeSitemap() {
    if (!sitemap.classList.contains('is-open')) return;
    sitemap.classList.remove('is-open');
    sitemap.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('sitemap-open');
    unlockBackgroundScroll();
    document.removeEventListener('keydown', onKeydown);
  }

  toggleBtn.addEventListener('click', openSitemap);

  sitemap.querySelectorAll('[data-sitemap-close]').forEach(function (el) {
    el.addEventListener('click', closeSitemap);
  });
})();
