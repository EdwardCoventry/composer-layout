import React from 'react';
import { act, render } from '@testing-library/react';
import { useKeyboardOpen } from './useKeyboardOpen';

class MockVisualViewport {
  height: number;
  private listeners: Record<string, Set<(event: Event) => void>> = {};

  constructor(height: number) {
    this.height = height;
  }

  addEventListener(type: string, callback: (event: Event) => void) {
    if (!this.listeners[type]) {
      this.listeners[type] = new Set();
    }
    this.listeners[type].add(callback);
  }

  removeEventListener(type: string, callback: (event: Event) => void) {
    this.listeners[type]?.delete(callback);
  }

  dispatch(type: string) {
    const event = new Event(type);
    this.listeners[type]?.forEach((callback) => callback(event));
  }
}

let latestValue = false;

function createFocusEvent(type: string): Event {
  if (typeof FocusEvent === 'function') {
    return new FocusEvent(type, { bubbles: true });
  }
  return new Event(type, { bubbles: true });
}

const HookProbe: React.FC<{ threshold?: number }> = ({ threshold }) => {
  latestValue = useKeyboardOpen(threshold);
  return null;
};

describe('useKeyboardOpen', () => {
  const originalViewport = window.visualViewport;
  const originalScreen = window.screen;

  beforeEach(() => {
    latestValue = false;
    Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    Object.defineProperty(window, 'screen', {
      value: { height: 800, orientation: { type: 'portrait-primary' } },
      configurable: true
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'visualViewport', { value: originalViewport, configurable: true });
    Object.defineProperty(window, 'screen', { value: originalScreen, configurable: true });
    document.body.innerHTML = '';
  });

  test('returns true when focused and the viewport height drops past the threshold', () => {
    const viewport = new MockVisualViewport(800);
    Object.defineProperty(window, 'visualViewport', { value: viewport, configurable: true });
    render(<HookProbe threshold={300} />);

    const input = document.createElement('textarea');
    document.body.appendChild(input);

    act(() => {
      input.dispatchEvent(createFocusEvent('focusin'));
    });

    act(() => {
      viewport.height = 400;
      viewport.dispatch('resize');
    });

    expect(latestValue).toBe(true);
  });

  test('returns false when focus leaves the input even if the viewport is still small', () => {
    const viewport = new MockVisualViewport(800);
    Object.defineProperty(window, 'visualViewport', { value: viewport, configurable: true });
    render(<HookProbe threshold={300} />);

    const input = document.createElement('textarea');
    document.body.appendChild(input);

    act(() => {
      input.dispatchEvent(createFocusEvent('focusin'));
      viewport.height = 400;
      viewport.dispatch('resize');
    });

    expect(latestValue).toBe(true);

    act(() => {
      input.dispatchEvent(createFocusEvent('focusout'));
    });

    expect(latestValue).toBe(false);
  });

  test('returns false when the viewport height restores while focused', () => {
    const viewport = new MockVisualViewport(800);
    Object.defineProperty(window, 'visualViewport', { value: viewport, configurable: true });
    render(<HookProbe threshold={300} />);

    const input = document.createElement('textarea');
    document.body.appendChild(input);

    act(() => {
      input.dispatchEvent(createFocusEvent('focusin'));
      viewport.height = 400;
      viewport.dispatch('resize');
    });

    expect(latestValue).toBe(true);

    act(() => {
      viewport.height = 800;
      viewport.dispatch('resize');
    });

    expect(latestValue).toBe(false);
  });
});
