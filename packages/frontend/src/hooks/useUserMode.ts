/**
 * Hook to detect user mode (woman vs man supporting partner)
 * Used to apply different UI styling based on user type
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';

export type UserMode = 'woman' | 'man' | 'unknown';

export function useUserMode(): { mode: UserMode; loading: boolean } {
  const { user } = useAuth();
  const [mode, setMode] = useState<UserMode>('unknown');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserMode() {
      if (!user) {
        setMode('unknown');
        setLoading(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('menopause_stage')
          .eq('id', user.id)
          .single();

        if (profile?.menopause_stage) {
          // If stage starts with 'supporting_', user is a man supporting their partner
          const isManMode = profile.menopause_stage.startsWith('supporting_');
          setMode(isManMode ? 'man' : 'woman');
        } else {
          setMode('unknown');
        }
      } catch (error) {
        console.error('Error fetching user mode:', error);
        setMode('unknown');
      } finally {
        setLoading(false);
      }
    }

    fetchUserMode();
  }, [user]);

  return { mode, loading };
}
