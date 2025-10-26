/**
 * Daily Check-In Component
 * Form for logging daily symptoms with severity ratings
 */

'use client';

import { useState, useEffect } from 'react';

interface DailyCheckInProps {
  userId: string;
  onSaved: () => void;
}

const PHYSICAL_SYMPTOMS = [
  { key: 'hot_flashes', label: 'Hot flashes' },
  { key: 'night_sweats', label: 'Night sweats' },
  { key: 'sleep_issues', label: 'Sleep issues' },
  { key: 'headaches', label: 'Headaches' },
  { key: 'joint_pain', label: 'Joint pain' },
  { key: 'fatigue', label: 'Fatigue' },
  { key: 'heart_palpitations', label: 'Heart palpitations' },
];

const EMOTIONAL_SYMPTOMS = [
  { key: 'mood_swings', label: 'Mood swings' },
  { key: 'anxiety', label: 'Anxiety' },
  { key: 'irritability', label: 'Irritability' },
  { key: 'depression', label: 'Depression/Low mood' },
  { key: 'brain_fog', label: 'Brain fog' },
  { key: 'memory_issues', label: 'Memory issues' },
  { key: 'crying_spells', label: 'Crying spells' },
  { key: 'overwhelmed', label: 'Feeling overwhelmed' },
];

export default function DailyCheckIn({ userId, onSaved }: DailyCheckInProps) {
  const [symptoms, setSymptoms] = useState<Record<string, number>>({});
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Get today's date
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const logDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Load existing log for today
  useEffect(() => {
    async function loadTodayLog() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${API_URL}/api/symptoms/date/${userId}/${logDate}`);

        if (response.ok) {
          const data = await response.json();
          if (data.log) {
            setSymptoms(data.log.symptoms || {});
            setEnergyLevel(data.log.energy_level || null);
            setNotes(data.log.notes || '');
          }
        }
      } catch (err) {
        console.error('Error loading today log:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadTodayLog();
  }, [userId, logDate]);

  const toggleSymptom = (symptomKey: string) => {
    if (symptoms[symptomKey]) {
      // Remove symptom
      const newSymptoms = { ...symptoms };
      delete newSymptoms[symptomKey];
      setSymptoms(newSymptoms);
    } else {
      // Add symptom with default severity of 3
      setSymptoms({ ...symptoms, [symptomKey]: 3 });
    }
  };

  const setSeverity = (symptomKey: string, severity: number) => {
    setSymptoms({ ...symptoms, [symptomKey]: severity });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (Object.keys(symptoms).length === 0 && !energyLevel) {
      setError('Please select at least one symptom or set your energy level');
      return;
    }

    setIsSubmitting(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_URL}/api/symptoms/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          log_date: logDate,
          symptoms,
          energy_level: energyLevel,
          notes: notes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save symptom log');
      }

      setSuccessMessage(`✓ Check-in saved for ${new Date().toLocaleDateString()}`);
      setTimeout(() => {
        onSaved();
      }, 1500);
    } catch (err) {
      console.error('Error saving symptom log:', err);
      setError('Failed to save check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Today's Check-In
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">{today}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Physical Symptoms */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Physical Symptoms
          </h3>
          <div className="space-y-4">
            {PHYSICAL_SYMPTOMS.map((symptom) => (
              <SymptomRow
                key={symptom.key}
                symptomKey={symptom.key}
                label={symptom.label}
                checked={!!symptoms[symptom.key]}
                severity={symptoms[symptom.key]}
                onToggle={toggleSymptom}
                onSeverityChange={setSeverity}
              />
            ))}
          </div>
        </div>

        {/* Emotional/Cognitive Symptoms */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Emotional/Cognitive
          </h3>
          <div className="space-y-4">
            {EMOTIONAL_SYMPTOMS.map((symptom) => (
              <SymptomRow
                key={symptom.key}
                symptomKey={symptom.key}
                label={symptom.label}
                checked={!!symptoms[symptom.key]}
                severity={symptoms[symptom.key]}
                onToggle={toggleSymptom}
                onSeverityChange={setSeverity}
              />
            ))}
          </div>
        </div>

        {/* Energy Level */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Overall Energy Level Today
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setEnergyLevel(level)}
                className={`flex-1 h-12 rounded-lg border-2 font-medium transition-all ${
                  energyLevel === level
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 flex justify-between">
            <span>Very Low</span>
            <span>Very High</span>
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes about how you're feeling today..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg
                     focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20
                     bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100
                     placeholder-neutral-400 dark:placeholder-neutral-500"
          />
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || (Object.keys(symptoms).length === 0 && !energyLevel)}
          className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-500
                   text-white font-semibold rounded-lg
                   hover:from-primary-700 hover:to-primary-600
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                   transition-all duration-200 shadow-md hover:shadow-lg
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Check-In'}
        </button>
      </form>
    </div>
  );
}

// Individual symptom row component
interface SymptomRowProps {
  symptomKey: string;
  label: string;
  checked: boolean;
  severity?: number;
  onToggle: (key: string) => void;
  onSeverityChange: (key: string, severity: number) => void;
}

function SymptomRow({
  symptomKey,
  label,
  checked,
  severity,
  onToggle,
  onSeverityChange,
}: SymptomRowProps) {
  return (
    <div className="flex items-start gap-4">
      <button
        type="button"
        onClick={() => onToggle(symptomKey)}
        className="mt-1 flex-shrink-0"
      >
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
          checked
            ? 'border-primary-500 bg-primary-500'
            : 'border-neutral-300 dark:border-neutral-600'
        }`}>
          {checked && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </button>

      <div className="flex-1">
        <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
          {label}
        </label>

        {checked && (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => onSeverityChange(symptomKey, level)}
                className={`w-10 h-10 rounded-full border-2 font-medium transition-all ${
                  severity === level
                    ? 'border-primary-500 bg-primary-500 text-white scale-110'
                    : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-300 dark:hover:border-primary-700'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
