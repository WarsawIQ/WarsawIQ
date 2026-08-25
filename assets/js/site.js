// One job only: keep the hero video off the critical path, start it when it is
// actually on screen, and never play it for readers who ask for less motion.
// The theme follows the operating system; there is no manual toggle.
(function () {
  'use strict';

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
