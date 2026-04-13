/**
 * SectionCard renders a named procedure section containing a list of steps.
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
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <h3 className="text-lg font-semibold text-slate-900">
          {section.title}
        </h3>
      </div>
      <div className="px-6 divide-y divide-slate-100">
        {section.steps.map((step) => (
          <StepCard key={step.id} step={step} />
        ))}
      </div>
    </section>
  );
}
