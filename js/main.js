/**
 * main.js — shared behaviour across all pages
 * - Nav scroll state
 * - Mobile hamburger menu
 * - Scroll-reveal (Intersection Observer)
 * - Contact form (mailto fallback)
 * - Terminal typewriter effect
 */
(function () {
  'use strict';

  /* ── Scroll progress bar ───────────────────────────────── */
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    const updateProgress = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* ── Nav scroll state ──────────────────────────────────── */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Hero title → nav logo morph ───────────────────────── */
  const heroName   = document.getElementById('heroName');
  const morphTitle = document.getElementById('morphTitle');
  const morphLast  = document.getElementById('morphLast');
  const navLogo    = document.querySelector('.nav__logo');

  // Non-hero pages: show nav logo immediately; flag any Home navigation so index.html plays reverse entrance
  if (!heroName && navLogo) {
    navLogo.classList.add('is-visible');
    const flagHomeNav = () => sessionStorage.setItem('navLogoClick', '1');
    navLogo.addEventListener('click', flagHomeNav);
    document.querySelectorAll('a[href="index.html"], a[href="./index.html"]').forEach(a => {
      a.addEventListener('click', flagHomeNav);
    });
  }

  if (heroName && morphTitle && navLogo) {
    const heroSection = document.getElementById('hero');
    let heroFontSize = 0;
    let navFontSize  = 0;
    let scrollControlReady = false;

    function lerp(a, b, t) { return a + (b - a) * t; }
    function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

    function updateMorph() {
      if (!scrollControlReady) return;

      const scrollY = window.scrollY;
      const heroH   = heroSection ? heroSection.offsetHeight : window.innerHeight;
      const rawP    = Math.max(0, Math.min(1, scrollY / (heroH * 0.75)));
      const p       = easeInOut(rawP);

      // Live positions: h1 scrolls with page; nav logo is sticky at top
      const heroRect = heroName.getBoundingClientRect();
      const navRect  = navLogo.getBoundingClientRect();

      const scaleEnd     = navFontSize / heroFontSize;
      const currentScale = lerp(1, scaleEnd, p);
      const currentX     = lerp(heroRect.left, navRect.left, p);
      const navTargetY   = navRect.top + navRect.height / 2 - (morphTitle.offsetHeight * scaleEnd) / 2;
      const currentY     = lerp(heroRect.top,  navTargetY,  p);
      const currentLS    = lerp(-0.04, -0.02, p);

      morphTitle.style.transform     = `translate(${currentX}px, ${currentY}px) scale(${currentScale})`;
      morphTitle.style.letterSpacing = `${currentLS}em`;

      // " Morley" fades in during the last 40% of the animation
      morphLast.style.opacity = String(Math.max(0, Math.min(1, (p - 0.6) / 0.4)));

      // Make clickable only when it's sitting in the nav area
      morphTitle.classList.toggle('is-clickable', p > 0.9);
    }

    // Clicking the morph when it's in nav position scrolls back to top
    // (updateMorph runs on scroll so the expansion back to hero happens naturally)
    morphTitle.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const fromNav = sessionStorage.getItem('navLogoClick');
    if (fromNav) sessionStorage.removeItem('navLogoClick');

    if (fromNav) {
      // ── Reverse entrance: expand from nav position to hero ──
      heroName.style.animation = 'none';
      heroName.style.opacity   = '0';

      document.fonts.ready.then(() => {
        requestAnimationFrame(() => {
          heroFontSize = parseFloat(getComputedStyle(heroName).fontSize);
          navFontSize  = parseFloat(getComputedStyle(navLogo).fontSize);

          const heroRect = heroName.getBoundingClientRect();
          const navRect  = navLogo.getBoundingClientRect();
          const scaleEnd = navFontSize / heroFontSize;
          const startY   = navRect.top + navRect.height / 2 - morphTitle.offsetHeight * scaleEnd / 2;

          // Snap to nav position (no transition yet)
          morphTitle.style.transition    = 'none';
          morphTitle.style.fontSize      = heroFontSize + 'px';
          morphTitle.style.letterSpacing = '-0.02em';
          morphTitle.style.opacity       = '1';
          morphTitle.style.transform     = `translate(${navRect.left}px, ${startY}px) scale(${scaleEnd})`;
          morphLast.style.opacity        = '1';

          // Animate outward to hero position on next frame
          requestAnimationFrame(() => {
            morphTitle.style.transition = 'transform 0.75s cubic-bezier(0.34, 1.3, 0.64, 1), letter-spacing 0.75s ease';
            morphLast.style.transition  = 'opacity 0.2s ease';
            morphTitle.style.transform     = `translate(${heroRect.left}px, ${heroRect.top}px) scale(1)`;
            morphTitle.style.letterSpacing = '-0.04em';
            morphLast.style.opacity        = '0';

            // Hand off to scroll control after animation
            setTimeout(() => {
              morphTitle.style.transition = '';
              morphLast.style.transition  = '';
              scrollControlReady = true;
              updateMorph();
            }, 800);
          });
        });
      });

    } else {
      // ── Normal entrance: wait for CSS animation, then hand off ──
      setTimeout(() => {
        const heroRect = heroName.getBoundingClientRect();
        heroFontSize   = parseFloat(getComputedStyle(heroName).fontSize);
        navFontSize    = parseFloat(getComputedStyle(navLogo).fontSize);

        heroName.style.animation = 'none';
        heroName.style.opacity   = '0';

        morphTitle.style.fontSize  = heroFontSize + 'px';
        morphTitle.style.transform = `translate(${heroRect.left}px, ${heroRect.top}px) scale(1)`;
        morphTitle.style.opacity   = '1';

        scrollControlReady = true;
        updateMorph();
      }, 850);
    }

    window.addEventListener('scroll', updateMorph, { passive: true });

    // Nav link click → animate morph to nav corner, then navigate
    document.querySelectorAll('.nav__link').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return; // skip same-page anchors

      link.addEventListener('click', (e) => {
        if (!scrollControlReady) return; // not ready yet — navigate normally

        const scrollY = window.scrollY;
        const heroH   = heroSection ? heroSection.offsetHeight : window.innerHeight;
        const rawP    = Math.max(0, Math.min(1, scrollY / (heroH * 0.75)));
        const p       = easeInOut(rawP);

        if (p >= 1) return; // morph already in nav — navigate normally

        e.preventDefault();

        const navRect  = navLogo.getBoundingClientRect();
        const scaleEnd = navFontSize / heroFontSize;
        const targetY  = navRect.top + navRect.height / 2 - morphTitle.offsetHeight * scaleEnd / 2;

        morphTitle.style.transition    = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), letter-spacing 0.5s ease';
        morphLast.style.transition     = 'opacity 0.4s ease 0.1s';
        morphTitle.style.transform     = `translate(${navRect.left}px, ${targetY}px) scale(${scaleEnd})`;
        morphTitle.style.letterSpacing = '-0.02em';
        morphLast.style.opacity        = '1';

        setTimeout(() => { window.location.href = href; }, 530);
      });
    });
  }

  /* ── Mobile hamburger ──────────────────────────────────── */
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when a link is clicked
    links.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!nav || nav.contains(e.target)) return;
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  }

  /* ── Scroll reveal ─────────────────────────────────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Stagger children if they have the reveal class
        const children = entry.target.querySelectorAll('.reveal');
        children.forEach((child, i) => {
          child.style.transitionDelay = (i * 0.08) + 's';
          child.classList.add('is-visible');
        });
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ── Hero typewriter ────────────────────────────────────── */
  const typewriterEl = document.getElementById('typewriterText');
  if (typewriterEl) {
    const roles = [
      'a web developer.',
      'an AI Automation Engineer.',
      'a musician.',
      'a kitesurfer.',
      'a writer.',
      'a company director.',
    ];
    const TYPE_SPEED   = 60;   // ms per character
    const DELETE_SPEED = 35;   // ms per character
    const PAUSE_AFTER  = 1800; // ms to hold the completed word
    const PAUSE_BEFORE = 400;  // ms pause before typing next

    let roleIndex  = 0;
    let charIndex  = 0;
    let deleting   = false;

    function tick() {
      const current = roles[roleIndex];

      if (!deleting) {
        typewriterEl.textContent = current.slice(0, ++charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(tick, PAUSE_AFTER);
          return;
        }
      } else {
        typewriterEl.textContent = current.slice(0, --charIndex);
        if (charIndex === 0) {
          deleting   = false;
          roleIndex  = (roleIndex + 1) % roles.length;
          setTimeout(tick, PAUSE_BEFORE);
          return;
        }
      }

      setTimeout(tick, deleting ? DELETE_SPEED : TYPE_SPEED);
    }

    // Small initial delay so the page settles before typing starts
    setTimeout(tick, 800);
  }

  /* ── Contact form (mailto) ─────────────────────────────── */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name    = form.querySelector('#name')?.value.trim()    || '';
      const email   = form.querySelector('#email')?.value.trim()   || '';
      const message = form.querySelector('#message')?.value.trim() || '';

      if (!name || !email || !message) {
        alert('Please fill in all fields.');
        return;
      }

      const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
      const body    = encodeURIComponent(
        `Hi Jacob,\n\n${message}\n\n---\nFrom: ${name}\nEmail: ${email}`
      );
      const mailto  = `mailto:morleyjacob6@gmail.com?subject=${subject}&body=${body}`;

      // Open mailto
      window.location.href = mailto;

      // Show feedback
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Email client opened!';
        btn.disabled  = true;
        btn.style.background = '#22c55e';
        btn.style.borderColor = '#22c55e';

        setTimeout(() => {
          btn.innerHTML = original;
          btn.disabled  = false;
          btn.style.background = '';
          btn.style.borderColor = '';
        }, 4000);
      }
    });
  }

  /* ── Terminal typewriter effect ────────────────────────── */
  const terminalText   = document.getElementById('terminalText');
  const terminalOutput = document.getElementById('terminalOutput');

  if (terminalText && terminalOutput) {
    const command = 'connect --linkedin';
    let   index   = 0;
    let   started = false;

    const typeObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        typeObserver.disconnect();
        // Delay then start typing
        setTimeout(typeWriter, 600);
      }
    }, { threshold: 0.5 });

    typeObserver.observe(terminalText);

    function typeWriter() {
      if (index < command.length) {
        terminalText.textContent += command[index];
        index++;
        setTimeout(typeWriter, 80 + Math.random() * 40);
      } else {
        // Show output after typing finishes
        setTimeout(() => {
          terminalOutput.style.opacity = '1';
        }, 350);
      }
    }
  }

  /* ── Theme toggle ──────────────────────────────────────── */
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon   = document.getElementById('themeIcon');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (themeIcon) {
      themeIcon.className = theme === 'light'
        ? 'fa-solid fa-moon'
        : 'fa-solid fa-sun';
    }
  }

  // Sync icon to current theme on page load
  if (themeIcon) {
    const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    themeIcon.className = initialTheme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      applyTheme(current === 'light' ? 'dark' : 'light');
    });
  }

  /* ── Skill card: reset transition delays after reveal ── */
  // Prevents transition delays from lingering on re-hover
  const skillGrid = document.querySelector('.skills__grid');
  if (skillGrid) {
    const skillObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const cards = skillGrid.querySelectorAll('.skill-card');
        cards.forEach((card, i) => {
          card.style.transitionDelay = (i * 0.05) + 's';
          card.classList.add('is-visible');
          // Reset delay after entrance animation so hover is instant
          setTimeout(() => { card.style.transitionDelay = '0s'; }, 800 + i * 50);
        });
        skillObserver.disconnect();
      }
    }, { threshold: 0.1 });
    skillObserver.observe(skillGrid);
  }

})();
