(() => {
  const image = new Image();
  image.src = 'assets/expression-melon.png';
  image.onload = () => {
    try {
      const L = window.Lattice;
      const world = { ...L.WORLDS.paper, bg: '#1b3034', shadow: false, dotGain: 1, gridAlpha: 0 };
      const stage = new L.Stage(document.getElementById('field'), [{ id: 'hero', el: '#stage', pos: [0, 0, 10], look: [0, 0, 0] }], world);
      const field = new L.Field(stage, { size: 128 });
      field.useSets(L.sets);
      stage.add(field);
      field.onResize(stage);
      const geometry = field.points.geometry;
      const Attribute = geometry.getAttribute('position').constructor;
      const colors = new Float32Array(field.N * 3);
      const colorAttribute = new Attribute(colors, 3);
      geometry.setAttribute('aImageColor', colorAttribute);
      const material = field.drawMat;
      material.vertexShader = material.vertexShader
        .replace('attribute vec2 ref;', 'attribute vec2 ref; attribute vec3 aImageColor; varying vec3 vImageColor;')
        .replace('void main() {', 'void main() { vImageColor = aImageColor;');
      material.fragmentShader = material.fragmentShader
        .replace('uniform vec3 uInk, uHot;', 'uniform vec3 uInk, uHot; varying vec3 vImageColor;')
        .replace('vec3 col = mix(uInk, uHot, vHeat);', 'vec3 col = vImageColor;');
      material.needsUpdate = true;
      const bitmap = document.createElement('canvas');
      bitmap.width = bitmap.height = 112;
      const context = bitmap.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0, bitmap.width, bitmap.height);
      const pixels = context.getImageData(0, 0, bitmap.width, bitmap.height).data;
      field.keep(lattice => {
        const points = new Float32Array(field.N * 4);
        const width = lattice.cols * lattice.pitch;
        const height = lattice.rows * lattice.pitch;
        const extent = Math.min(width, height) * 0.88;
        let count = 0;
        for (let y = 0; y < bitmap.height; y++) for (let x = 0; x < bitmap.width; x++) {
          const src = (y * bitmap.width + x) * 4;
          if (pixels[src + 3] < 100 || count >= field.N) continue;
          points.set([(x / (bitmap.width - 1) - .5) * extent, (.5 - y / (bitmap.height - 1)) * extent, 0, 1], count * 4);
          colors.set([pixels[src] / 255, pixels[src + 1] / 255, pixels[src + 2] / 255], count * 3);
          count++;
        }
        colorAttribute.needsUpdate = true;
        return points;
      }, { dur: 1.5, flow: 2.4, alpha: .56, lit: 1.35 });
      parent.postMessage({ type: 'miyabi-lattice-ready' }, location.origin);
    } catch (error) {
      console.warn('Lattice unavailable:', error);
    }
  };
})();
