/**
 * Root layout for the Next.js app. Sets up basic HTML shell and global styles.
 */
import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'MenoAI — Emotional Companion',
  description: 'Empathy before education. Validation before solutions.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <div className="max-w-3xl mx-auto p-4">{children}</div>
      </body>
    </html>
  );
}

