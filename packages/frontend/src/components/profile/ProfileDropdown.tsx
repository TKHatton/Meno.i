/**
 * Profile dropdown menu component
 * Shows user info and navigation options
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import UserAvatar from './UserAvatar';

interface ProfileDropdownProps {
  onOpenProfile: () => void;
  refreshTrigger?: number;
}

export default function ProfileDropdown({ onOpenProfile, refreshTrigger }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();

  // Load custom avatar from profile
  useEffect(() => {
    if (!user) return;

    const loadCustomAvatar = async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (data?.avatar_url) {
        setCustomAvatarUrl(data.avatar_url);
      }
    };

    loadCustomAvatar();
  }, [user, refreshTrigger]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  // Get user data from metadata or email
  const userName = user.user_metadata?.full_name || user.user_metadata?.name || null;
  const userEmail = user.email || null;
  const googleAvatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

  // Prioritize custom avatar over Google avatar
  const avatarUrl = customAvatarUrl || googleAvatarUrl;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        aria-label="User menu"
      >
        <UserAvatar
          avatarUrl={avatarUrl}
          name={userName}
          email={userEmail}
          size="md"
        />
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-sm font-medium text-neutral-900">
            {userName || userEmail?.split('@')[0] || 'User'}
          </span>
          {userName && (
            <span className="text-xs text-neutral-500">{userEmail}</span>
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg
                      border border-neutral-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <UserAvatar
                avatarUrl={avatarUrl}
                name={userName}
                email={userEmail}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">
                  {userName || 'User'}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  {userEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenProfile();
              }}
              className="w-full px-4 py-2 text-left text-sm text-neutral-700
                       hover:bg-neutral-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Edit Profile
            </button>

            <a
              href="/history"
              className="w-full px-4 py-2 text-left text-sm text-neutral-700
                       hover:bg-neutral-50 transition-colors flex items-center gap-2 block"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Chat History
            </a>
          </div>

          {/* Sign Out */}
          <div className="border-t border-neutral-100 pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600
                       hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
