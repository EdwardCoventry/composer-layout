import React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { act } from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { useKeyboardOptionsSync } from './useKeyboardOptionsSync';

const originalVisualViewport = (window as any).visualViewport;
const originalInnerHeightDescriptor = Object.getOwnPropertyDescriptor(window, 'innerHeight');
const originalInnerWidthDescriptor = Object.getOwnPropertyDescriptor(window, 'innerWidth');

function setInnerHeight(value: number) {
  Object.defineProperty(window, 'innerHeight', { value, configurable: true, writable: true });
}

function setInnerWidth(value: number) {
  Object.defineProperty(window, 'innerWidth', { value, configurable: true, writable: true });
}

function mockVisualViewport(height: number) {
  const listeners: Array<() => void> = [];
  const vv = {
    height,
    addEventListener: (_event: string, cb: () => void) => { listeners.push(cb); },
    removeEventListener: (_event: string, cb: () => void) => {
      const idx = listeners.indexOf(cb);
      if (idx >= 0) listeners.splice(idx, 1);
    }
  } as any;
  (window as any).visualViewport = vv;
  return {
    setHeight: (next: number) => {
      vv.height = next;
      listeners.forEach((cb) => cb());
    }
  };
}

afterEach(() => {
  cleanup();
  if (originalInnerHeightDescriptor) {
    Object.defineProperty(window, 'innerHeight', originalInnerHeightDescriptor);
  } else {
    delete (window as any).innerHeight;
  }
  if (originalInnerWidthDescriptor) {
    Object.defineProperty(window, 'innerWidth', originalInnerWidthDescriptor);
  } else {
    delete (window as any).innerWidth;
  }
  (window as any).visualViewport = originalVisualViewport;
});

describe('useKeyboardOptionsSync', () => {
  test('closes options when keyboard opens', () => {
    setInnerHeight(800);
    const vv = mockVisualViewport(800);
    const closeSpy = vi.fn();

    const TestComponent = () => {
      const [open, setOpen] = React.useState(true);
      useKeyboardOptionsSync({
        isOptionsOpen: open,
        onRequestCloseOptions: () => {
          closeSpy();
          setOpen(false);
        },
        keyboardThreshold: 100
      });
      return <div data-open={open ? 'true' : 'false'} />;
    };

    const { container } = render(<TestComponent />);
    expect((container.firstElementChild as HTMLElement)?.getAttribute('data-open')).toBe('true');

    act(() => { vv.setHeight(650); });

    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect((container.firstElementChild as HTMLElement)?.getAttribute('data-open')).toBe('false');
  });

  test('blurs the active element when opening options while keyboard is up', () => {
    setInnerHeight(800);
    const vv = mockVisualViewport(800);

    const TestComponent = () => {
      const [open, setOpen] = React.useState(false);
      const { prepareToOpenOptions } = useKeyboardOptionsSync({
        isOptionsOpen: open,
        onRequestCloseOptions: () => setOpen(false),
        keyboardThreshold: 100
      });
      return (
        <div>
          <input data-testid="field" />
          <button
            data-testid="toggle"
            onClick={() => setOpen((v) => {
              const next = !v;
              if (next) prepareToOpenOptions();
              return next;
            })}
          >
            Toggle
          </button>
        </div>
      );
    };

    const { getByTestId } = render(<TestComponent />);
    const field = getByTestId('field') as HTMLInputElement;
    field.focus();
    expect(document.activeElement).toBe(field);

    act(() => { vv.setHeight(650); });
    // Keyboard considered open at this point; now opening options should blur.
    fireEvent.click(getByTestId('toggle'));

    expect(document.activeElement).not.toBe(field);
  });

  test('closes options on input focus when mobile', () => {
    setInnerWidth(600);
    const closeSpy = vi.fn();

    const TestComponent = () => {
      const [open, setOpen] = React.useState(true);
      const { handleInputFocus } = useKeyboardOptionsSync({
        isOptionsOpen: open,
        onRequestCloseOptions: () => {
          closeSpy();
          setOpen(false);
        }
      });
      return (
        <button data-testid="focus" data-open={open ? 'true' : 'false'} onClick={handleInputFocus}>
          Focus
        </button>
      );
    };

    const { getByTestId } = render(<TestComponent />);
    expect(getByTestId('focus').getAttribute('data-open')).toBe('true');

    fireEvent.click(getByTestId('focus'));

    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(getByTestId('focus').getAttribute('data-open')).toBe('false');
  });

  test('does not close options on input focus when desktop', () => {
    setInnerWidth(1200);
    const closeSpy = vi.fn();

    const TestComponent = () => {
      const [open, setOpen] = React.useState(true);
      const { handleInputFocus } = useKeyboardOptionsSync({
        isOptionsOpen: open,
        onRequestCloseOptions: () => {
          closeSpy();
          setOpen(false);
        }
      });
      return (
        <button data-testid="focus" data-open={open ? 'true' : 'false'} onClick={handleInputFocus}>
          Focus
        </button>
      );
    };

    const { getByTestId } = render(<TestComponent />);
    fireEvent.click(getByTestId('focus'));

    expect(closeSpy).not.toHaveBeenCalled();
    expect(getByTestId('focus').getAttribute('data-open')).toBe('true');
  });
});
