import React from 'react';

export const OptionsIcon: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const viewBoxSize = isMobile ? 28 : 24;
  const cols = isMobile ? 1 : 2;
  const rows = isMobile ? 3 : 2;
  const gap = isMobile ? 2 : 3.5;
  const desiredWidth = isMobile ? 18 : 24;
  const desiredHeight = isMobile ? 24 : 16;
  const strokeWidth = 2;
  const maxSize = viewBoxSize - strokeWidth;
  const targetWidth = Math.min(desiredWidth, maxSize);
  const targetHeight = Math.min(desiredHeight, maxSize);
  const cellWidth = (targetWidth - gap * (cols - 1)) / cols;
  const cellHeight = (targetHeight - gap * (rows - 1)) / rows;
  const x = (viewBoxSize - targetWidth) / 2;
  const y = (viewBoxSize - targetHeight) / 2;

  const strokeProps = {
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  const cells = Array.from({ length: rows * cols }, (_, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const cellX = x + col * (cellWidth + gap);
    const cellY = y + row * (cellHeight + gap);
    return (
      <rect
        key={idx}
        x={cellX}
        y={cellY}
        width={cellWidth}
        height={cellHeight}
        rx={1.5}
        fill="none"
        {...strokeProps}
      />
    );
  });

  return (
    <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} role="img" aria-hidden focusable="false">
      {cells}
    </svg>
  );
};

export const SendIcon = () => (
  <svg viewBox="0 0 24 24" role="img" aria-hidden focusable="false">
    <path
      d="M4.5 12L4 5l16 7-16 7 .5-7L14 12 4.5 12Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const CheckIcon = () => (
  <svg viewBox="0 0 24 24" role="img" aria-hidden focusable="false">
    <path d="M5.5 12.5L10 17l8.5-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

