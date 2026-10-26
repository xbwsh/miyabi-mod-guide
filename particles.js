(() => {
  const gallery = document.querySelector('.particle-gallery');
  if (!gallery) return;
  const desktop = matchMedia('(min-width: 1100px) and (min-height: 700px) and (hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const scenes = [];
  class Scene {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.points = [];
      this.mouse = null;
      this.visible = false;
      this.raf = 0;
      this.loading = false;
      canvas.addEventListener('pointermove', event => {
        if (!desktop.matches || reduced.matches || !this.points.length) return;
        const bounds = canvas.getBoundingClientRect();
        this.mouse = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
        this.start();
      });
      canvas.addEventListener('pointerleave', () => { this.mouse = null; this.start(); });
      new ResizeObserver(() => {
        if (desktop.matches && this.visible && this.image) this.resize();
      }).observe(canvas);
    }
    async load() {
      if (this.loading || this.image || !this.ctx) return;
      this.loading = true;
      const image = new Image();
      image.decoding = 'async';
      image.src = this.canvas.dataset.image;
      try {
        await image.decode();
        this.image = image;
        if (desktop.matches && this.visible) this.resize();
      } catch {
        const fallback = document.createElement('img');
        fallback.src = image.src;
        fallback.alt = this.canvas.getAttribute('aria-label');
        fallback.className = 'particle-static';
        this.canvas.replaceWith(fallback);
      }
    }
    resize() {
      this.stop();
      this.mouse = null;
      const width = Math.round(this.canvas.clientWidth);
      const height = Math.round(this.canvas.clientHeight);
      if (!width || !height) return;
      this.width = width;
      this.height = height;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(width * dpr);
      this.canvas.height = Math.round(height * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const size = Math.max(1, Math.floor(Math.min(width, height) * .88));
      const source = document.createElement('canvas');
      source.width = source.height = size;
      const context = source.getContext('2d', { willReadFrequently: true });
      context.drawImage(this.image, 0, 0, size, size);
      const pixels = context.getImageData(0, 0, size, size).data;
      const offsetX = (width - size) / 2;
      const offsetY = (height - size) / 2;
      this.points = [];
      for (let y = 0; y < size; y += 3) {
        for (let x = 0; x < size; x += 3) {
          const i = (y * size + x) * 4;
          if (pixels[i + 3] < 100) continue;
          let [r, g, b] = pixels.slice(i, i + 3);
          // Preserve dark outlines, gently lifting them against the dark panel.
          if (r * .299 + g * .587 + b * .114 < 55) {
            r = Math.min(255, r + 65); g = Math.min(255, g + 72); b = Math.min(255, b + 76);
          }
          this.points.push({ x: x + offsetX, y: y + offsetY,
            homeX: x + offsetX, homeY: y + offsetY, vx: 0, vy: 0,
            color: `rgba(${r},${g},${b},${pixels[i + 3] / 255})` });
        }
      }
      this.draw();
    }
    draw() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      for (const p of this.points) {
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, 1.05, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    start() {
      if (this.raf || !this.visible || !desktop.matches || reduced.matches || document.hidden) return;
      this.frames = 0;
      this.raf = requestAnimationFrame(() => this.tick());
    }
    tick() {
      this.raf = 0;
      if (!this.visible || !desktop.matches || document.hidden || reduced.matches) return;
      let moving = false;
      for (const p of this.points) {
        if (this.mouse) {
          const dx = p.x - this.mouse.x, dy = p.y - this.mouse.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 46) {
            const force = (46 - distance) / 46 * 2.4;
            p.vx += (distance ? dx / distance : 1) * force;
            p.vy += (distance ? dy / distance : 0) * force;
          }
        }
        p.vx = (p.vx + (p.homeX - p.x) * .1) * .82;
        p.vy = (p.vy + (p.homeY - p.y) * .1) * .82;
        p.x += p.vx; p.y += p.vy;
        if (Math.abs(p.vx) + Math.abs(p.vy) > .025) moving = true;
      }
      this.draw();
      // An idle pointer and a settled image never need an endless animation loop.
      if (moving && ++this.frames < 160) this.raf = requestAnimationFrame(() => this.tick());
    }
    stop() { cancelAnimationFrame(this.raf); this.raf = 0; }
    refresh() {
      if (!desktop.matches || !this.visible || document.hidden) { this.stop(); return; }
      if (!this.image) this.load();
      else this.resize();
    }
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const scene = scenes.find(item => item.canvas === entry.target);
      if (scene) { scene.visible = entry.isIntersecting; scene.refresh(); }
    }
  });
  gallery.querySelectorAll('canvas').forEach(canvas => {
    const scene = new Scene(canvas); scenes.push(scene); observer.observe(canvas);
  });
  desktop.addEventListener('change', () => scenes.forEach(scene => scene.refresh()));
  reduced.addEventListener('change', () => scenes.forEach(scene => scene.refresh()));
  document.addEventListener('visibilitychange', () => scenes.forEach(scene => scene.refresh()));
})();
