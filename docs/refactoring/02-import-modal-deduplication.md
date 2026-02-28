# Plan 2: Deduplicate ImportModal + ImportLibraryModal

**Priority:** Critical  
**Status:** Complete

## Problem

`ImportModal` (~140 lines) and `ImportLibraryModal` (~150 lines) are structurally identical. Both share:

- `fileInput`, `textInput`, `error`, `isLoading` state
- A `handleClose` that resets all four
- An async `handleSubmit` that runs `fileInput`-first then `textInput` fallback
- The same `<FileDropzone>` + divider + `<textarea>` + error alert JSX

The only differences are the `source` string (`'combat'` vs `'library'`), the validator, and the `onImport` callback shape.

## Goal

Extract the shared logic into a generic hook and a shared form body component, leaving each modal containing only its domain-specific wiring.

## Steps

1. **Create `useImportForm` hook**
   - Path: `src/hooks/useImportForm.ts`
   - Accepts: `{ source: string, validator: ZodSchema, onSuccess: (data) => void }`
   - Manages: `fileInput`, `textInput`, `error`, `isLoading`
   - Exposes: `handleClose` (resets all), `handleSubmit`, `hasInput`, `fileInput`, `textInput`, `setFileInput`, `setTextInput`, `error`, `isLoading`

2. **Create `ImportFormBody` component**
   - Path: `src/components/common/ImportFormBody.tsx`
   - Renders: `<FileDropzone>`, divider, `<textarea>`, error alert
   - Accepts controlled values and callbacks as props from `useImportForm`
   - Export from the `common` barrel: `src/components/common/index.ts`

3. **Refactor `ImportModal`**
   - Path: `src/features/combat/modals/ImportModal.tsx`
   - Replace inline state + submit logic with `useImportForm`
   - Replace inline JSX with `<ImportFormBody>`

4. **Refactor `ImportLibraryModal`**
   - Path: `src/features/library/modals/ImportLibraryModal.tsx`
   - Replace inline state + submit logic with `useImportForm`
   - Replace inline JSX with `<ImportFormBody>`

## Verification

- [x] File-upload import works in both combat and library contexts
- [x] Paste-text import works in both contexts
- [x] File takes precedence over text when both are present
- [x] Error state displays correctly on invalid input
- [x] Form resets on close/cancel
- [x] `npx tsc --noEmit` passes
- [x] `npm run lint` passes
- [x] `npx i18next-cli lint` passes

## Notes

- `useImportForm` is placed in `src/hooks/` (app-level) rather than a feature directory because it has no domain knowledge — it only knows about validators and callbacks.
- `ImportFormBody` goes in `src/components/common/` for the same reason.
