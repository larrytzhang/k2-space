"use client";

/**
 * ErrorBoundary catches render-time errors thrown by its children and shows
 * a friendly fallback instead of a white screen. Primarily wrapped around the
 * procedure result view so that a malformed field in the JSON cannot take
 * down the rest of the app.
 *
 * @param props.onReset  - Callback invoked when the user clicks "Start over".
 * @param props.children - The subtree to protect.
 */

import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  onReset: () => void;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string | null;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, message: null };

  /**
   * React lifecycle hook that converts a thrown error into state.
   * Called once per render error.
   */
  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      message:
        error instanceof Error
          ? error.message
          : "Unexpected render error",
    };
  }

  /**
   * Reset the boundary state and delegate to the parent's reset handler so
   * the rest of the app returns to idle cleanly.
   */
  private handleReset = () => {
    this.setState({ hasError: false, message: null });
    this.props.onReset();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="mx-auto max-w-xl border border-hairline bg-paper p-8"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-clay-ink">
            Render error
          </p>
          <h2 className="mt-3 font-serif text-2xl text-ink tracking-tight">
            Something went wrong rendering this procedure.
          </h2>
          <p className="mt-3 text-sm text-ink-muted leading-relaxed">
            {this.state.message ?? "The result could not be displayed."}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="mt-6 inline-flex items-center gap-2 rounded-sm bg-ink px-4 py-2 text-sm text-paper hover:bg-clay-ink transition-colors"
          >
            Start over
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
