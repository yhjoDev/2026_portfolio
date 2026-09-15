(function () {
  var canvas = document.getElementById('dotGrid');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');

  var SPACING = 30;
  var RADIUS = 400;
  var BASE_A = 0.13;
  var PEAK_A = 1;
  var REST_RGB = [235, 235, 235];
  var LIT_RGB = [255, 255, 255];

  var mouse = null;
  var dots = [];
  var cw = 0;
  var ch = 0;
  var raf = null;

  function updateFromClient(clientX, clientY) {
    var rect = canvas.getBoundingClientRect();
    mouse = { x: clientX - rect.left, y: clientY - rect.top };
  }

  function onMouseMove(e) {
    updateFromClient(e.clientX, e.clientY);
  }

  function onTouchMove(e) {
    var t = e.touches[0];
    if (t) updateFromClient(t.clientX, t.clientY);
  }

  function clearPointer() {
    mouse = null;
  }

  function build() {
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    cw = rect.width;
    ch = rect.height;
    if (!cw || !ch) return;

    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    dots = [];
    var cols = Math.floor(cw / SPACING) + 2;
    var rows = Math.floor(ch / SPACING) + 2;
    var ox = (cw % SPACING) / 2;
    var oy = (ch % SPACING) / 2;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        dots.push({ x: ox + c * SPACING, y: oy + r * SPACING, b: 0 });
      }
    }
  }

  function frame() {
    ctx.clearRect(0, 0, cw, ch);

    var mx = mouse ? mouse.x : -99999;
    var my = mouse ? mouse.y : -99999;
    var r2 = RADIUS * RADIUS;

    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      var dx = d.x - mx;
      var dy = d.y - my;
      var dist2 = dx * dx + dy * dy;
      var tgt = dist2 < r2 ? Math.pow(1 - Math.sqrt(dist2) / RADIUS, 1.5) : 0;

      d.b += (tgt > d.b ? 0.16 : 0.07) * (tgt - d.b);
      if (d.b < 0.004) d.b = 0;

      var alpha = BASE_A + (PEAK_A - BASE_A) * d.b;
      var sz = 1 + d.b * 1.2;
      var rr = Math.round(REST_RGB[0] + (LIT_RGB[0] - REST_RGB[0]) * d.b);
      var gg = Math.round(REST_RGB[1] + (LIT_RGB[1] - REST_RGB[1]) * d.b);
      var bb = Math.round(REST_RGB[2] + (LIT_RGB[2] - REST_RGB[2]) * d.b);
      ctx.fillStyle = 'rgba(' + rr + ',' + gg + ',' + bb + ',' + alpha.toFixed(2) + ')';
      ctx.fillRect(d.x - sz / 2, d.y - sz / 2, sz, sz);
    }

    raf = requestAnimationFrame(frame);
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('touchend', clearPointer, { passive: true });
  window.addEventListener('touchcancel', clearPointer, { passive: true });
  document.addEventListener('mouseleave', clearPointer);
  window.addEventListener('resize', build);

  build();
  frame();
})();
