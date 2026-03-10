// This runs before any tests, ensuring fetch exists
if (typeof global.fetch === 'undefined') {
  global.fetch = () => Promise.resolve({ json: () => ({}) });
}
if (typeof window.fetch === 'undefined') {
  window.fetch = global.fetch;
}
