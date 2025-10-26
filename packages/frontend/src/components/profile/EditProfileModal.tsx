/**
 * Edit Profile Modal
 * Allows users to change display name and upload avatar
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

interface EditProfileModalProps {
  profile: any;
  onClose: () => void;
  onSave: () => void;
}

export default function EditProfileModal({ profile, onClose, onSave }: EditProfileModalProps) {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('userId', user!.id);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_URL}/api/profile/upload-avatar`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAvatarUrl(data.avatarUrl);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (!displayName.trim()) {
      alert('Please enter a display name');
      return;
    }

    setSaving(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_URL}/api/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName.trim(),
          avatar_url: avatarUrl,
        }),
      });

      if (response.ok) {
        onSave();
        onClose();
      } else {
        throw new Error('Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
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
            Edit Profile
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
          {/* Avatar Section */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Profile Photo
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {displayName.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <label className="cursor-pointer inline-block px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Max 2MB, JPG or PNG
                </p>
              </div>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg
                       bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100
                       focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
            />
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
            disabled={saving || uploading}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
