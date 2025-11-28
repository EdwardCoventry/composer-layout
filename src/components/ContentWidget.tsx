import React from 'react';

type ContentWidgetProps = {
  isMobile: boolean;
};

export const ContentWidget: React.FC<ContentWidgetProps> = ({ isMobile }) => {
  return (
    <div
      style={{
        flex: '1 0 auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isMobile ? 'center' : 'flex-end', // keep vertical behavior
        alignItems: 'center',
        pointerEvents: 'auto',
        minHeight: 0,
        paddingTop: isMobile ? 0 : 16,
        paddingBottom: isMobile ? 16 : 32,
      }}
      data-testid="content-widget"
    >
      <div
        style={{
          width: '100%',
          maxWidth: 720,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', // always center horizontally
          textAlign: 'center',  // always center text
          gap: 12,
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(1.6rem, 2.5vw + 0.5rem, 2.4rem)',
            margin: 0,
            lineHeight: 1.15,
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            maxWidth: '100%',
          }}
        >
          This is the content widget title
        </h1>
        <p
          style={{
            margin: 0,
            opacity: 0.85,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            maxWidth: '100%',
          }}
        >
          Vertically {isMobile ? 'centered' : 'bottom-aligned'} container; text centered for both mobile and desktop.
        </p>
        <p
          style={{
            margin: 0,
            opacity: 0.65,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            maxWidth: '100%',
          }}
        >
          Resize the viewport to see vertical alignment change while text stays centered.
        </p>
      </div>
    </div>
  );
};
