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
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

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
          className="mx-auto max-w-xl rounded-xl border border-amber-200 bg-amber-50 p-6 text-center"
        >
          <ExclamationTriangleIcon className="mx-auto h-8 w-8 text-amber-500" />
          <h2 className="mt-3 text-base font-semibold text-slate-900">
            Something went wrong rendering this procedure.
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {this.state.message ??
              "The result could not be displayed."}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Start over
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
