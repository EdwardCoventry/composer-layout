import React from 'react';
import Sheet from 'react-modal-sheet';

export const SheetAddMenu: React.FC<{ open: boolean; content: React.ReactNode; onClose: () => void; }> = ({ open, content, onClose }) => {
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const peek = Math.round(vh * 0.2);
  const snapPoints = [vh, peek, 0];

  return (
    <Sheet isOpen={open} onClose={onClose} snapPoints={snapPoints} initialSnap={1} detent="full-height">
      <Sheet.Container>
        <Sheet.Header />
        <Sheet.Content // @ts-expect-error v1 supports boolean disableDrag, newer versions support callback
          disableDrag={(state: { scrollPosition: 'top' | 'middle' | 'bottom' }) => state.scrollPosition !== 'top'}
        >
          <div className="assistant-add__body assistant-add__body--sheet">{content}</div>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop />
    </Sheet>
  );
};

