/**
 * Individual message bubble component
 * Styled differently for user vs AI messages
 */

'use client';

interface MessageBubbleProps {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Message bubble */}
        <div
          className={`rounded-2xl px-5 py-3 ${
            isUser
              ? 'bg-primary-600 text-white'
              : 'bg-white text-neutral-900 border border-neutral-200'
          }`}
        >
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>

        {/* Timestamp */}
        <p className={`text-xs text-neutral-500 mt-1 px-2 ${isUser ? 'text-right' : 'text-left'}`}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
