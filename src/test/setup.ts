import '@testing-library/jest-dom';

// Force a callable matchMedia mock for all tests
// @ts-expect-error - overriding possibly existing non-function
window.matchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {}, // deprecated
  removeListener: () => {}, // deprecated
  dispatchEvent: () => false
});
