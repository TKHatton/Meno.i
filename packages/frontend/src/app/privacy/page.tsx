/**
 * Privacy Policy Page
 * Required for GDPR and legal compliance
 */

import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - MenoAI',
  description: 'Privacy Policy for MenoAI - Your Compassionate Menopause Companion',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">Privacy Policy</h1>
        <p className="text-neutral-600 mb-8">Last updated: October 21, 2025</p>

        <div className="prose prose-neutral max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Introduction</h2>
            <p className="text-neutral-700 leading-relaxed">
              Welcome to MenoAI ("we," "our," or "us"). We are committed to protecting your privacy
              and handling your data in an open and transparent manner. This Privacy Policy explains
              how we collect, use, store, and protect your personal information when you use our
              AI-powered menopause companion service.
            </p>
            <p className="text-neutral-700 leading-relaxed mt-4">
              We understand the sensitive nature of health-related conversations and take your privacy
              extremely seriously. Your trust is paramount to us.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">1. Information We Collect</h2>

            <h3 className="text-xl font-medium text-neutral-800 mb-3">1.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li><strong>Account Information</strong>: When you sign up via Google OAuth, we collect your name, email address, and profile picture from your Google account.</li>
              <li><strong>Profile Information</strong>: Optional information you choose to provide, such as display name, custom profile picture, and bio.</li>
              <li><strong>Conversation Data</strong>: Messages you send to our AI companion, including text and voice transcriptions.</li>
              <li><strong>Voice Data</strong>: When you use voice input, your speech is processed by your browser's built-in Web Speech API. Audio is NOT sent to our servers - only the text transcription.</li>
            </ul>

            <h3 className="text-xl font-medium text-neutral-800 mb-3 mt-6">1.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li><strong>Usage Data</strong>: Information about how you use our service (e.g., features used, pages visited).</li>
              <li><strong>Technical Data</strong>: IP address, browser type, device information, and timestamps.</li>
              <li><strong>Analytics Data</strong>: We use privacy-focused analytics (PostHog) to understand usage patterns. We do NOT track message content, only metadata like "message sent" or "feature used."</li>
            </ul>

            <h3 className="text-xl font-medium text-neutral-800 mb-3 mt-6">1.3 Information We DO NOT Collect</h3>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li>We do NOT record or store your voice audio</li>
              <li>We do NOT share your conversation content with third parties for marketing</li>
              <li>We do NOT sell your personal data</li>
              <li>We do NOT use your health information for advertising</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">2. How We Use Your Information</h2>

            <p className="text-neutral-700 mb-4">We use your information for the following purposes:</p>

            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li><strong>Provide Our Service</strong>: To deliver AI-powered conversational support and emotional companionship.</li>
              <li><strong>Personalization</strong>: To remember your conversation history and provide contextual, empathetic responses.</li>
              <li><strong>Safety Monitoring</strong>: To detect crisis situations (e.g., self-harm mentions) and provide appropriate resources.</li>
              <li><strong>Improve Our Service</strong>: To analyze usage patterns (not message content) and improve features.</li>
              <li><strong>Communication</strong>: To send important service updates, security alerts, or respond to your inquiries.</li>
              <li><strong>Legal Compliance</strong>: To comply with legal obligations and protect our rights.</li>
            </ul>
          </section>

          {/* AI Processing */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">3. AI Processing & Third-Party Services</h2>

            <h3 className="text-xl font-medium text-neutral-800 mb-3">3.1 OpenAI API</h3>
            <p className="text-neutral-700 leading-relaxed">
              We use OpenAI's API to generate AI responses. Your messages are sent to OpenAI for processing.
              According to OpenAI's data usage policy:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700 mt-3">
              <li>OpenAI does NOT use API data to train their models</li>
              <li>Data is retained for 30 days for abuse monitoring, then deleted</li>
              <li>See OpenAI's privacy policy: <a href="https://openai.com/privacy" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">https://openai.com/privacy</a></li>
            </ul>

            <h3 className="text-xl font-medium text-neutral-800 mb-3 mt-6">3.2 Web Speech API (Voice Features)</h3>
            <p className="text-neutral-700 leading-relaxed">
              Voice recognition is processed entirely in your browser using the Web Speech API provided by:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700 mt-3">
              <li><strong>Chrome/Edge</strong>: Google's speech recognition service</li>
              <li><strong>Safari</strong>: Apple's on-device speech recognition</li>
              <li><strong>Important</strong>: Your audio is NOT sent to our servers. Only the text transcription is stored.</li>
            </ul>

            <h3 className="text-xl font-medium text-neutral-800 mb-3 mt-6">3.3 Other Third-Party Services</h3>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li><strong>Supabase</strong>: Database and authentication (GDPR compliant, EU data residency available)</li>
              <li><strong>Netlify</strong>: Web hosting (SOC 2 Type II certified)</li>
              <li><strong>Render</strong>: Backend API hosting</li>
              <li><strong>PostHog</strong> (optional): Privacy-focused analytics (does NOT track message content)</li>
              <li><strong>Sentry</strong> (optional): Error tracking (sensitive data filtered out)</li>
            </ul>
          </section>

          {/* Data Storage and Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">4. Data Storage and Retention</h2>

            <h3 className="text-xl font-medium text-neutral-800 mb-3">4.1 Where Your Data is Stored</h3>
            <p className="text-neutral-700 leading-relaxed">
              Your data is stored securely in the cloud:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700 mt-3">
              <li><strong>Database</strong>: Supabase (PostgreSQL), encrypted at rest and in transit</li>
              <li><strong>Files</strong>: Supabase Storage (profile pictures), with user-specific access controls</li>
              <li><strong>Backups</strong>: Automated daily backups with 7-day retention</li>
            </ul>

            <h3 className="text-xl font-medium text-neutral-800 mb-3 mt-6">4.2 How Long We Keep Your Data</h3>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li><strong>Conversations</strong>: Retained for 30 days, then automatically anonymized (content replaced with "[REDACTED]")</li>
              <li><strong>Account Information</strong>: Retained until you delete your account</li>
              <li><strong>Safety Logs</strong>: Retained for 90 days for compliance and safety monitoring</li>
              <li><strong>Analytics Data</strong>: Aggregated and anonymized after 90 days</li>
            </ul>

            <h3 className="text-xl font-medium text-neutral-800 mb-3 mt-6">4.3 Automatic Anonymization</h3>
            <p className="text-neutral-700 leading-relaxed">
              To protect your privacy, we automatically anonymize conversations after 30 days:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700 mt-3">
              <li>Message content is replaced with "[REDACTED - Retention period expired]"</li>
              <li>Conversation metadata (timestamps, user ID) is retained for service improvement</li>
              <li>This ensures your sensitive health conversations are not stored indefinitely</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">5. Your Rights (GDPR & Privacy Laws)</h2>

            <p className="text-neutral-700 mb-4">You have the following rights regarding your personal data:</p>

            <ul className="list-disc pl-6 space-y-3 text-neutral-700">
              <li><strong>Right to Access</strong>: Request a copy of all personal data we hold about you.</li>
              <li><strong>Right to Rectification</strong>: Correct inaccurate or incomplete data (edit your profile anytime).</li>
              <li><strong>Right to Erasure ("Right to be Forgotten")</strong>: Request deletion of your account and all associated data.</li>
              <li><strong>Right to Data Portability</strong>: Request your data in a machine-readable format (JSON export).</li>
              <li><strong>Right to Restrict Processing</strong>: Request temporary suspension of data processing.</li>
              <li><strong>Right to Object</strong>: Object to certain types of data processing (e.g., analytics).</li>
              <li><strong>Right to Withdraw Consent</strong>: Withdraw consent for data processing at any time.</li>
            </ul>

            <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-neutral-800 font-medium">To exercise your rights, contact us at:</p>
              <p className="text-neutral-700 mt-2">
                Email: <a href="mailto:hello@cheilagibbs.com" className="text-primary-600 hover:underline">hello@cheilagibbs.com</a>
              </p>
              <p className="text-neutral-700 text-sm mt-2">We will respond within 30 days.</p>
            </div>
          </section>

          {/* Security */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">6. Security Measures</h2>

            <p className="text-neutral-700 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your data:
            </p>

            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li><strong>Encryption</strong>: All data is encrypted in transit (HTTPS/TLS) and at rest (AES-256).</li>
              <li><strong>Authentication</strong>: Secure OAuth 2.0 authentication via Google.</li>
              <li><strong>Access Control</strong>: Row-Level Security (RLS) ensures users can only access their own data.</li>
              <li><strong>Regular Security Audits</strong>: Automated vulnerability scanning and security updates.</li>
              <li><strong>Minimal Data Collection</strong>: We only collect data necessary to provide our service.</li>
              <li><strong>Employee Access</strong>: Strictly limited and logged access to production data.</li>
            </ul>

            <p className="text-neutral-700 leading-relaxed mt-4">
              <strong>Data Breach Notification</strong>: In the unlikely event of a data breach, we will notify affected
              users within 72 hours and report to relevant authorities as required by law.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">7. Cookies and Tracking</h2>

            <h3 className="text-xl font-medium text-neutral-800 mb-3">7.1 Essential Cookies</h3>
            <p className="text-neutral-700 leading-relaxed">
              We use essential cookies to maintain your login session and remember your preferences.
              These cannot be disabled as they are necessary for the service to function.
            </p>

            <h3 className="text-xl font-medium text-neutral-800 mb-3 mt-6">7.2 Analytics Cookies (Optional)</h3>
            <p className="text-neutral-700 leading-relaxed">
              If you consent, we use PostHog for privacy-focused analytics. You can opt out in your browser settings.
            </p>

            <h3 className="text-xl font-medium text-neutral-800 mb-3 mt-6">7.3 Third-Party Cookies</h3>
            <p className="text-neutral-700 leading-relaxed">
              We do NOT use third-party advertising or tracking cookies.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">8. Children's Privacy</h2>
            <p className="text-neutral-700 leading-relaxed">
              MenoAI is designed for adults experiencing perimenopause and menopause. Our service is not
              intended for individuals under 18 years of age. We do not knowingly collect personal information
              from children. If you believe a child has provided us with personal data, please contact us
              immediately at hello@cheilagibbs.com.
            </p>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">9. International Data Transfers</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Your data may be processed in countries outside your own, including the United States.
              We ensure appropriate safeguards are in place:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li><strong>EU Users</strong>: Supabase offers EU data residency (data stored in EU).</li>
              <li><strong>Standard Contractual Clauses</strong>: We use EU-approved clauses for data transfers.</li>
              <li><strong>Privacy Shield</strong>: Our providers comply with applicable data protection frameworks.</li>
            </ul>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-neutral-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700 mt-3">
              <li>Posting the updated policy on this page</li>
              <li>Updating the "Last updated" date at the top</li>
              <li>Sending an email notification for significant changes</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mt-4">
              Your continued use of MenoAI after changes are posted constitutes acceptance of the updated Privacy Policy.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">11. Contact Us</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices:
            </p>

            <div className="bg-neutral-100 p-6 rounded-lg space-y-2">
              <p className="text-neutral-800"><strong>Email</strong>: hello@cheilagibbs.com</p>
              <p className="text-neutral-800"><strong>Data Protection Officer</strong>: hello@cheilagibbs.com</p>
              <p className="text-neutral-800"><strong>Response Time</strong>: Within 30 days</p>
            </div>

            <p className="text-neutral-700 leading-relaxed mt-6">
              <strong>EU Residents</strong>: You have the right to lodge a complaint with your local Data Protection Authority
              if you believe your privacy rights have been violated.
            </p>
          </section>

          {/* Summary */}
          <section className="bg-primary-50 p-6 rounded-lg border border-primary-200">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Privacy at a Glance</h2>
            <ul className="space-y-2 text-neutral-700">
              <li>✅ Your conversations are automatically anonymized after 30 days</li>
              <li>✅ We do NOT record or store your voice audio</li>
              <li>✅ We do NOT sell your personal data</li>
              <li>✅ You can delete your account and all data anytime</li>
              <li>✅ We use encryption and security best practices</li>
              <li>✅ We are GDPR compliant</li>
              <li>✅ You have full control over your data</li>
            </ul>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <div className="flex justify-between items-center">
            <Link href="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
              → Terms of Service
            </Link>
            <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
