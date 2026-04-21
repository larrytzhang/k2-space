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
import { XMarkIcon } from "@heroicons/react/24/outline";
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
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 border border-hairline bg-paper px-4 py-2 text-sm text-ink-muted hover:text-ink hover:border-ink-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay transition-colors"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        About this project
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/20 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
          onClick={close}
        >
          <div
            className="relative w-full max-w-xl bg-paper p-8 md:p-10 border border-hairline"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 rounded-full p-1 text-ink-subtle hover:bg-cream hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-subtle">
              About
            </p>

            <h2
              id="about-title"
              className="mt-3 font-serif text-3xl text-ink tracking-tight"
            >
              Why I built this
            </h2>

            <div className="mt-5 space-y-4 text-[15px] text-ink-muted leading-[1.7]">
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
              <p className="text-ink">I&rsquo;d love to chat. Pick whichever is easiest:</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`mailto:${AUTHOR.email}`}
                className="inline-flex items-center gap-1.5 rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-clay-ink transition-colors"
              >
                Email
              </a>
              <a
                href={AUTHOR.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-sm border border-hairline-strong bg-paper px-4 py-2 text-sm text-ink hover:border-ink hover:bg-cream transition-colors"
              >
                LinkedIn
              </a>
              <a
                href={AUTHOR.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-sm border border-hairline-strong bg-paper px-4 py-2 text-sm text-ink hover:border-ink hover:bg-cream transition-colors"
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
