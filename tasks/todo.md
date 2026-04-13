# AI Procedure Generator — Build Tracker

## Phase 0: Scaffolding
- [x] Scaffold Next.js project
- [x] Install dependencies
- [x] Create directory structure
- [x] Create shared types (procedure.ts, pipeline.ts)
- [x] Create vitest.config.ts
- [x] Create .env.example

## Phase 1: Document Parser
- [x] types.ts + constants.ts + errors.ts
- [x] utils/text-cleaner.ts + test
- [x] parsers/txt-parser.ts + test
- [x] parsers/pdf-parser.ts + test
- [x] utils/table-extractor.ts
- [x] parsers/docx-parser.ts + test
- [x] utils/section-detector.ts + test
- [x] index.ts (public API) + integration test
- [x] Verify: all parser tests pass (41 tests)

## Phase 2: AI Engine
- [x] validation/procedure-schema.ts + test
- [x] ai/prompts.ts + test
- [x] ai/client.ts + mocked test
- [x] Verify: all AI engine tests pass (34 tests)

## Phase 3: Backend API
- [x] lib/pipeline/types.ts + errors.ts + config.ts
- [x] lib/validation.ts + test
- [x] lib/pipeline/job-store.ts + test
- [x] lib/pipeline/orchestrator.ts + test
- [x] POST /api/upload route + test
- [x] GET /api/jobs/[jobId]/stream route + test
- [x] lib/export/json-exporter.ts
- [x] GET /api/export/[jobId] route + test
- [x] Verify: all backend tests pass (27 tests)

## Phase 4: Frontend UI
- [x] globals.css + layout.tsx + lib/constants.ts + lib/api.ts
- [x] hooks (useFileUpload, useJobStream)
- [x] HeroSection
- [x] Upload components (FileDropZone, UploadedFileCard, ProcessButton, UploadSection)
- [x] ProcessingIndicator + ErrorToast
- [x] Content block components (all 6) + ContentBlockRenderer
- [x] Step/Section components (SubstepRow, StepCard, SectionCard)
- [x] Procedure display (ProcedureHeader, RolesBar, EquipmentList, ProcedureStats)
- [x] ProcedureViewer + ExportButton + Footer
- [x] page.tsx (wire everything)
- [x] Verify: build succeeds, 0 errors

## Phase 5: Integration & Deploy
- [ ] End-to-end test with mock procedure
- [ ] Verify all content block types render
- [ ] Responsive check
- [ ] Deploy to Vercel

## Summary
- 12 test files, 102 tests passing
- Next.js build: compiled successfully, 0 errors
- 5 routes: / (static), /api/upload, /api/jobs/[jobId]/stream, /api/export/[jobId]
