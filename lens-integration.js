import { createGlassSystem } from './vendor/lens/runtime.js';

// Three small stages limit GPU use while preserving the original HTML controls.
const selectors = ['.site-switch', '.sidebar .search', '#quickstart, .home-section, #profile'];
const systems = [];
for (const selector of selectors) {
  const surface = document.querySelector(selector);
  if (!surface) continue;
  const stage = document.createElement('div');
  stage.className = 'manual-glass-stage';
  surface.before(stage);
  stage.append(surface);
  surface.classList.add('lg-surface', 'manual-glass-surface');
  surface.dataset.glass = 'panel';
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
});
themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
window.addEventListener('pagehide', event => {
  if (event.persisted) return;
  themeObserver.disconnect();
  systems.forEach(system => system.destroy());
}, { once: true });
