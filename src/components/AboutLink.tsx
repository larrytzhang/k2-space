"use client";

/**
 * AboutLink renders a small floating "About this project" button anchored to
 * the bottom-right corner. Clicking it opens a modal with the personal pitch:
 * who built this, why, and how to get in touch.
 *
 * The modal content is deliberately short (under 150 words) so a senior
 * reviewer can absorb it in a few seconds without leaving the app.
 */

import { useCallback, useEffect, useState } from "react";
import { XMarkIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { AUTHOR } from "@/lib/author";

export default function AboutLink() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  // Dismiss on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <InformationCircleIcon className="h-4 w-4" />
        About this project
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
          onClick={close}
        >
          <div
            className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <h2
              id="about-title"
              className="text-lg font-semibold text-slate-900"
            >
              Why I built this
            </h2>

            <div className="mt-3 space-y-3 text-sm text-slate-700 leading-relaxed">
              <p>
                I&rsquo;m {AUTHOR.name}, a {AUTHOR.school} student interested
                in joining a scrappy, growth-minded space startup. I built
                this prototype after reading about K2&rsquo;s Mega-class
                satellite work — procedure digitization is a real, boring,
                high-leverage problem that every serious space program has
                to solve.
              </p>
              <p>
                I&rsquo;m a generalist with experience across research,
                medicine, government, and consulting. I ship fast, learn
                quickly, and make my teammates&rsquo; jobs easier. This is
                a sample of how I work: small scope, real output, no
                hand-waving.
              </p>
              <p>I&rsquo;d love to chat. Pick whichever is easiest:</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`mailto:${AUTHOR.email}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Email
              </a>
              <a
                href={AUTHOR.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                LinkedIn
              </a>
              <a
                href={AUTHOR.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Source on GitHub
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
