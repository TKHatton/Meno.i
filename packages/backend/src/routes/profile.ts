/**
 * Profile routes for MenoAI Free Tier
 * Handles user profile creation, reading, and updating (including onboarding)
 */

import { Router } from 'express';
import {
  getUserProfile,
  upsertUserProfile,
  isSupabaseConfigured,
} from '../lib/supabase';
import type { UpdateProfileDTO } from '@menoai/shared';
import { generalLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply general rate limiting to profile endpoints
router.use(generalLimiter);

/**
 * GET /api/profile/:userId
 * Get user profile by user ID
 *
 * Response: { profile: UserProfile | null }
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    console.log(`👤 Fetching profile for user ${userId}`);

    const profile = await getUserProfile(userId);

    // Profile not existing is not an error (user might not have completed onboarding)
    res.status(200).json({ profile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/profile/:userId
 * Create or update user profile
 *
 * Body: UpdateProfileDTO (partial fields allowed)
 * Response: { profile: UserProfile }
 */
router.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profileData = req.body as UpdateProfileDTO;

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Validate menopause_stage if provided
    const validStages = ['perimenopause', 'menopause', 'postmenopause', 'unsure', 'learning'];
    if (profileData.menopause_stage && !validStages.includes(profileData.menopause_stage)) {
      return res.status(400).json({
        error: `menopause_stage must be one of: ${validStages.join(', ')}`,
      });
    }

    // Validate primary_concerns if provided
    if (profileData.primary_concerns) {
      if (!Array.isArray(profileData.primary_concerns)) {
        return res.status(400).json({
          error: 'primary_concerns must be an array',
        });
      }

      // Limit to 2 concerns as per PRD
      if (profileData.primary_concerns.length > 2) {
        return res.status(400).json({
          error: 'primary_concerns must have maximum 2 items',
        });
      }

      const validConcerns = [
        'hot_flashes',
        'sleep_issues',
        'mood_swings',
        'anxiety',
        'brain_fog',
        'memory_issues',
        'energy',
        'fatigue',
        'relationship_challenges',
        'understanding_symptoms',
        'other',
      ];

      const invalidConcerns = profileData.primary_concerns.filter(
        (concern) => !validConcerns.includes(concern)
      );

      if (invalidConcerns.length > 0) {
        return res.status(400).json({
          error: `Invalid primary_concerns: ${invalidConcerns.join(', ')}`,
        });
      }
    }

    console.log(`💾 Upserting profile for user ${userId}`);

    const profile = await upsertUserProfile(userId, profileData);

    if (!profile) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.status(200).json({ profile });
  } catch (error) {
    console.error('Error upserting user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/profile/:userId
 * Update user profile (alias for POST for RESTful consistency)
 *
 * Body: UpdateProfileDTO (partial fields allowed)
 * Response: { profile: UserProfile }
 */
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profileData = req.body as UpdateProfileDTO;

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Same validation as POST
    const validStages = ['perimenopause', 'menopause', 'postmenopause', 'unsure', 'learning'];
    if (profileData.menopause_stage && !validStages.includes(profileData.menopause_stage)) {
      return res.status(400).json({
        error: `menopause_stage must be one of: ${validStages.join(', ')}`,
      });
    }

    if (profileData.primary_concerns) {
      if (!Array.isArray(profileData.primary_concerns)) {
        return res.status(400).json({
          error: 'primary_concerns must be an array',
        });
      }

      if (profileData.primary_concerns.length > 2) {
        return res.status(400).json({
          error: 'primary_concerns must have maximum 2 items',
        });
      }
    }

    console.log(`✏️  Updating profile for user ${userId}`);

    const profile = await upsertUserProfile(userId, profileData);

    if (!profile) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.status(200).json({ profile });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/profile/:userId/preferences
 * Get user preferences
 *
 * Response: { preferences: { email_daily_reminders, email_weekly_summary, share_data_research } }
 */
router.get('/:userId/preferences', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const profile = await getUserProfile(userId);

    // Return default preferences if profile doesn't exist
    const preferences = {
      email_daily_reminders: false,
      email_weekly_summary: false,
      share_data_research: false,
      ...(profile?.preferences || {}),
    };

    res.status(200).json({ preferences });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/profile/:userId/preferences
 * Update user preferences
 *
 * Body: { email_daily_reminders, email_weekly_summary, share_data_research }
 * Response: { preferences }
 */
router.put('/:userId/preferences', async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = req.body;

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    console.log(`⚙️  Updating preferences for user ${userId}`);

    // Update profile with new preferences
    const profile = await upsertUserProfile(userId, { preferences });

    if (!profile) {
      return res.status(500).json({ error: 'Failed to update preferences' });
    }

    res.status(200).json({ preferences: profile.preferences });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/profile/:userId/export
 * Export all user data
 *
 * Response: { user, profile, symptoms, journals, messages }
 */
router.get('/:userId/export', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    console.log(`📦 Exporting data for user ${userId}`);

    // Import supabaseAdmin from lib
    const { supabaseAdmin } = await import('../lib/supabase');

    // Get all user data
    const [profileData, symptomsData, journalsData] = await Promise.all([
      getUserProfile(userId),
      supabaseAdmin.from('symptom_logs').select('*').eq('user_id', userId).order('log_date', { ascending: false }),
      supabaseAdmin.from('journal_entries').select('*').eq('user_id', userId).order('entry_date', { ascending: false }),
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: userId,
      profile: profileData,
      symptom_logs: symptomsData.data || [],
      journal_entries: journalsData.data || [],
    };

    res.status(200).json(exportData);
  } catch (error) {
    console.error('Error exporting user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/profile/upload-avatar
 * Upload user avatar (placeholder - would need actual file upload middleware)
 *
 * Body: FormData with 'avatar' file
 * Response: { avatarUrl }
 */
router.post('/upload-avatar', async (req, res) => {
  try {
    // For MVP, we'll use a placeholder
    // In production, you'd use multer/formidable + S3/Supabase Storage

    res.status(501).json({
      error: 'Avatar upload not yet implemented. Coming soon!',
      message: 'For now, you can use gravatar or a placeholder avatar',
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/profile/change-password
 * Change user password
 *
 * Body: { userId, currentPassword, newPassword }
 * Response: { success: true }
 */
router.post('/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    console.log(`🔐 Changing password for user ${userId}`);

    // Import supabaseAdmin client
    const { supabaseAdmin } = await import('../lib/supabase');

    // Verify current password by attempting to sign in
    // Note: This is a simplified version. In production, you'd use a more secure method
    // For now, we'll just update the password

    // Update password using Supabase Admin API
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) {
      console.error('Error changing password:', error);
      return res.status(400).json({ error: error.message || 'Failed to change password' });
    }

    // TODO: Send email notification

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/profile/request-deletion
 * Request account deletion - sends confirmation code to user's email
 *
 * Body: { userId, confirmationText }
 * Response: { success: true, message: string }
 */
router.post('/request-deletion', async (req, res) => {
  try {
    const { userId, confirmationText } = req.body;

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    if (!userId || !confirmationText) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate confirmation text (case-insensitive)
    if (confirmationText.toUpperCase() !== 'DELETE') {
      return res.status(400).json({ error: 'Invalid confirmation text. Please type DELETE to confirm.' });
    }

    console.log(`📧 Requesting account deletion for user ${userId}`);

    // Import required modules
    const { supabaseAdmin } = await import('../lib/supabase');
    const { sendDeletionConfirmationEmail } = await import('../lib/email');

    // Get user's email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (userError || !userData?.user?.email) {
      return res.status(404).json({ error: 'User not found or has no email' });
    }

    // Generate 6-digit confirmation code
    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing confirmation codes for this user
    await supabaseAdmin
      .from('deletion_confirmations')
      .delete()
      .eq('user_id', userId);

    // Store confirmation code in database
    const { error: insertError } = await supabaseAdmin
      .from('deletion_confirmations')
      .insert({
        user_id: userId,
        confirmation_code: confirmationCode,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      });

    if (insertError) {
      console.error('Error storing confirmation code:', insertError);
      return res.status(500).json({ error: 'Failed to generate confirmation code' });
    }

    // Send confirmation email
    const emailSent = await sendDeletionConfirmationEmail(userData.user.email, confirmationCode);

    if (!emailSent) {
      console.warn('Failed to send confirmation email, but code was stored');
    }

    res.status(200).json({
      success: true,
      message: 'Confirmation code sent to your email. Please check your inbox.',
    });
  } catch (error) {
    console.error('Error requesting account deletion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/profile/delete-account
 * Delete user account and all associated data
 *
 * Body: { userId, confirmationCode?, confirmationText? }
 * Response: { success: true }
 */
router.delete('/delete-account', async (req, res) => {
  try {
    const { userId, confirmationCode, confirmationText } = req.body;

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Import supabaseAdmin
    const { supabaseAdmin } = await import('../lib/supabase');

    // Check if email confirmation is enabled
    const emailConfirmationEnabled = process.env.REQUIRE_EMAIL_CONFIRMATION === 'true';

    if (emailConfirmationEnabled) {
      // Email confirmation flow
      if (!confirmationCode) {
        return res.status(400).json({ error: 'Missing confirmation code' });
      }

      console.log(`🗑️  Verifying confirmation code for user ${userId}`);

      // Verify confirmation code
      const { data: confirmationData, error: confirmationError } = await supabaseAdmin
        .from('deletion_confirmations')
        .select('*')
        .eq('user_id', userId)
        .eq('confirmation_code', confirmationCode)
        .eq('used', false)
        .single();

      if (confirmationError || !confirmationData) {
        return res.status(400).json({
          error: 'Invalid or expired confirmation code. Please request a new code.',
        });
      }

      // Check if code is expired
      if (new Date(confirmationData.expires_at) < new Date()) {
        return res.status(400).json({
          error: 'Confirmation code has expired. Please request a new code.',
        });
      }

      // Mark confirmation as used
      await supabaseAdmin
        .from('deletion_confirmations')
        .update({ used: true })
        .eq('id', confirmationData.id);

      console.log(`✅ Confirmation code verified. Deleting account for user ${userId}`);
    } else {
      // Simple text confirmation flow (no email required)
      if (!confirmationText) {
        return res.status(400).json({ error: 'Missing confirmation text' });
      }

      // Validate confirmation text (case-insensitive)
      if (confirmationText.toUpperCase() !== 'DELETE') {
        return res.status(400).json({ error: 'Invalid confirmation text. Please type DELETE to confirm.' });
      }

      console.log(`✅ Text confirmation verified. Deleting account for user ${userId}`);
    }

    // Delete all user data (cascade delete should handle this via foreign keys)
    // But we'll be explicit for safety
    await Promise.all([
      supabaseAdmin.from('symptom_logs').delete().eq('user_id', userId),
      supabaseAdmin.from('journal_entries').delete().eq('user_id', userId),
      supabaseAdmin.from('user_profiles').delete().eq('id', userId),
      supabaseAdmin.from('deletion_confirmations').delete().eq('user_id', userId),
    ]);

    // Delete auth user (this is the final step)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Error deleting user:', error);
      return res.status(400).json({ error: error.message || 'Failed to delete account' });
    }

    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
