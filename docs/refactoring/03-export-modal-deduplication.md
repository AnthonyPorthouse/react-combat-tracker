# Plan 3: Deduplicate ExportModal + ExportLibraryModal

**Priority:** High  
**Status:** Complete

## Problem

`ExportModal` (~90 lines) and `ExportLibraryModal` (~115 lines) share identical copy-to-clipboard, download, and object-URL lifecycle patterns. Both:

- Call `useCopyToClipboard`
- Maintain `exportString` state updated by a `useEffect`
- Implement identical `handleDownload` (object-URL anchor click + revoke) and `handleCopy` logic
- Render identical Download + Copy button pairs in their `actions=` props

The only difference is the data source (combat state vs. Dexie read) and the export filename.

## Goal

Extract the shared action logic into a hook and the shared button pair into a component.

## Steps

1. **Create `useExportActions` hook**
   - Path: `src/hooks/useExportActions.ts`
   - Accepts: `{ getData: () => Promise<unknown>, filename: string }`
   - Internally calls `useCopyToClipboard`
   - Manages: `exportString` state, object-URL lifecycle (create on download, revoke after click)
   - Exposes: `exportString`, `handleDownload`, `handleCopy`, `copied`

2. **Create `ExportActionButtons` component**
   - Path: `src/components/common/ExportActionButtons.tsx`
   - Renders: Download button + Copy button
   - Accepts: `{ onDownload, onCopy, copied, disabled }` props
   - Export from the `common` barrel: `src/components/common/index.ts`

3. **Refactor `ExportModal`**
   - Path: `src/features/combat/modals/ExportModal.tsx`
   - Replace inline effect + handler logic with `useExportActions`
   - Replace inline button pair with `<ExportActionButtons>`

4. **Refactor `ExportLibraryModal`**
   - Path: `src/features/library/modals/ExportLibraryModal.tsx`
   - Replace inline effect + handler logic with `useExportActions`
   - Replace inline button pair with `<ExportActionButtons>`

## Verification

- [x] Download works in both combat and library export
- [x] Copy to clipboard works in both contexts
- [x] "Copied!" feedback state displays and resets correctly
- [x] Object URL is revoked after download (no memory leak — verify via DevTools Memory tab)
- [x] Export area is disabled/empty when no data is available
- [x] `npx tsc --noEmit` passes
- [x] `npm run lint` passes
- [x] `npx i18next-cli lint` passes

## Notes

- `useExportActions` is placed in `src/hooks/` (app-level) as it has no domain knowledge beyond the callback it receives.
- `ExportActionButtons` goes in `src/components/common/` for the same reason.
