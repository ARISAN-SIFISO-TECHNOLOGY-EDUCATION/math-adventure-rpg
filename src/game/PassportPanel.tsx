/**
 * PassportPanel — Math Adventure's slice of the People's Home Passport.
 * Export your badges to a file, or import a Passport from another People's Home
 * app (Our World, Everyday Foundations…). The flagship is the ecosystem's front
 * door, so this is where a learner's journey starts travelling.
 *
 * Web-only (the file IO is a browser download/upload); the call site gates it
 * behind !Capacitor.isNativePlatform() so the Play build is untouched. Fully
 * offline — nothing is sent anywhere; the transport is a file the user holds.
 */
import { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { BADGES } from './levelContent';
import { safeGet, safeSave } from '../lib/safeStorage';
import {
  buildPassport,
  parsePassport,
  mergeImport,
  passportFileName,
  APP_NAME,
  type ImportedStamp,
  type PassportStamp,
} from '../lib/passport';
import { downloadText, readFileText } from '../lib/download';

const IMPORTED_KEY = 'mathadv-passport-imported';

interface PassportPanelProps {
  earnedBadges: string[];
  onBadgesImported: (ids: string[]) => void;
}

export default function PassportPanel({ earnedBadges, onBadgesImported }: PassportPanelProps) {
  const [imported, setImported] = useState<ImportedStamp[]>(() => safeGet<ImportedStamp[]>(IMPORTED_KEY, []));
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const identity = () => {
    const c = safeGet<{ name?: string; emoji?: string } | null>('companionSetup', null);
    return { name: c?.name?.trim() || 'Explorer', emoji: c?.emoji || '🐉' };
  };

  // The child's earned badges, resolved to the universal stamp shape.
  const nativeStamps = (): PassportStamp[] =>
    BADGES.filter((b) => earnedBadges.includes(b.id)).map((b) => ({
      label: `I earned the ${b.label} badge`,
      app: APP_NAME,
      icon: b.emoji,
    }));

  const onExport = () => {
    const { name, emoji } = identity();
    const env = buildPassport({ name, emoji, nativeStamps: nativeStamps(), earnedBadges, imported });
    downloadText(passportFileName(name), JSON.stringify(env, null, 2));
    setStatus({ ok: true, msg: `Saved your Passport — ${env.stamps.length} milestone${env.stamps.length === 1 ? '' : 's'} to carry to other apps.` });
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await readFileText(file);
      const env = parsePassport(text);
      const result = mergeImport({ earnedBadges, imported }, env);
      // Persist + lift the foreign stamps and any restored badges.
      safeSave(IMPORTED_KEY, result.imported);
      setImported(result.imported);
      if (result.nativeAdded > 0) onBadgesImported(result.earnedBadges);
      const parts: string[] = [];
      if (result.nativeAdded > 0) parts.push(`${result.nativeAdded} badge${result.nativeAdded === 1 ? '' : 's'}`);
      if (result.foreignAdded > 0) parts.push(`${result.foreignAdded} from other apps`);
      setStatus({
        ok: true,
        msg: parts.length ? `Welcome, ${result.learnerName}! Added ${parts.join(' + ')}.` : 'That Passport is already in your book — nothing new to add.',
      });
    } catch (err) {
      setStatus({ ok: false, msg: err instanceof Error ? err.message : 'Could not import that file.' });
    }
  };

  return (
    <div className="mt-4 rounded-2xl border-2 border-black bg-white p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-left">
      <p className="text-xs font-black uppercase tracking-widest text-gray-700">📕 People's Home Passport</p>
      <p className="text-[11px] text-gray-600 mt-1 leading-snug">
        Carry your badges to other People's Home apps — saved as a file, never sent anywhere.
      </p>

      <div className="flex gap-2 mt-3">
        <button
          onClick={onExport}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl font-black text-xs text-white bg-blue-600 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
        >
          <Download className="h-4 w-4" /> Export
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl font-black text-xs text-blue-700 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
        >
          <Upload className="h-4 w-4" /> Import
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={onPickFile} className="hidden" />
      </div>

      {status && (
        <p className="text-[11px] mt-2.5 leading-snug font-bold" style={{ color: status.ok ? '#15803D' : '#B45309' }}>
          {status.ok ? '✓ ' : '⚠ '}{status.msg}
        </p>
      )}

      {imported.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1.5">🌍 From across The People's Home</p>
          <div className="space-y-1.5">
            {imported.map((s, i) => (
              <div key={`${s.label}-${i}`} className="flex items-center gap-2 rounded-xl border-2 border-amber-300 bg-amber-50 px-2.5 py-1.5">
                <span className="text-base shrink-0">{s.icon ?? '⭐'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-gray-800 leading-tight">{s.label}</p>
                  <p className="text-[10px] text-amber-700">{s.app}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
