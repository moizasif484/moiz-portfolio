/**
 * 3D TILT & SPECULAR HIGHLIGHT SYSTEM
 * Applies perspective tilt to glass cards and tracks internal coordinates
 * for dynamic sheen/glare highlights and ambient parallax.
 */

(function () {
  'use strict';

  // Only run if not on mobile/touch device
  if (window.matchMedia('(pointer: coarse)').matches) return;

  function init3DTilt() {
    const cards = document.querySelectorAll(
      '.glass-card, .info-card, .service-card, .jarvis-card, .contact-info-card, .contact-form-card, .about-hero-card'
    );

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cardX = e.clientX - rect.left;
        const cardY = e.clientY - rect.top;

        // Set CSS variables for specular reflection highlight
        card.style.setProperty('--card-mouse-x', `${cardX}px`);
        card.style.setProperty('--card-mouse-y', `${cardY}px`);

        // Calculate tilt angles (-10deg to +10deg max for subtle luxury feel)
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((centerY - cardY) / centerY) * 7.5;
        const rotateY = ((cardX - centerX) / centerX) * 7.5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.12s ease-out, border-color 0.35s ease, box-shadow 0.35s ease';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.35s ease, box-shadow 0.35s ease';
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        card.style.setProperty('--card-mouse-x', '-300px');
        card.style.setProperty('--card-mouse-y', '-300px');
      });
    });

    // Gentle Parallax on Cyber Grid and Hero Abstract AI Visual
    const cyberGrid = document.querySelector('.cyber-grid');
    const heroVisual = document.querySelector('.hero-ai-visual');

    window.addEventListener('mousemove', (e) => {
      const offsetX = e.clientX - window.innerWidth / 2;
      const offsetY = e.clientY - window.innerHeight / 2;

      if (cyberGrid) {
        cyberGrid.style.transform = `translate(${offsetX * 0.015}px, ${offsetY * 0.015}px)`;
      }
      if (heroVisual) {
        heroVisual.style.transform = `translate(calc(-50% + ${offsetX * -0.025}px), calc(-50% + ${offsetY * -0.025}px))`;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init3DTilt);
  } else {
    init3DTilt();
  }
})();
