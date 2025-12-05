import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface PreviewFrameProps {
  appPath: string;
  title: string;
  initials: string;
  baseSize?: { width: number };
  className?: string;
}

/**
 * PreviewFrame renders a non-interactive, scaled iframe preview of an app path
 * inside a fixed-aspect container. The iframe never captures pointer/keyboard
 * input so the parent link remains fully clickable and focusable.
 */
const PreviewFrame: React.FC<PreviewFrameProps> = ({
  appPath,
  title,
  initials,
  baseSize = { width: 800 },
  className,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Responsive baseWidth derived from viewport with mobile/desktop caps
  const [responsiveBaseWidth, setResponsiveBaseWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return Math.round(baseSize.width);
    const vw = window.innerWidth;
    const isMobile = vw <= 640;
    const cap = isMobile ? 480 : 960; // caps per device type
    const min = isMobile ? 320 : 720;  // minimums per device type
    return Math.max(min, Math.min(cap, Math.round(vw * (isMobile ? 0.95 : 0.8))));
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => {
      const vw = window.innerWidth;
      const isMobile = vw <= 640;
      const cap = isMobile ? 480 : 960;
      const min = isMobile ? 320 : 720;
      const next = Math.max(min, Math.min(cap, Math.round(vw * (isMobile ? 0.95 : 0.8))));
      setResponsiveBaseWidth(next);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const baseWidth = useMemo(() => Math.round(responsiveBaseWidth), [responsiveBaseWidth]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    let raf = 0;
    const applyScale = () => {
      const rect = wrapper.getBoundingClientRect();
      // Fit width exactly
      const scale = rect.width / baseWidth;
      canvas.style.transform = `scale(${scale})`;
      canvas.style.width = `${baseWidth}px`;
      // Derive logical height from wrapper aspect ratio so scaled canvas matches frame
      const aspect = rect.height / rect.width; // frame H/W
      const logicalHeight = baseWidth * aspect;
      canvas.style.height = `${logicalHeight}px`;
    };

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(applyScale);
    });

    ro.observe(wrapper);
    // First paint
    applyScale();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [baseWidth]);

  return (
    <div
      ref={wrapperRef}
      className={[
        'preview-frame',
        loaded ? 'preview-frame--loaded' : '',
        className || '',
      ].join(' ')}
      aria-hidden
    >
      <div
        ref={canvasRef}
        className="preview-frame__canvas"
        // Initial width/height; will be overridden by applyScale
        style={{ width: `${baseWidth}px`, height: `${baseWidth * (9 / 16)}px` }}
      >
        <iframe
          className="preview-frame__iframe"
          src={appPath}
          title={`${title} – preview`}
          loading="lazy"
          sandbox="allow-same-origin allow-scripts"
          tabIndex={-1}
          aria-hidden="true"
          onLoad={() => setLoaded(true)}
        />
      </div>

      {/* Fallback initials overlay until iframe loads */}
      <div className="preview-frame__fallback" aria-hidden>
        <span className="preview-frame__initials">{initials}</span>
      </div>
    </div>
  );
};

export default PreviewFrame;
