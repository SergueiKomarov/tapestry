// ============================================================
// TAPESTRY HOLISTIC HEALING — MAIN SCRIPT
// ============================================================

(function () {
    'use strict';

    // ── Nav scroll effect ──────────────────────────────────────
    const navbar = document.getElementById('navbar');

    function updateNavbar() {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar(); // run on load


    // ── Mobile hamburger ───────────────────────────────────────
    const hamburger = document.getElementById('hamburger');
    const navMenu   = document.getElementById('navMenu');

    hamburger.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('open');
        hamburger.classList.toggle('active', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        hamburger.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu when a nav link is clicked
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.setAttribute('aria-label', 'Open navigation menu');
            document.body.style.overflow = '';
        });
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && navMenu.classList.contains('open')) {
            navMenu.classList.remove('open');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            hamburger.focus();
        }
    });


    // ── Active nav link tracking ───────────────────────────────
    const sections  = document.querySelectorAll('section[id]');
    const navLinks  = document.querySelectorAll('.nav-link[href^="#"]');

    function updateActiveLink() {
        let currentId = '';
        sections.forEach(section => {
            const top = section.offsetTop - (navbar.offsetHeight + 80);
            if (window.scrollY >= top) {
                currentId = section.id;
            }
        });
        navLinks.forEach(link => {
            const href = link.getAttribute('href').slice(1);
            link.classList.toggle('active', href === currentId);
        });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });


    // ── Scroll reveal (IntersectionObserver) ───────────────────
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const revealEls = document.querySelectorAll(
            '.modality-card, .credential-item, .faq-item, .welcome-inner, .about-inner'
        );

        revealEls.forEach((el, i) => {
            el.classList.add('reveal');
            // Stagger cards within a grid
            const siblings = el.parentElement.querySelectorAll(':scope > .reveal');
            const idx = Array.from(siblings).indexOf(el);
            if (idx > 0 && idx <= 3) {
                el.classList.add(`reveal-delay-${idx}`);
            }
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -60px 0px'
        });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }


    // ── Smooth scroll for anchor links ────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const offset = navbar.offsetHeight + 8;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

})();
