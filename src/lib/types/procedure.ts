/**
 * Canonical type definitions for structured aerospace procedures.
 * This is the SINGLE source of truth — all modules import from here.
 * No other module should redefine these types.
 */

/** A role involved in procedure execution (e.g., Test Conductor, QA). */
export interface Role {
  /** Short form, e.g., "TC", "QA", "ME" */
  abbreviation: string;
  /** Full role name, e.g., "Test Conductor" */
  fullName: string;
}

/** A piece of equipment or material required by the procedure. */
export interface EquipmentItem {
  name: string;
  quantity?: string;
  specification?: string;
}

/**
 * A single content block attached to a procedure step.
 * Discriminated union on the "type" field.
 */
export type ContentBlock =
  | WarningBlock
  | CautionBlock
  | NoteBlock
  | FieldInputBlock
  | PassFailBlock
  | SignOffBlock;

/** Danger to PERSONNEL safety. Highest severity. */
export interface WarningBlock {
  type: "warning";
  text: string;
}

/** Risk to EQUIPMENT only. Medium severity. */
export interface CautionBlock {
  type: "caution";
  text: string;
}

/** Informational annotation. Lowest severity. */
export interface NoteBlock {
  type: "note";
  text: string;
}

/** A blank field to be filled in (measurement, reading, serial number). */
export interface FieldInputBlock {
  type: "field_input";
  label: string;
  inputType: "text" | "number" | "checkbox";
  unit?: string;
}

/** An acceptance criterion that must be verified as pass or fail. */
export interface PassFailBlock {
  type: "pass_fail";
  criteria: string;
}

/** A signature/approval line for a specific role. */
export interface SignOffBlock {
  type: "sign_off";
  role: string;
  label: string;
}

/** A single step within a procedure section. */
export interface ProcedureStep {
  id: string;
  /** Original step number, e.g., "4.1.2" */
  number: string;
  /** The action to perform */
  instruction: string;
  /** Warnings, cautions, notes, field inputs, pass/fail, sign-offs */
  contentBlocks: ContentBlock[];
  /** Nested sub-steps */
  substeps: ProcedureStep[];
}

/** A named section containing ordered steps. */
export interface ProcedureSection {
  id: string;
  title: string;
  steps: ProcedureStep[];
}

/** Summary metadata about the procedure. */
export interface ProcedureMetadata {
  /** Domain classification: "assembly", "test", "inspection", etc. */
  domain: string | null;
  totalSteps: number;
  totalWarnings: number;
  estimatedDuration: string | null;
}

/**
 * The fully structured representation of an aerospace procedure.
 * Produced by the AI engine, consumed by the backend and frontend.
 */
export interface StructuredProcedure {
  id: string;
  title: string;
  documentNumber: string | null;
  revision: string | null;
  effectiveDate: string | null;
  purpose: string | null;
  scope: string | null;
  roles: Role[];
  equipment: EquipmentItem[];
  sections: ProcedureSection[];
  metadata: ProcedureMetadata;
}
