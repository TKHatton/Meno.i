/**
 * Accessibility Toolbar
 * Provides controls for dark mode, font size, contrast, and other accessibility features
 */

'use client';

import { useState } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

export default function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    theme,
    fontSize,
    contrastMode,
    reducedMotion,
    isDarkMode,
    setTheme,
    increaseFontSize,
    decreaseFontSize,
    setContrastMode,
    setReducedMotion,
    resetAccessibility,
  } = useAccessibility();

  return (
    <>
      {/* Floating accessibility button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-500 dark:hover:bg-primary-600 dark:focus:ring-primary-800"
        aria-label="Open accessibility menu"
        aria-expanded={isOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </button>

      {/* Accessibility panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div
            className="fixed bottom-24 right-6 z-50 w-80 bg-white dark:bg-neutral-800 rounded-lg shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
            role="dialog"
            aria-label="Accessibility settings"
          >
            {/* Header */}
            <div className="bg-primary-600 dark:bg-primary-700 text-white px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Accessibility</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-white rounded p-1"
                aria-label="Close accessibility menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Controls */}
            <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Dark Mode */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`px-3 py-2 text-sm rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      theme === 'light'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-600'
                    }`}
                    aria-pressed={theme === 'light'}
                  >
                    ☀️ Light
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`px-3 py-2 text-sm rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      theme === 'dark'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-600'
                    }`}
                    aria-pressed={theme === 'dark'}
                  >
                    🌙 Dark
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={`px-3 py-2 text-sm rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      theme === 'system'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-600'
                    }`}
                    aria-pressed={theme === 'system'}
                  >
                    💻 Auto
                  </button>
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  Text Size
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={decreaseFontSize}
                    className="px-4 py-2 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-600 rounded hover:bg-neutral-50 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={fontSize === 'small'}
                    aria-label="Decrease font size"
                  >
                    A-
                  </button>
                  <span className="flex-1 text-center text-sm text-neutral-600 dark:text-neutral-300 capitalize">
                    {fontSize}
                  </span>
                  <button
                    onClick={increaseFontSize}
                    className="px-4 py-2 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-600 rounded hover:bg-neutral-50 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={fontSize === 'x-large'}
                    aria-label="Increase font size"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* High Contrast */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  Contrast
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setContrastMode('normal')}
                    className={`px-3 py-2 text-sm rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      contrastMode === 'normal'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-600'
                    }`}
                    aria-pressed={contrastMode === 'normal'}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => setContrastMode('high')}
                    className={`px-3 py-2 text-sm rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      contrastMode === 'high'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-600'
                    }`}
                    aria-pressed={contrastMode === 'high'}
                  >
                    High Contrast
                  </button>
                </div>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <label
                  htmlFor="reduced-motion"
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-200"
                >
                  Reduce Motion
                </label>
                <button
                  id="reduced-motion"
                  onClick={() => setReducedMotion(!reducedMotion)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    reducedMotion
                      ? 'bg-primary-600'
                      : 'bg-neutral-300 dark:bg-neutral-600'
                  }`}
                  role="switch"
                  aria-checked={reducedMotion}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      reducedMotion ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-neutral-200 dark:border-neutral-700" />

              {/* Current status */}
              <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
                <p>• Theme: {theme === 'system' ? `Auto (${isDarkMode ? 'dark' : 'light'})` : theme}</p>
                <p>• Text size: {fontSize}</p>
                <p>• Contrast: {contrastMode}</p>
                <p>• Reduced motion: {reducedMotion ? 'On' : 'Off'}</p>
              </div>

              {/* Reset button */}
              <button
                onClick={resetAccessibility}
                className="w-full px-4 py-2 text-sm bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
