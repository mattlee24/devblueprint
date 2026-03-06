# To-dos: PowerPoint-style proposal slides

Full detailed list derived from the plan. Order matches recommended implementation sequence.

---

## 1. Data model and normalization

- [ ] **1.1** Define `ProposalSlideBlock` type in `lib/queries/proposals.ts`: `id`, `type` (`'heading' | 'paragraph' | 'bullets' | 'numbered' | 'image'`), `content` (string), optional `level` (1–3 for headings).
- [ ] **1.2** Redefine `ProposalSlide` in `lib/queries/proposals.ts`: `id`, `order`, `title`, `blocks: ProposalSlideBlock[]`. Remove or deprecate canvas-specific fields (`x`, `y`, `width`, `height`, `backgroundColor`, `elements`) from the type used for the new deck flow.
- [ ] **1.3** Add normalization helper (e.g. in `lib/queries/proposals.ts` or `lib/proposals/slideNormalize.ts`): given a raw slide from DB (may have `body` or legacy `elements`), return a slide with `blocks` (e.g. single paragraph from `body`, or map first text element to a block).
- [ ] **1.4** Ensure all proposal read paths (getProposal, share API) use the normalizer so existing proposals with old slide shape still load and render with the new block-based model.

---

## 2. AI generation (minimum 9 slides, block-based)

- [ ] **2.1** Update the prompt in `app/api/proposals/generate/route.ts` to require at least 9 slides and to output each slide with a `blocks` array (e.g. `{ type: 'heading'|'paragraph'|'bullets', content: string }`) instead of a single `body`.
- [ ] **2.2** Update the API response parsing to build `ProposalSlide[]` with `id`, `order`, `title`, and `blocks` from the AI response (and ensure at least 9 slides; pad with blank slides if needed).
- [ ] **2.3** Keep returning `projectCreationPayload` and `estimated_total` unchanged; ensure the prompt still asks for the same 9-slide structure (intro, overview, investment, add-ons, terms 1–3, acceptance, thank you).
- [ ] **2.4** Update `app/(app)/proposals/new/page.tsx` so that after generate it saves the new slide shape (with `blocks`) to the proposal via `createProposal`; no changes to other createProposal fields beyond `slides`.

---

## 3. Deck preview component (read-only deck view)

- [ ] **3.1** Create `ProposalDeckPreview` component (e.g. in `components/proposals/ProposalDeckPreview.tsx`) that accepts `slides` (normalized, block-based) and optional `title`.
- [ ] **3.2** Implement single-slide-at-a-time view: render current slide’s `title` and `blocks` (heading, paragraph, bullets, numbered, image) with a clean, presentation-style layout.
- [ ] **3.3** Add Next/Previous controls (buttons) and keyboard navigation (e.g. ArrowRight/ArrowLeft for next/prev, Escape to exit if used in modal).
- [ ] **3.4** Add slide counter (e.g. “3 / 9”) and optional progress indicator (dots or bar).
- [ ] **3.5** Add “Close preview” or equivalent when used on proposal detail page (e.g. Escape key and button); ensure focus and aria-labels for accessibility.

---

## 4. Deck editor (slide list + per-slide block editing)

- [ ] **4.1** Create slide list component (e.g. `ProposalSlideList` or part of `ProposalDeckEditor`): list of slides (titles or thumbnails), with add (blank or duplicate), remove (with confirm if has content), and reorder (drag-and-drop or up/down). Enforce minimum 1 slide; optionally show a soft warning if fewer than 9 slides.
- [ ] **4.2** Create per-slide content editor: for the selected slide, show editable `title` and the list of blocks. Each block: type (heading/paragraph/bullets/numbered/image), editable content, delete, and reorder (up/down or drag).
- [ ] **4.3** Add “Add block” control with options: Heading, Paragraph, Bullets, Numbered list, (optional) Image. New blocks get a unique `id` and sensible default `content`.
- [ ] **4.4** Wire editor to proposal state: load slides (normalized), on change call `updateProposal(id, { slides })` (debounced or on blur/save button as per current pattern). Ensure `slides` are stored in the new shape (`id`, `order`, `title`, `blocks`).
- [ ] **4.5** Create container component (e.g. `ProposalDeckEditor`) that composes slide list + selected slide block editor and handles selection and persistence.

---

## 5. Share page (client sees deck only)

- [ ] **5.1** In `app/share/proposals/[token]/page.tsx`, replace `ProposalCanvas` with `ProposalDeckPreview` (or shared deck viewer). Pass `title` and normalized `slides` from the API response.
- [ ] **5.2** Ensure the share API `app/api/proposals/share/[token]/route.ts` returns `slides` in a form that the preview can consume (normalize legacy slides to blocks in the API response or in the viewer).
- [ ] **5.3** Optionally add header/footer text for client view (e.g. “Prepared for [Client]” or proposal title) in the share layout.

---

## 6. Proposal detail page (wire editor + preview, remove canvas)

- [ ] **6.1** Remove rendering of `ProposalCanvas` for the main proposal content on `app/(app)/proposals/[id]/page.tsx`.
- [ ] **6.2** Render the new deck editor (slide list + per-slide block editor) when the user is editing; use normalized slides from proposal.
- [ ] **6.3** Add a “Preview” button that opens the deck preview (inline toggle or route like `?mode=preview`). Preview shows only the deck (no edit UI).
- [ ] **6.4** Keep existing actions: Mark as agreed/declined, Create project from proposal, Delete, Share (Send proposal). Update share modal copy to: “Anyone with this link can view the proposal as a slide deck (read-only).”
- [ ] **6.5** If `app/(app)/proposals/[id]/edit/page.tsx` is kept, have it redirect to `proposals/[id]` (e.g. with `?edit=1`) or remove it if all editing is on the detail page.

---

## 7. Cleanup and polish

- [ ] **7.1** Remove or repurpose `ProposalCanvas`: either delete its use from proposals and delete the file, or keep it only for a legacy/fallback path if required.
- [ ] **7.2** Remove unused `ProposalWhiteboard` component (or confirm it is unused and delete).
- [ ] **7.3** Remove or limit proposal-specific use of `lib/canvas/types.ts` (CanvasElement, etc.) so proposals no longer depend on canvas types; remove any imports of canvas types from proposal code.
- [ ] **7.4** Update new-proposal copy (e.g. on `proposals/new`): “AI will generate a 9+ slide proposal; you can edit slides and add or remove slides, then preview before sending.”
- [ ] **7.5** Accessibility pass: deck preview and share view — keyboard (arrows, Escape), focus management, aria-labels for next/prev and slide position.

---

## Optional enhancements (if time)

- [ ] **O.1** Add one or two deck themes (e.g. light/dark or a single professional theme) for preview and share.
- [ ] **O.2** When adding a new slide, offer templates: “Blank”, “Title + bullets”, “Title + paragraph” to prefill block types.
- [ ] **O.3** Add “Download as PDF” from preview or share (e.g. print-to-PDF or server-side PDF of the deck).
