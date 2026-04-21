/**
 * Footer renders a compact attribution strip at the bottom of every page.
 * Surfaces the author and the canonical links so reviewers can reach the
 * source code and the author directly from anywhere in the app.
 */

import { AUTHOR } from "@/lib/author";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-hairline">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-3 px-6 py-8 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between md:px-10">
        <p>
          Prototype by{" "}
          <span className="text-ink">{AUTHOR.name}</span>
          <span className="mx-2 text-hairline-strong">·</span>
          Built for K2 Space
        </p>
        <div className="flex items-center gap-5">
          <a
            href={AUTHOR.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink transition-colors"
          >
            Source
          </a>
          <a
            href={AUTHOR.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink transition-colors"
          >
            LinkedIn
          </a>
          <a
            href={`mailto:${AUTHOR.email}`}
            className="hover:text-ink transition-colors"
          >
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
