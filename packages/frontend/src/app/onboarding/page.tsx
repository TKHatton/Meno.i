/**
 * Onboarding Flow for MenoAI Free Tier
 * Two-step process to collect user preferences and personalize their experience
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import JourneyStep from '@/components/onboarding/JourneyStep';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { completed: onboardingCompleted, loading: onboardingLoading } = useOnboardingStatus();
  const [currentStep, setCurrentStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [menopauseStage, setMenopauseStage] = useState('');
  const [primaryConcerns, setPrimaryConcerns] = useState<string[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Redirect if already completed onboarding
  useEffect(() => {
    if (!onboardingLoading && onboardingCompleted) {
      router.push('/chat');
    }
  }, [onboardingCompleted, onboardingLoading, router]);

  const handleWelcomeComplete = (name: string) => {
    setDisplayName(name);
    setCurrentStep(2);
  };

  const handleJourneyComplete = async (
    stage: string,
    concerns: string[]
  ) => {
    setMenopauseStage(stage);
    setPrimaryConcerns(concerns);

    // Save profile data to backend
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      console.log('🔄 Saving onboarding data...');
      console.log('API URL:', API_URL);
      console.log('User ID:', user?.id);
      console.log('Data:', {
        display_name: displayName,
        menopause_stage: stage,
        primary_concerns: concerns,
        onboarding_completed: true,
      });

      const response = await fetch(`${API_URL}/api/profile/${user?.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_name: displayName,
          menopause_stage: stage,
          primary_concerns: concerns,
          onboarding_completed: true,
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(`Failed to save profile: ${JSON.stringify(data)}`);
      }

      console.log('✅ Onboarding saved! Redirecting to /chat...');
      // Redirect to dashboard/chat
      router.push('/chat');
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error: ${errorMessage}\n\nCheck the browser console for details.`);
      // Still redirect even if save fails (they can update profile later)
      // router.push('/chat');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loading || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            <div className={`h-2 w-16 rounded-full ${currentStep >= 1 ? 'bg-primary-600' : 'bg-neutral-200'}`} />
            <div className={`h-2 w-16 rounded-full ${currentStep >= 2 ? 'bg-primary-600' : 'bg-neutral-200'}`} />
          </div>
          <p className="text-center mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Step {currentStep} of 2
          </p>
        </div>

        {/* Step content */}
        {currentStep === 1 && (
          <WelcomeStep
            initialName={displayName}
            onComplete={handleWelcomeComplete}
          />
        )}

        {currentStep === 2 && (
          <JourneyStep
            initialStage={menopauseStage}
            initialConcerns={primaryConcerns}
            onComplete={handleJourneyComplete}
            onBack={handleBack}
          />
        )}
      </div>
    </main>
  );
}
