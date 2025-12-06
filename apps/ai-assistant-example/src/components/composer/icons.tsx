import React from 'react';

export const SliderIcon = React.memo(() => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden focusable="false">
    <path d="M4 7h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M9 7a2 2 0 1 1 4 0a2 2 0 1 1-4 0" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M6 17a2 2 0 1 1 4 0a2 2 0 1 1-4 0" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
));
SliderIcon.displayName = 'SliderIcon';

export const CameraIcon = React.memo(() => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden focusable="false">
    <path
      d="M7 7h2l1-2h4l1 2h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
));
CameraIcon.displayName = 'CameraIcon';

export const GalleryIcon = React.memo(() => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden focusable="false">
    <rect x="4" y="5" width="16" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="m7.5 15.5 3-3.5 3 4L16.5 13 19 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="10" cy="9" r="1.5" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
));
GalleryIcon.displayName = 'GalleryIcon';

export const SendIcon = React.memo(() => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden focusable="false">
    <path d="m5 12 14-7-4 14-2.5-4.5L8 10.5l11-5.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
));
SendIcon.displayName = 'SendIcon';
