/*
 * CSP-safe async stylesheet activation & deferred Google Analytics 4 loader.
 * Prevents render-blocking fonts and avoids 178 KiB GTM execution during initial LCP/TBT window.
 */
(function () {
  function activateAsyncStyles() {
    var links = document.querySelectorAll('link[data-async-css]');
    for (var i = 0; i < links.length; i += 1) {
      links[i].media = 'all';
    }
  }

  if (document.readyState === 'complete') {
    setTimeout(activateAsyncStyles, 120);
  } else {
    window.addEventListener(
      'load',
      function () {
        setTimeout(activateAsyncStyles, 120);
      },
      { once: true }
    );
  }

  var gaLoaded = false;
  function loadGaScript() {
    if (gaLoaded) return;
    gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-NBKE5WJMDH';
    document.head.appendChild(s);
  }

  var interactionEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll', 'mousemove'];
  interactionEvents.forEach(function (ev) {
    window.addEventListener(ev, loadGaScript, { once: true, passive: true });
  });
})();
