/* ==========================================================================
   DAHIRA MADJMAHOUN NOREYNI TOUBA MALIKA — FORMULAIRE.JS
   --------------------------------------------------------------------------
   Comportements liés aux formulaires et à la recherche :
     1. Validation des formulaires (adhésion, contact, newsletter)
     2. Recherche de ressources (ressources.html)
     3. Boutons de paiement Wave / Orange Money (adhesion.html)
   Fichier autonome : ne dépend pas de script.js.
   ========================================================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initFormValidation();
    initResourcesSearch();
    initPaymentButtons();
  });

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

  /* ---------- 1. VALIDATION DES FORMULAIRES ---------- */

  function initFormValidation() {
    var forms = document.querySelectorAll(
      '[data-adhesion-form], [data-contact-form], [data-newsletter-form]'
    );
    if (!forms.length) return;

    var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    forms.forEach(function (form) {
      var feedback = form.querySelector('.form-feedback');

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var isValid = true;
        var firstInvalidField = null;
        var requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach(function (field) {
          clearFieldError(field);

          var fieldIsValid = field.checkValidity();
          if (field.type === 'email' && field.value.trim() !== '') {
            fieldIsValid = fieldIsValid && EMAIL_PATTERN.test(field.value.trim());
          }

          if (!fieldIsValid) {
            isValid = false;
            var message = field.type === 'checkbox'
              ? 'Merci de cocher cette case pour continuer.'
              : (field.type === 'email' ? 'Adresse email invalide.' : 'Ce champ est requis.');
            showFieldError(field, message);
            if (!firstInvalidField) firstInvalidField = field;
          }
        });

        if (!isValid) {
          setFeedback(feedback, 'Merci de corriger les champs signalés en rouge.', false);
          if (firstInvalidField) firstInvalidField.focus();
          return;
        }

        // Envoi réel si le formulaire pointe vers un service externe (ex. Formspree)
        var hasRemoteAction = form.action && form.action.indexOf('formspree.io') !== -1;

        if (hasRemoteAction) {
          var submitBtn = form.querySelector('button[type="submit"]');
          setFeedback(feedback, 'Envoi en cours…', true);
          if (submitBtn) submitBtn.disabled = true;

          fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
          })
            .then(function (response) {
              if (response.ok) {
                setFeedback(feedback, 'Merci ! Votre message a bien été envoyé au Dahira.', true);
                form.reset();
              } else {
                setFeedback(feedback, 'Une erreur est survenue. Réessayez ou contactez-nous directement.', false);
              }
            })
            .catch(function () {
              setFeedback(feedback, 'Erreur de connexion. Vérifiez votre connexion internet et réessayez.', false);
            })
            .finally(function () {
              if (submitBtn) submitBtn.disabled = false;
              window.setTimeout(function () {
                if (feedback) feedback.textContent = '';
              }, 8000);
            });
        } else {
          // Formulaire non encore connecté à un service d'envoi
          setFeedback(feedback, 'Merci ! Votre message a bien été pris en compte.', true);
          form.reset();
          window.setTimeout(function () {
            if (feedback) feedback.textContent = '';
          }, 6000);
        }
      });
    });

    function showFieldError(field, message) {
      field.classList.add('has-error');
      field.setAttribute('aria-invalid', 'true');
      var error = document.createElement('p');
      error.className = 'field-error';
      error.textContent = message;
      field.insertAdjacentElement('afterend', error);
    }

    function clearFieldError(field) {
      field.classList.remove('has-error');
      field.removeAttribute('aria-invalid');
      var next = field.nextElementSibling;
      if (next && next.classList.contains('field-error')) {
        next.remove();
      }
    }

    function setFeedback(el, message, success) {
      if (!el) return;
      el.textContent = message;
      el.style.color = success ? 'var(--success)' : 'var(--error)';
    }
  }

  /* ---------- 2. RECHERCHE DE RESSOURCES ---------- */

  function initResourcesSearch() {
    var searchInput = document.querySelector('[data-resources-search]');
    if (!searchInput) return; // pas sur cette page

    var filterGroup = document.querySelector('[data-resources-filters]');
    var items = document.querySelectorAll('.resource-item');

    function applySearch() {
      var term = searchInput.value.trim().toLowerCase();
      var activeBtn = filterGroup ? filterGroup.querySelector('.filter-btn.is-active') : null;
      var category = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';

      items.forEach(function (item) {
        var nameEl = item.querySelector('.resource-name');
        var text = nameEl ? nameEl.textContent.toLowerCase() : '';
        var matchesCategory = category === 'all' || item.getAttribute('data-category') === category;
        var matchesSearch = term === '' || text.indexOf(term) !== -1;
        item.hidden = !(matchesCategory && matchesSearch);
      });
    }

    searchInput.addEventListener('input', debounce(applySearch, 150));

    // Réagit quand script.js signale qu'un bouton de filtre a été cliqué
    document.addEventListener('dahira:filterChanged', applySearch);
  }

  /* ---------- 3. BOUTONS DE PAIEMENT WAVE / ORANGE MONEY ---------- */

  function initPaymentButtons() {
    var buttons = document.querySelectorAll('[data-payment]');
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var href = btn.getAttribute('href');
        if (href && href !== '#') return; // vrai lien configuré : comportement normal

        e.preventDefault();
        var card = btn.closest('.payment-card');
        var qr = card ? card.querySelector('.payment-qr') : null;
        if (!qr) return;

        qr.classList.add('payment-qr--pulse');
        qr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.setTimeout(function () {
          qr.classList.remove('payment-qr--pulse');
        }, 1600);
      });
    });
  }

})();