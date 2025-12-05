import { Maximize2 } from 'lucide-react';
import React from 'react';

export const ExpandIcon: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }> = ({ size = 18, className, style }) => (
  <Maximize2 size={size} className={className} style={style} aria-label="Expand" />
);
