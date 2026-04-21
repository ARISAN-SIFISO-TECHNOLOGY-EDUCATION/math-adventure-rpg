import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const accent = '#4F46E5';
const GATE = { question: 'What is 12 × 7?', answer: 84 };

// Replace YOUR_FORMSPREE_ID with your form ID from formspree.io (free account, takes 2 min)
// Steps: formspree.io → New Form → copy the ID (e.g. xyzabcde) → paste here
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/meevraqg';

type FormData = { name: string; email: string; subject: string; message: string };

export default function ContactPage() {
  const [gateInput, setGateInput] = useState('');
  const [gateError, setGateError] = useState(false);
  const [verified, setVerified] = useState(false);
  const [form, setForm] = useState<FormData>({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);

  const handleVerify = () => {
    if (parseInt(gateInput, 10) === GATE.answer) {
      setVerified(true);
      setGateError(false);
    } else {
      setGateError(true);
      setGateInput('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSendError(false);
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setSendError(true);
      }
    } catch {
      setSendError(true);
    } finally {
      setSending(false);
    }
  };

  const field = (id: keyof FormData, label: string, placeholder: string, type = 'text') => (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        id={id}
        required
        disabled={!verified}
        value={form[id]}
        onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
        placeholder={placeholder}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-400 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
      />
    </div>
  );

  return (
    <div className="font-[Inter] min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
      <Navbar breadcrumb="Contact" />

      <div className="max-w-3xl mx-auto px-6 pt-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold no-underline hover:opacity-70 transition-opacity" style={{ color: accent }}>
          ← Back to Home
        </Link>
      </div>

      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-[Nunito] text-4xl font-extrabold text-gray-900 mb-3">Contact Us</h1>
            <p className="text-gray-500 max-w-md mx-auto">
              Questions, feedback, or a bug to report? We'd love to hear from you.
            </p>
          </div>

          {submitted ? (
            /* ── Success state ── */
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="text-7xl mb-4">📬</div>
              <h2 className="font-[Nunito] text-2xl font-bold text-gray-900 mb-3">Message received!</h2>
              <p className="text-gray-500 mb-8">Thanks for reaching out. We'll get back to you within 2–3 business days.</p>
              <Link
                to="/"
                className="font-[Nunito] inline-flex items-center gap-2 text-white px-8 py-3 rounded-full font-bold no-underline hover:opacity-90 transition-opacity"
                style={{ background: accent }}
              >
                Return to Home
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10">

              {/* ── Parental gate ── */}
              <div className={`rounded-2xl border-2 px-5 py-4 mb-8 transition-colors ${verified ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-200'}`}>
                {verified ? (
                  <p className="text-green-700 font-semibold text-sm flex items-center gap-2">
                    <span>✓</span> Parent verified — you can now send a message.
                  </p>
                ) : (
                  <>
                    <p className="font-bold text-amber-800 mb-1">🔒 Quick parent check</p>
                    <p className="text-amber-700 text-sm mb-4">
                      To protect children's privacy, please answer this before contacting us.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">{GATE.question}</label>
                        <input
                          type="number"
                          value={gateInput}
                          onChange={e => { setGateInput(e.target.value); setGateError(false); }}
                          onKeyDown={e => e.key === 'Enter' && handleVerify()}
                          placeholder="Your answer"
                          className={`w-full px-4 py-3 border-2 rounded-2xl text-sm focus:outline-none transition-colors ${gateError ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-indigo-400'}`}
                        />
                        {gateError && <p className="text-red-500 text-xs mt-1 font-semibold">Incorrect — try again.</p>}
                      </div>
                      <button
                        type="button"
                        onClick={handleVerify}
                        className="px-6 py-3 rounded-2xl font-bold text-sm text-white transition-opacity hover:opacity-90"
                        style={{ background: '#D97706' }}
                      >
                        Verify →
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* ── Form ── */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {field('name',    'Your Name',      'Jane Doe')}
                {field('email',   'Email Address',  'parent@example.com', 'email')}
                {field('subject', 'Subject',        'e.g. Bug report, feedback, question')}

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                  <textarea
                    id="message"
                    required
                    disabled={!verified}
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Tell us what's on your mind…"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-400 disabled:bg-gray-50 disabled:text-gray-400 transition-colors resize-none"
                  />
                </div>

                {sendError && (
                  <p className="text-red-600 text-sm font-bold text-center">
                    ⚠️ Could not send. Please email us directly at sifiso.cyprianshezi28@gmail.com
                  </p>
                )}
                <button
                  type="submit"
                  disabled={!verified || sending}
                  className="w-full py-4 rounded-2xl font-[Nunito] font-bold text-base transition-all"
                  style={verified && !sending ? { background: accent, color: 'white' } : { background: '#E5E7EB', color: '#9CA3AF', cursor: 'not-allowed' }}
                >
                  {sending ? 'Sending…' : verified ? 'Send Message ✉️' : 'Complete verification above to unlock'}
                </button>
              </form>

              {/* ── Alt contact ── */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="font-[Nunito] font-bold text-gray-900 mb-4">Other ways to reach us</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: '🐛', label: 'Bug Reports',      email: 'sifiso.cyprianshezi28@gmail.com' },
                    { icon: '🔐', label: 'Privacy Enquiries', email: 'sifiso.cyprianshezi28@gmail.com' },
                  ].map(c => (
                    <div key={c.label} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <p className="text-sm font-bold text-gray-700 mb-1">{c.icon} {c.label}</p>
                      <a href={`mailto:${c.email}`} className="text-xs font-semibold no-underline hover:underline break-all" style={{ color: accent }}>
                        {c.email}
                      </a>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  We aim to respond within 2–3 business days.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
