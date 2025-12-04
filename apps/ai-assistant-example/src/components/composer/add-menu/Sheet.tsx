import React from 'react';
import Sheet from 'react-modal-sheet';

export const SheetAddMenu: React.FC<{ open: boolean; content: React.ReactNode; onClose: () => void; }> = ({ open, content, onClose }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [snapPoints, setSnapPoints] = React.useState<number[]>([0]);
  const [initialSnap, setInitialSnap] = React.useState<number>(0);

  const recomputeSnapPoints = React.useCallback(() => {
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const contentEl = containerRef.current;
    const contentHeight = contentEl ? contentEl.getBoundingClientRect().height : 0;
    // Cap the max snap at the content height and viewport height (whichever is smaller)
    const maxSnap = Math.min(contentHeight, vh);
    // Choose a peek around 40% of the viewport, but not greater than maxSnap
    const peek = Math.min(Math.round(vh * 0.4), maxSnap);
    // If content is smaller than peek, just open at content size
    const points = maxSnap > 0 ? [maxSnap, peek, 0] : [peek, 0];
    // Prefer opening at peek if peek < maxSnap, else open at 0 (closed) and user can drag up
    const nextInitial = points.length === 3 ? 1 : 0;
    setSnapPoints(points);
    setInitialSnap(nextInitial);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    // Measure after mount
    const rAF = window.requestAnimationFrame(recomputeSnapPoints);
    const onResize = () => recomputeSnapPoints();
    window.addEventListener('resize', onResize);
    return () => {
      window.cancelAnimationFrame(rAF);
      window.removeEventListener('resize', onResize);
    };
  }, [open, recomputeSnapPoints]);

  return (
    <Sheet isOpen={open} onClose={onClose} snapPoints={snapPoints} initialSnap={initialSnap}>
      <Sheet.Container className="assistant-sheet-container">
        <Sheet.Header className="assistant-sheet-header" />
        <Sheet.Content // @ts-expect-error v1 supports boolean disableDrag, newer versions support callback
          disableDrag={(state: { scrollPosition: 'top' | 'middle' | 'bottom' }) => state.scrollPosition !== 'top'}
          className="assistant-sheet-content"
        >
          <div ref={containerRef} className="assistant-add__body assistant-add__body--sheet">
            {content}
          </div>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop className="assistant-sheet-backdrop" />
    </Sheet>
  );
};
