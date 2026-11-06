---
name: Bounded localization transformations
description: Reliable translation-catalogue generation with the internal structured LLM helper.
---

Use bounded batches with a simple array of translation rows, each carrying its original numeric index. Validate exact index coverage and every target language before compiling dictionaries.

**Why:** Independent language arrays can omit a phrase and misalign translations. Elaborate schemas with a separate required property for every phrase were rejected by the model provider, while a compact reusable row schema worked.

**How to apply:** Keep transformation outputs well below the helper's response cap, preserve stable source indices when appending new text, and handle per-batch failures without discarding independent successful results.

Do not treat a complete source-string census as proof that the rendered site is fully translated. Include short data-driven headings, compact copy fields and tuple/array labels, not only JSX and sentence-length strings.

**Why:** A census initially reported no gaps while the rendered Arabic Vision page still had English area tabs and benefit headings. Those labels were stored as short data values rather than prose.

**How to apply:** Spot-check rendered sections and use any untranslated label to improve the extractor before regenerating only the missing catalogue entries.

Mask opaque interpolation expressions before translation and restore them afterwards; validate placeholder coverage separately from language coverage.

**Why:** Translation instructions alone did not stop quoted fallback labels and date-format arguments inside authentication interpolation expressions from changing.

**How to apply:** Treat double-brace expressions and numbered placeholders as code, not translatable prose. Keep visitor-authored content out of offline catalogue generation.
