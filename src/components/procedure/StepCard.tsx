/**
 * StepCard renders a single top-level procedure step with a monospaced step
 * number, the instruction text, any attached content blocks, and nested
 * substeps. No badge, no chrome — just typographic hierarchy.
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
    <div className="grid grid-cols-[4rem_1fr] gap-6 py-5">
      {/* Monospace step number */}
      <span className="font-mono text-sm text-ink-muted tabular-nums pt-0.5">
        {step.number}
      </span>

      {/* Content */}
      <div className="min-w-0">
        <p className="text-[15.5px] text-ink leading-[1.7]">
          {step.instruction}
        </p>

        {step.contentBlocks.length > 0 && (
          <div className="mt-4 flex flex-col gap-2.5">
            {step.contentBlocks.map((block, idx) => (
              <ContentBlockRenderer key={idx} block={block} />
            ))}
          </div>
        )}

        {step.substeps.length > 0 && (
          <div className="mt-3">
            {step.substeps.map((substep) => (
              <SubstepRow key={substep.id} step={substep} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
