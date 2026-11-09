/**
 * Navigate the browser to an external URL.
 *
 * Kept in a tiny helper so components remain testable without replacing the
 * read-only `window.location` object in jsdom.
 */
export function redirectTo(url) {
  if (typeof window === 'undefined' || !url) return;
  window.location.assign(url);
}

export function reloadPage() {
  if (typeof window === 'undefined') return;
  window.location.reload();
}
