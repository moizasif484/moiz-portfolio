/**
 * MOIZ ASIF — CORE PORTFOLIO CONTROLLER
 * Handles:
 * - Smooth page transitions
 * - Mobile navigation menu drawer
 * - Interactive JARVIS modals (Live Demo & Details)
 * - Active navigation indicator
 * - Contact form direct WhatsApp messenger
 */

(function () {
  'use strict';

  // 1. Smooth Page Entrance & Exit
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Smooth Page Entrance & Exit
    initPageLoader();
    initScrollReveal();

    const pageWrapper = document.querySelector('.page-wrapper');
    if (pageWrapper) {
      setTimeout(() => {
        pageWrapper.classList.add('page-loaded');
      }, 50);
    }

    // Intercept internal page links for cinematic transition
    const internalLinks = document.querySelectorAll('a[href]:not([target="_blank"]):not([href^="#"]):not([href^="mailto:"]):not([href^="https://wa.me"]):not([href^="javascript:"])');
    internalLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        // Check if destination is an html file or root
        if (href && (href.endsWith('.html') || href === '/' || href.startsWith('./'))) {
          e.preventDefault();
          const loaderLine = document.querySelector('.loader-line');
          if (loaderLine) {
            loaderLine.style.opacity = '1';
            loaderLine.style.width = '100%';
          }
          if (pageWrapper) {
            pageWrapper.classList.remove('page-loaded');
            pageWrapper.style.opacity = '0';
            pageWrapper.style.transform = 'translateY(-12px)';
          }
          setTimeout(() => {
            window.location.href = href;
          }, 280);
        }
      });
    });

    // Highlight current nav link based on pathname
    highlightActiveNav();

    // 2. Mobile Navigation Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileDrawer = document.querySelector('.mobile-menu-drawer');

    if (mobileToggle && mobileDrawer) {
      mobileToggle.addEventListener('click', () => {
        const isOpen = mobileDrawer.classList.toggle('open');
        mobileToggle.innerHTML = isOpen ? '✕' : '☰';
        mobileToggle.setAttribute('aria-expanded', isOpen);
      });

      // Close mobile drawer when clicking a link
      mobileDrawer.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
          mobileDrawer.classList.remove('open');
          mobileToggle.innerHTML = '☰';
        });
      });
    }

    // 3. Modal System (JARVIS Showcase)
    setupModals();

    // 4. Contact Form WhatsApp Dispatcher
    setupContactForm();
  });

  // Futuristic Page Progress Bar Loader
  function initPageLoader() {
    let loader = document.querySelector('.page-loader');
    if (!loader) {
      loader = document.createElement('div');
      loader.className = 'page-loader';
      loader.innerHTML = '<div class="loader-line"></div>';
      document.body.prepend(loader);
    }
    const line = loader.querySelector('.loader-line');
    if (line) {
      line.style.width = '35%';
      setTimeout(() => {
        line.style.width = '85%';
      }, 80);
      setTimeout(() => {
        line.style.width = '100%';
        setTimeout(() => {
          line.style.opacity = '0';
        }, 250);
      }, 200);
    }
  }

  // Scroll Reveal Animations (fade-up, subtle scale)
  function initScrollReveal() {
    const revealTargets = document.querySelectorAll(
      '.hero-section, .about-hero-card, .info-card, .tech-skills-section, .jarvis-showcase-wrapper, .service-card, .contact-info-card, .contact-form-card, .section-header'
    );

    if (!('IntersectionObserver' in window)) {
      revealTargets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    revealTargets.forEach((el, index) => {
      el.classList.add('reveal-on-scroll');
      // Add subtle stagger to sibling cards
      if (el.classList.contains('info-card') || el.classList.contains('service-card')) {
        const staggerClass = `delay-${(index % 4) + 1}`;
        el.classList.add(staggerClass);
      }
      observer.observe(el);
    });
  }

  // Highlight active link in navbar
  function highlightActiveNav() {
    const currentPath = window.location.pathname;
    const page = currentPath.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === page || (page === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Modals for Live Demo and Technical Details
  function setupModals() {
    const demoBtn = document.getElementById('open-demo-modal');
    const detailsBtn = document.getElementById('open-details-modal');
    const modalOverlay = document.getElementById('jarvis-modal');
    const modalCloseBtn = document.getElementById('close-modal-btn');
    const modalContentContainer = document.getElementById('modal-dynamic-content');

    if (!modalOverlay || !modalContentContainer) return;

    function openModal(contentHtml) {
      modalContentContainer.innerHTML = contentHtml;
      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (demoBtn) {
      demoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(`
          <div style="text-align: left;">
            <div style="display:flex; align-items:center; gap: 0.75rem; margin-bottom: 1rem;">
              <span class="jarvis-tag-badge" style="margin-bottom:0;">Live Demo Preview</span>
              <span style="font-family: var(--font-mono); font-size: 0.8rem; color: #22c55e;">● SYSTEM ACTIVE</span>
            </div>
            <h2 style="font-family: var(--font-heading); font-size: 1.85rem; color: #ffffff; margin-bottom: 0.75rem;">
              JARVIS AI Assistant Interface
            </h2>
            <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem;">
              JARVIS features a custom designed Gold & Black desktop interface powered by a real-time animated particle core with dynamic orbital telemetry rings.
            </p>

            <div style="border-radius: 14px; overflow: hidden; border: 1px solid rgba(255, 170, 0, 0.35); box-shadow: 0 0 35px rgba(255, 170, 0, 0.2); margin-bottom: 1.5rem;">
              <img src="assets/images/jarvis-gold.png" alt="JARVIS Core Interface" style="width: 100%; display: block;" />
            </div>

            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 170, 0, 0.2); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem;">
              <h4 style="font-family: var(--font-mono); font-size: 0.85rem; color: #fde68a; margin-bottom: 0.5rem; text-transform: uppercase;">
                Interactive Core Capabilities:
              </h4>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; color: #cbd5e1; font-size: 0.88rem;">
                <li><span style="color: #ffaa00;">✦</span> <strong>Orbital AI Core:</strong> Real-time physics particle reaction responding to system audio & voice pulses.</li>
                <li><span style="color: #ffaa00;">✦</span> <strong>Voice & Speech Synthesis:</strong> High-fidelity local and neural voice interaction.</li>
                <li><span style="color: #ffaa00;">✦</span> <strong>Desktop Automation:</strong> Direct script execution and workflow automation commands.</li>
              </ul>
            </div>

            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
              <a href="https://github.com/moizasif484/" target="_blank" rel="noopener noreferrer" class="btn btn-jarvis-gold">
                View Code on GitHub ↗
              </a>
              <a href="https://wa.me/923362383383?text=Hi%20Moiz,%20I%20saw%20your%20JARVIS%20AI%20Assistant%20demo%20and%20would%20love%20to%20discuss%20it!" target="_blank" rel="noopener noreferrer" class="btn btn-jarvis-outline">
                Contact Moiz for Live Demo ↗
              </a>
            </div>
          </div>
        `);
      });
    }

    if (detailsBtn) {
      detailsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(`
          <div style="text-align: left;">
            <div style="display:flex; align-items:center; gap: 0.75rem; margin-bottom: 1rem;">
              <span class="jarvis-tag-badge" style="margin-bottom:0;">Architecture & Specs</span>
            </div>
            <h2 style="font-family: var(--font-heading); font-size: 1.85rem; color: #ffffff; margin-bottom: 0.75rem;">
              JARVIS System Architecture
            </h2>
            <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.25rem;">
              Built by Moiz Asif as a full-fledged intelligent desktop assistant combining custom GUI visualization, speech processing, and automated tool integration.
            </p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 170, 0, 0.2); border-radius: 12px; padding: 1rem;">
                <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #ffaa00; margin-bottom: 0.25rem;">FRONTEND & VISUALS</div>
                <div style="color: #ffffff; font-weight: 600; font-size: 0.95rem;">Gold Orb GUI System</div>
                <div style="color: #94a3b8; font-size: 0.82rem; margin-top: 0.25rem;">Particle physics, rotating orbital telemetry, and dark HUD frame.</div>
              </div>

              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 170, 0, 0.2); border-radius: 12px; padding: 1rem;">
                <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #ffaa00; margin-bottom: 0.25rem;">INTELLIGENCE ENGINE</div>
                <div style="color: #ffffff; font-weight: 600; font-size: 0.95rem;">Python & AI APIs</div>
                <div style="color: #94a3b8; font-size: 0.82rem; margin-top: 0.25rem;">Conversational reasoning, context persistence, and command parsing.</div>
              </div>
            </div>

            <div style="background: rgba(14, 12, 6, 0.8); border: 1px solid rgba(255, 170, 0, 0.25); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem;">
              <div style="font-family: var(--font-mono); font-size: 0.8rem; color: #fde68a; margin-bottom: 0.65rem;">FULL VERIFIED STACK:</div>
              <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
                <span class="jarvis-tech-chip">Python</span>
                <span class="jarvis-tech-chip">AI APIs</span>
                <span class="jarvis-tech-chip">Voice Recognition</span>
                <span class="jarvis-tech-chip">Text-to-Speech (TTS)</span>
                <span class="jarvis-tech-chip">Automation Scripts</span>
                <span class="jarvis-tech-chip">Custom UI Engine</span>
              </div>
            </div>

            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
              <a href="https://github.com/moizasif484/" target="_blank" rel="noopener noreferrer" class="btn btn-jarvis-gold">
                Explore Repository ↗
              </a>
              <button onclick="document.getElementById('close-modal-btn').click();" class="btn btn-jarvis-outline">
                Close Window
              </button>
            </div>
          </div>
        `);
      });
    }

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeModal);
    }

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // 4. Contact Form Handler (Direct WhatsApp Connection)
  function setupContactForm() {
    const contactForm = document.getElementById('portfolio-contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('contact-name');
      const messageInput = document.getElementById('contact-message');

      const name = nameInput ? nameInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      if (!name || !message) {
        alert('Please provide both your name and message.');
        return;
      }

      // Format WhatsApp message text
      const fullText = `Hello Moiz, my name is ${name}. I am contacting you from your portfolio website:\n\n"${message}"`;
      const encoded = encodeURIComponent(fullText);
      const whatsappUrl = `https://wa.me/923362383383?text=${encoded}`;

      // Show temporary confirmation and redirect
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Connecting to WhatsApp... 🚀';
        submitBtn.disabled = true;

        setTimeout(() => {
          window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
          submitBtn.innerHTML = 'Message Sent to WhatsApp! ✓';
          contactForm.reset();

          setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
          }, 3000);
        }, 600);
      }
    });
  }
})();
