/**
 * SectionCard renders a named procedure section containing a list of steps.
 * Hairline top rule + serif title — no heavy card chrome.
 *
 * @param props.section - The procedure section to render.
 */

import type { ProcedureSection } from "@/lib/types/procedure";
import StepCard from "@/components/procedure/StepCard";

interface SectionCardProps {
  section: ProcedureSection;
}

export default function SectionCard({ section }: SectionCardProps) {
  return (
    <section className="border-t border-hairline-strong pt-8">
      <h3 className="font-serif text-2xl text-ink tracking-tight">
        {section.title}
      </h3>
      <div className="mt-4 divide-y divide-hairline">
        {section.steps.map((step) => (
          <StepCard key={step.id} step={step} />
        ))}
      </div>
    </section>
  );
}
