import { UserPreferences } from './types';

const STORAGE_KEY = 'navai-preferences';

const defaultPreferences: UserPreferences = {
  autoCalm: true,
  reduceMotion: false,
  largeText: false,
  highContrast: false,
  focusAssist: false,
};

export function loadPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultPreferences, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to load preferences:', e);
  }
  
  // Check system preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return {
    ...defaultPreferences,
    reduceMotion: prefersReducedMotion,
  };
}

export function savePreferences(preferences: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (e) {
    console.warn('Failed to save preferences:', e);
  }
}

export function applyPreferences(preferences: UserPreferences): void {
  const root = document.documentElement;
  
  // Reduce motion
  if (preferences.reduceMotion) {
    root.classList.add('reduce-motion');
  } else {
    root.classList.remove('reduce-motion');
  }
  
  // Large text
  if (preferences.largeText) {
    root.classList.add('text-size-large');
  } else {
    root.classList.remove('text-size-large');
  }
  
  // High contrast
  if (preferences.highContrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }
}
