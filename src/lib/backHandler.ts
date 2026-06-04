// Screen-level Android Back coordination.
//
// A single screen (currently the Game) can register a handler that pops its own
// in-page UI state (overlays, game-state machine). The app-level Back listener
// in App.tsx consults this first on every hardware/gesture Back press:
//   • handler returns true  → it consumed the press (stay where we are)
//   • handler returns false → nothing left to pop; fall through to route-level
//     back (navigate(-1) → … → home → exit app)
//
// Only one handler is active at a time — the most recently registered screen.

type ScreenBack = () => boolean;

let handler: ScreenBack | null = null;

/** Register the active screen's Back handler. Returns an unregister function. */
export function registerScreenBack(h: ScreenBack): () => void {
  handler = h;
  return () => {
    if (handler === h) handler = null;
  };
}

/** Run the active screen's Back handler, if any. Returns true if it consumed the press. */
export function consumeScreenBack(): boolean {
  return handler ? handler() : false;
}
