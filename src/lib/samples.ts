/**
 * Pre-authored sample aerospace procedures available as one-click demos.
 *
 * Each entry points to a source document in `/public/samples/sources/` and a
 * pre-computed structured JSON result in `/public/samples/results/`. The result
 * JSONs are hand-authored to satisfy the StructuredProcedureSchema exactly,
 * which lets the demo showcase a realistic output without consuming an
 * Anthropic API credit for every visitor.
 */

/** Metadata describing a single pre-authored sample procedure. */
export interface SampleProcedure {
  /** Stable identifier used in URLs and as a cache key. */
  id: string;
  /** Short human-readable title shown on the sample card. */
  title: string;
  /** Domain tag shown as a pill on the sample card. */
  domain: "test" | "inspection" | "safety";
  /** One-sentence description of what the procedure demonstrates. */
  description: string;
  /** Path (from site root) to the source text document. */
  sourcePath: string;
  /** Path (from site root) to the pre-computed structured JSON result. */
  resultPath: string;
}

/**
 * The curated set of sample procedures surfaced on the landing page.
 * Order here determines rendering order in the SampleProcedures component.
 */
export const SAMPLE_PROCEDURES: readonly SampleProcedure[] = [
  {
    id: "solar-array-deployment",
    title: "Solar Array Deployment Verification",
    domain: "test",
    description:
      "Assembly/test procedure with deployment kinematics, latch verification, and pass/fail criteria.",
    sourcePath: "/samples/sources/solar-array-deployment.txt",
    resultPath: "/samples/results/solar-array-deployment.json",
  },
  {
    id: "propulsion-leak-check",
    title: "Propulsion Feed System Leak Check",
    domain: "inspection",
    description:
      "Pressure-decay inspection with helium charge, joint survey, and temperature-corrected acceptance.",
    sourcePath: "/samples/sources/propulsion-leak-check.txt",
    resultPath: "/samples/results/propulsion-leak-check.json",
  },
  {
    id: "thermal-vacuum-safety",
    title: "Thermal Vacuum Chamber Entry Lockout",
    domain: "safety",
    description:
      "Personnel safety lockout/tagout flow with multi-role sign-offs and atmospheric checks.",
    sourcePath: "/samples/sources/thermal-vacuum-safety.txt",
    resultPath: "/samples/results/thermal-vacuum-safety.json",
  },
] as const;
