/**
 * Accessibility Menu Component
 * Dropdown menu for accessibility settings (dark mode, font size, etc.)
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

export default function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    theme,
    fontSize,
    contrastMode,
    reducedMotion,
    setTheme,
    setFontSize,
    setContrastMode,
    setReducedMotion,
  } = useAccessibility();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Accessibility Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        aria-label="Accessibility settings"
        title="Accessibility settings"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 p-4 z-50">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Accessibility Settings
          </h3>

          {/* Theme Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Theme
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors ${
                  theme === 'light'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors ${
                  theme === 'dark'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors ${
                  theme === 'system'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                }`}
              >
                Auto
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Font Size
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['small', 'medium', 'large', 'x-large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-2 py-2 text-xs rounded-md transition-colors ${
                    fontSize === size
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                  }`}
                >
                  {size === 'x-large' ? 'XL' : size.charAt(0).toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast */}
          <div className="mb-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                High Contrast
              </span>
              <button
                onClick={() =>
                  setContrastMode(contrastMode === 'high' ? 'normal' : 'high')
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  contrastMode === 'high'
                    ? 'bg-primary-600'
                    : 'bg-neutral-300 dark:bg-neutral-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    contrastMode === 'high' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>

          {/* Reduced Motion */}
          <div>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Reduce Motion
              </span>
              <button
                onClick={() => setReducedMotion(!reducedMotion)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  reducedMotion
                    ? 'bg-primary-600'
                    : 'bg-neutral-300 dark:bg-neutral-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
