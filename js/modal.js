(function () {
  var modal = document.getElementById('modal');
  if (!modal) return;

  var viewport = modal.querySelector('.modal__viewport');
  var scrollEl = modal.querySelector('.modal__scroll');
  var backdrop = modal.querySelector('.modal__backdrop');
  var media = modal.querySelector('.modal__media');
  var info = modal.querySelector('.modal__info');
  var closeBtn = modal.querySelector('.modal__close');
  var numberEl = modal.querySelector('.modal__number');
  var titleEl = modal.querySelector('.modal__title');
  var tagsEl = modal.querySelector('.modal__tags');

  var descGroup = modal.querySelector('.modal__group--description');
  var descEl = modal.querySelector('.modal__desc');
  var linksEl = modal.querySelector('.modal__links');
  var fixedLinksEl = modal.querySelector('.modal__fixed-links');
  var whatididGroup = modal.querySelector('.modal__group--whatidid');
  var whatididListEl = modal.querySelector('.modal__whatidid-list');
  var skillsGroup = modal.querySelector('.modal__group--skills');
  var skillsListEl = modal.querySelector('.modal__skills');

  var section2El = modal.querySelector('#modalSection2');
  var section3El = modal.querySelector('#modalSection3');
  var sectionReveals = [];
  var sectionVideos = [];

  var startRect = null;
  var lastTrigger = null;

  function renderSection(container, sectionData) {
    container.innerHTML = '';

    if (!sectionData || !sectionData.type) {
      container.className = 'modal__section';
      container.style.display = 'none';
      return null;
    }

    container.style.display = '';

    if (sectionData.type === 'links') {
      container.className = 'modal__section modal__section--links';
      var linksWrap = document.createElement('div');
      linksWrap.className = 'modal__component-links';
      var titleEl2 = document.createElement('h3');
      titleEl2.className = 'modal__group-title';
      titleEl2.textContent = sectionData.title || 'Components.';
      var list = document.createElement('ul');
      list.className = 'modal__component-list';
      var items = Array.isArray(sectionData.items) ? sectionData.items : [];
      items.forEach(function (entry) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = entry.href || '#';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = entry.label || '';
        li.appendChild(a);
        list.appendChild(li);
      });
      linksWrap.appendChild(titleEl2);
      linksWrap.appendChild(list);
      container.appendChild(linksWrap);
      return { el: container, kind: 'links', title: titleEl2, items: list.querySelectorAll('li') };
    }

    if (sectionData.type === 'images') {
      container.className = 'modal__section modal__section--gallery';
      var imagesWrap = document.createElement('div');
      imagesWrap.className = 'modal__gallery-images';
      var images = Array.isArray(sectionData.images) ? sectionData.images : [];
      images.forEach(function (entry) {

        if (entry && typeof entry === 'object' && entry.embed) {
          var embedWrap = document.createElement('div');
          embedWrap.className = 'modal__gallery-embed';
          var iframe = document.createElement('iframe');
          iframe.src = entry.embed;
          iframe.loading = 'lazy';
          iframe.allow = 'fullscreen';
          iframe.allowFullscreen = true;
          embedWrap.appendChild(iframe);
          imagesWrap.appendChild(embedWrap);
          return;
        }
        if (entry && typeof entry === 'object' && entry.video) {
          var videoWrap = document.createElement('div');
          videoWrap.className = 'modal__gallery-video';
          var video = document.createElement('video');
          video.className = 'modal__gallery-video-el';
          video.src = 'images/' + entry.video;

          video.muted = true;
          video.defaultMuted = true;
          video.playsInline = true;
          video.setAttribute('playsinline', '');
          video.setAttribute('webkit-playsinline', '');
          video.loop = true;
          video.controls = true;
          video.preload = 'metadata';
          videoWrap.appendChild(video);

          var toggleBtn = document.createElement('button');
          toggleBtn.type = 'button';
          toggleBtn.className = 'modal__gallery-video-toggle';
          toggleBtn.setAttribute('aria-label', '재생/일시정지');
          toggleBtn.innerHTML =
            '<svg class="modal__gallery-video-icon modal__gallery-video-icon--play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
            '<svg class="modal__gallery-video-icon modal__gallery-video-icon--pause" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>';
          toggleBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (video.paused) {
              var playResult = video.play();
              if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {});
              }
            } else {
              video.pause();
            }
          });

          var hideTimer = null;
          var HIDE_DELAY = 2200;

          function showToggleBtn() {
            toggleBtn.classList.remove('is-hidden');
          }

          function scheduleHideToggleBtn() {
            clearTimeout(hideTimer);
            if (video.paused) return;
            hideTimer = setTimeout(function () {
              toggleBtn.classList.add('is-hidden');
            }, HIDE_DELAY);
          }

          videoWrap.addEventListener('mousemove', function () {
            showToggleBtn();
            scheduleHideToggleBtn();
          });
          videoWrap.addEventListener('mouseenter', function () {
            showToggleBtn();
            scheduleHideToggleBtn();
          });
          videoWrap.addEventListener('mouseleave', function () {
            scheduleHideToggleBtn();
          });
          videoWrap.addEventListener('touchstart', function () {
            showToggleBtn();
            scheduleHideToggleBtn();
          }, { passive: true });

          video.addEventListener('play', function () {
            toggleBtn.classList.add('is-playing');
            scheduleHideToggleBtn();
          });
          video.addEventListener('pause', function () {
            toggleBtn.classList.remove('is-playing');
            clearTimeout(hideTimer);
            showToggleBtn();
          });
          videoWrap.appendChild(toggleBtn);

          imagesWrap.appendChild(videoWrap);
          sectionVideos.push(video);
          return;
        }
        var img = document.createElement('img');
        img.className = 'modal__gallery-image';
        img.src = 'images/' + entry;
        img.alt = '';
        img.loading = 'lazy';
        imagesWrap.appendChild(img);
      });
      container.appendChild(imagesWrap);
      return { el: container, kind: 'images', images: imagesWrap.children };
    }

    container.className = 'modal__section';
    container.style.display = 'none';
    return null;
  }

  function renderLinkButtons(container, links, withArrow) {
    if (!container) return;
    container.innerHTML = '';
    links.forEach(function (entry) {
      if (!entry || !entry.href) return;
      var a = document.createElement('a');
      a.className = 'modal__link';
      a.href = entry.href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      if (withArrow) {

        var label = document.createElement('span');
        label.className = 'modal__link-label';
        label.appendChild(document.createTextNode(entry.label || '사이트 보기'));
        var arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        arrow.setAttribute('class', 'modal__link-arrow');
        arrow.setAttribute('viewBox', '0 0 24 24');
        arrow.setAttribute('fill', 'none');
        arrow.setAttribute('stroke', 'currentColor');
        arrow.setAttribute('stroke-width', '2');
        arrow.setAttribute('stroke-linecap', 'round');
        arrow.setAttribute('stroke-linejoin', 'round');
        var arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrowPath.setAttribute('d', 'm9 18 6-6-6-6');
        arrow.appendChild(arrowPath);
        label.appendChild(arrow);
        a.appendChild(label);
      } else {
        a.textContent = entry.label || '사이트 보기';
      }
      container.appendChild(a);
    });
    container.style.display = links.length ? '' : 'none';
  }

  function populate(item) {
    var number = item.querySelector('.gallery__item-number');
    var title = item.querySelector('.gallery__item-title');
    var tags = item.querySelectorAll('.gallery__item-tags span');
    var imgInner = item.querySelector('.gallery__item-imginner');

    numberEl.textContent = number ? number.textContent : '';
    titleEl.textContent = title ? title.textContent : '';
    tagsEl.innerHTML = '';
    tags.forEach(function (tag) {
      var li = document.createElement('li');
      li.textContent = tag.textContent;
      tagsEl.appendChild(li);
    });
    media.style.backgroundImage = imgInner ? getComputedStyle(imgInner).backgroundImage : '';

    var dataEl = item.querySelector('.gallery__item-data');
    var data = {};
    if (dataEl) {
      try {
        data = JSON.parse(dataEl.textContent);
      } catch (e) {
        data = {};
      }
    }

    if (data.title) titleEl.textContent = data.title;

    descGroup.style.display = '';
    var description = data.description;
    var paragraphs = Array.isArray(description) ? description.filter(Boolean) : (description ? [description] : []);
    if (!paragraphs.length) paragraphs = ['[프로젝트 설명을 입력하세요]'];
    descEl.innerHTML = '';
    paragraphs.forEach(function (text) {
      var p = document.createElement('p');
      p.textContent = text;
      descEl.appendChild(p);
    });
    var links = Array.isArray(data.links) && data.links.length
      ? data.links
      : (data.link ? [{ href: data.link, label: data.linkLabel || '사이트 보기' }] : []);
    renderLinkButtons(linksEl, links);

    renderLinkButtons(fixedLinksEl, links, true);

    whatididGroup.style.display = '';
    var whatidid = Array.isArray(data.whatidid) && data.whatidid.length ? data.whatidid : ['[담당 업무를 입력하세요]'];
    whatididListEl.innerHTML = '';
    whatidid.forEach(function (text) {
      var li = document.createElement('li');
      li.textContent = text;
      whatididListEl.appendChild(li);
    });

    skillsGroup.style.display = '';
    var skills = Array.isArray(data.skills) && data.skills.length ? data.skills : ['[기술 스택을 입력하세요]'];
    skillsListEl.innerHTML = '';
    skills.forEach(function (text) {
      var li = document.createElement('li');
      li.textContent = text;
      skillsListEl.appendChild(li);
    });

    sectionVideos = [];
    sectionReveals = [
      renderSection(section2El, data.section2),
      renderSection(section3El, data.section3)
    ].filter(Boolean);
  }

  var smoothScroll = (function () {
    var current = 0;
    var target = 0;
    var max = 0;
    var raf = null;
    var lerp = 0.1;

    function apply() {
      scrollEl.style.transform = 'translateY(' + -current + 'px)';
    }

    function loop() {
      current += (target - current) * lerp;
      if (Math.abs(target - current) < 0.5) {
        current = target;
        apply();
        raf = null;
        return;
      }
      apply();
      raf = requestAnimationFrame(loop);
    }

    function ensureLoop() {
      if (!raf) raf = requestAnimationFrame(loop);
    }

    function recalc() {
      max = Math.max(0, scrollEl.scrollHeight - viewport.clientHeight);
      target = Math.min(target, max);
      current = Math.min(current, max);
    }

    function moveBy(delta) {
      target = Math.max(0, Math.min(target + delta, max));
      ensureLoop();
    }

    function reset() {
      current = 0;
      target = 0;
      max = 0;
      apply();
    }

    function onWheel(e) {
      e.preventDefault();
      moveBy(e.deltaY);
    }

    var touchStartY = 0;
    var touchStartTarget = 0;

    function onTouchStart(e) {
      touchStartY = e.touches[0].clientY;
      touchStartTarget = target;
    }

    function onTouchMove(e) {
      var dy = touchStartY - e.touches[0].clientY;
      target = Math.max(0, Math.min(touchStartTarget + dy, max));
      ensureLoop();
    }

    function handleKeydown(e) {
      var page = viewport.clientHeight * 0.9;
      if (e.key === 'ArrowDown') moveBy(80);
      else if (e.key === 'ArrowUp') moveBy(-80);
      else if (e.key === 'PageDown') moveBy(page);
      else if (e.key === 'PageUp') moveBy(-page);
      else if (e.key === 'Home') moveBy(-max);
      else if (e.key === 'End') moveBy(max);
      else return false;
      e.preventDefault();
      return true;
    }

    viewport.addEventListener('wheel', onWheel, { passive: false });
    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchmove', onTouchMove, { passive: true });

    window.addEventListener('resize', recalc);

    return { recalc: recalc, reset: reset, handleKeydown: handleKeydown };
  })();

  if (typeof ResizeObserver !== 'undefined') {
    var scrollResizeObserver = new ResizeObserver(function () {
      smoothScroll.recalc();
    });
    scrollResizeObserver.observe(scrollEl);
  }

  function collectRevealTargets(reveal) {
    var targets = [];
    if (reveal.kind === 'links') {
      if (reveal.title) targets.push(reveal.title);
      reveal.items.forEach(function (el) {
        targets.push(el);
      });
    } else if (reveal.kind === 'images') {
      Array.prototype.forEach.call(reveal.images, function (el) {
        targets.push(el);
      });
    }
    return targets;
  }

  var sectionObserver = null;

  function setupSectionReveals() {
    var allTargets = [];
    sectionReveals.forEach(function (reveal) {
      var targets = collectRevealTargets(reveal);
      var offsetY = reveal.kind === 'images' ? 48 : 20;
      targets.forEach(function (el) {
        gsap.set(el, { opacity: 0, y: offsetY });
      });
      allTargets = allTargets.concat(targets);
    });

    if (typeof IntersectionObserver === 'undefined') {
      allTargets.forEach(function (el) {
        gsap.set(el, { clearProps: 'all' });
      });
      return;
    }

    if (sectionObserver) sectionObserver.disconnect();
    sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          gsap.to(entry.target, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
          sectionObserver.unobserve(entry.target);
        });
      },
      { root: viewport, threshold: 0, rootMargin: '0px 0px -10% 0px' }
    );
    allTargets.forEach(function (el) {
      sectionObserver.observe(el);
    });
  }

  var videoObserver = null;

  function setupVideoAutoplay() {
    if (videoObserver) videoObserver.disconnect();
    if (!sectionVideos.length) return;

    if (typeof IntersectionObserver === 'undefined') return;

    videoObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var video = entry.target;
          if (entry.intersectionRatio >= 0.98) {
            var playResult = video.play();
            if (playResult && typeof playResult.catch === 'function') {
              playResult.catch(function () {});
            }
          } else if (entry.intersectionRatio <= 0) {
            video.pause();
          }
        });
      },
      { root: viewport, threshold: [0, 0.98] }
    );
    sectionVideos.forEach(function (video) {
      videoObserver.observe(video);
    });
  }

  function pauseAllVideos() {
    if (videoObserver) {
      videoObserver.disconnect();
      videoObserver = null;
    }
    sectionVideos.forEach(function (video) {
      video.pause();
    });
  }

  function pinScroll(lscroll) {
    if (!lscroll.scroll || !lscroll.scroll.instance) return;
    var current = lscroll.scroll.instance.scroll;
    lscroll.setScroll(current.x, current.y);
  }

  function lockScroll() {
    var lscroll = window.__lscroll;
    if (!lscroll) return;
    lscroll.stop();
    pinScroll(lscroll);

    var frames = 0;
    var holdFrame = function () {
      if (frames >= 20 || !modal.classList.contains('is-open')) return;
      frames += 1;
      pinScroll(lscroll);
      requestAnimationFrame(holdFrame);
    };
    requestAnimationFrame(holdFrame);
  }

  function unlockScroll() {
    var lscroll = window.__lscroll;
    if (lscroll) lscroll.start();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      closeModal();
      return;
    }
    smoothScroll.handleKeydown(e);
  }

  function openModal(item) {
    var imgEl = item.querySelector('.gallery__item-img');
    if (!imgEl) return;

    lastTrigger = item.querySelector('.gallery__item-link') || imgEl;
    startRect = imgEl.getBoundingClientRect();

    populate(item);
    lockScroll();
    setupSectionReveals();
    setupVideoAutoplay();

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('modal-open');
    smoothScroll.reset();

    gsap.set(backdrop, { opacity: 0 });
    gsap.set(closeBtn, { opacity: 0 });
    gsap.set(fixedLinksEl, { opacity: 0 });
    gsap.set(info, { opacity: 0, x: 24 });
    gsap.set(media, { opacity: 1, clearProps: 'position,top,left,width,height,margin' });

    requestAnimationFrame(function () {
      smoothScroll.recalc();
      var endRect = media.getBoundingClientRect();
      gsap.set(media, {
        position: 'fixed',
        top: startRect.top,
        left: startRect.left,
        width: startRect.width,
        height: startRect.height,
        margin: 0
      });

      var tl = gsap.timeline();
      tl.to(backdrop, { opacity: 1, duration: 0.35, ease: 'power1.out' }, 0);
      tl.to(
        media,
        {
          top: endRect.top,
          left: endRect.left,
          width: endRect.width,
          height: endRect.height,
          duration: 0.7,
          ease: 'power3.inOut',
          onComplete: function () {
            gsap.set(media, { clearProps: 'position,top,left,width,height,margin' });
          }
        },
        0
      );
      tl.to(closeBtn, { opacity: 1, duration: 0.4 }, 0.2);
      tl.to(fixedLinksEl, { opacity: 1, duration: 0.4 }, 0.2);
      tl.to(info, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: function () {

          gsap.set(info, { clearProps: 'transform' });
        }
      }, 0.7);
    });

    closeBtn.focus();
    document.addEventListener('keydown', onKeydown);
  }

  function closeModal() {
    if (!modal.classList.contains('is-open')) return;

    var tl = gsap.timeline({
      onComplete: function () {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.documentElement.classList.remove('modal-open');
        gsap.set(media, { clearProps: 'all' });
        gsap.set(info, { clearProps: 'all' });
        gsap.set(backdrop, { clearProps: 'all' });
        gsap.set(closeBtn, { clearProps: 'all' });
        gsap.set(fixedLinksEl, { clearProps: 'all' });
        gsap.set(viewport, { clearProps: 'all' });
        smoothScroll.reset();
        pauseAllVideos();
        unlockScroll();
        if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
        startRect = null;
      }
    });

    tl.to(viewport, { opacity: 0, duration: 0.28, ease: 'power1.in' }, 0);
    tl.to(closeBtn, { opacity: 0, duration: 0.22 }, 0);
    tl.to(fixedLinksEl, { opacity: 0, duration: 0.22 }, 0);
    tl.to(backdrop, { opacity: 0, duration: 0.3 }, 0);

    document.removeEventListener('keydown', onKeydown);
  }

  document.querySelectorAll('.gallery__item').forEach(function (item) {
    var img = item.querySelector('.gallery__item-img');
    var link = item.querySelector('.gallery__item-link');

    if (img) {
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.addEventListener('click', function () {
        openModal(item);
      });
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(item);
        }
      });
    }

    if (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        openModal(item);
      });
    }
  });

  modal.querySelectorAll('[data-modal-close]').forEach(function (el) {
    el.addEventListener('click', closeModal);
  });

  window.__openProjectModal = openModal;
})();
