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

const PreferencesSummaryBar: React.FC<{ preferences: AssistantPreferences; onOpen: () => void; }> = ({ preferences, onOpen }) => (
  <div className="assistant-pref-bar">
    <div className="assistant-pref-bar__text">
      <div className="assistant-pref-bar__label">Preferences</div>
      <div className="assistant-pref-bar__summary">{preferencesSummary(preferences)}</div>
    </div>
    <button type="button" className="assistant-pref-bar__edit" onClick={onOpen}>
      <SliderIcon />
      Edit
    </button>
  </div>
);

export const PreferencesControl: React.FC<PreferencesControlProps> = ({ preferences, onUpdatePreferences, Shell, contentVariant = 'popup', isEmbed = false }) => {
  const [prefsOpen, setPrefsOpen] = React.useState(false);
  const openPrefs = () => setPrefsOpen(true);
  const closePrefs = () => setPrefsOpen(false);

  const form = (
    <PreferencesForm
      preferences={preferences}
      onUpdatePreferences={onUpdatePreferences}
      contentVariant={contentVariant}
      onClose={closePrefs}
      renderFooterInside={contentVariant !== 'popup'}
    />
  );

  return (
    <>
      <PreferencesSummaryBar preferences={preferences} onOpen={openPrefs} />

      {prefsOpen && (
        <Shell
          isEmbed={isEmbed}
          onClose={closePrefs}
          content={
            contentVariant === 'popup' ? (
              <>
                {form}
                {/* Footer outside content for popup; visually pinned at bottom */}
                <PreferencesFooter onClose={closePrefs} showDivider={true} />
              </>
            ) : contentVariant === 'fullscreen' ? (
              <div className="assistant-modal__scroll-frame">{form}</div>
            ) : (
              form
            )
          }
        />
      )}
    </>
  );
};
