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

  var EDGE_THRESHOLD = 40; // 이 정도 오차는 "끝에 닿았다"로 간주

  function update() {
    var firstRect = firstItem.getBoundingClientRect();
    var lastRect = lastItem.getBoundingClientRect();

    // 첫 슬라이드의 왼쪽 끝이 화면 안(또는 그 근처)까지 들어와 있으면
    // 더 이상 왼쪽으로 갈 콘텐츠가 없다는 뜻이라 왼쪽 페이드를 숨긴다.
    left.classList.toggle('is-hidden', firstRect.left > -EDGE_THRESHOLD);
    // 마지막 슬라이드의 오른쪽 끝이 화면 안까지 들어와 있으면 오른쪽도 동일.
    right.classList.toggle('is-hidden', lastRect.right < window.innerWidth + EDGE_THRESHOLD);

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
})();
