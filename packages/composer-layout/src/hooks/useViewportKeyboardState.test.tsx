import React from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useViewportKeyboardState, type ViewportKeyboardState } from './useViewportKeyboardState';

class MockVisualViewport {
  height: number;
  offsetTop: number;
  private listeners: Record<string, Set<(event: Event) => void>> = {};

  constructor(height: number, offsetTop: number = 0) {
    this.height = height;
    this.offsetTop = offsetTop;
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

let latestState: ViewportKeyboardState | null = null;

const HookProbe: React.FC<{ threshold?: number }> = ({ threshold }) => {
  latestState = useViewportKeyboardState(threshold);
  return null;
};

const originalViewport = window.visualViewport;

async function flushViewportFrames() {
  act(() => {
    vi.advanceTimersByTime(50);
  });
}

describe('useViewportKeyboardState', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: [
        'Date',
        'performance',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'setTimeout',
        'clearTimeout',
        'setInterval',
        'clearInterval',
      ],
    });
    latestState = null;
    Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true, writable: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(window, 'visualViewport', { value: originalViewport, configurable: true });
    document.body.innerHTML = '';
  });

  test('holds the last stable closed inset while the viewport is settling after keyboard close', async () => {
    const viewport = new MockVisualViewport(768);
    Object.defineProperty(window, 'visualViewport', { value: viewport, configurable: true });
    render(<HookProbe threshold={300} />);

    act(() => {
      vi.advanceTimersByTime(240);
    });

    expect(latestState?.stableClosedBottomInset).toBe(32);
    expect(latestState?.effectiveBottomInset).toBe(32);

    const input = document.createElement('textarea');
    document.body.appendChild(input);

    act(() => {
      input.focus();
      viewport.height = 400;
      viewport.dispatch('resize');
    });
    await flushViewportFrames();

    expect(latestState?.keyboardOpen).toBe(true);
    expect(latestState?.effectiveBottomInset).toBe(400);

    act(() => {
      input.blur();
      viewport.height = 790;
      viewport.dispatch('resize');
    });
    await flushViewportFrames();

    expect(latestState?.keyboardOpen).toBe(false);
    expect(latestState?.settling).toBe(true);
    expect(latestState?.liveBottomInset).toBe(10);
    expect(latestState?.effectiveBottomInset).toBe(32);

    act(() => {
      viewport.height = 768;
      viewport.dispatch('resize');
    });
    await flushViewportFrames();

    act(() => {
      vi.advanceTimersByTime(240);
    });

    expect(latestState?.keyboardActive).toBe(false);
    expect(latestState?.settling).toBe(false);
    expect(latestState?.stableClosedBottomInset).toBe(32);
    expect(latestState?.effectiveBottomInset).toBe(32);
  });
});
