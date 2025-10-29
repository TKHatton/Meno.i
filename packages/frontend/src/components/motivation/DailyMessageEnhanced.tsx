/**
 * Daily Message Component (Simplified)
 * Displays one rotating motivational message per day with:
 * - Favorites
 * - Social media sharing
 */

'use client';

import { useState, useEffect } from 'react';
import type { DailyMessage as DailyMessageType } from '@menoai/shared';
import {
  getTodaysMessage,
} from '@/data/dailyMessages';

interface DailyMessageEnhancedProps {
  userJoinDate: Date;
}

export default function DailyMessageEnhanced({ userJoinDate }: DailyMessageEnhancedProps) {
  const [message, setMessage] = useState<DailyMessageType | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('favoriteMessages');
    if (stored) {
      setFavorites(new Set(JSON.parse(stored)));
    }
  }, []);

  // Get today's message
  useEffect(() => {
    const todaysMessage = getTodaysMessage(userJoinDate);
    setMessage(todaysMessage);
  }, [userJoinDate]);

  const toggleFavorite = () => {
    if (!message) return;

    const newFavorites = new Set(favorites);
    if (newFavorites.has(message.id)) {
      newFavorites.delete(message.id);
    } else {
      newFavorites.add(message.id);
    }

    setFavorites(newFavorites);
    localStorage.setItem('favoriteMessages', JSON.stringify(Array.from(newFavorites)));
  };

  const shareToSocial = (platform: 'twitter' | 'facebook' | 'instagram' | 'email' | 'sms' | 'copy') => {
    if (!message) return;

    const text = message.text;
    const attribution = '- Meno.i';
    const fullMessage = `${text}\n\n${attribution}`;
    const url = window.location.origin;

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullMessage)}&url=${encodeURIComponent(url)}`,
          '_blank',
          'width=550,height=420'
        );
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(fullMessage)}`,
          '_blank',
          'width=550,height=420'
        );
        break;
      case 'instagram':
        navigator.clipboard.writeText(fullMessage);
        alert('Message copied to clipboard! Open Instagram and paste it into your story or post.');
        break;
      case 'email':
        const subject = 'Daily Motivation from Meno.i';
        const body = fullMessage;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        break;
      case 'sms':
        // SMS protocol - works on mobile devices
        window.location.href = `sms:?&body=${encodeURIComponent(fullMessage)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(fullMessage);
        alert('Message copied to clipboard!');
        break;
    }

    setShowShareMenu(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'affirmation':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      case 'education':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'tip':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'encouragement':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'affirmation':
        return '💜';
      case 'education':
        return '📚';
      case 'tip':
        return '💡';
      case 'encouragement':
        return '🌟';
      default:
        return '☀️';
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  if (!message) {
    return null;
  }

  const isFavorite = favorites.has(message.id);

  return (
    <div className="space-y-4">
      {/* Message Card */}
      <div className={`rounded-xl border-2 p-6 shadow-md transition-all ${getCategoryColor(message.category)}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getCategoryIcon(message.category)}</span>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Today's Message
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {getCategoryLabel(message.category)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Favorite Button */}
            <button
              onClick={toggleFavorite}
              className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/20 transition-colors"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg
                className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'fill-none text-neutral-400'}`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            {/* Share Button */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/20 transition-colors"
                aria-label="Share message"
              >
                <svg className="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>

              {/* Share Menu */}
              {showShareMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border-2 border-neutral-200 dark:border-neutral-700 z-10">
                  <button
                    onClick={() => shareToSocial('twitter')}
                    className="w-full px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-700"
                  >
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    <span className="text-sm">Share on Twitter</span>
                  </button>
                  <button
                    onClick={() => shareToSocial('facebook')}
                    className="w-full px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-700"
                  >
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-sm">Share on Facebook</span>
                  </button>
                  <button
                    onClick={() => shareToSocial('instagram')}
                    className="w-full px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-700"
                  >
                    <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span className="text-sm">Share on Instagram</span>
                  </button>
                  <button
                    onClick={() => shareToSocial('email')}
                    className="w-full px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-700"
                  >
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Share via Email</span>
                  </button>
                  <button
                    onClick={() => shareToSocial('sms')}
                    className="w-full px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-700"
                  >
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span className="text-sm">Share via Text/SMS</span>
                  </button>
                  <button
                    onClick={() => shareToSocial('copy')}
                    className="w-full px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-3 rounded-b-lg"
                  >
                    <svg className="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Copy to Clipboard</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div>
          <p className="text-lg leading-relaxed text-neutral-800 dark:text-neutral-200">
            "{message.text}"
          </p>
        </div>
      </div>

      {/* Favorites Count */}
      {favorites.size > 0 && (
        <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
          ❤️ You have {favorites.size} favorite message{favorites.size !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
