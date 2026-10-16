---
name: Bounded localization transformations
description: Reliable translation-catalogue generation with the internal structured LLM helper.
---

Use bounded batches with a simple array of translation rows, each carrying its original numeric index. Validate exact index coverage and every target language before compiling dictionaries.

**Why:** Independent language arrays can omit a phrase and misalign translations. Elaborate schemas with a separate required property for every phrase were rejected by the model provider, while a compact reusable row schema worked.

**How to apply:** Keep transformation outputs well below the helper's response cap, preserve stable source indices when appending new text, and handle per-batch failures without discarding independent successful results.
