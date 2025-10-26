/**
 * Color scheme utilities
 * Provides different color palettes for woman vs man modes
 */

import type { UserMode } from '@/hooks/useUserMode';

export interface ColorScheme {
  // Primary button colors
  primaryButton: string;
  primaryButtonHover: string;

  // Accent colors
  accent: string;
  accentLight: string;
  accentDark: string;

  // Background colors
  backgroundGradient: string;
  cardBackground: string;

  // Border colors
  borderFocus: string;
  borderSelected: string;

  // Text colors
  textAccent: string;
}

/**
 * Get color scheme based on user mode
 */
export function getColorScheme(mode: UserMode): ColorScheme {
  if (mode === 'man') {
    // Masculine color scheme: stronger, bolder, more saturated
    return {
      primaryButton: 'bg-gradient-to-r from-primary-700 to-primary-600',
      primaryButtonHover: 'hover:from-primary-800 hover:to-primary-700',

      accent: 'bg-primary-600',
      accentLight: 'bg-primary-100 dark:bg-primary-900/30',
      accentDark: 'bg-primary-800',

      backgroundGradient: 'bg-gradient-to-br from-primary-100 via-neutral-50 to-neutral-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900',
      cardBackground: 'bg-white dark:bg-neutral-800',

      borderFocus: 'border-primary-600',
      borderSelected: 'border-primary-600 bg-primary-100 dark:bg-primary-900/30',

      textAccent: 'text-primary-700 dark:text-primary-300',
    };
  }

  // Default (woman) color scheme: softer, more pastel
  return {
    primaryButton: 'bg-gradient-to-r from-primary-600 to-primary-500',
    primaryButtonHover: 'hover:from-primary-700 hover:to-primary-600',

    accent: 'bg-primary-500',
    accentLight: 'bg-primary-50 dark:bg-primary-900/20',
    accentDark: 'bg-primary-700',

    backgroundGradient: 'bg-gradient-to-br from-primary-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900',
    cardBackground: 'bg-white dark:bg-neutral-800',

    borderFocus: 'border-primary-500',
    borderSelected: 'border-primary-500 bg-primary-50 dark:bg-primary-900/20',

    textAccent: 'text-primary-700 dark:text-primary-300',
  };
}

/**
 * Get button classes based on user mode
 */
export function getButtonClasses(mode: UserMode, variant: 'primary' | 'secondary' = 'primary'): string {
  const scheme = getColorScheme(mode);

  if (variant === 'primary') {
    return `${scheme.primaryButton} ${scheme.primaryButtonHover} text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg`;
  }

  return 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-semibold rounded-lg border-2 border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 transition-all duration-200';
}

/**
 * Get selected state classes based on user mode
 */
export function getSelectedClasses(mode: UserMode, isSelected: boolean): string {
  const scheme = getColorScheme(mode);

  if (isSelected) {
    return `${scheme.borderSelected} border-2`;
  }

  return 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 border-2';
}

/**
 * Get radio button classes based on user mode
 */
export function getRadioClasses(mode: UserMode, isSelected: boolean): string {
  if (isSelected) {
    if (mode === 'man') {
      return 'border-primary-600 bg-primary-600';
    }
    return 'border-primary-500 bg-primary-500';
  }

  return 'border-neutral-300 dark:border-neutral-600';
}

/**
 * Get checkbox classes based on user mode
 */
export function getCheckboxClasses(mode: UserMode, isChecked: boolean): string {
  if (isChecked) {
    if (mode === 'man') {
      return 'border-primary-600 bg-primary-600';
    }
    return 'border-primary-500 bg-primary-500';
  }

  return 'border-neutral-300 dark:border-neutral-600';
}
