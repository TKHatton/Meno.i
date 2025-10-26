/**
 * Journal Entry Form Component
 * Allows users to write and edit journal entries
 */

'use client';

import { useState, useEffect } from 'react';

interface JournalEntryFormProps {
  userId: string;
  editingEntryId: string | null;
  onSaved: () => void;
  onCancel: () => void;
}

const WRITING_PROMPTS = [
  "How am I feeling today?",
  "What's on my mind?",
  "What went well today?",
  "What challenged me today?",
  "What do I need right now?",
  "What am I grateful for?",
  "What did I learn about myself?",
  "What do I want to remember?",
];

const MOOD_OPTIONS = [
  { value: 1, label: 'Struggling', emoji: '😔', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  { value: 2, label: 'Okay', emoji: '😐', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
  { value: 3, label: 'Good', emoji: '🙂', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  { value: 4, label: 'Great', emoji: '😊', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
];

export default function JournalEntryForm({
  userId,
  editingEntryId,
  onSaved,
  onCancel,
}: JournalEntryFormProps) {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Load existing entry if editing
  useEffect(() => {
    if (editingEntryId) {
      loadEntry();
    } else {
      // Reset form for new entry
      setContent('');
      setMood(null);
      setError('');
    }
  }, [editingEntryId]);

  const loadEntry = async () => {
    setIsLoading(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_URL}/api/journal/entry/${editingEntryId}?user_id=${userId}`);

      if (!response.ok) {
        throw new Error('Failed to load entry');
      }

      const data = await response.json();
      setContent(data.entry.content);
      setMood(data.entry.mood_rating || null);
    } catch (err) {
      console.error('Error loading entry:', err);
      setError('Failed to load entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    // Add prompt to content if not already there
    if (!content.includes(prompt)) {
      setContent(prev => (prev ? `${prev}\n\n${prompt}\n` : `${prompt}\n`));
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      setError('Please write something in your journal entry');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

      if (editingEntryId) {
        // Update existing entry
        const response = await fetch(`${API_URL}/api/journal/entry/${editingEntryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            content: content.trim(),
            mood_rating: mood || undefined,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update entry');
        }
      } else {
        // Create new entry - use today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        const response = await fetch(`${API_URL}/api/journal/entries`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            entry_date: today,
            content: content.trim(),
            mood_rating: mood || undefined,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save entry');
        }
      }

      // Reset form and notify parent
      setContent('');
      setMood(null);
      onSaved();
    } catch (err) {
      console.error('Error saving entry:', err);
      setError('Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    if (content.trim() && !confirm('Are you sure you want to discard this entry?')) {
      return;
    }
    setContent('');
    setMood(null);
    setError('');
    onCancel();
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading entry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Form Card */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            {editingEntryId ? 'Edit Your Entry' : 'New Journal Entry'}
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            🔒 Your entries are private and secure
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Writing Prompts */}
        {!editingEntryId && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Writing Prompts (click to add)
            </label>
            <div className="flex flex-wrap gap-2">
              {WRITING_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handlePromptClick(prompt)}
                  className="px-3 py-1.5 text-sm bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300
                           rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Textarea */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Your Thoughts
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing... Let your thoughts flow freely. There's no right or wrong way to journal."
            className="w-full h-64 px-4 py-3 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg
                     bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100
                     focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800
                     resize-none"
          />
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {content.length} characters
          </p>
        </div>

        {/* Mood Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            How are you feeling? (optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MOOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMood(mood === option.value ? null : option.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  mood === option.value
                    ? `${option.color} border-current shadow-md`
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600'
                }`}
              >
                <div className="text-3xl mb-1">{option.emoji}</div>
                <div className="text-sm font-medium">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !content.trim()}
            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium
                     hover:bg-primary-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-700
                     disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving...' : editingEntryId ? 'Update Entry' : 'Save Entry'}
          </button>
          <button
            type="button"
            onClick={handleDiscard}
            disabled={isSaving}
            className="px-6 py-3 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300
                     rounded-lg font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {editingEntryId ? 'Cancel' : 'Discard'}
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4">
        <p className="text-sm text-primary-900 dark:text-primary-100">
          💡 <strong>Tip:</strong> Journaling can help you process emotions, track patterns, and gain insights into your menopause journey.
          Write freely without judgment - this space is just for you.
        </p>
      </div>
    </div>
  );
}
