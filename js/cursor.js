/**
 * CUSTOM CURSOR — SIMPLE & SUBTLE
 * A small dot that tracks the pointer exactly, plus a soft lagging ring.
 * Only interaction: the ring grows slightly on hover over links/buttons.
 * No trails, no magnetic pull, no particles.
 */

(function () {
  'use strict';

  // Desktop pointers only — no custom cursor on touch devices
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (!isFinePointer) return;

  const cursorDot = document.querySelector('.cursor-dot');
  const cursorFollower = document.querySelector('.cursor-follower');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let followerX = mouseX;
  let followerY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (cursorDot) {
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }
  });

  function renderCursor() {
    followerX += (mouseX - followerX) * 0.2;
    followerY += (mouseY - followerY) * 0.2;

    if (cursorFollower) {
      cursorFollower.style.left = `${followerX}px`;
      cursorFollower.style.top = `${followerY}px`;
    }

    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Subtle hover state on interactive elements only
  function setupHoverStates() {
    const hoverTargets = document.querySelectorAll(
      'a, button, .btn, .nav-link, .nav-cta, .channel-link, .glass-card, .info-card, .tech-tag'
    );

    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
      });
    });
  }

  document.addEventListener('mouseleave', () => {
    if (cursorDot) cursorDot.style.opacity = '0';
    if (cursorFollower) cursorFollower.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    if (cursorDot) cursorDot.style.opacity = '1';
    if (cursorFollower) cursorFollower.style.opacity = '1';
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupHoverStates);
  } else {
    setupHoverStates();
  }
})();
