/**
 * Admin Safety Dashboard
 * Shows recent safety escalations and allows filtering
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SafetyLog {
  id: string;
  userId: string;
  messageId: string;
  triggerPhrase: string;
  escalationAction: string;
  createdAt: string;
  messagePreview: string;
  conversationId: string | null;
}

export default function AdminSafetyPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<SafetyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);
  const [adminEmail, setAdminEmail] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const loadSafetyLogs = async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(
        `${API_URL}/api/admin/safety?days=${days}&email=${encodeURIComponent(email)}`
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Unauthorized. Please check your admin email.');
        }
        throw new Error(`Failed to load safety logs: ${response.statusText}`);
      }

      const data = await response.json();
      setLogs(data.logs || []);
      setAuthenticated(true);
    } catch (err) {
      console.error('Failed to load safety logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load safety logs');
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail) {
      loadSafetyLogs(adminEmail);
    }
  };

  const handleRefresh = () => {
    if (adminEmail) {
      loadSafetyLogs(adminEmail);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (!authenticated) {
    return (
      <main className="h-screen flex flex-col bg-neutral-50">
        <header className="bg-white border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <img
              src="/images/logo.jpeg"
              alt="Meno.i Logo"
              className="h-8 w-auto object-contain"
            />
            <h1 className="text-lg font-medium">Safety Dashboard</h1>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 max-w-md w-full mx-4">
            <h2 className="text-xl font-medium mb-4">Admin Access Required</h2>
            <p className="text-neutral-600 mb-6">
              Enter your admin email to view safety logs.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="admin@example.com"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Access Dashboard
              </button>
            </form>

            <div className="mt-6 text-center">
              <a
                href="/chat"
                className="text-sm text-neutral-600 hover:text-neutral-900"
              >
                Back to Chat
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <img
              src="/images/logo.jpeg"
              alt="Meno.i Logo"
              className="h-8 w-auto object-contain"
            />
            <h1 className="text-lg font-medium">Safety Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600">{adminEmail}</span>
            <button
              onClick={() => router.push('/chat')}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Back to Chat
            </button>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="bg-white border-b border-neutral-200 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm text-neutral-700">
              Filter by last:
            </label>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="px-3 py-1 border border-neutral-300 rounded text-sm"
            >
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
            </select>
            <button
              onClick={handleRefresh}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Refresh
            </button>
          </div>
          <div className="text-sm text-neutral-600">
            {logs.length} event{logs.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-neutral-500">Loading safety logs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Try Again
              </button>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-600">
                No safety events in the last {days} days.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                      Trigger Phrase
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                      Message Preview
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                      User ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 text-sm text-neutral-900 whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {log.triggerPhrase}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-600 max-w-md truncate">
                        {log.messagePreview}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-500 font-mono">
                        {log.userId.substring(0, 8)}...
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {log.conversationId ? (
                          <a
                            href={`/history/${log.conversationId}`}
                            className="text-teal-600 hover:text-teal-700"
                          >
                            View Conversation
                          </a>
                        ) : (
                          <span className="text-neutral-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
