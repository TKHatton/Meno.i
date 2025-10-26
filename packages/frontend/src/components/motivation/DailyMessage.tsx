/**
 * Daily Message Component
 * Displays rotating motivational messages with navigation
 */

'use client';

import { useState, useEffect } from 'react';
import type { DailyMessage as DailyMessageType } from '@menoai/shared';
import {
  dailyMessages,
  getCurrentMessageIndex,
  getMessageByIndex,
  getTotalMessages,
} from '@/data/dailyMessages';

interface DailyMessageProps {
  userJoinDate: Date;
}

export default function DailyMessage({ userJoinDate }: DailyMessageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState<DailyMessageType | null>(null);

  // Initialize with today's message
  useEffect(() => {
    const todayIndex = getCurrentMessageIndex(userJoinDate);
    setCurrentIndex(todayIndex);
    setMessage(getMessageByIndex(todayIndex));
  }, [userJoinDate]);

  const handlePrevious = () => {
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    setMessage(getMessageByIndex(newIndex));
  };

  const handleNext = () => {
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    setMessage(getMessageByIndex(newIndex));
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

  const totalMessages = getTotalMessages();
  const displayIndex = ((currentIndex % totalMessages) + totalMessages) % totalMessages;

  return (
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
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          {displayIndex + 1} of {totalMessages}
        </div>
      </div>

      {/* Message Content */}
      <div className="mb-6">
        <p className="text-lg leading-relaxed text-neutral-800 dark:text-neutral-200">
          "{message.text}"
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300
                   bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700
                   rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300
                   bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700
                   rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
        >
          Next
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
