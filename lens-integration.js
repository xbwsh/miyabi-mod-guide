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
