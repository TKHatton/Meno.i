/**
 * Onboarding Step 1: Welcome & Display Name
 * Collects the user's preferred display name
 */

'use client';

import { useState } from 'react';

interface WelcomeStepProps {
  initialName: string;
  onComplete: (name: string) => void;
}

export default function WelcomeStep({ initialName, onComplete }: WelcomeStepProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    onComplete(name.trim());
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8 md:p-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          Welcome to Meno.i! 👋
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-300">
          Let's personalize your experience
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
          >
            What should we call you?
          </label>
          <input
            type="text"
            id="displayName"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="Enter your first name"
            className={`
              w-full px-4 py-3
              border-2 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-primary-500
              transition-all duration-200
              ${error
                ? 'border-red-500 focus:border-red-500'
                : 'border-neutral-200 dark:border-neutral-700 focus:border-primary-500'
              }
              bg-white dark:bg-neutral-900
              text-neutral-900 dark:text-neutral-100
              placeholder-neutral-400 dark:placeholder-neutral-500
            `}
            autoFocus
          />
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-500
                   text-white font-semibold rounded-lg
                   hover:from-primary-700 hover:to-primary-600
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                   transition-all duration-200 shadow-md hover:shadow-lg
                   disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!name.trim()}
        >
          Continue
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
        This helps us personalize your experience. You can change this later.
      </p>
    </div>
  );
}
