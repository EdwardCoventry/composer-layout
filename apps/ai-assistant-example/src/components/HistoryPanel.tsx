import React from 'react';
import { AssistantHistoryEntry } from './types';

type HistoryPanelProps = {
  open: boolean;
  items: AssistantHistoryEntry[];
  onClose: () => void;
  onSelect: (entry: AssistantHistoryEntry) => void;
};

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden focusable="false">
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M12 8v4l2.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ open, items, onClose, onSelect }) => {
  if (!open) return null;

  const hasItems = items.length > 0;
  const groupedItems = React.useMemo(() => {
    if (!hasItems) return [];
    const map = new Map<string, AssistantHistoryEntry[]>();
    items.forEach((entry) => {
      const key = entry.groupLabel || 'Earlier';
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(entry);
    });
    return Array.from(map.entries());
  }, [hasItems, items]);

  return (
    <div className="assistant-history" role="dialog" aria-modal aria-label="History">
      <div className="assistant-history__backdrop" onClick={onClose} />

      <div className="assistant-history__panel">
        <div className="assistant-history__header">
          <div className="assistant-history__inner">
            <button type="button" className="assistant-history__close" onClick={onClose} aria-label="Close history">
              ×
            </button>
            <div className="assistant-history__title">
              <span className="assistant-history__title-text">History</span>
            </div>
          </div>
        </div>

        <div className="assistant-history__body">
          <div className="assistant-history__column">
            {hasItems ? (
              groupedItems.map(([group, groupItems]) => (
                <div key={group} className="assistant-history__group">
                  <div className="assistant-history__group-title">{group}</div>
                  <ul className="assistant-history__list">
                    {groupItems.map((entry) => (
                      <li key={entry.id}>
                        <button type="button" className="assistant-history__row" onClick={() => onSelect(entry)}>
                          <div className="assistant-history__row-title line-clamp line-clamp-2">{entry.title}</div>
                          <div className="assistant-history__row-meta">
                            <ClockIcon />
                            <span>{entry.timestamp}</span>
                            {entry.typeLabel ? (
                              <>
                                <span aria-hidden="true" className="assistant-history__row-dot">
                                  ·
                                </span>
                                <span className="assistant-history__row-mode">{entry.typeLabel}</span>
                              </>
                            ) : null}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <div className="assistant-history__empty" role="status">
                <div className="assistant-history__empty-title">No history yet</div>
                <div className="assistant-history__empty-body">Start a conversation and it will appear here.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
