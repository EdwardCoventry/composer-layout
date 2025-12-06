import React from 'react';
import { QuizScreenLayout } from './screens/QuizScreenLayout';
import { useApplyColorSchemeTheme } from 'ui/hooks/useApplyColorSchemeTheme';

export default function App() {
  useApplyColorSchemeTheme();

  return <QuizScreenLayout />;
}
