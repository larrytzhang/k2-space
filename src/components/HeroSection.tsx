"use client";

/**
 * HeroSection displays the application's headline, description, and feature pills.
 * Shown on the idle/landing state of the page.
 */
export default function HeroSection() {
  const pills = [
    "AI-Powered Extraction",
    "Safety-Critical Accuracy",
    "Instant JSON Export",
  ];

  return (
    <section className="text-center py-12 animate-[fadeIn_0.3s_ease-out]">
      <h1 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">
        Transform Operational Procedures into Structured Digital Formats
      </h1>
      <p className="text-slate-600 max-w-2xl mx-auto mb-8 text-lg leading-relaxed">
        Upload a procedure document. AI extracts sections, steps, warnings,
        sign-offs, and pass/fail criteria in seconds.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {pills.map((pill) => (
          <span
            key={pill}
            className="inline-flex items-center rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200"
          >
            {pill}
          </span>
        ))}
      </div>
    </section>
  );
}
