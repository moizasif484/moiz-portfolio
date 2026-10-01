/**
 * CARD SHEEN TRACKING
 * Tracks pointer position inside glass cards to drive a soft highlight
 * (see --card-mouse-x/--card-mouse-y in CSS). No 3D tilt, no parallax —
 * just a gentle, premium light-reflection cue.
 */

(function () {
  'use strict';

  // Skip on touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  function initCardSheen() {
    const cards = document.querySelectorAll(
      '.glass-card, .info-card, .service-card, .jarvis-card, .contact-info-card, .contact-form-card, .about-hero-card'
    );

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--card-mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--card-mouse-y', `${e.clientY - rect.top}px`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--card-mouse-x', '-300px');
        card.style.setProperty('--card-mouse-y', '-300px');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCardSheen);
  } else {
    initCardSheen();
  }
})();
