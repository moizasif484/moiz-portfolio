/**
 * CUSTOM INTERACTIVE CURSOR & MAGNETIC LIGHTING
 * Features:
 * - Dynamic mouse coordinates tracker updating CSS variables for spotlight
 * - Dual-layer cursor (laser dot + smooth lagging aura ring)
 * - Magnetic pull on interactive buttons & navigation items
 * - Auto-detect hover states on interactive glass elements
 */

(function () {
  'use strict';

  // Check if pointer is fine (desktop mouse)
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (!isFinePointer) return;

  const cursorDot = document.querySelector('.cursor-dot');
  const cursorFollower = document.querySelector('.cursor-follower');
  const root = document.documentElement;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let followerX = mouseX;
  let followerY = mouseY;
  let isMoving = false;
  let isHovered = false;

  // Track mouse coordinates
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isMoving = true;

    // Direct dot positioning
    if (cursorDot) {
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }

    // Update CSS variables for radial mouse spotlight
    root.style.setProperty('--mouse-x', `${mouseX}px`);
    root.style.setProperty('--mouse-y', `${mouseY}px`);
  });

  // Smooth animation loop for lagging follower ring
  function renderCursor() {
    // Lerp follower position
    followerX += (mouseX - followerX) * 0.18;
    followerY += (mouseY - followerY) * 0.18;

    if (cursorFollower) {
      cursorFollower.style.left = `${followerX}px`;
      cursorFollower.style.top = `${followerY}px`;
    }

    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Magnetic Button Effect & Hover expansion
  function setupMagneticElements() {
    const magneticTargets = document.querySelectorAll(
      'a, button, .btn, .nav-link, .nav-cta, .channel-link, .glass-card, .info-card, .tech-tag'
    );

    magneticTargets.forEach((el) => {
      // Hover state toggle
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
        isHovered = true;
      });

      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
        isHovered = false;
        if (el.classList.contains('btn') || el.classList.contains('nav-cta') || el.classList.contains('channel-link')) {
          el.style.transition = 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)';
          el.style.transform = 'translate(0px, 0px)';
        }
      });

      // Magnetic pull specifically for buttons & interactive chips
      if (el.classList.contains('btn') || el.classList.contains('nav-cta') || el.classList.contains('channel-link')) {
        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const deltaX = (e.clientX - centerX) * 0.25;
          const deltaY = (e.clientY - centerY) * 0.25;
          el.style.transition = 'transform 0.08s ease-out';
          el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        });
      }
    });
  }

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    if (cursorDot) cursorDot.style.opacity = '0';
    if (cursorFollower) cursorFollower.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    if (cursorDot) cursorDot.style.opacity = '1';
    if (cursorFollower) cursorFollower.style.opacity = '1';
  });

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMagneticElements);
  } else {
    setupMagneticElements();
  }
})();
