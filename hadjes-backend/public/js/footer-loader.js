// /hadjes-backend/public/js/footer-loader.js
(() => {
  const PLACEHOLDER_ID = 'footer-root';
  const DEFAULT_URL = '/partials/footer.html'; // served from public/

  function injectFooter() {
    const root = document.getElementById(PLACEHOLDER_ID);
    if (!root) return;

    const url = root.getAttribute('data-footer-src') || DEFAULT_URL;

    fetch(url, { cache: 'no-cache' })
      .then(res => {
        if (!res.ok) throw new Error(`Footer HTTP ${res.status}`);
        return res.text();
      })
      .then(html => {
        root.outerHTML = html; // swap placeholder with footer markup
      })
      .catch(err => console.error('Footer load failed:', err));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFooter);
  } else {
    injectFooter();
  }
})();
