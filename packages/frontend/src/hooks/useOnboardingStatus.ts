/**
 * Hook to check if user has completed onboarding
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

interface OnboardingStatus {
  completed: boolean;
  loading: boolean;
  error: Error | null;
}

export function useOnboardingStatus(): OnboardingStatus {
  const { user } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus>({
    completed: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (!user) {
        setStatus({ completed: false, loading: false, error: null });
        return;
      }

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${API_URL}/api/profile/${user.id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        const profile = data.profile;

        // Check if onboarding is completed
        const isCompleted = profile?.onboarding_completed === true;

        setStatus({
          completed: isCompleted,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setStatus({
          completed: false,
          loading: false,
          error: error as Error,
        });
      }
    }

    checkOnboardingStatus();
  }, [user]);

  return status;
}
