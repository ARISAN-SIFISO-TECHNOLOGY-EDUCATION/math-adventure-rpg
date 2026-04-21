import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const accent = '#4F46E5';

const SECTIONS = [
  {
    title: '1. No Data Collection',
    body: 'Math Adventure RPG is designed with privacy-first principles. We do not collect, store, or transmit any personally identifiable information (PII).',
    bullets: [
      'No names, email addresses, or phone numbers',
      'No location data',
      'No device identifiers or advertising IDs',
      'No usage analytics or telemetry',
      'No cookies or tracking pixels',
    ],
  },
  {
    title: '2. Local Storage Only',
    body: 'All game progress is stored exclusively on your device using your browser\'s localStorage. This includes:',
    bullets: [
      'Current phase and level',
      'Daily streak count',
      'Companion name and emoji preference',
      'Tutorial completion flag',
    ],
    footer: 'This data never leaves your device. You can clear it at any time by clearing your browser\'s site data.',
  },
  {
    title: '3. No Third-Party Services',
    body: 'The app makes zero external network requests after the initial page load. There are no:',
    bullets: [
      'Analytics SDKs (Google Analytics, Mixpanel, etc.)',
      'Ad networks (Google Ads, AdMob, etc.)',
      'Crash reporting or monitoring services',
      'Cloud storage or backup services',
      'Social media plugins or share buttons',
    ],
  },
  {
    title: '4. COPPA, GDPR-K & POPIA Compliance',
    body: 'Because we collect no personal data from any user — including children under 13 — we are fully compliant with:',
    bullets: [
      'COPPA — Children\'s Online Privacy Protection Act (USA)',
      'GDPR-K — General Data Protection Regulation, children provisions (EU)',
      'POPIA — Protection of Personal Information Act (South Africa)',
    ],
  },
  {
    title: '5. Parental Gate',
    body: 'A parental gate (a math problem only an adult can solve comfortably) is required before any grade-level change. This prevents children from accidentally advancing to content outside their ability range.',
    bullets: [],
  },
  {
    title: '6. Changes to This Policy',
    body: 'If we update this privacy policy we will post the changes here and update the "Last updated" date. Our core commitment to zero data collection will never change.',
    bullets: [],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="font-[Inter] min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
      <Navbar breadcrumb="Privacy Policy" />

      <div className="max-w-4xl mx-auto px-6 pt-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold no-underline hover:opacity-70 transition-opacity" style={{ color: accent }}>
          ← Back to Home
        </Link>
      </div>

      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">

          {/* Header */}
          <h1 className="font-[Nunito] text-4xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: April 4, 2026</p>

          {/* Summary banner */}
          <div className="bg-green-50 border-l-4 border-green-500 rounded-r-2xl px-5 py-4 mb-10">
            <p className="font-bold text-green-800 mb-1">🎯 The Short Version</p>
            <p className="text-green-700 text-sm leading-relaxed">
              We collect <strong>zero</strong> personal data. No accounts. No tracking. No ads. Your child's privacy is our #1 priority — and it always will be.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {SECTIONS.map(s => (
              <div key={s.title}>
                <h2 className="font-[Nunito] text-xl font-bold text-gray-900 mb-2">{s.title}</h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">{s.body}</p>
                {s.bullets.length > 0 && (
                  <ul className="space-y-1.5 mb-3">
                    {s.bullets.map(b => (
                      <li key={b} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="mt-0.5 font-bold text-indigo-500 shrink-0">✓</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
                {s.footer && <p className="text-gray-500 text-sm italic">{s.footer}</p>}
              </div>
            ))}

            {/* Contact sub-section */}
            <div>
              <h2 className="font-[Nunito] text-xl font-bold text-gray-900 mb-2">7. Contact Us</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                If you have any questions about this privacy policy or our data practices, please reach out:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-3">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Privacy enquiries</p>
                  <Link to="/contact" className="text-sm font-bold no-underline hover:underline" style={{ color: accent }}>
                    Contact us via the contact page →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Footer nav */}
          <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center flex-wrap gap-4">
            <Link to="/" className="text-sm font-bold no-underline hover:underline" style={{ color: accent }}>
              ← Return to Home
            </Link>
            <Link to="/contact" className="text-sm font-bold no-underline hover:underline" style={{ color: accent }}>
              Have a question? Contact us →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
