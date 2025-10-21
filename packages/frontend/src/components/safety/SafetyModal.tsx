/**
 * Safety modal component
 * Displays when high-risk language is detected
 */

'use client';

interface SafetyModalProps {
  onClose: () => void;
}

export default function SafetyModal({ onClose }: SafetyModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">
          Support Resources
        </h2>

        <p className="text-neutral-700 mb-6 leading-relaxed">
          I hear how unbearable this feels right now. You don't have to face it alone.
          Here are some resources that can provide immediate professional support:
        </p>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-neutral-50 rounded-lg">
            <h3 className="font-semibold text-neutral-900 mb-1">Samaritans (UK)</h3>
            <p className="text-neutral-600 text-sm mb-1">24/7 crisis support</p>
            <a href="tel:116123" className="text-primary-600 font-semibold hover:underline">
              116 123
            </a>
          </div>

          <div className="p-4 bg-neutral-50 rounded-lg">
            <h3 className="font-semibold text-neutral-900 mb-1">NHS Mental Health Hotline</h3>
            <p className="text-neutral-600 text-sm mb-1">24/7 crisis support</p>
            <a href="tel:111" className="text-primary-600 font-semibold hover:underline">
              111
            </a>
          </div>

          <div className="p-4 bg-neutral-50 rounded-lg">
            <h3 className="font-semibold text-neutral-900 mb-1">Crisis Text Line</h3>
            <p className="text-neutral-600 text-sm mb-1">24/7 text support</p>
            <p className="text-primary-600 font-semibold">
              Text "SHOUT" to 85258
            </p>
          </div>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-sm text-red-900">
            <strong>Immediate Crisis:</strong> If you're in immediate danger,
            please contact emergency services (999) or go to your nearest A&E.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl
                   hover:bg-primary-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
