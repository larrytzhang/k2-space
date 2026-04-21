/**
 * SubstepRow renders a procedure substep with indentation based on depth.
 * Supports recursive rendering for nested substeps and displays content blocks.
 *
 * @param props.step - The procedure step to render.
 * @param props.depth - Nesting depth for indentation (default 1).
 */

import type { ProcedureStep } from "@/lib/types/procedure";
import ContentBlockRenderer from "@/components/procedure/ContentBlockRenderer";

interface SubstepRowProps {
  step: ProcedureStep;
  depth?: number;
}

export default function SubstepRow({ step, depth = 1 }: SubstepRowProps) {
  return (
    <div
      className="border-l border-hairline py-2"
      style={{ marginLeft: `${depth * 1.25}rem`, paddingLeft: "1rem" }}
    >
      <div className="flex items-baseline gap-3">
        <span className="text-xs font-mono text-ink-subtle shrink-0 tabular-nums">
          {step.number}
        </span>
        <p className="text-sm text-ink-muted leading-relaxed">
          {step.instruction}
        </p>
      </div>

      {step.contentBlocks.length > 0 && (
        <div className="mt-2 flex flex-col gap-2 ml-8">
          {step.contentBlocks.map((block, idx) => (
            <ContentBlockRenderer key={idx} block={block} />
          ))}
        </div>
      )}

      {step.substeps.length > 0 && (
        <div className="mt-1">
          {step.substeps.map((substep) => (
            <SubstepRow
              key={substep.id}
              step={substep}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
