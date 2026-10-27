(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.combo-preview').forEach(preview => {
    const images = [...preview.querySelectorAll('img[data-motion]')];
    const button = preview.querySelector('.combo-toggle');
    let playing = !reducedMotion.matches;
    function render() {
      for (const image of images) image.src = playing ? image.dataset.motion : image.dataset.still;
      button.textContent = playing ? '暂停动画' : '播放动画';
    }
    button.addEventListener('click', () => { playing = !playing; render(); });
    reducedMotion.addEventListener('change', event => {
      if (event.matches) { playing = false; render(); }
    });
    button.hidden = false;
    render();
  });
})();
