import React from 'react';
import { Sheet } from 'react-modal-sheet';

const SHEET_PEEK_FRACTION = 0.4; // 40% peek position

export const SheetAddMenu: React.FC<{
    open: boolean;
    content: React.ReactNode;
    onClose: () => void;
}> = ({ open, content, onClose }) => {
    return (
        <Sheet
            isOpen={open}
            onClose={onClose}
            // v5 detent API: "content" replaces "content-height"
            detent="content"
            // Use fractions of sheet height, in ascending order
            // 0 = closed, 0.4 = peek, 1 = fully open
            snapPoints={[0, SHEET_PEEK_FRACTION, 1]}
            initialSnap={1}
        >
            <Sheet.Container
                className="assistant-sheet-container"
                style={{
                    // keep solid background
                    backgroundColor: 'var(--assistant-sheet-bg, #05060a)',
                }}
            >
                <Sheet.Header className="assistant-sheet-header" />
                <Sheet.Content
                    className="assistant-sheet-content"
                    style={{
                        // ensure there’s always some visible body
                        minHeight: '40vh',
                        backgroundColor: 'var(--assistant-sheet-bg, #05060a)',
                    }}
                >
                    <div className="assistant-add__body assistant-add__body--sheet">
                        {content}
                    </div>
                </Sheet.Content>
            </Sheet.Container>
            {/* Backdrop is non-interactive by default in v5; it won't close on tap
               unless you explicitly add onTap={onClose}. */}
            <Sheet.Backdrop className="assistant-sheet-backdrop" onTap={onClose} />
        </Sheet>
    );
};
