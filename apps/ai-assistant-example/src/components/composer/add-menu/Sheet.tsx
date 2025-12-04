import React from 'react';
import Sheet from 'react-modal-sheet';

const SHEET_PEEK_FRACTION = 0.4;

export const SheetAddMenu: React.FC<{
    open: boolean;
    content: React.ReactNode;
    onClose: () => void;
}> = ({ open, content, onClose }) => {
    // 1. Calculate the pixel value for the peek state
    // (Safe check for SSR environments)
    const vh = typeof window !== 'undefined' ? window.innerHeight : 0;
    const peekPx = vh * SHEET_PEEK_FRACTION;

    return (
        <Sheet
            isOpen={open}
            onClose={onClose}
            // 2. Tell the sheet to base "100%" on the content height, not the viewport
            detent="content-height"
            // 3. Define snap points: [Closed, Peek (px), Full (100% of content)]
            // Note: v5 uses ascending order (0 -> 1)
            snapPoints={[0, peekPx, 1]}
            initialSnap={1} // Open to the peek state (index 1)
        >
            <Sheet.Container>
                <Sheet.Header className="assistant-sheet-header" />
                <Sheet.Content
                    className="assistant-sheet-content"
                    // 4. CRITICAL: Ensure content is at least as tall as the peek.
                    // This prevents the "Full" snap point from being smaller
                    // than the "Peek" point, which would break the sheet.
                    style={{ minHeight: peekPx }}
                >
                    <div className="assistant-add__body assistant-add__body--sheet">
                        {content}
                    </div>
                </Sheet.Content>
            </Sheet.Container>
            <Sheet.Backdrop className="assistant-sheet-backdrop" />
        </Sheet>
    );
};