import { createGlassSystem } from './vendor/lens/runtime.js';

// Keep semantic controls intact and give each visible card its own bounded stage.
const surfaces = document.querySelectorAll([
  '.site-switch', '.sidebar .search', '.sidebar .filters', '.top-actions button',
  'main > .hero', 'main > .stats', 'main > .quickstart',
  '.home-section', '.entries > .entry:not(#combat)', '.entries > details', '#combat > .ability'
].join(','));
const systems = [];
for (const surface of surfaces) {
  const stage = document.createElement('div');
  stage.className = 'manual-glass-stage';
  surface.before(stage);
  stage.append(surface);
  surface.classList.add('lg-surface', 'manual-glass-surface');
  surface.dataset.glass = surface.matches('button') ? 'button' : 'panel';
  surface.querySelectorAll('.site-switch a, .filters button, .hero-links a, .section-nav a, [data-skin], .community button, details > summary').forEach(control => {
    control.classList.add('lg-surface', 'manual-glass-control');
    control.dataset.glass = 'button';
  });
  surface.querySelectorAll('.manual-row, .set-card, .recipe, .numbers').forEach(panel => {
    panel.classList.add('lg-surface', 'manual-glass-inner');
    panel.dataset.glass = 'panel';
  });
  try {
    const system = createGlassSystem(stage, {
      material: 'thick',
      scene: document.body.classList.contains('dark') ? 'ocean' : 'aurora',
      motion: false,
      artwork(ctx, { width, height, dpr }) {
        const dark = document.body.classList.contains('dark');
        const sidebar = stage.closest('.sidebar');
        ctx.fillStyle = sidebar ? (dark ? '#152427' : '#f1f1eb') : (dark ? '#18282b' : '#f8f7f3');
        ctx.fillRect(0, 0, width, height);
        if (sidebar) return;
        ctx.strokeStyle = dark ? 'rgba(165,203,208,.045)' : 'rgba(50,101,112,.055)';
        ctx.lineWidth = dpr;
        const step = 48 * dpr;
        for (let x = 0; x < width; x += step) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let y = 0; y < height; y += step) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }
      },
      audio: { enabled: false, storage: null }
    });
    system.sound.set({ enabled: false });
    systems.push(system);
  } catch (error) {
    stage.classList.add('fallback');
    console.warn('Lens fallback:', error);
  }
}
const themeObserver = new MutationObserver(() => {
  const scene = document.body.classList.contains('dark') ? 'ocean' : 'aurora';
  systems.forEach(system => system.setScene(scene));
  document.querySelectorAll('.manual-glass-stage.fallback').forEach(stage => { stage.dataset.scene = scene; });
});
themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
window.addEventListener('pagehide', event => {
  if (event.persisted) return;
  themeObserver.disconnect();
  systems.forEach(system => system.destroy());
}, { once: true });
