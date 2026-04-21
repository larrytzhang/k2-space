/**
 * NoteBlock renders a low-severity informational annotation — treated as a
 * quiet editorial aside in ink tones rather than a colored callout.
 *
 * @param props.text - The note message text.
 */

interface NoteBlockProps {
  text: string;
}

export default function NoteBlock({ text }: NoteBlockProps) {
  return (
    <div className="border-l-2 border-hairline-strong bg-paper/60 px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-subtle">
        Note
      </p>
      <p className="mt-1 text-sm text-ink-muted leading-relaxed">{text}</p>
    </div>
  );
}
