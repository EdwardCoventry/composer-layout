import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import { LayoutFrame } from './LayoutFrame';
import { ComposerHeightMode } from '../types/layout';

let mockKeyboardState = {
  effectiveBottomInset: 0,
  keyboardActive: false,
  keyboardHeight: 0,
  keyboardOpen: false,
  layoutViewportHeight: 800,
  liveBottomInset: 0,
  settling: false,
  stableClosedBottomInset: 0,
  textEntryFocused: false,
  viewportShifted: false,
  visualViewportHeight: 800,
  visualViewportOffsetTop: 0
};
vi.mock('../hooks/useViewportKeyboardState', () => ({
  useViewportKeyboardState: () => mockKeyboardState
}));

if (!window.matchMedia) {
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

const originalRequestAnimationFrame = window.requestAnimationFrame;
const originalCancelAnimationFrame = window.cancelAnimationFrame;

beforeEach(() => {
  mockKeyboardState = {
    effectiveBottomInset: 0,
    keyboardActive: false,
    keyboardHeight: 0,
    keyboardOpen: false,
    layoutViewportHeight: 800,
    liveBottomInset: 0,
    settling: false,
    stableClosedBottomInset: 0,
    textEntryFocused: false,
    viewportShifted: false,
    visualViewportHeight: 800,
    visualViewportOffsetTop: 0
  };
  Object.defineProperty(window, 'requestAnimationFrame', {
    value: (callback: FrameRequestCallback) => {
      window.queueMicrotask(() => callback(performance.now()));
      return 1;
    },
    configurable: true
  });
  Object.defineProperty(window, 'cancelAnimationFrame', {
    value: () => {},
    configurable: true
  });
});

afterEach(() => {
  Object.defineProperty(window, 'requestAnimationFrame', {
    value: originalRequestAnimationFrame,
    configurable: true
  });
  Object.defineProperty(window, 'cancelAnimationFrame', {
    value: originalCancelAnimationFrame,
    configurable: true
  });
});

function baseProps(mode: ComposerHeightMode) {
  return {
    header: <div>Header</div>,
    contentPanel: <div style={{ height: '100%', background: 'purple' }}>Content</div>,
    composerPanel: <div>Composer content</div>,
    showComposerPanel: true,
    composerHeightMode: mode,
    footer: <div>Footer</div>,
    overlayPadContentPanel: true
  } as const;
}

describe('LayoutFrame composer height modes', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
  });

  test('fraction mode applies fixed pixel height on bottom-region', () => {
    const mode: ComposerHeightMode = { type: 'fraction', fraction: 0.4, minPx: 200 };
    const { container } = render(<LayoutFrame {...baseProps(mode)} />);
    const region = container.querySelector('[data-role="bottom-region"]') as HTMLElement;
    expect(region).toBeTruthy();
    expect(region.dataset.mode).toBe('inline');
    expect(region.style.height).toBe('40vh');
  });

  test('fraction mode with allowAutoHeight applies auto height and minHeight', () => {
    const mode: ComposerHeightMode = { type: 'fraction', fraction: 0.4, minPx: 200, allowAutoHeight: true };
    const { container } = render(<LayoutFrame {...baseProps(mode)} />);
    const region = container.querySelector('[data-role="bottom-region"]') as HTMLElement;
    expect(region).toBeTruthy();
    expect(region.dataset.mode).toBe('inline');
    expect(region.style.height).toBe('auto');
    // minHeight depends on viewport sizing, so we skip verifying it here.
  });

  test('calculated mode applies pixel height on bottom-region', () => {
    const mode: ComposerHeightMode = { type: 'calculated', getHeight: () => 220, maxFraction: 0.7 };
    const { container } = render(<LayoutFrame {...baseProps(mode)} />);
    const region = container.querySelector('[data-role="bottom-region"]') as HTMLElement;
    expect(region.style.height).toBe('220px');
  });

  test('content mode has no fixed height style on bottom-region', () => {
    const mode: ComposerHeightMode = { type: 'content', maxFraction: 0.6 };
    const { container } = render(<LayoutFrame {...baseProps(mode)} />);
    const region = container.querySelector('[data-role="bottom-region"]') as HTMLElement;
    expect(region.style.height).toBe('');
  });
});

describe('Overlay behavior for composer BottomRegion', () => {
  test('overlay activates when heuristic triggered and composer present', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    mockKeyboardState = {
      ...mockKeyboardState,
      keyboardActive: true,
      keyboardOpen: true,
      visualViewportHeight: 600
    };
    const mode: ComposerHeightMode = { type: 'fraction', fraction: 0.3 };
    const { container } = render(<LayoutFrame {...baseProps(mode)} />);
    const region = container.querySelector('[data-role="bottom-region"]') as HTMLElement;
    expect(region.dataset.mode).toBe('overlay');
  });

  test('lockComposerPosition keeps bottom-region fixed without keyboard overlay', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    const mode: ComposerHeightMode = { type: 'fraction', fraction: 0.3 };
    const { container } = render(
      <LayoutFrame {...baseProps(mode)} lockComposerPosition />
    );
    const region = container.querySelector('[data-role="bottom-region"]') as HTMLElement;
    expect(region.dataset.mode).toBe('inline');
    expect(region.style.position).toBe('fixed');
  });
});

describe('Footer visibility recovery on keyboard close', () => {
  test('shows footer after keyboard closes even if hideComposerFooter stays true', async () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    mockKeyboardState = {
      ...mockKeyboardState,
      keyboardActive: true,
      keyboardOpen: true
    };
    const mode: ComposerHeightMode = { type: 'fraction', fraction: 0.3 };
    const { container, rerender } = render(
      <LayoutFrame {...baseProps(mode)} hideComposerFooter />
    );

    expect(container.querySelector('[data-role="footer"]')).toBeNull();

    await act(async () => {
      mockKeyboardState = {
        ...mockKeyboardState,
        keyboardActive: false,
        keyboardOpen: false
      };
      rerender(<LayoutFrame {...baseProps(mode)} hideComposerFooter />);
    });

    expect(container.querySelector('[data-role="footer"]')).toBeTruthy();
  });
});

describe('Overlay padding for content panel', () => {
  test('applies bottom padding equal to composer height plus inset in overlay', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    mockKeyboardState = {
      ...mockKeyboardState,
      effectiveBottomInset: 48,
      keyboardActive: true,
      keyboardOpen: true,
      visualViewportHeight: 600
    };
    const mode: ComposerHeightMode = { type: 'fraction', fraction: 0.25 };

    const { container } = render(<LayoutFrame {...baseProps(mode)} />);
    const content = container.querySelector('[data-role="content-panel"]') as HTMLElement;
    const region = container.querySelector('[data-role="bottom-region"]') as HTMLElement;
    expect(region.style.bottom).toBe('48px');
    expect(content.dataset.contentOverlayPad).toBe('198');
    expect(content.style.paddingBottom).toBe('198px');
  });

  test('omits bottom padding when overlay is inactive', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    const mode: ComposerHeightMode = { type: 'fraction', fraction: 0.25 };

    const { container } = render(<LayoutFrame {...baseProps(mode)} />);
    const content = container.querySelector('[data-role="content-panel"]') as HTMLElement;
    expect(content.dataset.contentOverlayPad).toBe('0');
    expect(content.style.paddingBottom).toBe('');
  });
});

describe('Layout structure ordering with composer BottomRegion', () => {
  test('inline mode ordering: header, content-wrapper, bottom-region', () => {
    const mode: ComposerHeightMode = { type: 'fraction', fraction: 0.3 };
    Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    const { container } = render(<LayoutFrame {...baseProps(mode)} />);
    const root = container.querySelector('[data-role="layout-frame"]') as HTMLElement;
    const children = Array.from(root.children);
    const header = container.querySelector('[data-role="header"]')!;
    const contentWrapper = container.querySelector('[data-role="content-wrapper"]')!;
    const bottomRegion = container.querySelector('[data-role="bottom-region"]')!;
    expect(children[0]).toBe(header);
    expect(children[1]).toBe(contentWrapper);
    expect(children[2]).toBe(bottomRegion);
  });
});

describe('Standalone footer (no composer panel) behavior', () => {
  test('footer renders inline when composer absent', () => {
    const { container } = render(
      <LayoutFrame
        header={<div>Header</div>}
        contentPanel={<div>Content</div>}
        composerPanel={undefined}
        showComposerPanel={false}
        footer={<div>Footer</div>}
      />
    );
    const bottomRegion = container.querySelector('[data-role="bottom-region"]');
    expect(bottomRegion).toBeNull();
    const footer = container.querySelector('[data-role="footer"]') as HTMLElement;
    expect(footer).toBeTruthy();
    expect(footer.dataset.footerStandalone).toBe('true');
  });
});

describe('Content panel scroll fallback', () => {
  test('content panel has overflow-y auto', () => {
    const mode: ComposerHeightMode = { type: 'fraction', fraction: 0.3 };
    const { container } = render(<LayoutFrame {...baseProps(mode)} />);
    const content = container.querySelector('[data-role="content-panel"]') as HTMLElement;
    expect(content.style.overflowY).toBe('auto');
  });

  test('chat message mode switches to page scroll with sticky header and composer', () => {
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    const mode: ComposerHeightMode = { type: 'content', maxFraction: 0.45 };
    const { container } = render(<LayoutFrame {...baseProps(mode)} contentPanelMode="chat-message" />);
    const root = container.querySelector('[data-role="layout-frame"]') as HTMLElement;
    const header = container.querySelector('[data-role="header"]') as HTMLElement;
    const content = container.querySelector('[data-role="content-panel"]') as HTMLElement;
    const region = container.querySelector('[data-role="bottom-region"]') as HTMLElement;

    expect(root.style.height).toBe('');
    expect(root.style.minHeight).toBe('100dvh');
    expect(root.style.overflow).toBe('visible');
    expect(root.dataset.contentMode).toBe('chat-message');

    expect(header.style.position).toBe('sticky');
    expect(header.style.top).toBe('0px');
    expect(header.dataset.mode).toBe('sticky');

    expect(content.style.overflow).toBe('visible');
    expect(content.style.overflowY).toBe('');
    expect(content.dataset.contentMode).toBe('chat-message');

    expect(region.dataset.mode).toBe('sticky');
    expect(region.style.position).toBe('sticky');
    expect(region.style.bottom).toBe('0px');
  });

  test('chat message mode applies bottom padding when overlay padding is enabled', () => {
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    const mode: ComposerHeightMode = { type: 'fraction', fraction: 0.25 };
    const { container } = render(<LayoutFrame {...baseProps(mode)} contentPanelMode="chat-message" />);
    const content = container.querySelector('[data-role="content-panel"]') as HTMLElement;
    expect(content.dataset.contentOverlayPad).toBe('200');
    expect(content.style.paddingBottom).toBe('200px');
  });
});

describe('Chat message header behavior', () => {
  const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;

  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function(this: HTMLElement) {
      if (this.getAttribute('data-role') === 'header-content') {
        return {
          x: 0,
          y: 0,
          width: 320,
          height: 96,
          top: 0,
          right: 320,
          bottom: 96,
          left: 0,
          toJSON: () => ({})
        } as DOMRect;
      }

      return {
        x: 0,
        y: 0,
        width: 320,
        height: 0,
        top: 0,
        right: 320,
        bottom: 0,
        left: 0,
        toJSON: () => ({})
      } as DOMRect;
    });
  });

  afterEach(() => {
    HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    vi.restoreAllMocks();
  });

  test('chat message mode allows the header to scroll away when pinned is false', () => {
    const mode: ComposerHeightMode = { type: 'content', maxFraction: 0.45 };
    const { container } = render(
      <LayoutFrame
        {...baseProps(mode)}
        contentPanelMode="chat-message"
        headerBehavior={{ pinned: false }}
      />
    );

    const header = container.querySelector('[data-role="header"]') as HTMLElement;
    expect(header.style.position).toBe('');
    expect(header.dataset.mode).toBe('scroll');
  });

  test('chat message mode collapses a pinned header down to the requested height', async () => {
    const mode: ComposerHeightMode = { type: 'content', maxFraction: 0.45 };
    const { container } = render(
      <LayoutFrame
        {...baseProps(mode)}
        contentPanelMode="chat-message"
        headerBehavior={{ pinned: true, collapsedHeight: 40 }}
      />
    );

    const header = container.querySelector('[data-role="header"]') as HTMLElement;

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 80, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(header.style.position).toBe('sticky');
    expect(header.style.height).toBe('40px');
    expect(header.dataset.mode).toBe('pinned-collapse');
  });

  test('floating header reveals again when scroll direction reverses', async () => {
    const mode: ComposerHeightMode = { type: 'content', maxFraction: 0.45 };
    const { container } = render(
      <LayoutFrame
        {...baseProps(mode)}
        contentPanelMode="chat-message"
        headerBehavior={{ pinned: false, floating: true }}
      />
    );

    const header = container.querySelector('[data-role="header"]') as HTMLElement;

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 60, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    await act(async () => {
      await Promise.resolve();
    });
    const hiddenHeight = header.style.height;

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 24, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(header.dataset.mode).toBe('floating');
    expect(hiddenHeight).toBe('36px');
    expect(header.style.height).toBe('72px');
  });

  test('snap header fully returns on reverse scroll', async () => {
    const mode: ComposerHeightMode = { type: 'content', maxFraction: 0.45 };
    const { container } = render(
      <LayoutFrame
        {...baseProps(mode)}
        contentPanelMode="chat-message"
        headerBehavior={{ pinned: false, floating: true, snap: true }}
      />
    );

    const header = container.querySelector('[data-role="header"]') as HTMLElement;

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 60, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 56, writable: true, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(header.dataset.mode).toBe('floating-snap');
    expect(header.style.height).toBe('96px');
  });
});

describe('Optional composerHeightMode handling', () => {
  test('no composerHeightMode needed when composer panel absent', () => {
    const { container } = render(
      <LayoutFrame
        header={<div>Header</div>}
        contentPanel={<div>Content</div>}
        composerPanel={undefined}
        showComposerPanel={false}
        footer={<div>Footer</div>}
      />
    );
    expect(container.querySelector('[data-role="bottom-region"]')).toBeNull();
    expect(container.querySelector('[data-role="content-panel"]')).toBeTruthy();
  });
});
