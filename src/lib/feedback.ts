export function notify(message: string, kind: 'ok' | 'err' | 'info' = 'info') {
  window.dispatchEvent(new CustomEvent('site:notice', { detail: { message, kind } }));
}
