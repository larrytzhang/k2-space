"use client";

/**
 * HeroSection is the landing-page headline. Editorial tone, left-aligned,
 * serif display — the opposite of the pill-and-eyebrow SaaS template.
 *
 * Layout:
 *   - Small monospace affiliation line (who this was built for).
 *   - Serif H1 with the direct value proposition.
 *   - Body paragraph giving the time-savings quantification.
 *   - A single quiet pipeline sentence — no pill chips, no arrows.
 */

export default function HeroSection() {
  return (
    <section className="py-16 md:py-24 animate-[fadeIn_0.4s_ease-out]">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted">
        Prototype · Built for K2 Space
      </p>

      <h1 className="mt-6 font-serif text-4xl md:text-5xl lg:text-[56px] leading-[1.08] tracking-[-0.01em] text-ink max-w-[22ch]">
        Paper aerospace procedures,
        <br />
        <span className="italic text-clay-ink">structured</span> in seconds.
      </h1>

      <p className="mt-6 max-w-[58ch] text-[17px] leading-[1.7] text-ink-muted">
        Hours of manual digitization collapsed into a single upload. Warnings,
        cautions, sign-offs, and pass/fail criteria are preserved verbatim and
        classified correctly for downstream tooling.
      </p>

      <p className="mt-10 text-sm text-ink-subtle">
        <span className="text-ink-muted">Upload</span>
        <span className="mx-3 text-hairline-strong">/</span>
        <span className="text-ink-muted">parse with Claude</span>
        <span className="mx-3 text-hairline-strong">/</span>
        <span className="text-ink-muted">export JSON</span>
      </p>
    </section>
  );
}
