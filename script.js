/* ========================================
   Turtle Rock Companies — Script
   ======================================== */

(function () {
    'use strict';

    var body = document.body;

    // ---- Nav scroll state ----
    var nav = document.getElementById('nav');

    function handleNavScroll() {
        if (window.scrollY > 50) {
            nav.classList.add('nav-scrolled');
        } else {
            nav.classList.remove('nav-scrolled');
        }
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();

    // ---- Mobile menu toggle ----
    var navToggle = document.querySelector('.nav-toggle');
    var navLinks = document.querySelector('.nav-links');

    navToggle.addEventListener('click', function () {
        var isOpen = navLinks.classList.toggle('nav-open');
        navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu on link click
    var navAnchors = document.querySelectorAll('.nav-links a');
    for (var i = 0; i < navAnchors.length; i++) {
        navAnchors[i].addEventListener('click', function () {
            navLinks.classList.remove('nav-open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    }

    // ---- Active nav link highlighting (dynamic) ----
    var navItems = document.querySelectorAll('.nav-links a');
    var sectionObserver = null;

    function updateSectionObserver() {
        if (sectionObserver) {
            sectionObserver.disconnect();
        }

        if (!('IntersectionObserver' in window)) return;

        var allSections = document.querySelectorAll('section[id]');
        var visibleSections = [];
        var activePathway = body.classList.contains('pathway-buyside') ? 'buyside'
                          : body.classList.contains('pathway-longterm') ? 'longterm'
                          : null;

        for (var s = 0; s < allSections.length; s++) {
            var sec = allSections[s];
            var pathway = sec.getAttribute('data-pathway');

            // Include section if: no pathway active, section is shared/no-pathway, or matches active pathway
            if (!activePathway || !pathway || pathway === 'shared' || pathway === activePathway) {
                visibleSections.push(sec);
            }
        }

        sectionObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    for (var j = 0; j < navItems.length; j++) {
                        navItems[j].classList.remove('active');
                        if (navItems[j].getAttribute('href') === '#' + entry.target.id) {
                            navItems[j].classList.add('active');
                        }
                    }
                }
            });
        }, { rootMargin: '-20% 0px -80% 0px' });

        for (var v = 0; v < visibleSections.length; v++) {
            sectionObserver.observe(visibleSections[v]);
        }
    }

    // Initial observer setup
    updateSectionObserver();

    // ---- Pathway selection ----
    var pathwaySwitcher = document.getElementById('pathway-switcher');
    var switcherCurrent = document.getElementById('switcher-current');
    var switcherLink = document.getElementById('switcher-link');
    var pathwayCards = document.querySelectorAll('.pathway-card[data-pathway-trigger]');

    var pathwayLabels = {
        buyside: 'Buyside Origination',
        longterm: 'Long-Term Acquisition Vehicle'
    };

    var pathwayOpposite = {
        buyside: 'longterm',
        longterm: 'buyside'
    };

    function selectPathway(pathway) {
        var opposite = pathwayOpposite[pathway];

        // Update body classes
        body.classList.add('pathway-active');
        body.classList.remove('pathway-' + opposite);
        body.classList.add('pathway-' + pathway);

        // Update switcher bar
        switcherCurrent.textContent = 'Viewing: ' + pathwayLabels[pathway];
        switcherLink.textContent = 'Switch to ' + pathwayLabels[opposite];
        switcherLink.setAttribute('data-switch-to', opposite);
        pathwaySwitcher.style.display = '';

        // Set aria-hidden on collapsed sections
        var hiddenSections = document.querySelectorAll('[data-pathway="' + opposite + '"]');
        var visibleSections = document.querySelectorAll('[data-pathway="' + pathway + '"], [data-pathway="shared"]');
        for (var h = 0; h < hiddenSections.length; h++) {
            hiddenSections[h].setAttribute('aria-hidden', 'true');
        }
        for (var v = 0; v < visibleSections.length; v++) {
            visibleSections[v].removeAttribute('aria-hidden');
        }

        // Store in sessionStorage
        try {
            sessionStorage.setItem('trc-pathway', pathway);
        } catch (e) {
            // sessionStorage unavailable — silent fail
        }

        // Refresh the IntersectionObserver
        updateSectionObserver();
    }

    // Pathway card click handlers
    for (var c = 0; c < pathwayCards.length; c++) {
        (function (card) {
            card.addEventListener('click', function (e) {
                var trigger = card.getAttribute('data-pathway-trigger');
                var target = e.target;

                // If clicking the CTA button, prevent default scroll and handle manually
                if (target.classList.contains('pathway-cta')) {
                    e.preventDefault();
                    selectPathway(trigger);

                    // Scroll to target section after a short delay for CSS transition to begin
                    var href = target.getAttribute('href');
                    setTimeout(function () {
                        var section = document.querySelector(href);
                        if (section) {
                            section.scrollIntoView({ behavior: 'smooth' });
                        }
                    }, 100);
                } else {
                    // Clicked the card itself (not the button) — just select pathway
                    selectPathway(trigger);
                }
            });

            // Make entire card feel clickable
            card.style.cursor = 'pointer';
        })(pathwayCards[c]);
    }

    // Switcher link handler
    switcherLink.addEventListener('click', function (e) {
        e.preventDefault();
        var switchTo = switcherLink.getAttribute('data-switch-to');
        selectPathway(switchTo);

        // Scroll back to pathways section
        var pathwaysSection = document.getElementById('pathways');
        if (pathwaysSection) {
            pathwaysSection.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // ---- Initial state from URL hash or sessionStorage ----
    var buysideSections = ['services', 'approach'];
    var longtermSections = ['objective', 'criteria'];

    function getPathwayFromHash() {
        var hash = window.location.hash;
        if (!hash) return null;

        var sectionId = hash.replace('#', '');
        if (buysideSections.indexOf(sectionId) !== -1) return 'buyside';
        if (longtermSections.indexOf(sectionId) !== -1) return 'longterm';
        return null;
    }

    (function initPathway() {
        var hashPathway = getPathwayFromHash();
        var storedPathway = null;
        try {
            storedPathway = sessionStorage.getItem('trc-pathway');
        } catch (e) {}

        var initialPathway = hashPathway || storedPathway;

        if (initialPathway && pathwayLabels[initialPathway]) {
            selectPathway(initialPathway);
        }
    })();

    // Handle hashchange (browser back/forward or manual hash edit)
    window.addEventListener('hashchange', function () {
        var hashPathway = getPathwayFromHash();
        if (hashPathway) {
            selectPathway(hashPathway);
        }
    });

    // ---- Contact form ----
    var form = document.getElementById('contact-form');
    var formStatus = document.getElementById('form-status');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        var formData = new FormData(form);

        var formspreeEndpoint = 'https://formspree.io/f/mbdapqag';

        fetch(formspreeEndpoint, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        })
        .then(function (response) {
            if (response.ok) {
                formStatus.textContent = 'Message sent. We will be in touch.';
                formStatus.className = 'form-status form-status-success';
                form.reset();
            } else {
                throw new Error('Submission failed');
            }
        })
        .catch(function () {
            formStatus.textContent = 'There was an error. Please email us directly at andrew@turtlerockcompanies.com';
            formStatus.className = 'form-status form-status-error';
        });
    });

    // ---- Footer year ----
    var yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

})();
