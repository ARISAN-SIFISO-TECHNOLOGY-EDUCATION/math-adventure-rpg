# ADR-002: Audio Management

## Status
**Accepted** – April 3, 2026

## Context
The Math Adventure RPG uses sound effects (SFX) and background music (BGM) to enhance engagement:
- **SFX:** correct answer, wrong answer, attack, victory, game over.
- **BGM:** Looping adventure track during battles and exploration.

Requirements:
- Audio must play reliably on both iOS and Android.
- Mute toggle must immediately silence all audio (SFX + BGM) and persist across sessions.
- BGM should pause when app goes to background and resume when foreground returns.
- Audio preloading to eliminate delay on first play.

## Decision
**Use `expo-av` for all audio playback, managed by a singleton AudioService class.**

The AudioService will:
- Preload all SFX and BGM files using `Audio.Sound.createAsync()` on app start.
- Store references to sound objects and reuse them.
- Maintain a global `isMuted` state (persisted via MMKV).
- Provide methods: `playSFX(type)`, `playBGM()`, `pauseBGM()`, `resumeBGM()`, `toggleMute()`.
- Handle app state changes via `AppState` listener to pause/resume BGM.

## Consequences

### Positive
- **Cross‑platform reliability** – `expo-av` is battle‑tested on both stores.
- **Preloading eliminates latency** – sounds play instantly on first trigger.
- **Centralised control** – mute toggling and lifecycle management in one place.
- **No external dependencies** beyond Expo’s audio module.

### Negative
- **Memory usage** – keeping sound objects in memory (negligible for a few short clips).
- **Async complexity** – need to ensure sounds are loaded before playback (handled via Promise).

### Mitigations
- Use `useEffect` with loading state to disable buttons until audio is ready.
- Unload sounds on app termination (optional – OS will clean up).

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|---------------|
| **React Native Sound (react-native-sound)** | Requires manual linking, no Expo support, less active maintenance. |
| **Web Audio API (via react-native-webview)** | Overkill, high latency, complex for simple SFX. |
| **No audio** | Reduces engagement, especially for kids. |

## Implementation Example

```typescript
// services/AudioService.ts
import { Audio } from 'expo-av';
import { getItem, setItem } from './storage';

class AudioService {
  private sounds: Map<string, Audio.Sound> = new Map();
  private bgm?: Audio.Sound;
  private isMuted: boolean = false;

  async loadSounds() {
    const muted = await getItem('isMuted');
    this.isMuted = muted === 'true';
    const sfxFiles = ['correct', 'wrong', 'attack', 'victory', 'gameover'];
    for (const sfx of sfxFiles) {
      const { sound } = await Audio.Sound.createAsync(
        require(`../assets/sfx/${sfx}.mp3`)
      );
      this.sounds.set(sfx, sound);
    }
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/bgm/adventure.mp3'),
      { isLooping: true, volume: 0.4 }
    );
    this.bgm = sound;
  }

  playSFX(type: string) {
    if (this.isMuted) return;
    this.sounds.get(type)?.replayAsync();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    setItem('isMuted', String(this.isMuted));
    if (this.isMuted) this.bgm?.pauseAsync();
    else this.bgm?.playAsync();
  }
}