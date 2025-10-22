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
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-6 py-3 flex items-center justify-between">
          <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
          <div className="flex gap-2">
            <button
              onClick={handleRetry}
              className="text-sm text-red-800 hover:text-red-900 font-medium"
            >
              Retry
            </button>
            <button
              onClick={copyLastResponse}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Copy Last Response
            </button>
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <MessageList messages={messages} />
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
            <input
              type="checkbox"
              checked={streamingMode}
              onChange={(e) => setStreamingMode(e.target.checked)}
              className="rounded border-neutral-300"
            />
            Stream mode
          </label>
          <span className="text-xs text-neutral-400">
            {streamingMode ? 'Responses stream in real-time' : 'Wait for complete responses'}
          </span>
        </div>
        <MessageInput onSend={handleSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
}
