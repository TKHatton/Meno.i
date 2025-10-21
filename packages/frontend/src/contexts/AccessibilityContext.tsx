/**
 * Accessibility Context
 * Manages accessibility preferences: dark mode, font size, high contrast, reduced motion
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large' | 'x-large';
export type ContrastMode = 'normal' | 'high';

interface AccessibilityState {
  theme: Theme;
  fontSize: FontSize;
  contrastMode: ContrastMode;
  reducedMotion: boolean;
  isDarkMode: boolean;
}

interface AccessibilityContextType extends AccessibilityState {
  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;
  setContrastMode: (mode: ContrastMode) => void;
  setReducedMotion: (enabled: boolean) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetAccessibility: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const FONT_SIZES: FontSize[] = ['small', 'medium', 'large', 'x-large'];

const DEFAULT_STATE: AccessibilityState = {
  theme: 'system',
  fontSize: 'medium',
  contrastMode: 'normal',
  reducedMotion: false,
  isDarkMode: false,
};

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [state, setState] = useState<AccessibilityState>(DEFAULT_STATE);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const loadPreferences = () => {
      try {
        // Check if we're in browser environment
        if (typeof window === 'undefined') return;

        const savedTheme = localStorage.getItem('accessibility-theme') as Theme;
        const savedFontSize = localStorage.getItem('accessibility-fontSize') as FontSize;
        const savedContrast = localStorage.getItem('accessibility-contrast') as ContrastMode;
        const savedReducedMotion = localStorage.getItem('accessibility-reducedMotion');

        // Check system preferences
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        setState({
          theme: savedTheme || 'system',
          fontSize: savedFontSize || 'medium',
          contrastMode: savedContrast || 'normal',
          reducedMotion: savedReducedMotion ? savedReducedMotion === 'true' : prefersReducedMotion,
          isDarkMode: savedTheme === 'dark' || ((!savedTheme || savedTheme === 'system') && prefersDark),
        });
      } catch (error) {
        console.error('Failed to load accessibility preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  // Update isDarkMode when theme changes or system preference changes
  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return;

    const updateDarkMode = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = state.theme === 'dark' || (state.theme === 'system' && prefersDark);

      if (isDark !== state.isDarkMode) {
        setState(prev => ({ ...prev, isDarkMode: isDark }));
      }
    };

    updateDarkMode();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => updateDarkMode();
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [state.theme, state.isDarkMode]);

  // Apply accessibility settings to document
  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    // Apply theme
    if (state.isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply font size
    root.setAttribute('data-font-size', state.fontSize);

    // Apply contrast mode
    if (state.contrastMode === 'high') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply reduced motion
    if (state.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [state.isDarkMode, state.fontSize, state.contrastMode, state.reducedMotion]);

  const setTheme = (theme: Theme) => {
    setState(prev => ({ ...prev, theme }));
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibility-theme', theme);
    }
  };

  const setFontSize = (fontSize: FontSize) => {
    setState(prev => ({ ...prev, fontSize }));
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibility-fontSize', fontSize);
    }
  };

  const setContrastMode = (contrastMode: ContrastMode) => {
    setState(prev => ({ ...prev, contrastMode }));
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibility-contrast', contrastMode);
    }
  };

  const setReducedMotion = (reducedMotion: boolean) => {
    setState(prev => ({ ...prev, reducedMotion }));
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibility-reducedMotion', String(reducedMotion));
    }
  };

  const increaseFontSize = () => {
    const currentIndex = FONT_SIZES.indexOf(state.fontSize);
    if (currentIndex < FONT_SIZES.length - 1) {
      setFontSize(FONT_SIZES[currentIndex + 1]);
    }
  };

  const decreaseFontSize = () => {
    const currentIndex = FONT_SIZES.indexOf(state.fontSize);
    if (currentIndex > 0) {
      setFontSize(FONT_SIZES[currentIndex - 1]);
    }
  };

  const resetAccessibility = () => {
    setState(DEFAULT_STATE);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessibility-theme');
      localStorage.removeItem('accessibility-fontSize');
      localStorage.removeItem('accessibility-contrast');
      localStorage.removeItem('accessibility-reducedMotion');
    }
  };

  const value: AccessibilityContextType = {
    ...state,
    setTheme,
    setFontSize,
    setContrastMode,
    setReducedMotion,
    increaseFontSize,
    decreaseFontSize,
    resetAccessibility,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
