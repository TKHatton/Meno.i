/**
 * Main chat interface component
 * Manages conversation state and message exchange
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { sendMessage } from '@/lib/api';
import { useAuth } from '../auth/AuthProvider';
import type { AIResponse } from '@menoai/shared';
import { WELCOME_MESSAGE } from '@menoai/shared';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onSafetyTrigger: () => void;
}

export default function ChatInterface({ onSafetyTrigger }: ChatInterfaceProps) {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    // Add user message to chat
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Send message to backend with optional userId
      const response = await sendMessage(content, conversationId, user?.id);

      // Update conversation ID if this is the first message
      if (!conversationId && response.conversationId) {
        setConversationId(response.conversationId);
      }

      // Check if safety was triggered
      if (response.safetyTriggered) {
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

      // Add error message
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'ai',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <MessageList messages={messages} />
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-neutral-200 bg-white px-6 py-4">
        <MessageInput onSend={handleSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
}
