/**
 * Conversation Detail Page
 * Shows full message history for a specific conversation
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getConversationHistory } from '@/lib/api';
import MessageBubble from '@/components/chat/MessageBubble';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  created_at: string;
}

interface ConversationDetailProps {
  params: {
    conversationId: string;
  };
}

export default function ConversationDetailPage({ params }: ConversationDetailProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConversation();
  }, [params.conversationId]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getConversationHistory(params.conversationId);
      setMessages(response.messages || []);
    } catch (err) {
      console.error('Failed to load conversation:', err);
      setError('Failed to load conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-50 pb-16 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/history')}
              className="text-neutral-600 hover:text-neutral-900"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <img
              src="/images/logo.jpg"
              alt="Meno.i Logo"
              className="h-8 w-auto object-contain"
            />
            <h1 className="text-lg font-medium">Conversation</h1>
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
              <p className="text-neutral-500">Loading messages...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadConversation}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Try Again
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-600">No messages found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={new Date(message.created_at)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Note */}
      <div className="border-t border-neutral-200 bg-white px-6 py-3">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-neutral-500">
            This is a read-only view.{' '}
            <button
              onClick={() => router.push('/chat')}
              className="text-teal-600 hover:text-teal-700"
            >
              Start a new conversation
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
