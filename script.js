/* ========================================
   Turtle Rock Companies — Script
   ======================================== */

(function () {
    'use strict';

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

    // ---- Active nav link highlighting ----
    var navItems = document.querySelectorAll('.nav-links a');

    if ('IntersectionObserver' in window) {
        var sections = document.querySelectorAll('section[id]');

        var observer = new IntersectionObserver(function (entries) {
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

        for (var s = 0; s < sections.length; s++) {
            observer.observe(sections[s]);
        }
    }

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
