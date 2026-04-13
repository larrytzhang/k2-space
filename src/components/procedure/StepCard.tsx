/**
 * StepCard renders a single top-level procedure step with a numbered circle badge,
 * the instruction text, any attached content blocks, and nested substeps.
 *
 * @param props.step - The procedure step to render.
 */

import type { ProcedureStep } from "@/lib/types/procedure";
import ContentBlockRenderer from "@/components/procedure/ContentBlockRenderer";
import SubstepRow from "@/components/procedure/SubstepRow";

interface StepCardProps {
  step: ProcedureStep;
}

export default function StepCard({ step }: StepCardProps) {
  return (
    <div className="flex gap-4 py-4">
      {/* Number badge */}
      <div className="shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-bold">
          {step.number}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-slate-800 leading-relaxed">{step.instruction}</p>

        {step.contentBlocks.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {step.contentBlocks.map((block, idx) => (
              <ContentBlockRenderer key={idx} block={block} />
            ))}
          </div>
        )}

        {step.substeps.length > 0 && (
          <div className="mt-2">
            {step.substeps.map((substep) => (
              <SubstepRow key={substep.id} step={substep} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
