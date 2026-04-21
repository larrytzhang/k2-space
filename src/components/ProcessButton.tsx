"use client";

/**
 * ProcessButton triggers the procedure structuring workflow. Warm ink-black
 * rectangle — the primary action, kept calm and deliberate.
 *
 * @param props.onClick - Callback invoked when the button is clicked.
 * @param props.disabled - When true, the button is non-interactive.
 * @param props.loading - When true, shows a loading spinner instead of the icon.
 */

interface ProcessButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function ProcessButton({
  onClick,
  disabled,
  loading,
}: ProcessButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex items-center justify-center gap-3 rounded-sm bg-ink px-7 py-3 text-sm font-medium tracking-wide text-paper hover:bg-clay-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper border-t-transparent" />
      ) : null}
      Structure procedure
      <span aria-hidden="true" className="text-paper/60">
        →
      </span>
    </button>
  );
}
