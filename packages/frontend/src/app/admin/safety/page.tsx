/**
 * Admin Safety Dashboard
 * Shows recent safety escalations and allows filtering
 *
 * SECURITY: Requires authenticated admin user with JWT token
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';

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
  const { user } = useAuth();
  const [logs, setLogs] = useState<SafetyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  // Load safety logs when component mounts or days changes
  useEffect(() => {
    if (user) {
      loadSafetyLogs();
    }
  }, [days, user]);

  const loadSafetyLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current session with JWT token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError('Not authenticated. Please sign in.');
        router.push('/');
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(
        `${API_URL}/api/admin/safety?days=${days}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please sign in again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have admin privileges.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to load safety logs: ${response.statusText}`);
      }

      const data = await response.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to load safety logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load safety logs');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadSafetyLogs();
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

  // Show loading state while checking authentication
  if (!user) {
    return (
      <main className="h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <p className="text-neutral-600">Redirecting to sign in...</p>
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
            <span className="text-sm text-neutral-600">
              Admin: {user?.email}
            </span>
            <button
              onClick={() => router.push('/chat')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
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
