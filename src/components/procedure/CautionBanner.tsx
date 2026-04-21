/**
 * CautionBanner renders a medium-severity caution callout for equipment risks.
 * Amber kept as semantic hue, softened to sit on cream.
 *
 * @param props.text - The caution message text.
 */

interface CautionBannerProps {
  text: string;
}

export default function CautionBanner({ text }: CautionBannerProps) {
  return (
    <div className="border-l-2 border-amber-500 bg-amber-50/70 px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-700">
        Caution
      </p>
      <p className="mt-1 text-sm text-amber-900 leading-relaxed">{text}</p>
    </div>
  );
}
