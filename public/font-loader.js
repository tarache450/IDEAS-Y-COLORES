/*
 * CSP-safe async stylesheet activation.
 * Replaces the former inline onload="this.media='all'" attribute, which would
 * be blocked once the Content-Security-Policy forbids inline script attributes.
 */
(function () {
  function activateAsyncStyles() {
    var links = document.querySelectorAll('link[data-async-css]');
    for (var i = 0; i < links.length; i += 1) {
      links[i].media = 'all';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateAsyncStyles, { once: true });
  } else {
    activateAsyncStyles();
  }
})();
