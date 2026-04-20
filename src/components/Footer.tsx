/**
 * Footer renders a compact attribution strip at the bottom of every page.
 * Surfaces the author and the canonical links so reviewers can reach the
 * source code and the author directly from anywhere in the app.
 */

import { AUTHOR } from "@/lib/author";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Prototype by{" "}
          <span className="font-medium text-slate-700">{AUTHOR.name}</span>
          {" · "}
          Built for K2 Space
        </p>
        <div className="flex items-center gap-4">
          <a
            href={AUTHOR.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-900 transition-colors"
          >
            Source
          </a>
          <a
            href={AUTHOR.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-900 transition-colors"
          >
            LinkedIn
          </a>
          <a
            href={`mailto:${AUTHOR.email}`}
            className="hover:text-slate-900 transition-colors"
          >
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
