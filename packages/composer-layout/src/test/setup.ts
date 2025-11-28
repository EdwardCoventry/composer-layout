import '@testing-library/jest-dom';

if (!window.matchMedia) {
  // provide a compatible mock
  // @ts-ignore
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false
  });
}
