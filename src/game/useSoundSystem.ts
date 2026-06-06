import { useState, useRef, useCallback, useEffect } from 'react';

// Procedural Web Audio sound system for the kids' RPG: a looping background
// melody plus one-shot SFX (click/correct/wrong/victory), all synthesised on
// the fly so nothing has to be bundled or fetched. Returns the play controls
// and a mute toggle.
export function useSoundSystem() {
  const [muted, setMuted] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const bgmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bgmPlayingRef = useRef(false);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
      masterGainRef.current = ctxRef.current.createGain();
      masterGainRef.current.gain.value = 1;
      masterGainRef.current.connect(ctxRef.current.destination);
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return { ctx: ctxRef.current, master: masterGainRef.current! };
  }, []);

  const playNote = useCallback((
    ctx: AudioContext, master: GainNode,
    freq: number, startTime: number, duration: number,
    type: OscillatorType = 'sine', gainVal = 0.3
  ) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(master);
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

  const scheduleBGMLoop = useCallback((ctx: AudioContext, master: GainNode, startTime: number) => {
    if (!bgmPlayingRef.current) return;
    let t = startTime;
    const totalDur = BGM_NOTES.reduce((sum, [, dur]) => sum + dur, 0);
    BGM_NOTES.forEach(([freq, dur]) => {
      playNote(ctx, master, freq, t, dur - 0.04, 'triangle', 0.07);
      t += dur;
    });
    bgmTimerRef.current = setTimeout(() => {
      if (bgmPlayingRef.current) scheduleBGMLoop(ctx, master, ctx.currentTime + 0.05);
    }, (totalDur - 0.3) * 1000);
  }, [playNote]);

  const startBGM = useCallback(() => {
    if (bgmPlayingRef.current) return;
    bgmPlayingRef.current = true;
    const { ctx, master } = getCtx();
    scheduleBGMLoop(ctx, master, ctx.currentTime + 0.1);
  }, [getCtx, scheduleBGMLoop]);

  const stopBGM = useCallback(() => {
    bgmPlayingRef.current = false;
    if (bgmTimerRef.current) clearTimeout(bgmTimerRef.current);
  }, []);

  const playClick = useCallback(() => {
    const { ctx, master } = getCtx();
    playNote(ctx, master, 1046.5, ctx.currentTime, 0.08, 'sine', 0.35);
  }, [getCtx, playNote]);

  const playCorrect = useCallback(() => {
    const { ctx, master } = getCtx();
    const t = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
      playNote(ctx, master, freq, t + i * 0.12, 0.25, 'sine', 0.35)
    );
  }, [getCtx, playNote]);

  const playWrong = useCallback(() => {
    const { ctx, master } = getCtx();
    const t = ctx.currentTime;
    playNote(ctx, master, 349.23, t, 0.15, 'sawtooth', 0.18);
    playNote(ctx, master, 261.63, t + 0.18, 0.35, 'sawtooth', 0.18);
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
      ctxRef.current?.close();
    };
  }, []);

  return { muted, toggleMute, startBGM, stopBGM, playClick, playCorrect, playWrong, playVictory };
}
