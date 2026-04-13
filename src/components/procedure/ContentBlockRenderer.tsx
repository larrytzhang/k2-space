/**
 * ContentBlockRenderer renders the correct component for a given ContentBlock
 * based on its discriminated type field.
 *
 * @param props.block - The content block to render.
 */

import type { ContentBlock } from "@/lib/types/procedure";
import WarningBanner from "@/components/procedure/WarningBanner";
import CautionBanner from "@/components/procedure/CautionBanner";
import NoteBlock from "@/components/procedure/NoteBlock";
import FieldInputDisplay from "@/components/procedure/FieldInputDisplay";
import PassFailCriteria from "@/components/procedure/PassFailCriteria";
import SignOffLine from "@/components/procedure/SignOffLine";

interface ContentBlockRendererProps {
  block: ContentBlock;
}

export default function ContentBlockRenderer({
  block,
}: ContentBlockRendererProps) {
  switch (block.type) {
    case "warning":
      return <WarningBanner text={block.text} />;
    case "caution":
      return <CautionBanner text={block.text} />;
    case "note":
      return <NoteBlock text={block.text} />;
    case "field_input":
      return (
        <FieldInputDisplay
          label={block.label}
          inputType={block.inputType}
          unit={block.unit}
        />
      );
    case "pass_fail":
      return <PassFailCriteria criteria={block.criteria} />;
    case "sign_off":
      return <SignOffLine role={block.role} label={block.label} />;
    default:
      return null;
  }
}
