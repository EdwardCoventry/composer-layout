import { describe, expect, it } from 'vitest';

import {
  calculateCollapsePlan,
  calculateMinHeight,
  computeEmbedMeasurements,
  computeEmbedTokens
} from './AssistantEmbedLayout';

describe('AssistantEmbedLayout sizing', () => {
  it('mirrors embed CSS variables when deriving tokens', () => {
    const viewportHeight = 900;
    const viewportWidth = 1200;
    const tokens = computeEmbedTokens(viewportHeight, viewportWidth);

    const scale = Math.max(14, viewportHeight * 0.018 + 8);
    const growGap = Math.max(0, viewportHeight * 0.006);
    const growCardPad = Math.max(0, viewportHeight * 0.022);

    expect(tokens.embedGap).toBeCloseTo(Math.max(6, scale * 0.65) + growGap, 5);
    expect(tokens.cardPaddingY).toBeCloseTo(scale * 1.1 + growCardPad, 5);
    expect(tokens.cardGap).toBeCloseTo(scale * 0.75 + growGap, 5);
    expect(tokens.heroGap).toBeCloseTo(Math.max(14, viewportWidth * 0.01 + 8) + growGap, 5);
    expect(tokens.inputButtonHeight).toBeCloseTo(Math.max(44, viewportHeight * 0.012 + 40));
  });

  it('computes minimum section heights from shared tokens', () => {
    const measurements = computeEmbedMeasurements({
      viewportHeight: 900,
      viewportWidth: 1200,
      longestTagLabel: 12,
      modeCount: 6,
      hasSelectedMode: true,
      imagesCount: 0
    });

    expect(measurements.stackGap).toBeCloseTo(21.13, 2);
    expect(measurements).toMatchObject({
      heroCopy: 129,
      heroModes: 59,
      preferences: 132,
      photos: 171,
      composer: 299,
      shellPaddingTop: 0,
      shellPaddingBottom: 0
    });

    const minHeight = calculateMinHeight(measurements, {
      hideHeroCopy: false,
      hideTags: false,
      hidePreferences: false,
      hidePhotos: false
    });

    expect(minHeight).toBeCloseTo(874.52, 2);
    expect(minHeight).toBeLessThanOrEqual(900);
  });

  it('collapses sections in order as the viewport shrinks', () => {
    const photosGrowMeasurements = computeEmbedMeasurements({
      viewportHeight: 900,
      viewportWidth: 1200,
      longestTagLabel: 12,
      modeCount: 6,
      hasSelectedMode: true,
      imagesCount: 6
    });
    expect(photosGrowMeasurements.photos).toBeGreaterThan(computeEmbedMeasurements({
      viewportHeight: 900,
      viewportWidth: 1200,
      longestTagLabel: 12,
      modeCount: 6,
      hasSelectedMode: true,
      imagesCount: 0
    }).photos);

    const tagFirstMeasurements = computeEmbedMeasurements({
      viewportHeight: 670,
      viewportWidth: 390,
      longestTagLabel: 12,
      modeCount: 6,
      hasSelectedMode: true,
      imagesCount: 0
    });

    expect(calculateCollapsePlan(tagFirstMeasurements, 670, true)).toEqual({
      hideHeroCopy: false,
      hideTags: true,
      hidePreferences: false,
      hidePhotos: false
    });

    const midMeasurements = computeEmbedMeasurements({
      viewportHeight: 640,
      viewportWidth: 390,
      longestTagLabel: 12,
      modeCount: 6,
      hasSelectedMode: true,
      imagesCount: 0
    });

    expect(calculateCollapsePlan(midMeasurements, 640, true)).toEqual({
      hideHeroCopy: true,
      hideTags: true,
      hidePreferences: false,
      hidePhotos: false
    });

    const tightMeasurements = computeEmbedMeasurements({
      viewportHeight: 430,
      viewportWidth: 390,
      longestTagLabel: 12,
      modeCount: 6,
      hasSelectedMode: true,
      imagesCount: 0
    });

    expect(calculateCollapsePlan(tightMeasurements, 430, true)).toEqual({
      hideHeroCopy: true,
      hideTags: true,
      hidePreferences: true,
      hidePhotos: false
    });

    const smallestMeasurements = computeEmbedMeasurements({
      viewportHeight: 320,
      viewportWidth: 390,
      longestTagLabel: 12,
      modeCount: 6,
      hasSelectedMode: true,
      imagesCount: 0
    });

    expect(calculateCollapsePlan(smallestMeasurements, 320, true)).toEqual({
      hideHeroCopy: true,
      hideTags: true,
      hidePreferences: true,
      hidePhotos: true
    });

    expect(calculateCollapsePlan(midMeasurements, 640, false)).toEqual({
      hideHeroCopy: false,
      hideTags: false,
      hidePreferences: false,
      hidePhotos: false
    });
  });
});
