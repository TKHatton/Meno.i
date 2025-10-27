/**
 * Delete Account Modal
 * Allows users to delete their account with proper confirmation
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

interface DeleteAccountModalProps {
  onClose: () => void;
}

export default function DeleteAccountModal({ onClose }: DeleteAccountModalProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [confirmationText, setConfirmationText] = useState('');
  const [understood, setUnderstood] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Set to true to enable email confirmation (requires REQUIRE_EMAIL_CONFIRMATION=true in backend)
  const EMAIL_CONFIRMATION_ENABLED = false;

  const handleDelete = async () => {
    if (!user) return;

    if (confirmationText.toUpperCase() !== 'DELETE') {
      alert('Please type DELETE to confirm');
      return;
    }

    if (!understood) {
      alert('Please confirm that you understand this action cannot be undone');
      return;
    }

    // Final confirmation
    if (!confirm('Are you absolutely sure? This will permanently delete all your data including journal entries, symptom logs, and account information. This action cannot be undone.')) {
      return;
    }

    setDeleting(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_URL}/api/profile/delete-account`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          confirmationText,
        }),
      });

      if (response.ok) {
        // Sign out and redirect
        await signOut();
        alert('Your account has been deleted. We\'re sorry to see you go.');
        router.push('/');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete account');
      }
    } catch (error: any) {
      console.error('Error deleting account:', error);
      alert(error.message || 'Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-semibold text-red-900 dark:text-red-100">
              Delete Account
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <svg className="w-5 h-5 text-red-700 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Warning Message */}
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-900 dark:text-red-100 font-semibold mb-2">
              ⚠️ Warning: This action is permanent
            </p>
            <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
              <li>• All your journal entries will be deleted</li>
              <li>• All your symptom logs will be deleted</li>
              <li>• All your account data will be deleted</li>
              <li>• This cannot be undone</li>
            </ul>
          </div>

          {/* Confirmation Text */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Type <span className="font-bold text-red-600 dark:text-red-400">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg
                       bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100
                       focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800"
            />
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer p-3 border-2 border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
            <input
              type="checkbox"
              checked={understood}
              onChange={(e) => setUnderstood(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-red-300 dark:border-red-700 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm text-red-900 dark:text-red-100 font-medium">
              I understand this action cannot be undone and all my data will be permanently deleted
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-neutral-200 dark:border-neutral-700">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting || confirmationText.toUpperCase() !== 'DELETE' || !understood}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? 'Deleting...' : 'Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
