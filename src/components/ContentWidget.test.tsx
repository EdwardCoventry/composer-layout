import React from 'react';
import { render } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { QuizScreenLayout } from '../screens/QuizScreenLayout';

if (!window.matchMedia) {
  // basic mock
  // @ts-ignore
  window.matchMedia = (query: string) => ({
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

  test('mobile: text is centered', () => {
    setViewport(500); // mobile breakpoint
    const { getByTestId } = render(<QuizScreenLayout />);
    const widget = getByTestId('content-widget');
    const inner = widget.querySelector('div');
    expect(inner).toBeTruthy();
    expect((inner as HTMLElement).style.textAlign).toBe('center');
  });

  test('desktop: text is still centered', () => {
    setViewport(1200); // desktop
    const { getByTestId } = render(<QuizScreenLayout />);
    const widget = getByTestId('content-widget');
    const inner = widget.querySelector('div');
    expect(inner).toBeTruthy();
    expect((inner as HTMLElement).style.textAlign).toBe('center');
  });
});
