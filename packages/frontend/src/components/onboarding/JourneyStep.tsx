/**
 * Onboarding Step 2: Journey Stage & Primary Concerns
 * Collects menopause stage and up to 2 primary concerns
 */

'use client';

import { useState } from 'react';
import { getSelectedClasses, getRadioClasses, getCheckboxClasses, getButtonClasses } from '@/utils/colorScheme';
import type { UserMode } from '@/hooks/useUserMode';

interface JourneyStepProps {
  initialStage: string;
  initialConcerns: string[];
  onComplete: (stage: string, concerns: string[]) => void;
  onBack: () => void;
}

const MENOPAUSE_STAGES = [
  {
    value: 'perimenopause',
    label: 'Perimenopause',
    description: 'Symptoms but still menstruating',
  },
  {
    value: 'menopause',
    label: 'Menopause',
    description: '12+ months without period',
  },
  {
    value: 'postmenopause',
    label: 'Post-menopause',
    description: 'Past the menopause transition',
  },
  {
    value: 'unsure',
    label: 'Not sure yet',
    description: 'Still figuring it out',
  },
  {
    value: 'learning',
    label: "I'm here to learn",
    description: 'Preparing for the journey',
  },
];

const SUPPORTING_PARTNER_STAGES = [
  {
    value: 'supporting_perimenopause',
    label: 'Perimenopause',
    description: 'Symptoms but still menstruating',
  },
  {
    value: 'supporting_menopause',
    label: 'Menopause',
    description: '12+ months without period',
  },
  {
    value: 'supporting_postmenopause',
    label: 'Post-menopause',
    description: 'Past the menopause transition',
  },
  {
    value: 'supporting_unsure',
    label: 'Not sure',
    description: "Still figuring it out together",
  },
];

const PRIMARY_CONCERNS = [
  { value: 'hot_flashes', label: 'Hot flashes' },
  { value: 'sleep_issues', label: 'Sleep issues' },
  { value: 'mood_swings', label: 'Mood swings / Anxiety' },
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'brain_fog', label: 'Brain fog / Memory' },
  { value: 'memory_issues', label: 'Memory issues' },
  { value: 'energy', label: 'Energy / Fatigue' },
  { value: 'fatigue', label: 'Fatigue' },
  { value: 'relationship_challenges', label: 'Relationship challenges' },
  { value: 'understanding_symptoms', label: 'Understanding symptoms' },
  { value: 'other', label: 'Other' },
];

export default function JourneyStep({
  initialStage,
  initialConcerns,
  onComplete,
  onBack,
}: JourneyStepProps) {
  const [stage, setStage] = useState(initialStage);
  const [concerns, setConcerns] = useState<string[]>(initialConcerns);
  const [stageError, setStageError] = useState('');
  const [concernsError, setConcernsError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSupportingPartner, setIsSupportingPartner] = useState(
    initialStage?.startsWith('supporting_') || false
  );

  // Determine color mode based on selection
  const colorMode: UserMode = isSupportingPartner ? 'man' : 'woman';

  const handleConcernToggle = (concernValue: string) => {
    if (concerns.includes(concernValue)) {
      // Remove concern
      setConcerns(concerns.filter((c) => c !== concernValue));
      setConcernsError('');
    } else {
      // Add concern (max 2)
      if (concerns.length >= 2) {
        setConcernsError('Please select up to 2 concerns');
        return;
      }
      setConcerns([...concerns, concernValue]);
      setConcernsError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!stage) {
      setStageError('Please select where you are in your journey');
      return;
    }

    if (concerns.length === 0) {
      setConcernsError('Please select at least one concern');
      return;
    }

    setIsSubmitting(true);

    try {
      await onComplete(stage, concerns);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8 md:p-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          About Your Journey
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-300">
          This helps us personalize your experience
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Who is this for? */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
            Who is this for?
          </label>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsSupportingPartner(false);
                setStage('');
                setStageError('');
              }}
              className={`
                px-6 py-4 rounded-lg font-medium
                transition-all duration-200
                ${getSelectedClasses('woman', !isSupportingPartner)}
                ${!isSupportingPartner
                  ? 'text-primary-700 dark:text-primary-300'
                  : 'text-neutral-700 dark:text-neutral-300'
                }
              `}
            >
              For me
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSupportingPartner(true);
                setStage('');
                setStageError('');
              }}
              className={`
                px-6 py-4 rounded-lg font-medium
                transition-all duration-200
                ${getSelectedClasses('man', isSupportingPartner)}
                ${isSupportingPartner
                  ? 'text-primary-700 dark:text-primary-300'
                  : 'text-neutral-700 dark:text-neutral-300'
                }
              `}
            >
              Supporting my partner
            </button>
          </div>
        </div>

        {/* Menopause Stage */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
            {isSupportingPartner
              ? "What stage is your partner at?"
              : "Where are you in your menopause journey?"}
          </label>
          <div className="space-y-3">
            {(isSupportingPartner ? SUPPORTING_PARTNER_STAGES : MENOPAUSE_STAGES).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setStage(option.value);
                  setStageError('');
                }}
                className={`
                  w-full text-left px-4 py-4 rounded-lg
                  transition-all duration-200
                  ${getSelectedClasses(colorMode, stage === option.value)}
                `}
              >
                <div className="flex items-center">
                  <div className={`
                    w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center
                    ${getRadioClasses(colorMode, stage === option.value)}
                  `}>
                    {stage === option.value && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      {option.label}
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      {option.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {stageError && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{stageError}</p>
          )}
        </div>

        {/* Primary Concerns */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            What's your main concern right now?
            <span className="text-neutral-500 dark:text-neutral-400 font-normal ml-2">
              (Select up to 2)
            </span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {PRIMARY_CONCERNS.map((concern) => (
              <button
                key={concern.value}
                type="button"
                onClick={() => handleConcernToggle(concern.value)}
                disabled={!concerns.includes(concern.value) && concerns.length >= 2}
                className={`
                  text-left px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${getSelectedClasses(colorMode, concerns.includes(concern.value))}
                  ${!concerns.includes(concern.value) && concerns.length >= 2
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                  }
                `}
              >
                <div className="flex items-center">
                  <div className={`
                    w-5 h-5 rounded border-2 mr-3 flex items-center justify-center
                    ${getCheckboxClasses(colorMode, concerns.includes(concern.value))}
                  `}>
                    {concerns.includes(concern.value) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {concern.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
          {concernsError && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{concernsError}</p>
          )}
          {concerns.length > 0 && (
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {concerns.length} of 2 selected
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-4 flex-1 bg-white dark:bg-neutral-900
                     text-neutral-700 dark:text-neutral-300 font-semibold rounded-lg
                     border-2 border-neutral-300 dark:border-neutral-600
                     hover:border-neutral-400 dark:hover:border-neutral-500
                     transition-all duration-200"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!stage || concerns.length === 0 || isSubmitting}
            className={`px-6 py-4 flex-1 ${getButtonClasses(colorMode, 'primary')}
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? 'Getting Started...' : 'Get Started'}
          </button>
        </div>
      </form>
    </div>
  );
}
