/* Entrada de TaskFlow. ParticleText adaptado a los colores de la ilustración. */
(function () {
  'use strict';

  const GATHER_MS = 1600;
  const STAGGER_MS = 420;
  const FADE_MS = 230;
  const IMAGE_WAIT_MS = 750;
  const SAMPLE_COLUMNS = 52;
  const TAU = Math.PI * 2;

  function waitForImage(image, signal) {
    if (image.complete) return Promise.resolve(image.naturalWidth > 0);
    return new Promise(resolve => {
      const finish = () => {
        clearTimeout(timeout);
        image.removeEventListener('load', finish);
        image.removeEventListener('error', finish);
        signal.removeEventListener('abort', finish);
        resolve(!signal.aborted && image.naturalWidth > 0);
      };
      const timeout = setTimeout(finish, IMAGE_WAIT_MS);
      image.addEventListener('load', finish, { once: true });
      image.addEventListener('error', finish, { once: true });
      signal.addEventListener('abort', finish, { once: true });
    });
  }

  function sampleImage(image, width, height) {
    const sample = document.createElement('canvas');
    sample.width = SAMPLE_COLUMNS;
    sample.height = Math.round(SAMPLE_COLUMNS * image.naturalHeight / image.naturalWidth);
    const context = sample.getContext('2d', { willReadFrequently: true });
    if (!context) return [];

    context.drawImage(image, 0, 0, sample.width, sample.height);
    const pixels = context.getImageData(0, 0, sample.width, sample.height).data;
    const spread = Math.min(180, width * 0.42);
    const particles = [];
    for (let row = 0; row < sample.height; row++) {
      const y = (row + 0.5) / sample.height;
      for (let column = 0; column < sample.width; column++) {
        const x = (column + 0.5) / sample.width;
        // El medidor real cubre el impreso en la ilustración. No animar el porcentaje impreso.
        if (x >= 0.126 && x <= 0.874 && y >= 0.5455 && y <= 0.581) continue;
        const index = row * sample.width + column;
        const red = pixels[index * 4];
        const green = pixels[index * 4 + 1];
        const blue = pixels[index * 4 + 2];
        const light = Math.max(red, green, blue);
        if (light < 24) continue;
        const seed = ((index * 9301 + 49297) % 233280) / 233280;
        const depth = ((index * 233 + 97) % 1000) / 1000;
        const angle = seed * TAU;
        const distance = spread * (0.35 + depth * 0.75);
        particles.push({
          x: x * width,
          y: y * height,
          dx: Math.cos(angle) * distance + (seed - 0.5) * spread * 0.45,
          dy: Math.sin(angle) * distance + (depth - 0.5) * spread * 0.45,
          delay: seed * STAGGER_MS,
          size: Math.max(1, Math.min(width / SAMPLE_COLUMNS * 0.47, 1.4 + light / 225)),
          color: `rgb(${red},${green},${blue})`,
        });
      }
    }
    return particles;
  }

  window.TaskFlowSplashParticles = async function playSplash(splash, signal) {
    const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const image = splash.querySelector('.tfSplashImage');
    const canvas = splash.querySelector('.tfSplashParticles');
    if (!image || !canvas || signal.aborted || motion?.matches || document.hidden) return;
    if (!(await waitForImage(image, signal)) || signal.aborted) return;

    const { width, height } = canvas.getBoundingClientRect();
    const context = canvas.getContext('2d');
    if (!context || width < 1 || height < 1) return;
    const particles = sampleImage(image, width, height);
    if (!particles.length) return;

    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.ceil(width * scale);
    canvas.height = Math.ceil(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    const gatherEnd = GATHER_MS + STAGGER_MS;

    await new Promise(resolve => {
      let frame = 0;
      let start;
      const finish = () => {
        cancelAnimationFrame(frame);
        clearTimeout(fallback);
        signal.removeEventListener('abort', finish);
        motion?.removeEventListener?.('change', onMotionChange);
        canvas.width = canvas.height = 1;
        splash.style.removeProperty('--tf-splash-reveal');
        resolve();
      };
      const onMotionChange = () => { if (motion.matches) finish(); };
      const fallback = setTimeout(finish, gatherEnd + FADE_MS + 350);

      function draw(now) {
        start ??= now;
        const elapsed = now - start;
        const reveal = Math.max(0, Math.min(1, (elapsed - gatherEnd) / FADE_MS));
        context.clearRect(0, 0, width, height);
        for (const particle of particles) {
          const progress = Math.max(0, Math.min(1, (elapsed - particle.delay) / GATHER_MS));
          const offset = (1 - progress) ** 3;
          context.globalAlpha = (1 - reveal) * (0.35 + progress * 0.65);
          context.fillStyle = particle.color;
          const x = particle.x + particle.dx * offset;
          const y = particle.y + particle.dy * offset;
          const radius = particle.size / 2;
          if (particle.size <= 2.1) {
            context.fillRect(x - radius, y - radius, particle.size, particle.size);
          } else {
            context.beginPath();
            context.arc(x, y, radius, 0, TAU);
            context.fill();
          }
        }
        if (reveal > 0) splash.style.setProperty('--tf-splash-reveal', String(reveal));
        if (reveal === 1) finish();
        else frame = requestAnimationFrame(draw);
      }

      signal.addEventListener('abort', finish, { once: true });
      motion?.addEventListener?.('change', onMotionChange);
      frame = requestAnimationFrame(draw);
    });
  };
})();
