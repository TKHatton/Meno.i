/**
 * Desktop Header Navigation
 * Top navigation bar for desktop/tablet with logo, nav links, and profile
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';

export default function DesktopHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);

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
  }, [user]);

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  const navLinks = [
    { name: 'Home', path: '/dashboard' },
    { name: 'Chat', path: '/chat' },
    { name: 'Track', path: '/track' },
    { name: 'Journal', path: '/journal' },
  ];

  // Don't show header on landing page or auth pages
  if (!user || pathname === '/' || pathname === '/login') {
    return null;
  }

  return (
    <header className="hidden md:block sticky top-0 z-40 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/images/logo.jpg"
            alt="Meno.i Logo"
            width={56}
            height={56}
            className="rounded-lg"
          />
        </Link>

        {/* Center Navigation */}
        <nav className="flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-medium transition-colors relative ${
                  active
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                {link.name}
                {active && (
                  <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Profile Section */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {user?.email}
            </p>
          </div>
          <Link
            href="/profile"
            className="w-10 h-10 rounded-full overflow-hidden hover:ring-2 hover:ring-primary-500 transition-all"
          >
            {customAvatarUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
              <img
                src={customAvatarUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.picture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold">
                {(user?.user_metadata?.name || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
