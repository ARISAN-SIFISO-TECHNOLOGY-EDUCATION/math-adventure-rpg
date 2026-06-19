import { useState, useRef, useCallback, useEffect } from 'react';

// Procedural Web Audio sound system for the kids' RPG: an OPTIONAL looping
// background melody plus one-shot SFX (click/correct/wrong/victory), all
// synthesised on the fly so nothing has to be bundled or fetched.
//
// Audio hierarchy (Designed-for-Families review): NARRATION > feedback SFX >
// background music. Music therefore:
//   • is OFF by default (`musicOn` starts false) — opt-in via its own toggle;
//   • routes through a dedicated gain node so it can DUCK under narration
//     (`duckForNarration`) instead of competing with the spoken question;
// and the wrong-answer sound is a gentle "boop", never a harsh buzzer.
export function useSoundSystem() {
  const [muted, setMuted] = useState(false);      // master: narration + SFX
  const [musicOn, setMusicOn] = useState(false);  // background music: opt-in
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const bgmGainRef = useRef<GainNode | null>(null);
  const bgmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const duckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bgmPlayingRef = useRef(false);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
      masterGainRef.current = ctxRef.current.createGain();
      masterGainRef.current.gain.value = 1;
      masterGainRef.current.connect(ctxRef.current.destination);
      // Music has its own sub-mix so it can be ducked without touching SFX.
      bgmGainRef.current = ctxRef.current.createGain();
      bgmGainRef.current.gain.value = 1;
      bgmGainRef.current.connect(masterGainRef.current);
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return { ctx: ctxRef.current, master: masterGainRef.current!, bgm: bgmGainRef.current! };
  }, []);

  const playNote = useCallback((
    ctx: AudioContext, dest: AudioNode,
    freq: number, startTime: number, duration: number,
    type: OscillatorType = 'sine', gainVal = 0.3
  ) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(dest);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(gainVal, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }, []);

  const BGM_NOTES: [number, number][] = [
    [523.25, 0.25], [659.25, 0.25], [783.99, 0.25], [880.00, 0.25],
    [783.99, 0.50], [659.25, 0.25], [523.25, 0.25], [587.33, 0.50],
    [659.25, 0.25], [523.25, 0.25], [440.00, 0.25], [523.25, 0.75],
    [392.00, 0.25], [440.00, 0.25], [523.25, 0.25], [659.25, 0.25],
    [523.25, 0.50], [440.00, 0.25], [392.00, 0.25], [523.25, 1.00],
  ];

  const scheduleBGMLoop = useCallback((ctx: AudioContext, bgm: GainNode, startTime: number) => {
    if (!bgmPlayingRef.current) return;
    let t = startTime;
    const totalDur = BGM_NOTES.reduce((sum, [, dur]) => sum + dur, 0);
    BGM_NOTES.forEach(([freq, dur]) => {
      playNote(ctx, bgm, freq, t, dur - 0.04, 'triangle', 0.07);
      t += dur;
    });
    bgmTimerRef.current = setTimeout(() => {
      if (bgmPlayingRef.current) scheduleBGMLoop(ctx, bgm, ctx.currentTime + 0.05);
    }, (totalDur - 0.3) * 1000);
  }, [playNote]);

  const startBGM = useCallback(() => {
    // Music is opt-in: never auto-plays unless the parent/child enabled it.
    if (!musicOn || bgmPlayingRef.current) return;
    bgmPlayingRef.current = true;
    const { ctx, bgm } = getCtx();
    scheduleBGMLoop(ctx, bgm, ctx.currentTime + 0.1);
  }, [musicOn, getCtx, scheduleBGMLoop]);

  const stopBGM = useCallback(() => {
    bgmPlayingRef.current = false;
    if (bgmTimerRef.current) clearTimeout(bgmTimerRef.current);
  }, []);

  const toggleMusic = useCallback(() => {
    setMusicOn(prev => {
      const next = !prev;
      if (next) {
        bgmPlayingRef.current = true;
        const { ctx, bgm } = getCtx();
        scheduleBGMLoop(ctx, bgm, ctx.currentTime + 0.1);
      } else {
        bgmPlayingRef.current = false;
        if (bgmTimerRef.current) clearTimeout(bgmTimerRef.current);
      }
      return next;
    });
  }, [getCtx, scheduleBGMLoop]);

  // Briefly lower the music so the spoken question/feedback is never buried.
  const duckForNarration = useCallback((holdMs = 2200) => {
    if (!bgmPlayingRef.current || !bgmGainRef.current || !ctxRef.current) return;
    const now = ctxRef.current.currentTime;
    const g = bgmGainRef.current.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0.18, now + 0.12);           // duck down
    if (duckTimerRef.current) clearTimeout(duckTimerRef.current);
    duckTimerRef.current = setTimeout(() => {
      if (!bgmGainRef.current || !ctxRef.current) return;
      const t = ctxRef.current.currentTime;
      bgmGainRef.current.gain.cancelScheduledValues(t);
      bgmGainRef.current.gain.setValueAtTime(bgmGainRef.current.gain.value, t);
      bgmGainRef.current.gain.linearRampToValueAtTime(1, t + 0.4); // ease back up
    }, holdMs);
  }, []);

  const playClick = useCallback(() => {
    const { ctx, master } = getCtx();
    // Softer + shorter than before so taps don't beep over the narration.
    playNote(ctx, master, 1046.5, ctx.currentTime, 0.06, 'sine', 0.15);
  }, [getCtx, playNote]);

  const playCorrect = useCallback(() => {
    const { ctx, master } = getCtx();
    const t = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
      playNote(ctx, master, freq, t + i * 0.12, 0.25, 'sine', 0.3)
    );
  }, [getCtx, playNote]);

  // Gentle, encouraging "boop" — NOT a harsh buzzer. A wrong answer should feel
  // like "try again", never "you failed" (especially for ages 3–5).
  const playWrong = useCallback(() => {
    const { ctx, master } = getCtx();
    const t = ctx.currentTime;
    playNote(ctx, master, 392.00, t, 0.14, 'sine', 0.22);
    playNote(ctx, master, 329.63, t + 0.14, 0.20, 'sine', 0.20);
  }, [getCtx, playNote]);

  const playVictory = useCallback(() => {
    const { ctx, master } = getCtx();
    const t = ctx.currentTime;
    const fanfare: [number, number, number][] = [
      [523.25, 0.00, 0.15], [659.25, 0.15, 0.15], [783.99, 0.30, 0.15],
      [523.25, 0.50, 0.10], [659.25, 0.60, 0.10], [783.99, 0.70, 0.10],
      [1046.50, 0.85, 0.65],
    ];
    fanfare.forEach(([freq, offset, dur]) =>
      playNote(ctx, master, freq, t + offset, dur, 'sine', 0.4)
    );
  }, [getCtx, playNote]);

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const newMuted = !prev;
      if (masterGainRef.current) masterGainRef.current.gain.value = newMuted ? 0 : 1;
      if (!newMuted) {
        const { ctx, master } = getCtx();
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g); g.connect(master);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.05);
        g.gain.setValueAtTime(0.35, ctx.currentTime + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime + 0.05);
        osc.stop(ctx.currentTime + 0.2);
      }
      return newMuted;
    });
  }, [getCtx]);

  useEffect(() => {
    return () => {
      bgmPlayingRef.current = false;
      if (bgmTimerRef.current) clearTimeout(bgmTimerRef.current);
      if (duckTimerRef.current) clearTimeout(duckTimerRef.current);
      ctxRef.current?.close();
    };
  }, []);

  return {
    muted, toggleMute, musicOn, toggleMusic,
    startBGM, stopBGM, duckForNarration,
    playClick, playCorrect, playWrong, playVictory,
  };
}
