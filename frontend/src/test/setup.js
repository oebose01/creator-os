import { vi } from 'vitest';
import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Ensure fetch is available globally in Node test environment
if (typeof global.fetch === 'undefined') {
  global.fetch = fetch;
}
vi.stubGlobal('fetch', fetch);
vi.stubGlobal('window', { fetch });
