/**
 * Conversation History Page
 * Shows list of all user conversations
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUserConversations, deleteConversation } from '@/lib/api';

interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  first_message?: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await getUserConversations(user.id);
      setConversations(response.conversations || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (conversationId: string) => {
    if (!user) return;

    try {
      await deleteConversation(conversationId, user.id);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      alert('Failed to delete conversation. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  if (!user) {
    return (
      <main className="h-screen flex flex-col bg-neutral-50 pb-16 md:pb-0">
        <header className="bg-white border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <img
              src="/images/logo.jpg"
              alt="Meno.i Logo"
              className="h-8 w-auto object-contain"
            />
            <h1 className="text-lg font-medium">Conversation History</h1>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-neutral-600">Please sign in to view your conversation history.</p>
            <button
              onClick={() => router.push('/chat')}
              className="mt-4 text-teal-600 hover:text-teal-700 font-medium"
            >
              Go to Chat
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col bg-neutral-50 pb-16 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <img
              src="/images/logo.jpg"
              alt="Meno.i Logo"
              className="h-8 w-auto object-contain"
            />
            <h1 className="text-lg font-medium">Conversation History</h1>
          </div>
          <button
            onClick={() => router.push('/chat')}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            New Chat
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-neutral-500">Loading conversations...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-600 mb-4">No conversations yet.</p>
              <button
                onClick={() => router.push('/chat')}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Start your first chat
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <button
                      onClick={() => router.push(`/history/${conversation.id}`)}
                      className="flex-1 text-left"
                    >
                      <p className="text-neutral-800 mb-1 line-clamp-2">
                        {conversation.first_message || 'Conversation'}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {formatDate(conversation.updated_at)}
                      </p>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(conversation.id)}
                      className="ml-4 text-neutral-400 hover:text-red-600 transition-colors"
                      title="Delete conversation"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-medium mb-2">Delete Conversation?</h2>
            <p className="text-neutral-600 mb-6">
              This action cannot be undone. All messages in this conversation will be permanently deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
