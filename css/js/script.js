/* ==========================================================================
   DAHIRA MADJMAHOUN NOREYNI TOUBA MALIKA — SCRIPT.JS
   --------------------------------------------------------------------------
   Comportements globaux présents sur TOUTES les pages :
     1. Utilitaires (debounce)
     2. Année courante (footer)
     3. Menu mobile (hamburger)
     4. Mode sombre / clair (persistant)
     5. Ombre du header au scroll
     6. Révélation des éléments au scroll
     7. Compteurs animés (accueil)
     8. Sous-onglets avec scrollspy (À propos, Organisation, Médias)
     9. Filtres par catégorie (Activités, Actualités, Médias, Ressources)
   ========================================================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initFooterYear();
    initMobileNav();
    initThemeToggle();
    initStickyHeaderShadow();
    initScrollReveal();
    initCountUp();
    initSubTabsScrollspy();
    initFilterTabs();
  });

  /* ---------- 1. UTILITAIRES ---------- */

  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var context = this;
      var args = arguments;
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

  /* ---------- 2. ANNÉE COURANTE (FOOTER) ---------- */

  function initFooterYear() {
    var targets = document.querySelectorAll('[data-current-year]');
    var year = new Date().getFullYear();
    targets.forEach(function (el) {
      el.textContent = year;
    });
  }

  /* ---------- 3. MENU MOBILE (HAMBURGER) ---------- */

  function initMobileNav() {
    var hamburger = document.querySelector('.hamburger');
    var navLinks = document.getElementById('nav-links');
    if (!hamburger || !navLinks) return;

    function closeMenu() {
      navLinks.classList.remove('is-open');
      hamburger.classList.remove('is-active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    }

    function openMenu() {
      navLinks.classList.add('is-open');
      hamburger.classList.add('is-active');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('nav-open');
    }

    hamburger.addEventListener('click', function () {
      var isOpen = navLinks.classList.contains('is-open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    document.addEventListener('click', function (e) {
      var clickedInsideNav = navLinks.contains(e.target) || hamburger.contains(e.target);
      if (!clickedInsideNav && navLinks.classList.contains('is-open')) {
        closeMenu();
      }
    });

    window.addEventListener('resize', debounce(function () {
      if (window.innerWidth > 760) closeMenu();
    }, 150));
  }

  /* ---------- 4. MODE SOMBRE / CLAIR ---------- */

  function initThemeToggle() {
    var toggleBtn = document.querySelector('[data-theme-toggle]');
    var root = document.documentElement;
    var STORAGE_KEY = 'dahira-theme';

    function applyTheme(theme) {
      if (theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
      }
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        var icon = toggleBtn.querySelector('span[aria-hidden]');
        if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
      }
    }

    var saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      /* stockage indisponible : on ignore silencieusement */
    }

    if (saved === 'dark' || saved === 'light') {
      applyTheme(saved);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      applyTheme('dark');
    }

    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', function () {
      var isDark = root.getAttribute('data-theme') === 'dark';
      var next = isDark ? 'light' : 'dark';
      applyTheme(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (err) {
        /* sans gravité si indisponible */
      }
    });
  }

  /* ---------- 5. OMBRE DU HEADER AU SCROLL ---------- */

  function initStickyHeaderShadow() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var ticking = false;

    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  /* ---------- 6. RÉVÉLATION AU SCROLL ---------- */

  function initScrollReveal() {
    var selector = [
      '.activity-card', '.value-card', '.commission-card', '.news-card',
      '.stat-card', '.timeline-item', '.resource-item', '.gallery-card',
      '.event-card', '.photo-item', '.podcast-item', '.org-node'
    ].join(', ');

    var targets = document.querySelectorAll(selector);
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el, index) {
      el.classList.add('reveal-on-scroll');
      el.style.transitionDelay = (Math.min(index % 6, 5) * 70) + 'ms';
      observer.observe(el);
    });
  }

  /* ---------- 7. COMPTEURS ANIMÉS ---------- */

  function initCountUp() {
    var counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    function easeOutQuad(t) { return t * (2 - t); }

    function animateCounter(el) {
      var target = parseFloat(el.getAttribute('data-target')) || 0;
      var duration = 1400;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = easeOutQuad(progress);
        var current = Math.floor(eased * target);
        el.textContent = current.toLocaleString('fr-FR');

        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = target.toLocaleString('fr-FR');
        }
      }
      window.requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCounter);
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- 8. SOUS-ONGLETS AVEC SCROLLSPY ---------- */

  function initSubTabsScrollspy() {
    var subTabs = document.querySelectorAll('.sub-tabs .sub-tab');
    if (!subTabs.length) return;

    var pairs = [];
    subTabs.forEach(function (tab) {
      var href = tab.getAttribute('href');
      if (href && href.charAt(0) === '#') {
        var section = document.querySelector(href);
        if (section) pairs.push({ tab: tab, section: section });
      }
    });
    if (!pairs.length) return;

    function setActive(tab) {
      subTabs.forEach(function (t) { t.classList.remove('is-active'); });
      tab.classList.add('is-active');
    }

    setActive(pairs[0].tab);

    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var match = pairs.filter(function (p) { return p.section === entry.target; })[0];
          if (match) setActive(match.tab);
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

    pairs.forEach(function (p) { observer.observe(p.section); });
  }

  /* ---------- 9. FILTRES PAR CATÉGORIE ---------- */

  function initFilterTabs() {
    var groups = document.querySelectorAll(
      '[data-activity-filters], [data-news-filters], [data-media-filters], [data-resources-filters]'
    );
    if (!groups.length) return;

    groups.forEach(function (group) {
      var buttons = group.querySelectorAll('.filter-btn');
      if (!buttons.length) return;

      buttons.forEach(function (b) {
        b.setAttribute('aria-pressed', b.classList.contains('is-active') ? 'true' : 'false');
      });

      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          buttons.forEach(function (b) {
            b.classList.remove('is-active');
            b.setAttribute('aria-pressed', 'false');
          });
          btn.classList.add('is-active');
          btn.setAttribute('aria-pressed', 'true');

          applyFilter(btn.getAttribute('data-filter'));
        });
      });
    });

    function applyFilter(filter) {
      document.querySelectorAll('[data-category], [data-event]').forEach(function (item) {
        var value = item.getAttribute('data-category') || item.getAttribute('data-event');
        var show = filter === 'all' || value === filter;
        item.hidden = !show;
      });

      document.querySelectorAll('section.content-section[data-category]').forEach(function (section) {
        var sectionValue = section.getAttribute('data-category');
        section.hidden = filter !== 'all' && sectionValue !== filter;
      });

      var eventsSection = document.getElementById('evenements');
      if (eventsSection) {
        eventsSection.hidden = filter !== 'all' && filter !== 'evenement';
      }

      // Informe formulaire.js (recherche ressources) qu'un filtre a changé
      document.dispatchEvent(new CustomEvent('dahira:filterChanged', { detail: { filter: filter } }));
    }
  }

})();