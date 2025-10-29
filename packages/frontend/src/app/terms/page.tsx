/**
 * Terms of Service Page
 * Legal terms and conditions for using MenoAI
 */

import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service - MenoAI',
  description: 'Terms of Service for MenoAI - Your Compassionate Menopause Companion',
};

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">Terms of Service</h1>
        <p className="text-neutral-600 mb-8">Last updated: October 21, 2025</p>

        <div className="prose prose-neutral max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Introduction</h2>
            <p className="text-neutral-700 leading-relaxed">
              Welcome to MenoAI. These Terms of Service ("Terms") govern your use of our AI-powered
              menopause companion service (the "Service"). By accessing or using MenoAI, you agree to
              be bound by these Terms. If you do not agree to these Terms, please do not use our Service.
            </p>
            <p className="text-neutral-700 leading-relaxed mt-4">
              Please read these Terms carefully. They contain important information about your rights
              and obligations, including limitations on our liability.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              By creating an account, accessing, or using MenoAI, you acknowledge that you have read,
              understood, and agree to be bound by these Terms and our Privacy Policy.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li>You must be at least 18 years old to use this Service</li>
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You agree to notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          {/* Medical Disclaimer */}
          <section className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">⚠️ 2. Important Medical Disclaimer</h2>

            <div className="space-y-4 text-neutral-800">
              <p className="font-bold text-lg">
                MenoAI IS NOT A MEDICAL SERVICE AND DOES NOT PROVIDE MEDICAL ADVICE.
              </p>

              <p className="leading-relaxed">
                <strong>NOT a Substitute for Professional Medical Care</strong>: MenoAI is an emotional
                support companion powered by artificial intelligence. It is NOT a licensed healthcare provider,
                therapist, doctor, or medical professional. Our Service:
              </p>

              <ul className="list-disc pl-6 space-y-2">
                <li>Does NOT diagnose medical conditions</li>
                <li>Does NOT prescribe medications or treatments</li>
                <li>Does NOT provide mental health therapy or counseling</li>
                <li>Does NOT replace professional medical advice, diagnosis, or treatment</li>
                <li>Is NOT for medical emergencies</li>
              </ul>

              <p className="leading-relaxed mt-4">
                <strong>Always Seek Professional Medical Advice</strong>: If you have questions about your health,
                symptoms, medications, or treatment options, consult a qualified healthcare provider. Do not
                disregard, avoid, or delay seeking medical advice based on information provided by MenoAI.
              </p>

              <p className="leading-relaxed">
                <strong>Emergency Situations</strong>: If you are experiencing a medical or mental health emergency,
                including thoughts of self-harm or suicide:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Call 911 (US) or your local emergency number immediately</li>
                <li>Contact the 988 Suicide & Crisis Lifeline (US): Call or text 988</li>
                <li>Go to your nearest emergency room</li>
                <li>DO NOT rely on MenoAI for crisis intervention</li>
              </ul>

              <p className="leading-relaxed mt-4">
                <strong>Accuracy of Information</strong>: While we strive to provide supportive and evidence-based
                information, AI-generated responses may contain errors, omissions, or inaccuracies. Always verify
                health information with your doctor or qualified healthcare provider.
              </p>

              <p className="leading-relaxed font-bold">
                BY USING MENOAI, YOU ACKNOWLEDGE AND ACCEPT THESE LIMITATIONS.
              </p>
            </div>
          </section>

          {/* Description of Service */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">3. Description of Service</h2>

            <h3 className="text-xl font-medium text-neutral-800 mb-3">3.1 What MenoAI Provides</h3>
            <p className="text-neutral-700 leading-relaxed mb-4">
              MenoAI is an AI-powered emotional support companion designed to provide:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li>Empathetic, non-judgmental conversation about menopause experiences</li>
              <li>Emotional support and validation during perimenopause and menopause</li>
              <li>General information about menopause symptoms and coping strategies</li>
              <li>A safe space to express feelings and concerns</li>
              <li>Referrals to crisis resources when appropriate</li>
            </ul>

            <h3 className="text-xl font-medium text-neutral-800 mb-3 mt-6">3.2 Service Availability</h3>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li>We strive for 24/7 availability but do not guarantee uninterrupted access</li>
              <li>Service may be temporarily unavailable for maintenance or technical issues</li>
              <li>We reserve the right to modify, suspend, or discontinue the Service at any time</li>
            </ul>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">4. User Responsibilities and Conduct</h2>

            <h3 className="text-xl font-medium text-neutral-800 mb-3">4.1 Acceptable Use</h3>
            <p className="text-neutral-700 mb-4">You agree to use MenoAI only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
              <li>Upload or transmit viruses, malware, or other harmful code</li>
              <li>Harass, abuse, or harm others through the Service</li>
              <li>Impersonate any person or entity</li>
              <li>Scrape, data mine, or use automated tools to access the Service</li>
              <li>Reverse engineer, decompile, or attempt to extract our source code</li>
              <li>Use the Service to collect personal information about other users</li>
              <li>Share your account credentials with others</li>
            </ul>

            <h3 className="text-xl font-medium text-neutral-800 mb-3 mt-6">4.2 Content You Submit</h3>
            <p className="text-neutral-700 leading-relaxed mb-4">
              When you use MenoAI, you may share personal experiences, thoughts, and feelings. You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li>Ensuring you have the right to share any content you provide</li>
              <li>Not sharing confidential information about others without permission</li>
              <li>Understanding that conversations may be stored (see Privacy Policy for details)</li>
              <li>Not submitting content that violates laws or infringes on others' rights</li>
            </ul>

            <h3 className="text-xl font-medium text-neutral-800 mb-3 mt-6">4.3 Account Security</h3>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li>You are responsible for all activity under your account</li>
              <li>Notify us immediately if you suspect unauthorized access</li>
              <li>We are not liable for losses due to stolen or compromised credentials</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">5. Intellectual Property Rights</h2>

            <h3 className="text-xl font-medium text-neutral-800 mb-3">5.1 Our Intellectual Property</h3>
            <p className="text-neutral-700 leading-relaxed mb-4">
              MenoAI and all related content, features, functionality, and technology are owned by us and are
              protected by copyright, trademark, and other intellectual property laws. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li>The MenoAI name, logo, and branding</li>
              <li>Our website design and user interface</li>
              <li>AI prompts, response templates, and conversation flows</li>
              <li>Software code and algorithms</li>
            </ul>

            <h3 className="text-xl font-medium text-neutral-800 mb-3 mt-6">5.2 Your Content</h3>
            <p className="text-neutral-700 leading-relaxed">
              You retain ownership of the content you submit to MenoAI (your messages and profile information).
              However, by using our Service, you grant us a limited license to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700 mt-3">
              <li>Store and process your messages to provide the Service</li>
              <li>Use anonymized, aggregated data to improve our Service</li>
              <li>Share your messages with OpenAI's API for AI response generation (see Privacy Policy)</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mt-4">
              This license ends when you delete your account or your data is automatically anonymized after 30 days.
            </p>

            <h3 className="text-xl font-medium text-neutral-800 mb-3 mt-6">5.3 AI-Generated Responses</h3>
            <p className="text-neutral-700 leading-relaxed">
              Responses generated by MenoAI are created by artificial intelligence and are not owned by you.
              However, you are free to use AI responses for your personal, non-commercial purposes.
            </p>
          </section>

          {/* Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">6. Privacy and Data Protection</h2>
            <p className="text-neutral-700 leading-relaxed">
              Your privacy is important to us. Our collection, use, and protection of your personal information
              is governed by our <Link href="/privacy" className="text-primary-600 hover:underline font-medium">Privacy Policy</Link>.
              By using MenoAI, you also agree to our Privacy Policy.
            </p>

            <h3 className="text-xl font-medium text-neutral-800 mb-3 mt-6">Key Privacy Points:</h3>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li>Conversations are automatically anonymized after 30 days</li>
              <li>We do NOT record or store your voice audio</li>
              <li>We do NOT sell your personal data</li>
              <li>You can delete your account and all data at any time</li>
              <li>We use industry-standard encryption and security measures</li>
            </ul>
          </section>

          {/* Safety and Crisis Resources */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">7. Safety Monitoring and Crisis Response</h2>

            <h3 className="text-xl font-medium text-neutral-800 mb-3">7.1 Automated Safety Monitoring</h3>
            <p className="text-neutral-700 leading-relaxed mb-4">
              For your safety, we monitor conversations for signs of crisis or self-harm. If concerning keywords
              or phrases are detected, we will:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li>Provide immediate crisis resources and hotline numbers</li>
              <li>Log the incident for safety review (see Privacy Policy)</li>
              <li>Encourage you to seek professional help immediately</li>
            </ul>

            <h3 className="text-xl font-medium text-neutral-800 mb-3 mt-6">7.2 Limitations of Safety Features</h3>
            <p className="text-neutral-700 leading-relaxed">
              While we take safety seriously, our automated monitoring has limitations:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700 mt-3">
              <li>We may not detect all crisis situations</li>
              <li>We cannot prevent you from harming yourself or others</li>
              <li>We are NOT a crisis intervention service</li>
              <li>We are NOT monitored by human crisis counselors 24/7</li>
            </ul>

            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-bold">IF YOU ARE IN CRISIS:</p>
              <ul className="list-disc pl-6 space-y-1 text-red-700 mt-2">
                <li>Call 911 or go to the nearest emergency room</li>
                <li>Call 988 Suicide & Crisis Lifeline (US): 988</li>
                <li>Text HELLO to 741741 (Crisis Text Line)</li>
                <li>Contact the SAMHSA National Helpline: 1-800-662-4357</li>
              </ul>
            </div>
          </section>

          {/* Disclaimers and Limitations */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">8. Disclaimers and Limitations of Liability</h2>

            <h3 className="text-xl font-medium text-neutral-800 mb-3">8.1 "AS IS" Service</h3>
            <p className="text-neutral-700 leading-relaxed mb-4">
              MenoAI IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED,
              INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
              OR NON-INFRINGEMENT.
            </p>
            <p className="text-neutral-700 leading-relaxed">
              We do not guarantee that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700 mt-3">
              <li>The Service will be uninterrupted, secure, or error-free</li>
              <li>AI responses will be accurate, complete, or appropriate for your situation</li>
              <li>The Service will meet your specific needs or expectations</li>
              <li>Any errors or defects will be corrected</li>
            </ul>

            <h3 className="text-xl font-medium text-neutral-800 mb-3 mt-6">8.2 Limitation of Liability</h3>
            <p className="text-neutral-700 leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li>Any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, data, use, or goodwill</li>
              <li>Personal injury or property damage resulting from your use of the Service</li>
              <li>Decisions you make based on AI-generated responses</li>
              <li>Unauthorized access to or alteration of your data</li>
              <li>Any third-party conduct or content on the Service</li>
            </ul>

            <p className="text-neutral-700 leading-relaxed mt-4">
              IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU EXCEED THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS,
              OR $100 (WHICHEVER IS GREATER).
            </p>

            <h3 className="text-xl font-medium text-neutral-800 mb-3 mt-6">8.3 AI Limitations</h3>
            <p className="text-neutral-700 leading-relaxed">
              You acknowledge that AI technology has inherent limitations:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700 mt-3">
              <li>AI may generate inaccurate, incomplete, or inappropriate responses</li>
              <li>AI cannot understand complex emotional nuances like a human therapist</li>
              <li>AI responses are based on patterns in training data, not professional judgment</li>
              <li>AI cannot replace human connection, empathy, or professional care</li>
            </ul>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">9. Indemnification</h2>
            <p className="text-neutral-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless MenoAI, its affiliates, and their respective
              officers, directors, employees, and agents from any claims, liabilities, damages, losses, costs,
              or expenses (including reasonable attorneys' fees) arising out of or related to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700 mt-4">
              <li>Your use or misuse of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another person or entity</li>
              <li>Content you submit to the Service</li>
            </ul>
          </section>

          {/* Term and Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">10. Term and Termination</h2>

            <h3 className="text-xl font-medium text-neutral-800 mb-3">10.1 Termination by You</h3>
            <p className="text-neutral-700 leading-relaxed">
              You may terminate your account at any time by:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700 mt-3">
              <li>Requesting account deletion through your profile settings</li>
              <li>Contacting us at hello@cheilagibbs.com</li>
              <li>Upon deletion, your data will be permanently removed (see Privacy Policy for details)</li>
            </ul>

            <h3 className="text-xl font-medium text-neutral-800 mb-3 mt-6">10.2 Termination by Us</h3>
            <p className="text-neutral-700 leading-relaxed mb-4">
              We reserve the right to suspend or terminate your access to the Service at any time, with or
              without notice, for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li>Violation of these Terms</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>Requests by law enforcement or government agencies</li>
              <li>Extended periods of inactivity</li>
              <li>Discontinuation of the Service</li>
            </ul>

            <h3 className="text-xl font-medium text-neutral-800 mb-3 mt-6">10.3 Effect of Termination</h3>
            <p className="text-neutral-700 leading-relaxed">
              Upon termination:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700 mt-3">
              <li>Your right to use the Service immediately ceases</li>
              <li>We may delete your account and data (subject to legal retention requirements)</li>
              <li>Sections of these Terms that should survive termination (e.g., disclaimers, limitations of liability) will remain in effect</li>
            </ul>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">11. Changes to These Terms</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              We reserve the right to modify these Terms at any time. When we make changes, we will:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li>Update the "Last updated" date at the top of this page</li>
              <li>Notify you via email for material changes</li>
              <li>Provide notice within the Service</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mt-4">
              Your continued use of MenoAI after changes are posted constitutes acceptance of the updated Terms.
              If you do not agree to the new Terms, you must stop using the Service.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">12. Governing Law and Dispute Resolution</h2>

            <h3 className="text-xl font-medium text-neutral-800 mb-3">12.1 Governing Law</h3>
            <p className="text-neutral-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of [Your State/Country],
              without regard to its conflict of law provisions.
            </p>

            <h3 className="text-xl font-medium text-neutral-800 mb-3 mt-6">12.2 Dispute Resolution</h3>
            <p className="text-neutral-700 leading-relaxed mb-4">
              If you have a dispute with us, please first contact us at hello@cheilagibbs.com to attempt
              to resolve it informally.
            </p>
            <p className="text-neutral-700 leading-relaxed">
              If informal resolution fails, you agree that disputes will be resolved through binding arbitration
              (except for small claims court matters), rather than in court. You waive your right to a jury trial.
            </p>

            <h3 className="text-xl font-medium text-neutral-800 mb-3 mt-6">12.3 Class Action Waiver</h3>
            <p className="text-neutral-700 leading-relaxed">
              You agree that disputes will be resolved on an individual basis only, not as part of a class action,
              consolidated action, or representative action.
            </p>
          </section>

          {/* Miscellaneous */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">13. Miscellaneous</h2>

            <h3 className="text-xl font-medium text-neutral-800 mb-3">13.1 Entire Agreement</h3>
            <p className="text-neutral-700 leading-relaxed">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and
              MenoAI regarding use of the Service.
            </p>

            <h3 className="text-xl font-medium text-neutral-800 mb-3 mt-6">13.2 Severability</h3>
            <p className="text-neutral-700 leading-relaxed">
              If any provision of these Terms is found to be unenforceable, the remaining provisions will
              remain in full force and effect.
            </p>

            <h3 className="text-xl font-medium text-neutral-800 mb-3 mt-6">13.3 No Waiver</h3>
            <p className="text-neutral-700 leading-relaxed">
              Our failure to enforce any right or provision of these Terms will not constitute a waiver of
              that right or provision.
            </p>

            <h3 className="text-xl font-medium text-neutral-800 mb-3 mt-6">13.4 Assignment</h3>
            <p className="text-neutral-700 leading-relaxed">
              You may not assign or transfer these Terms or your rights hereunder. We may assign these
              Terms to any affiliate or successor.
            </p>

            <h3 className="text-xl font-medium text-neutral-800 mb-3 mt-6">13.5 Force Majeure</h3>
            <p className="text-neutral-700 leading-relaxed">
              We shall not be liable for any failure to perform due to circumstances beyond our reasonable
              control (e.g., natural disasters, war, pandemics, labor disputes).
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">14. Contact Us</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              If you have questions about these Terms or the Service:
            </p>

            <div className="bg-neutral-100 p-6 rounded-lg space-y-2">
              <p className="text-neutral-800"><strong>Email</strong>: hello@cheilagibbs.com</p>
              <p className="text-neutral-800"><strong>Support</strong>: hello@cheilagibbs.com</p>
              <p className="text-neutral-800"><strong>Response Time</strong>: Within 3-5 business days</p>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="bg-primary-50 p-6 rounded-lg border border-primary-200">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Your Acknowledgment</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              By using MenoAI, you acknowledge that you have read, understood, and agree to be bound by these
              Terms of Service. You also acknowledge that:
            </p>
            <ul className="space-y-2 text-neutral-700">
              <li>✓ MenoAI is NOT a medical service and does not provide medical advice</li>
              <li>✓ You should consult healthcare professionals for medical concerns</li>
              <li>✓ MenoAI is not for emergencies - call 911 or 988 if in crisis</li>
              <li>✓ AI responses may contain errors and should not be solely relied upon</li>
              <li>✓ You are responsible for your own health and safety decisions</li>
              <li>✓ You have read and agree to our <Link href="/privacy" className="text-primary-600 hover:underline font-medium">Privacy Policy</Link></li>
            </ul>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <div className="flex justify-between items-center">
            <Link href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
              ← Privacy Policy
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
