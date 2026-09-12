// Translation dictionaries for the operator-facing screens.
// Structure: translations[langCode][namespace][key]
// Admin-only screens (Users, Parts, Approvals, Today's Log, PIN change) are
// intentionally left in English per scope decision.
//
// Split into per-language files (translations.en.js / .ta.js / .or.js) to
// keep each file small enough to push reliably.

import { en } from './translations.en.js';
import { ta } from './translations.ta.js';
import { or } from './translations.or.js';

export const translations = { en, ta, or };
