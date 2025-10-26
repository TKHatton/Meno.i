/**
 * Profile editing modal component
 * Allows users to update their profile information
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import UserAvatar from './UserAvatar';

interface ProfileModalProps {
  onClose: () => void;
  onSave?: () => void;
}

interface UserProfile {
  full_name: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
}

export default function ProfileModal({ onClose, onSave }: ProfileModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    display_name: '',
    bio: '',
    avatar_url: null
  });

  // Get user data from metadata
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
  const userEmail = user?.email || '';
  const googleAvatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  // Current avatar URL (custom or Google)
  const currentAvatarUrl = profile.avatar_url || googleAvatarUrl;

  // Load existing profile
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('full_name, display_name, bio, avatar_url')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = no rows returned (profile doesn't exist yet)
          console.error('Error loading profile:', error);
          setError('Failed to load profile');
        } else if (data) {
          setProfile({
            full_name: data.full_name || userName,
            display_name: data.display_name || userName,
            bio: data.bio || '',
            avatar_url: data.avatar_url || null
          });
        } else {
          // No profile exists, use OAuth data
          setProfile({
            full_name: userName,
            display_name: userName,
            bio: '',
            avatar_url: null
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, userName]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, etc.)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Delete old avatar if exists
      if (profile.avatar_url && profile.avatar_url.includes('supabase.co/storage')) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);

        // Provide more specific error messages
        if (uploadError.message.includes('Bucket not found')) {
          setError('Storage not configured. Please contact support or check setup guide.');
        } else if (uploadError.message.includes('new row violates row-level security')) {
          setError('Permission denied. Storage policies may not be configured correctly.');
        } else {
          setError(`Upload failed: ${uploadError.message}`);
        }
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile state
      setProfile({ ...profile, avatar_url: publicUrl });
      setSuccess('Image uploaded! Click Save Changes to update your profile.');
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('An unexpected error occurred while uploading');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name || userName,
          display_name: profile.display_name || profile.full_name || userName,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error saving profile:', error);
        setError('Failed to save profile. Please try again.');
      } else {
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          if (onSave) {
            onSave();
          }
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <UserAvatar
                  avatarUrl={currentAvatarUrl}
                  name={profile.display_name || userName}
                  email={userEmail}
                  size="lg"
                  className="mb-2"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full
                                flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              <p className="text-sm text-neutral-500 mb-2">{userEmail}</p>

              {/* Upload Button */}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <span className="inline-flex items-center gap-2 px-4 py-2 text-sm
                               bg-neutral-100 hover:bg-neutral-200 text-neutral-700
                               rounded-lg transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {uploading ? 'Uploading...' : 'Change Photo'}
                </span>
              </label>

              <p className="text-xs text-neutral-400 mt-2">
                {profile.avatar_url ? 'Custom profile picture' : 'Using Google profile picture'}
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-800 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-800 text-sm">
                {success}
              </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-neutral-700 mb-1">
                  Full Name
                </label>
                <input
                  id="full_name"
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={userName || 'Your full name'}
                />
              </div>

              <div>
                <label htmlFor="display_name" className="block text-sm font-medium text-neutral-700 mb-1">
                  Display Name
                </label>
                <input
                  id="display_name"
                  type="text"
                  value={profile.display_name}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={profile.full_name || userName || 'How you want to be called'}
                />
                <p className="text-xs text-neutral-500 mt-1">
                  This is how we'll address you in conversations
                </p>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-neutral-700 mb-1">
                  About You (Optional)
                </label>
                <textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Tell us a bit about yourself and your menopause journey..."
                  maxLength={500}
                />
                <p className="text-xs text-neutral-500 mt-1">
                  {profile.bio.length}/500 characters
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-neutral-300 text-neutral-700
                           font-semibold rounded-xl hover:border-neutral-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl
                           hover:bg-primary-700 transition-colors disabled:bg-neutral-300
                           disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
