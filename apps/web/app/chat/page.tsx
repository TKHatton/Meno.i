/**
 * Chat page: minimal UI that posts to the Express API and renders a structured response.
 */
"use client";

import { useState } from 'react';
import { ChatResponse } from "@meno/shared/src/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, anonId: 'local-dev-anon' })
      });
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      const data: ChatResponse = await res.json();
      setResponse(data);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Chat</h1>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Share what's on your mind…"
          className="flex-1 rounded border border-gray-300 px-3 py-2"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="rounded bg-rose-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? 'Thinking…' : 'Send'}
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {response && (
        <section className="rounded border border-gray-200 bg-white p-4 space-y-3">
          <h2 className="font-medium">MenoAI Response</h2>
          <div>
            <p><span className="font-semibold">Validate:</span> {response.nvc.validate}</p>
            <p><span className="font-semibold">Reflect:</span> {response.nvc.reflect}</p>
            <p><span className="font-semibold">Reframe:</span> {response.nvc.reframe}</p>
            <p><span className="font-semibold">Empower:</span> {response.nvc.empower}</p>
          </div>
          <div className="text-sm text-gray-600">
            <p>Emotion: {response.emotion.primary}{response.emotion.secondary ? `, ${response.emotion.secondary}` : ''}</p>
            <p>Safety: {response.safety.level}</p>
            <p>Model: {response.model} • Latency: {response.latencyMs}ms</p>
          </div>
        </section>
      )}
    </main>
  );
}

