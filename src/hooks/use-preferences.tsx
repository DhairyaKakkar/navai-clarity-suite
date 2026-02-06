import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { UserPreferences, AdaptationLevel } from '@/lib/types';
import { loadPreferences, savePreferences, applyPreferences } from '@/lib/preferences';

interface PreferencesContextValue {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  resetPreferences: () => void;
  adaptationLevel: AdaptationLevel;
  setAdaptationLevel: (level: AdaptationLevel) => void;
  calmModeActive: boolean;
  setCalmModeActive: (active: boolean) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences);
  const [adaptationLevel, setAdaptationLevel] = useState<AdaptationLevel>(0);
  const [calmModeActive, setCalmModeActive] = useState(false);

  useEffect(() => {
    applyPreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    // Auto-enable calm mode at level 2+ if autoCalm is on
    if (preferences.autoCalm && adaptationLevel >= 2 && !calmModeActive) {
      setCalmModeActive(true);
    }
  }, [adaptationLevel, preferences.autoCalm, calmModeActive]);

  const updatePreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    savePreferences(newPrefs);
  };

  const resetPreferences = () => {
    const defaults = loadPreferences();
    setPreferences(defaults);
    savePreferences(defaults);
    setAdaptationLevel(0);
    setCalmModeActive(false);
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreference,
        resetPreferences,
        adaptationLevel,
        setAdaptationLevel,
        calmModeActive,
        setCalmModeActive,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
}
