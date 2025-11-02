/**
 * Main chat interface component
 * Manages conversation state and message exchange
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { sendMessage, sendMessageStream } from '@/lib/api';
import { useAuth } from '../auth/AuthProvider';
// import { analytics } from '@/lib/analytics';
import type { AIResponse, ChatMode } from '@menoai/shared';
import { WELCOME_MESSAGE } from '@menoai/shared';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatInterfaceProps {
  onSafetyTrigger: () => void;
  chatMode: ChatMode;
}

export default function ChatInterface({ onSafetyTrigger, chatMode }: ChatInterfaceProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: WELCOME_MESSAGE,
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [streamingMode, setStreamingMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCallback, setRetryCallback] = useState<(() => void) | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Clear stream timeout on unmount
  useEffect(() => {
    return () => {
      if (streamTimeoutRef.current) {
        clearTimeout(streamTimeoutRef.current);
      }
    };
  }, []);

  const handleSendMessage = async (content: string) => {
    setError(null);
    setRetryCallback(null);

    // Add user message to chat
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Use streaming mode if enabled
    if (streamingMode) {
      await handleStreamingMessage(content);
    } else {
      await handleNormalMessage(content);
    }
  };

  const handleNormalMessage = async (content: string) => {
    try {
      // Track message sent event
      // analytics.messageSent(false);

      // Send message to backend with optional userId and chatMode
      const response = await sendMessage(content, conversationId, user?.id, chatMode);

      // Update conversation ID if this is the first message
      if (!conversationId && response.conversationId) {
        setConversationId(response.conversationId);
      }

      // Check if safety was triggered
      if (response.safetyTriggered) {
        // analytics.safetyTriggered();
        onSafetyTrigger();
      }

      // Add AI response to chat
      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        role: 'ai',
        content: response.response.full_response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      showError('Failed to send message. Please try again.', () => handleNormalMessage(content));
    } finally {
      setIsTyping(false);
    }
  };

  const handleStreamingMessage = async (content: string) => {
    const streamingMessageId = `ai_${Date.now()}`;
    let streamedContent = '';

    // Track message sent event
    // analytics.messageSent(true);

    // Add placeholder for streaming message
    const streamingMessage: Message = {
      id: streamingMessageId,
      role: 'ai',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, streamingMessage]);

    // Set timeout for streaming (30 seconds)
    streamTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      showError('Response timed out. Please try again.', () => handleStreamingMessage(content));
    }, 30000);

    try {
      await sendMessageStream(
        content,
        conversationId,
        user?.id,
        chatMode,
        // onDelta
        (delta: string) => {
          streamedContent += delta;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === streamingMessageId
                ? { ...msg, content: streamedContent }
                : msg
            )
          );
        },
        // onDone
        (meta: any) => {
          if (streamTimeoutRef.current) {
            clearTimeout(streamTimeoutRef.current);
          }

          // Update conversation ID if this is the first message
          if (!conversationId && meta.conversationId) {
            setConversationId(meta.conversationId);
          }

          // Check if safety was triggered
          if (meta.safetyTriggered) {
            // analytics.safetyTriggered();
            onSafetyTrigger();
          }

          // Mark streaming as complete
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === streamingMessageId
                ? { ...msg, isStreaming: false }
                : msg
            )
          );

          setIsTyping(false);
        },
        // onError
        (errorMsg: string) => {
          if (streamTimeoutRef.current) {
            clearTimeout(streamTimeoutRef.current);
          }

          console.error('Streaming error:', errorMsg);

          // Remove incomplete streaming message
          setMessages((prev) => prev.filter((msg) => msg.id !== streamingMessageId));

          setIsTyping(false);
          showError('Streaming failed. Please try again.', () => handleStreamingMessage(content));
        }
      );
    } catch (error) {
      if (streamTimeoutRef.current) {
        clearTimeout(streamTimeoutRef.current);
      }

      console.error('Failed to stream message:', error);

      // Remove incomplete streaming message
      setMessages((prev) => prev.filter((msg) => msg.id !== streamingMessageId));

      setIsTyping(false);
      showError('Failed to send message. Please try again.', () => handleStreamingMessage(content));
    }
  };

  const showError = (message: string, retry: () => void) => {
    setError(message);
    setRetryCallback(() => retry);
  };

  const handleRetry = () => {
    if (retryCallback) {
      setError(null);
      setRetryCallback(null);
      setIsTyping(true);
      retryCallback();
    }
  };

  const copyLastResponse = () => {
    const lastAiMessage = [...messages].reverse().find((msg) => msg.role === 'ai');
    if (lastAiMessage) {
      navigator.clipboard.writeText(lastAiMessage.content);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
      {/* Welcome Header - only show when no conversation */}
      {messages.length === 1 && messages[0].id === 'welcome' && (
        <div className="px-6 py-8 bg-secondary-50 dark:bg-neutral-800 border-b border-secondary-100 dark:border-neutral-700">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 bg-primary-400 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-soft">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-serif text-neutral-900 dark:text-neutral-100 mb-3">
              Your AI Companion
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg font-light">
              I'm here to support you through your menopause journey with empathy and understanding
            </p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border-b border-primary-200 dark:border-primary-800 px-6 py-4 flex items-center justify-between shadow-elegant">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="text-sm text-neutral-800 dark:text-neutral-200 font-medium">{error}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-primary-400 text-white rounded-pill hover:bg-primary-600 transition-all text-sm font-medium shadow-soft"
            >
              Retry
            </button>
            <button
              onClick={() => setError(null)}
              className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-10 bg-neutral-50 dark:bg-neutral-900">
        <div className="max-w-4xl mx-auto">
          <MessageList messages={messages} />
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-secondary-100 dark:border-neutral-700 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm px-4 md:px-8 py-5 mb-20 md:mb-0 safe-area-bottom shadow-elegant">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <label className="flex items-center gap-2.5 px-4 py-2 bg-secondary-100 dark:bg-neutral-700 rounded-pill cursor-pointer hover:bg-secondary-200 dark:hover:bg-neutral-600 transition-all">
              <input
                type="checkbox"
                checked={streamingMode}
                onChange={(e) => setStreamingMode(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-500 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Stream mode</span>
            </label>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:inline font-light">
              {streamingMode ? '✨ Responses appear in real-time' : '⏳ Wait for complete responses'}
            </span>
          </div>
          <MessageInput onSend={handleSendMessage} disabled={isTyping} />
        </div>
      </div>
    </div>
  );
}
