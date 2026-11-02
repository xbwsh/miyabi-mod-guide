(() => {
  const gallery = document.querySelector('.particle-gallery');
  const canvas = gallery?.querySelector('canvas[data-image="assets/expression-melon.png"]');
  if (!gallery || !canvas) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame;
  let visible = false;
  function stop() {
    frame?.remove();
    frame = null;
    canvas.hidden = false;
  }
  function sync() {
    if (!gallery.open || !visible || reduced.matches || document.hidden) { stop(); return; }
    if (frame) return;
    frame = document.createElement('iframe');
    frame.title = '吃蜜瓜的星见雅，互动点阵';
    frame.className = 'lattice-melon';
    frame.src = 'lattice-melon.html';
    canvas.after(frame);
  }
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  });
  observer.observe(canvas.parentElement);
  gallery.addEventListener('toggle', sync);
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== frame?.contentWindow || event.data?.type !== 'miyabi-lattice-ready') return;
    canvas.hidden = true;
    frame.classList.add('ready');
  });
})();
