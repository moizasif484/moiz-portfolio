/**
 * ASTRA NEURAL PARTICLES & MOUSE REACTION SYSTEM
 * Inspired by GPT-6 Astra & high-end generative AI interfaces.
 * Features:
 * - Fluid floating particle field with neon electric cyan and soft purple hues
 * - Interactive mouse repulsion and magnetic attraction field
 * - Light velocity trails when mouse moves swiftly
 * - Distance-based neural filaments (constellation mesh)
 * - Soft glowing light aura around the cursor
 * - Responsive canvas resizing
 */

(function () {
  'use strict';

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouseTrail = [];

  // Mouse state
  const mouse = {
    x: -1000,
    y: -1000,
    prevX: -1000,
    prevY: -1000,
    vx: 0,
    vy: 0,
    speed: 0,
    radius: 180, // influence radius
    isHovered: false
  };

  // Color configurations (Electric Blue, Soft Purple, Crisp White)
  const colors = [
    { r: 0, g: 242, b: 254 },    // Electric Cyan
    { r: 56, g: 189, b: 248 },   // Sky Blue
    { r: 168, g: 85, b: 247 },   // Soft Purple
    { r: 129, g: 140, b: 248 },  // Indigo Accent
    { r: 255, g: 255, b: 255 }   // Pure Stardust White
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
      this.baseSize = Math.random() * 2 + 0.8;
      this.size = this.baseSize;
      
      // Floating velocity
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      
      // Original positions for elastic drift
      this.originX = this.x;
      this.originY = this.y;

      // Color pick
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.alpha = Math.random() * 0.55 + 0.25;
      this.baseAlpha = this.alpha;
      
      // Twinkle properties
      this.pulseSpeed = Math.random() * 0.02 + 0.005;
      this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update() {
      // Natural drifting
      this.x += this.vx;
      this.y += this.vy;

      // Gentle bounds bounce
      if (this.x < 0) this.x = width;
      else if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      else if (this.y > height) this.y = 0;

      // Soft pulsating twinkle
      this.pulsePhase += this.pulseSpeed;
      this.alpha = this.baseAlpha + Math.sin(this.pulsePhase) * 0.15;

      // Mouse interactive force field (Fluid Push & Orbit)
      if (mouse.x > -500) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          // Dynamic force based on mouse velocity and distance
          const force = (1 - dist / mouse.radius);
          const angle = Math.atan2(dy, dx);
          
          // Slight push with tangential vortex spin
          const pushStrength = force * 4.5;
          const swirlStrength = force * 2.5;

          this.x -= Math.cos(angle) * pushStrength - Math.sin(angle) * swirlStrength * (mouse.speed > 5 ? 1 : 0.4);
          this.y -= Math.sin(angle) * pushStrength + Math.cos(angle) * swirlStrength * (mouse.speed > 5 ? 1 : 0.4);

          // Glow brighter near cursor
          this.alpha = Math.min(1, this.baseAlpha + force * 0.65);
          this.size = this.baseSize + force * 1.8;
        } else {
          // Slowly recover size
          this.size += (this.baseSize - this.size) * 0.05;
        }
      }
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${Math.max(0, this.alpha)})`;
      
      // Subtle glow on brighter particles
      if (this.alpha > 0.4) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.8)`;
      }
      
      ctx.fill();
      ctx.restore();
    }
  }

  // Mouse Trail Segment
  class TrailNode {
    constructor(x, y, vx, vy, color) {
      this.x = x;
      this.y = y;
      this.vx = vx * 0.15 + (Math.random() - 0.5) * 1.2;
      this.vy = vy * 0.15 + (Math.random() - 0.5) * 1.2;
      this.life = 1.0;
      this.decay = Math.random() * 0.035 + 0.025;
      this.size = Math.random() * 3.5 + 1.5;
      this.color = color || colors[0];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
      this.size *= 0.96;
    }

    draw() {
      if (this.life <= 0) return;
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(0.5, this.size), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.life * 0.75})`;
      ctx.shadowBlur = 12;
      ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.9)`;
      ctx.fill();
      ctx.restore();
    }
  }

  function initParticles() {
    particles = [];
    // Dynamic density based on screen dimensions
    const count = Math.min(140, Math.floor((width * height) / 10000));
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  // Draw delicate constellation filaments between close particles
  function drawFilaments() {
    const maxDist = 95;
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
          const alpha = (1 - dist / maxDist) * 0.15;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
          ctx.lineWidth = 0.65;
          ctx.stroke();
        }
      }
    }
  }

  // Main render loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Dynamic glowing light aura directly on canvas around cursor
    if (mouse.x > 0 && mouse.y > 0) {
      const auraRadius = mouse.radius * 1.35;
      const auraGrad = ctx.createRadialGradient(
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, auraRadius
      );
      auraGrad.addColorStop(0, 'rgba(0, 242, 254, 0.16)');
      auraGrad.addColorStop(0.35, 'rgba(168, 85, 247, 0.08)');
      auraGrad.addColorStop(0.7, 'rgba(99, 102, 241, 0.025)');
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.save();
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, auraRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Update & draw background particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    // Draw neural filaments between close particles
    drawFilaments();

    // Astra Interactive: Draw magnetic filaments from cursor to nearby particles
    if (mouse.x > 0 && mouse.y > 0) {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          const alpha = (1 - dist / 140) * 0.35;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }
    }

    // Spawn mouse light trail when moving
    if (mouse.speed > 1.8 && mouse.x > 0 && mouse.y > 0) {
      const trailCount = Math.min(5, Math.floor(mouse.speed / 4) + 1);
      for (let k = 0; k < trailCount; k++) {
        const chosenColor = colors[Math.floor(Math.random() * colors.length)];
        mouseTrail.push(new TrailNode(
          mouse.x + (Math.random() - 0.5) * 12,
          mouse.y + (Math.random() - 0.5) * 12,
          mouse.vx,
          mouse.vy,
          chosenColor
        ));
      }
    }

    // Update & draw mouse trails
    for (let i = mouseTrail.length - 1; i >= 0; i--) {
      const node = mouseTrail[i];
      node.update();
      node.draw();
      if (node.life <= 0) {
        mouseTrail.splice(i, 1);
      }
    }

    // Subtle decay on mouse speed
    mouse.speed *= 0.9;
    mouse.vx *= 0.85;
    mouse.vy *= 0.85;

    requestAnimationFrame(animate);
  }

  // Mouse movement listener with velocity calculation
  window.addEventListener('mousemove', function (e) {
    if (mouse.prevX !== -1000) {
      mouse.vx = e.clientX - mouse.prevX;
      mouse.vy = e.clientY - mouse.prevY;
      mouse.speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
    }
    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', function () {
    mouse.x = -1000;
    mouse.y = -1000;
    mouse.prevX = -1000;
    mouse.prevY = -1000;
  });

  // Touch support for mobile devices
  window.addEventListener('touchmove', function (e) {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      if (mouse.prevX !== -1000) {
        mouse.vx = touch.clientX - mouse.prevX;
        mouse.vy = touch.clientY - mouse.prevY;
        mouse.speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
      }
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
      mouse.x = touch.clientX;
      mouse.y = touch.clientY;
    }
  }, { passive: true });

  window.addEventListener('touchend', function () {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  window.addEventListener('resize', resize);

  // Initialize
  resize();
  animate();
})();
