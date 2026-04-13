/**
 * ProcedureViewer is the top-level container that renders a complete structured procedure.
 * Composes the header, roles bar, equipment list, section cards, and stats.
 *
 * @param props.procedure - The full structured procedure to render.
 */

import type { StructuredProcedure } from "@/lib/types/procedure";
import ProcedureHeader from "@/components/procedure/ProcedureHeader";
import RolesBar from "@/components/procedure/RolesBar";
import EquipmentList from "@/components/procedure/EquipmentList";
import SectionCard from "@/components/procedure/SectionCard";
import ProcedureStats from "@/components/procedure/ProcedureStats";

interface ProcedureViewerProps {
  procedure: StructuredProcedure;
}

export default function ProcedureViewer({ procedure }: ProcedureViewerProps) {
  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      <ProcedureHeader procedure={procedure} />
      <RolesBar roles={procedure.roles} />
      <EquipmentList equipment={procedure.equipment} />

      <div className="space-y-6">
        {procedure.sections.map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}
      </div>

      <ProcedureStats metadata={procedure.metadata} />
    </div>
  );
}
