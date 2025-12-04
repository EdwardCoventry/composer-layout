import React from 'react';
import { render } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { QuizScreenLayout } from '../screens/QuizScreenLayout';

if (typeof window !== 'undefined' && !window.matchMedia) {
  (window as any).matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

describe('ContentWidget text alignment', () => {
  function setViewport(width: number) {
    Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
    window.dispatchEvent(new Event('resize'));
  }

  test('mobile: text is left-aligned', () => {
    setViewport(500);
    const { getByTestId } = render(<QuizScreenLayout />);
    const widget = getByTestId('content-widget');
    const inner = widget.querySelector('div');
    expect(inner).toBeTruthy();
    expect((inner as HTMLElement).style.textAlign).toBe('left');
  });

  test('desktop: text is still left-aligned', () => {
    setViewport(1200);
    const { getByTestId } = render(<QuizScreenLayout />);
    const widget = getByTestId('content-widget');
    const inner = widget.querySelector('div');
    expect(inner).toBeTruthy();
    expect((inner as HTMLElement).style.textAlign).toBe('left');
  });
});
