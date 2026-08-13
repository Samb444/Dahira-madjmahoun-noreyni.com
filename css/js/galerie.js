/* ==========================================================================
   DAHIRA MADJMAHOUN NOREYNI TOUBA MALIKA — GALERIE.JS
   --------------------------------------------------------------------------
   Comportements spécifiques à la page Médias (medias.html) :
     1. Lightbox galerie photos
     2. Lecture exclusive vidéos / podcasts (un seul son actif à la fois)
   Fichier autonome : ne dépend pas de script.js.
   ========================================================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initPhotoLightbox();
    initExclusiveMediaPlayback();
  });

  /* ---------- 1. LIGHTBOX GALERIE PHOTOS ---------- */

  function initPhotoLightbox() {
    var lightbox = document.querySelector('[data-lightbox]');
    if (!lightbox) return; // pas de lightbox sur cette page

    var lightboxImage = lightbox.querySelector('[data-lightbox-image]');
    var closeBtn = lightbox.querySelector('.lightbox-close');
    var triggers = document.querySelectorAll('.photo-item img');
    var lastFocused = null;

    function open(src, alt) {
      lastFocused = document.activeElement;
      lightboxImage.src = src;
      lightboxImage.alt = alt || '';
      lightbox.hidden = false;
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      lightbox.hidden = true;
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxImage.src = '';
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    }

    triggers.forEach(function (img) {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', function () {
        open(img.currentSrc || img.src, img.alt);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', close);

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) close();
    });
  }

  /* ---------- 2. LECTURE EXCLUSIVE VIDÉOS / PODCASTS ---------- */

  function initExclusiveMediaPlayback() {
    var videos = document.querySelectorAll('.video-grid video');
    var audios = document.querySelectorAll('.podcast-list audio');
    var mediaElements = Array.prototype.slice.call(videos).concat(Array.prototype.slice.call(audios));
    if (!mediaElements.length) return;

    mediaElements.forEach(function (media) {
      media.addEventListener('play', function () {
        mediaElements.forEach(function (other) {
          if (other !== media && !other.paused) {
            other.pause();
          }
        });
      });
    });
  }

})();