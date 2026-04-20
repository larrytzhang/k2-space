# Procedure AI

**Turn paper aerospace procedures into structured JSON in seconds.**

A working prototype built for [K2 Space](https://www.k2space.com) by Larry Zhang (Harvard).
Live demo: _<paste your Vercel URL here after first deploy>_

---

## What it does

Aerospace teams run on paper procedures: assembly checklists, leak-check
sequences, lockout/tagout flows, test-conductor scripts. Digitizing them by
hand takes engineers hours per document. This app converts them in seconds.

Upload a PDF, DOCX, or TXT procedure. Claude reads it and returns a strict,
schema-validated JSON structure:

- Title, document number, revision, effective date
- Personnel roles and equipment/materials lists
- Sections and nested steps with original numbering
- Content blocks per step: **warnings** (personnel danger), **cautions**
  (equipment risk), **notes**, **field inputs** (typed, with units),
  **pass/fail criteria**, **sign-off lines**
- Summary metadata (domain, step count, warning count, estimated duration)

Three pre-computed sample procedures are available as one-click demos so
a reviewer can see the output in under 10 seconds without uploading
anything.

---

## How it works

```
Upload (PDF/DOCX/TXT)
        │
        ▼
 Document parser  ─── pdf-parse / mammoth / plain-text
        │
        ▼
 Claude (Sonnet)  ─── system prompt enforces aerospace vocab
        │              (WARNING vs CAUTION, verbatim safety text)
        ▼
 Zod schema validation
        │
        ▼
 Rendered view + downloadable JSON
```

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4
- **Backend**: Next.js Route Handlers (serverless-ready). In-memory job store
  with pub/sub, streams progress to the client over SSE
- **AI**: Anthropic API with retry + token-ceiling escalation + strict JSON
  parsing + Zod validation
- **Samples**: pre-authored .txt source + hand-validated JSON result, loaded
  client-side (no API round-trip) for instant demo playback

---

## Run it locally

```bash
git clone https://github.com/larryzhang225/k2-procedure-ai.git
cd k2-procedure-ai
npm install
cp .env.example .env
# paste your Anthropic API key into .env
npm run dev
```

Visit <http://localhost:3000>.

---

## Deploy to Vercel

1. Push this repo to GitHub
2. Import it at <https://vercel.com/new>
3. Set `ANTHROPIC_API_KEY` in the project's environment variables
4. Deploy

No other config is needed. Samples work even without an API key — only the
custom-upload path requires one.

---

## Tests

```bash
npm run build    # TypeScript + Next.js build
npm run lint     # ESLint
npx vitest run   # unit + integration tests
```

Coverage spans the document parser (PDF / DOCX / TXT), the AI client
(mocked), the Zod schema, the pipeline job store/orchestrator, the upload
route, the error translator, and a contract test ensuring every sample
procedure still satisfies the schema.

---

## Built by

**Larry Zhang** · Harvard · [LinkedIn](https://www.linkedin.com/in/larryzhang225/) · <larryzhang225@gmail.com>

If you're at K2 Space and want to chat, I'd love to — even a 15-minute
call to learn what problems you'd love to push onto a scrappy generalist.

---

## License

[MIT](./LICENSE)
