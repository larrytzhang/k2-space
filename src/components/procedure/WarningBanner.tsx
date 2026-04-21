/**
 * WarningBanner renders a high-severity warning callout for personnel safety
 * hazards. Red is kept as the semantic hue, but softened to sit on cream.
 *
 * @param props.text - The warning message text.
 */

interface WarningBannerProps {
  text: string;
}

export default function WarningBanner({ text }: WarningBannerProps) {
  return (
    <div className="border-l-2 border-red-600 bg-red-50/70 px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-red-700">
        Warning
      </p>
      <p className="mt-1 text-sm text-red-900 leading-relaxed">{text}</p>
    </div>
  );
}
