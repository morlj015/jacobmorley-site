/**
 * projects.js — project card modal behaviour
 * Reads data-* attributes from each .project-card and populates the modal
 */
(function () {
  'use strict';

  const overlay = document.getElementById('modalOverlay');
  const modal   = document.getElementById('modal');
  const closeBtn = document.getElementById('modalClose');

  if (!overlay || !modal) return;

  /* ── Helpers ─────────────────────────────────────────── */
  function openModal(card) {
    const title    = card.dataset.title    || '';
    const desc     = card.dataset.desc     || '';
    const tagsStr  = card.dataset.tags     || '';
    const featStr  = card.dataset.features || '[]';
    const color    = card.dataset.color    || '#e07a3f';
    const emoji    = card.dataset.emoji    || '💻';
    const github   = card.dataset.github   || '#';

    // Banner — clone the SVG graphic from the card
    const banner = document.getElementById('modalBanner');
    if (banner) {
      const cardBanner = card.querySelector('.project-card__banner');
      const cardSvg = cardBanner && cardBanner.querySelector('svg');
      banner.innerHTML = '';
      if (cardSvg) {
        const cloned = cardSvg.cloneNode(true);
        cloned.style.width = '100%';
        cloned.style.height = '100%';
        cloned.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        banner.style.background = cardBanner.style.background || '';
        banner.style.padding = '0';
        banner.style.fontSize = '0';
        banner.appendChild(cloned);
      } else {
        banner.style.background = `linear-gradient(135deg, #1a1918, ${color})`;
        banner.textContent = emoji;
      }
    }

    // Title
    const titleEl = document.getElementById('modalTitle');
    if (titleEl) titleEl.textContent = title;

    // Tags
    const tagsEl = document.getElementById('modalTags');
    if (tagsEl) {
      tagsEl.innerHTML = tagsStr.split(',').map(t =>
        `<span class="tag">${t.trim()}</span>`
      ).join('');
    }

    // Description
    const descEl = document.getElementById('modalDesc');
    if (descEl) descEl.textContent = desc;

    // Features
    const featEl = document.getElementById('modalFeatures');
    if (featEl) {
      try {
        const features = JSON.parse(featStr);
        featEl.innerHTML = features.map(f => `<li>${f}</li>`).join('');
      } catch {
        featEl.innerHTML = '';
      }
    }

    // GitHub / live site link
    const githubEl = document.getElementById('modalGithub');
    if (githubEl) {
      if (!github || github === '#') {
        githubEl.style.display = 'none';
      } else {
        githubEl.style.display = '';
        githubEl.href = github;
        const isGithub = github.includes('github.com') || github.includes('github.io');
        githubEl.innerHTML = isGithub
          ? '<i class="fa-brands fa-github" aria-hidden="true"></i> View on GitHub'
          : '<i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i> Visit Live Site';
      }
    }

    // Open
    overlay.hidden = false;
    overlay.removeAttribute('hidden');
    requestAnimationFrame(() => overlay.classList.add('open'));
    document.body.style.overflow = 'hidden';

    // Focus for accessibility
    setTimeout(() => closeBtn && closeBtn.focus(), 350);
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { overlay.hidden = true; }, 320);
  }

  /* ── Reverse card order ──────────────────────────────── */
  const grid = document.querySelector('.projects-grid');
  if (grid) {
    [...grid.children].reverse().forEach(card => grid.appendChild(card));
  }

  /* ── Event delegation on project cards ──────────────── */
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't open modal if a real external link was clicked
      const link = e.target.closest('a');
      if (link && link.href && !link.dataset.openModal && link.href !== '#') return;
      e.preventDefault();
      openModal(card);
    });

    // Keyboard: Enter/Space opens modal
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card);
      }
    });
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Open details for ${card.dataset.title}`);
  });

  /* ── Close actions ───────────────────────────────────── */
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

  /* ── Trap focus inside modal ─────────────────────────── */
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = modal.querySelectorAll(
      'button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

})();
