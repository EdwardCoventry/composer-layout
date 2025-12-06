import React from 'react';
import type { AssistantPreferences } from '../../types';
import { SliderIcon } from '../icons';
import { PreferencesForm, PreferencesFooter } from './PreferencesForm';

const preferencesSummary = (preferences: AssistantPreferences) => `Tone: ${preferences.tone} · Detail: ${preferences.detail}`;

export type PreferencesShellComponentProps = { content: React.ReactNode; onClose: () => void; isEmbed?: boolean; };

export type PreferencesControlProps = {
  preferences: AssistantPreferences;
  onUpdatePreferences: (prefs: Partial<AssistantPreferences>) => void;
  Shell: React.ComponentType<PreferencesShellComponentProps>;
  contentVariant?: 'popup' | 'modal' | 'fullscreen';
  isEmbed?: boolean;
};

const PreferencesSummaryBar: React.FC<{ preferences: AssistantPreferences; onOpen: () => void; }> = ({ preferences, onOpen }) => {
  const summaryText = preferencesSummary(preferences);
  return (
    <div className="assistant-pref-bar">
      <div className="assistant-pref-bar__text">
        <div className="assistant-pref-bar__label">Preferences</div>
        <div className="assistant-pref-bar__summary">{summaryText}</div>
      </div>
      <button type="button" className="assistant-pref-bar__edit" onClick={onOpen}>
        <SliderIcon />
        Edit
      </button>
    </div>
  );
};

export const PreferencesControl: React.FC<PreferencesControlProps> = ({ preferences, onUpdatePreferences, Shell, contentVariant = 'popup', isEmbed = false }) => {
  const [prefsOpen, setPrefsOpen] = React.useState(false);
  const openPrefs = React.useCallback(() => setPrefsOpen(true), []);
  const closePrefs = React.useCallback(() => setPrefsOpen(false), []);

  const form = React.useMemo(() => (
    <PreferencesForm
      preferences={preferences}
      onUpdatePreferences={onUpdatePreferences}
      contentVariant={contentVariant}
      onClose={closePrefs}
      renderFooterInside={contentVariant !== 'popup'}
    />
  ), [preferences, onUpdatePreferences, contentVariant, closePrefs]);

  const shellContent = React.useMemo(() => {
    if (contentVariant === 'popup') {
      return (
        <>
          {form}
          <PreferencesFooter onClose={closePrefs} showDivider={true} />
        </>
      );
    }
    if (contentVariant === 'fullscreen') {
      return <div className="assistant-modal__scroll-frame">{form}</div>;
    }
    return form;
  }, [contentVariant, form, closePrefs]);

  return (
    <>
      <PreferencesSummaryBar preferences={preferences} onOpen={openPrefs} />

      {prefsOpen && (
        <Shell
          isEmbed={isEmbed}
          onClose={closePrefs}
          content={shellContent}
        />
      )}
    </>
  );
};
