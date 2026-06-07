// Tactile feedback via the Web Vibration API (navigator.vibrate), which works
// in the Android WebView that Capacitor uses — so no native plugin or build sync
// is required. Every call is capability-guarded and wrapped in try/catch, so it
// is a silent no-op on devices/browsers without vibration (e.g. desktop, iOS).
//
// Respects an on-device setting (`mathadv-haptics`, default ON) so a future
// settings toggle can disable it without touching call sites.
import { safeGet } from './safeStorage';

const HAPTICS_KEY = 'mathadv-haptics';

function enabled(): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return false;
  // Default on: only `false` disables it.
  return safeGet<boolean>(HAPTICS_KEY, true) !== false;
}

function buzz(pattern: number | number[]): void {
  if (!enabled()) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* ignore — vibration is a nice-to-have, never critical */
  }
}

/** Light tick for taps / selections. */
export const hapticTap = () => buzz(10);
/** Upbeat double pulse for a correct answer. */
export const hapticSuccess = () => buzz([0, 18, 40, 28]);
/** Soft single buzz for a wrong answer (gentle, not punishing). */
export const hapticError = () => buzz(45);
/** Celebratory pattern for level-ups and victories. */
export const hapticCelebrate = () => buzz([0, 25, 50, 25, 50, 60]);
