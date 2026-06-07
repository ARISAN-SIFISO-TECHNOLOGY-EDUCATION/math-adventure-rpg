// Branded Suspense fallback shown while a lazy route chunk loads. Themed so it
// doesn't flash a dark screen before the bright kids' app (or vice-versa).
interface Props {
  /** Dark variant for the Academy (ages 13–17); light otherwise. */
  dark?: boolean;
}

export default function LoadingScreen({ dark = false }: Props) {
  const bg = dark ? '#0f172a' : '#ffffff';
  const ring = dark ? '#5EEAD4' : '#4338ca';
  const track = dark ? 'rgba(94,234,212,0.18)' : 'rgba(67,56,202,0.15)';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: bg }}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div
        className="w-12 h-12 rounded-full animate-spin motion-reduce:animate-none"
        style={{ border: `4px solid ${track}`, borderTopColor: ring }}
      />
      <span className="text-3xl" aria-hidden="true">🧮</span>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
