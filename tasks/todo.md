# K2 Space Demo Polish — Implementation Plan

> Goal: a clickable Vercel demo that a senior K2 engineer can understand in 5 seconds
> and fully evaluate in under 60. Deploy-ready, secure, clean repo.

Principles: simplicity first, minimal-impact changes, demonstrate max value in shortest path.

---

## Phase A — Core value (the demo must land in 30 seconds)

- [x] **A1.** Authored three realistic aerospace sample procedures in `/public/samples/sources/`
- [x] **A2.** Pre-computed schema-validated JSON results in `/public/samples/results/`
- [x] **A3.** `SampleProcedures` component with three one-click cards
- [x] **A4.** Sample flow wired: instant cached fetch + scripted progress animation
- [x] **A5.** Rewrote `HeroSection`: value prop, author, K2 framing, 3-step visual
- [x] **A6.** Added Rendered ↔ Raw JSON toggle + Copy JSON button
- [x] **A7.** Real `layout.tsx` metadata: OpenGraph, Twitter card, keywords
- [x] **A8.** Replaced default Next.js favicon with a custom SVG mark
- [x] **A9.** Rewrote footer: author attribution, K2 framing, canonical links
- [x] **A10.** Added "About this project" modal with personal pitch

## Phase B — Reliability

- [x] **B1.** React error boundary around the result view
- [x] **B2.** Richer progress stage text across both sample and real flows
- [x] **B3.** `friendlyError()` translator for common failure modes
- [x] **B4.** Existing 120 s client-side stream timeout verified

## Phase C — README + repo hygiene

- [x] **C1.** Rewrote `README.md` with pitch, demo, stack, setup, author
- [x] **C2.** Added MIT `LICENSE`
- [x] **C3.** Removed unused default Next.js SVGs from `/public`
- [x] **C4.** Clearer `.env.example`
- [x] **C5.** `.gitignore` tightened: `.env*` ignored, `!.env.example` allowed

## Phase D — UI polish

- [x] **D1.** Step-list `ProcessingIndicator` with per-stage status (done/active/pending)
- [x] **D2.** Mobile responsiveness verified (grid collapse, header wrap, modal)
- [x] **D3.** Smooth transitions (fadeIn animations preserved, toggle states)
- [x] **D4.** Accessibility pass: `role=tablist`, `aria-current`, focus rings, modal escape

## Phase E — Security sweep (OWASP-informed)

- [x] **E1.** Per-IP rate limit on `/api/upload` (10 / hour)
- [x] **E2.** Per-IP rate limit on `/api/jobs/[jobId]/stream` (60 / min)
- [x] **E3.** Input validation: UUID v4 gate, strict multipart content-type, single-field form, empty / size / MIME checks
- [x] **E4.** API key handling: server-only read, verified absent from client bundle
- [x] **E5.** OWASP-informed checks: no `dangerouslySetInnerHTML`, no `console.*` in src, generic 500 responses, `npm audit` clean
- [x] **E6.** Security headers via `next.config.ts`: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- [x] **E7.** Git history scan — no secrets present
- [x] **E8.** `.env.example` tracked, all other `.env*` ignored

## Phase F — Final verification

- [x] **F1.** `npm run build` — 0 errors, 0 warnings
- [x] **F2.** `npm run lint` — clean
- [x] **F3.** `npx vitest run` — 133 tests pass (added error-messages, samples, rate-limit)
- [x] **F4.** Manual smoke: home → each sample → rendered/JSON toggle → copy → About → error path
- [x] **F5.** Clean commit history prepared
- [x] **F6.** Ready for `git push` → Vercel import

---

## Review section

**Outcome:** the app now has a clear 5-second value proposition, three one-click
demos that run without touching the Anthropic API, a real rendered/raw-JSON
result view with client-side download, security-hardened endpoints, and a
deploy-ready README. 133 tests pass, lint is clean, build is clean.

**What was not previously working that is now fixed:**
- The SSE stream route (`/api/jobs/[jobId]/stream`) emitted unnamed `data:` events,
  but the client hook listened for named `progress` / `complete` / `error` events on
  a different URL (`/api/stream/[jobId]`). Real uploads never returned a result.
  Both sides now agree on URL and event format and the terminal `complete` event
  carries the full `StructuredProcedure`.
- Pre-existing ESLint errors (`prefer-const`, mutating refs during render, `any`)
  are cleaned up so `npm run lint` is now zero-error.

**Architecture notes for a reviewer:**
- Samples are delivered client-side from `/public/samples/results/*.json` so a
  reviewer without an `ANTHROPIC_API_KEY` can still see a full working output.
- `ExportButton` is now pure client-side (`JSON.stringify` → `Blob` → anchor
  download). The old `/api/export/[jobId]` round-trip and its `json-exporter`
  module are deleted as dead code.
- Rate limiter is in-memory per instance (acceptable for a demo on Vercel;
  swap to Upstash/Redis if this goes to prod).
- Error boundary wraps the result view only — errors during upload or sample
  loading are handled by the state machine and surfaced via `friendlyError`.

**Known limitations (documented, not regressions):**
- Access control on jobs: any holder of a jobId can fetch the result. UUID v4
  makes this unguessable in practice, but a production deployment should add
  per-session scoping.
- Scanned PDFs with no text layer are not OCR'd — `friendlyError` shows a
  clear message and steers the user to a sample.
