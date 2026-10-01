/**
 * AMBIENT BACKGROUND PARTICLES
 * A quiet, non-reactive starfield used to add depth behind the content.
 * No cursor tracking, no trails, no repulsion — just a slow, gentle drift.
 */

(function () {
  'use strict';

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  // Muted, professional palette (soft cyan / soft purple / white)
  const colors = [
    { r: 148, g: 210, b: 255 },
    { r: 168, g: 85, b: 247 },
    { r: 226, g: 232, b: 240 }
  ];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
  }

  class Particle {
    constructor() {
      this.init();
    }

    init() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 1.4 + 0.5;

      this.vx = (Math.random() - 0.5) * 0.12;
      this.vy = (Math.random() - 0.5) * 0.12;

      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.baseAlpha = Math.random() * 0.3 + 0.12;
      this.alpha = this.baseAlpha;

      this.pulseSpeed = Math.random() * 0.01 + 0.004;
      this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0) this.x = width;
      else if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      else if (this.y > height) this.y = 0;

      this.pulsePhase += this.pulseSpeed;
      this.alpha = this.baseAlpha + Math.sin(this.pulsePhase) * 0.06;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${Math.max(0, this.alpha)})`;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    // Low density — ambient texture, not a feature in itself
    const count = Math.min(60, Math.floor((width * height) / 22000));
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  // Faint constellation lines between nearby particles only (no cursor link)
  function drawFilaments() {
    const maxDist = 80;
    const maxDistSq = maxDist * maxDist;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistSq) {
          const dist = Math.sqrt(distSq);
          const alpha = (1 - dist / maxDist) * 0.06;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(148, 210, 255, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    drawFilaments();

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);

  resize();
  animate();
})();
