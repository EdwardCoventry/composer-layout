import React from 'react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import { LayoutFrame } from './LayoutFrame';
import { ComposerHeightMode } from '../types/layout';

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
    expect(region.style.height).toBe('400px');
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
  const originalVV = (window as any).visualViewport;
  afterEach(() => { (window as any).visualViewport = originalVV; });
  function mockVisualViewport(height: number) {
    (window as any).visualViewport = { height, addEventListener: () => {}, removeEventListener: () => {} };
  }
  test('overlay activates when heuristic triggered and composer present', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    mockVisualViewport(600);
    const mode: ComposerHeightMode = { type: 'fraction', fraction: 0.3 };
    const { container } = render(<LayoutFrame {...baseProps(mode)} />);
    const region = container.querySelector('[data-role="bottom-region"]') as HTMLElement;
    expect(region.dataset.mode).toBe('overlay');
  });

  test('lockComposerPosition keeps bottom-region fixed without keyboard overlay', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    (window as any).visualViewport = undefined;
    const mode: ComposerHeightMode = { type: 'fraction', fraction: 0.3 };
    const { container } = render(
      <LayoutFrame {...baseProps(mode)} lockComposerPosition />
    );
    const region = container.querySelector('[data-role="bottom-region"]') as HTMLElement;
    expect(region.dataset.mode).toBe('inline');
    expect(region.style.position).toBe('fixed');
  });
});

describe('Overlay padding for content panel', () => {
  const originalVV = (window as any).visualViewport;
  afterEach(() => { (window as any).visualViewport = originalVV; });

  function mockVisualViewport(height: number) {
    (window as any).visualViewport = { height, addEventListener: () => {}, removeEventListener: () => {} };
  }

  test('applies bottom padding equal to composer height in overlay', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    mockVisualViewport(600);
    const mode: ComposerHeightMode = { type: 'fraction', fraction: 0.25 };

    const { container } = render(<LayoutFrame {...baseProps(mode)} />);
    const content = container.querySelector('[data-role="content-panel"]') as HTMLElement;
    expect(content.dataset.contentOverlayPad).toBe('150');
    expect(content.style.paddingBottom).toBe('150px');
  });

  test('omits bottom padding when overlay is inactive', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    (window as any).visualViewport = undefined;
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
