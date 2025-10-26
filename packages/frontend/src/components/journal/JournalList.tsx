/**
 * Journal List Component
 * Displays user's journal entries with search and management
 */

'use client';

import { useState, useEffect } from 'react';

interface JournalListProps {
  userId: string;
  refreshTrigger: number;
  onEdit: (entryId: string) => void;
  onDelete: () => void;
}

interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  mood_rating?: number;
  entry_date: string;
  created_at: string;
  updated_at: string;
}

const MOOD_LABELS: Record<number, { emoji: string; label: string }> = {
  1: { emoji: '😔', label: 'Struggling' },
  2: { emoji: '😐', label: 'Okay' },
  3: { emoji: '🙂', label: 'Good' },
  4: { emoji: '😊', label: 'Great' },
};

export default function JournalList({
  userId,
  refreshTrigger,
  onEdit,
  onDelete,
}: JournalListProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadEntries();
  }, [userId, refreshTrigger]);

  const loadEntries = async () => {
    setIsLoading(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const url = searchQuery
        ? `${API_URL}/api/journal/search/${userId}?q=${encodeURIComponent(searchQuery)}`
        : `${API_URL}/api/journal/entries/${userId}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to load entries');
      }

      const data = await response.json();
      setEntries(data.entries || []);
    } catch (err) {
      console.error('Error loading journal entries:', err);
      setError('Failed to load entries. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadEntries();
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this journal entry? This cannot be undone.')) {
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_URL}/api/journal/entry/${entryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      // Refresh the list
      onDelete();
    } catch (err) {
      console.error('Error deleting entry:', err);
      alert('Failed to delete entry. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your journal entries..."
            className="flex-1 px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg
                     bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100
                     focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium
                     hover:bg-primary-700 transition-colors"
          >
            Search
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                loadEntries();
              }}
              className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300
                       rounded-lg font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Entries List */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {searchQuery ? `Search Results (${entries.length})` : `Your Entries (${entries.length})`}
          </h3>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg mb-4">
            {error}
          </div>
        )}

        {entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              {searchQuery ? 'No entries found matching your search' : 'No journal entries yet'}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-500">
              {searchQuery ? 'Try a different search term' : 'Start writing to create your first entry'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onEdit={onEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Individual entry card
interface EntryCardProps {
  entry: JournalEntry;
  onEdit: (entryId: string) => void;
  onDelete: (entryId: string) => void;
}

function EntryCard({ entry, onEdit, onDelete }: EntryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const date = new Date(entry.entry_date);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = new Date(entry.created_at).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  // Create preview (first 150 characters)
  const preview = entry.content.length > 150
    ? entry.content.substring(0, 150) + '...'
    : entry.content;

  const moodInfo = entry.mood_rating ? MOOD_LABELS[entry.mood_rating] : null;

  return (
    <div className="border-2 border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-start justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors text-left"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="font-medium text-neutral-900 dark:text-neutral-100">
              {formattedDate}
            </div>
            {moodInfo && (
              <div className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                <span>{moodInfo.emoji}</span>
                <span>{moodInfo.label}</span>
              </div>
            )}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
            {formattedTime}
          </div>
          {!isExpanded && (
            <p className="text-neutral-700 dark:text-neutral-300 line-clamp-2">
              {preview}
            </p>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-neutral-400 transition-transform flex-shrink-0 ml-3 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 py-4 bg-neutral-50 dark:bg-neutral-700/30 border-t border-neutral-200 dark:border-neutral-700">
          <div className="prose prose-neutral dark:prose-invert max-w-none mb-4">
            <p className="whitespace-pre-wrap text-neutral-900 dark:text-neutral-100">
              {entry.content}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-600">
            <button
              onClick={() => onEdit(entry.id)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg
                       hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={() => onDelete(entry.id)}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300
                       rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
