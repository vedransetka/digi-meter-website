document.addEventListener('DOMContentLoaded', () => {
  const selector = document.getElementById('lang-select');
  if (!selector) return;
  const page = selector.dataset.currentPage || 'home';
  const localePath = page === 'home' ? '' : `${page}/`;

  // The original static-site handler only displayed a placeholder toast.
  // Capture the event first and route to the equivalent generated page.
  selector.addEventListener('change', event => {
    event.stopImmediatePropagation();
    window.location.assign(`/${selector.value}/${localePath}`);
  }, true);
});
