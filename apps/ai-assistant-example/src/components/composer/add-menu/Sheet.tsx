import React from 'react';
import {Sheet} from 'react-modal-sheet';

const SHEET_PEEK_FRACTION = 0.4;

export const SheetAddMenu: React.FC<{
    open: boolean;
    content: React.ReactNode;
    onClose: () => void;
}> = ({open, content, onClose}) => {
    const snapPoints = [0, SHEET_PEEK_FRACTION, 1];

    return (
        <Sheet
            isOpen={open}
            onClose={onClose}
            detent="content"          // <- key change
            snapPoints={snapPoints}   // 0 = closed, 0.4 = peek, 1 = max content height
            initialSnap={1}
        >
            <Sheet.Container
                className="assistant-sheet-container"
                style={{
                    backgroundColor: 'var(--assistant-sheet-bg, #05060a)',
                }}
            >
                <Sheet.Header className="assistant-sheet-header" />
                <Sheet.Content
                    className="assistant-sheet-content"
                    style={{
                        minHeight: '40vh',
                        backgroundColor: 'var(--assistant-sheet-bg, #05060a)',
                    }}
                >
                    <div className="assistant-add__body assistant-add__body--sheet">
                        {content}
                    </div>
                    <div className="assistant-footer-divider" />
                </Sheet.Content>
            </Sheet.Container>
            <Sheet.Backdrop
                className="assistant-sheet-backdrop"
                onTap={onClose}
            />
        </Sheet>
    );
};
