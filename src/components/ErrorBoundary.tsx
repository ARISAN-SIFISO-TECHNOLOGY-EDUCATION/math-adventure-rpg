import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Optional friendlier label for what failed (e.g. "this question"). */
  scopeLabel?: string;
  /** Optional custom recovery action label + handler (defaults to a full reload). */
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render/lifecycle throws so a single bad state never white-screens the
 * whole app on a child's device. There is no telemetry (the app is 100% offline),
 * so the boundary's job is purely graceful recovery: show a friendly message and
 * a one-tap escape hatch back to a working screen.
 */
export default class ErrorBoundary extends Component<Props, State> {
  // This repo has no @types/react yet (Phase-2 cleanup), so the inherited
  // Component members aren't typed — declare the ones we use.
  declare props: Props;
  declare setState: (state: Partial<State>) => void;
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // No network logging by design; surface it to the console for local debugging.
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    if (this.props.onReset) {
      this.setState({ hasError: false, error: null });
      this.props.onReset();
    } else {
      // Full reload back to home — clears any transient bad in-memory state.
      window.location.href = '/';
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const what = this.props.scopeLabel ?? 'the app';
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-sm">
          <div className="text-6xl mb-4">🛠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Oops — something hiccuped</h1>
          <p className="text-slate-300 mb-6">
            We hit a snag with {what}. Nothing is broken on your device — let's get you back on track.
          </p>
          <button
            onClick={this.handleReset}
            className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-lg transition-colors"
          >
            {this.props.onReset ? 'Try again' : 'Back to start'}
          </button>
        </div>
      </div>
    );
  }
}
