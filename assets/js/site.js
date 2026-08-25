// Two jobs only: remember the reader's theme choice, and pause the hero video
// when it is off screen or the reader prefers reduced motion.
(function () {
  'use strict';

  var root = document.documentElement;

  // --- theme --------------------------------------------------------------- //

  var stored = null;
  try { stored = localStorage.getItem('theme'); } catch (e) { /* private mode, or storage blocked */ }
  if (stored === 'dark' || stored === 'light') {
    root.setAttribute('data-theme', stored);
  }

  function currentTheme() {
    var explicit = root.getAttribute('data-theme');
    if (explicit) { return explicit; }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  var toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    var sync = function () {
      // The button offers the theme you are not currently in.
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      toggle.textContent = toggle.getAttribute('data-label-' + next);
      toggle.setAttribute('aria-label', toggle.getAttribute('data-aria-' + next));
    };
    sync();
    toggle.hidden = false;
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* nothing to do */ }
      sync();
    });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      if (!root.getAttribute('data-theme')) { sync(); }
    });
  }

  // --- hero video ---------------------------------------------------------- //
  // preload="none" keeps it off the critical path; start it only once it is
  // actually visible, and never when the reader has asked for less motion.

  var video = document.querySelector('.hero video');
  if (!video) { return; }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.removeAttribute('autoplay');
    return;
  }

  if (!('IntersectionObserver' in window)) { return; }

  new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var playing = video.play();
        if (playing && playing.catch) { playing.catch(function () { /* autoplay refused */ }); }
      } else if (!video.paused) {
        video.pause();
      }
    });
  }, { threshold: 0.1 }).observe(video);
})();
