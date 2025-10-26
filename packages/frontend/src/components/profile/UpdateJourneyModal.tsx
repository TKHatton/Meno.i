/**
 * Update Journey Modal
 * Allows users to update menopause stage and primary concerns
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

interface UpdateJourneyModalProps {
  profile: any;
  onClose: () => void;
  onSave: () => void;
}

const STAGES = [
  { value: 'perimenopause', label: 'Perimenopause', description: 'Symptoms but still menstruating' },
  { value: 'menopause', label: 'Menopause', description: '12+ months without period' },
  { value: 'postmenopause', label: 'Post-menopause', description: 'After menopause' },
  { value: 'unsure', label: 'Not sure yet', description: 'Still figuring it out' },
  { value: 'learning', label: "I'm here to learn", description: 'Supporting someone else' },
];

const CONCERNS = [
  { value: 'hot_flashes', label: 'Hot Flashes' },
  { value: 'night_sweats', label: 'Night Sweats' },
  { value: 'sleep_issues', label: 'Sleep Issues' },
  { value: 'mood_swings', label: 'Mood Swings' },
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'depression', label: 'Depression' },
  { value: 'brain_fog', label: 'Brain Fog' },
  { value: 'memory_issues', label: 'Memory Issues' },
  { value: 'weight_gain', label: 'Weight Gain' },
  { value: 'low_libido', label: 'Low Libido' },
  { value: 'vaginal_dryness', label: 'Vaginal Dryness' },
  { value: 'joint_pain', label: 'Joint Pain' },
];

export default function UpdateJourneyModal({ profile, onClose, onSave }: UpdateJourneyModalProps) {
  const { user } = useAuth();
  const [stage, setStage] = useState(profile?.menopause_stage || '');
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(profile?.primary_concerns || []);
  const [saving, setSaving] = useState(false);

  const toggleConcern = (concern: string) => {
    if (selectedConcerns.includes(concern)) {
      setSelectedConcerns(selectedConcerns.filter(c => c !== concern));
    } else {
      if (selectedConcerns.length >= 2) {
        alert('You can select up to 2 primary concerns');
        return;
      }
      setSelectedConcerns([...selectedConcerns, concern]);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (!stage) {
      alert('Please select your menopause stage');
      return;
    }

    setSaving(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_URL}/api/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menopause_stage: stage,
          primary_concerns: selectedConcerns,
        }),
      });

      if (response.ok) {
        onSave();
        onClose();
      } else {
        throw new Error('Failed to update journey info');
      }
    } catch (error) {
      console.error('Error updating journey:', error);
      alert('Failed to update journey info. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Update Your Journey
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Menopause Stage */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Where are you in your menopause journey?
            </label>
            <div className="space-y-2">
              {STAGES.map((item) => (
                <label
                  key={item.value}
                  className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    stage === item.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="stage"
                    value={item.value}
                    checked={stage === item.value}
                    onChange={(e) => setStage(e.target.value)}
                    className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      {item.label}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      {item.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Primary Concerns */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              What's your main concern right now?
            </label>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
              Select up to 2 concerns ({selectedConcerns.length}/2 selected)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CONCERNS.map((concern) => (
                <button
                  key={concern.value}
                  onClick={() => toggleConcern(concern.value)}
                  className={`px-3 py-2 text-sm rounded-lg border-2 transition-colors ${
                    selectedConcerns.includes(concern.value)
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
                  }`}
                >
                  {concern.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-neutral-200 dark:border-neutral-700">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
