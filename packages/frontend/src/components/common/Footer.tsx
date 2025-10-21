/**
 * Footer component with legal links
 * Displayed on main pages for compliance
 */

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-neutral-200 py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <p className="text-sm text-neutral-600">
            © {currentYear} MenoAI. All rights reserved.
          </p>

          {/* Legal Links */}
          <div className="flex gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-neutral-600 hover:text-primary-600 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-neutral-600 hover:text-primary-600 transition-colors"
            >
              Terms of Service
            </Link>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-neutral-500 text-center md:text-right max-w-md">
            Not medical advice. Consult healthcare professionals for medical concerns.
          </p>
        </div>
      </div>
    </footer>
  );
}
