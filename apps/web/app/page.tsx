/**
 * Simple landing page with a link to the chat.
 */
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-semibold">Welcome to MenoAI</h1>
      <p className="text-gray-700">
        A compassionate companion for navigating perimenopause and menopause.
      </p>
      <Link
        href="/chat"
        className="inline-flex items-center rounded-md bg-rose-600 px-4 py-2 text-white hover:bg-rose-700"
      >
        Open Chat
      </Link>
    </main>
  );
}

