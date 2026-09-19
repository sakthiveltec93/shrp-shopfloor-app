---
name: ui-ux-pro-max
description: >-
  Comprehensive UI/UX design intelligence and design system knowledge.
  Use when designing, implementing, styling, or auditing user interfaces,
  industrial dashboards, operator panels, responsive layouts, data tables,
  forms, modals, and design tokens across React, Tailwind CSS, and Vite.
---

# UI/UX Pro Max Design Intelligence

This skill provides comprehensive UI/UX design system knowledge, layout architecture, typography, semantic color systems, accessibility standards, and responsive heuristics.

---

## 1. Core Design Principles

### A. Visual Hierarchy & Clarity
1. **Primary vs Secondary Actions**:
   - Primary action (e.g., Save, Submit, Approve) must be solid, high-contrast, visually prominent.
   - Secondary action (e.g., Cancel, Back, Clear) should be ghost, outline, or muted neutral.
   - Destructive action (e.g., Delete, Reject, Scrap) must use warning/danger colors (`red-600` / `rose-700`) and always require explicit confirmation.
2. **Information Density & Scannability**:
   - Use Bento grids or structured card containers with distinct borders and subtle shadows (`shadow-sm`, `border-slate-200/80` or `border-slate-800`).
   - Group related metadata logically (e.g., Machine + Part + Mould in one cluster; Operator + Shift in another).
   - Display critical metrics (Counts, Status, Timers, Shift Progress) in large monospace or tabular figures (`font-mono`, `text-2xl` to `text-4xl`, `font-bold`).

---

## 2. Industrial & Shopfloor UX Standards

### A. Touch-First Ergonomics
- **Target Size**: Minimum touch target size of **48px x 48px** for buttons, tabs, dropdowns, and counter controls.
- **Operator Readability**: Minimum font size of **14px** for captions, **16px-18px** for body/inputs, and **24px-36px** for counts and machine numbers.
- **Accidental Tap Prevention**: Separate destructive and submit buttons with clear spacing (minimum `16px` / `gap-4`).

### B. Real-Time Status & High-Visibility Feedback
- **Machine & Session States**:
  - `RUNNING` / `IN_PROGRESS`: Emerald/Green pulse badge (`bg-emerald-500/15 text-emerald-600 border-emerald-500/30`).
  - `MOULD_CHANGE` / `SETUP`: Amber/Yellow warning badge (`bg-amber-500/15 text-amber-600 border-amber-500/30`).
  - `OFF` / `STOPPED`: Slate/Gray neutral badge (`bg-slate-500/15 text-slate-500 border-slate-500/30`).
  - `BREAKDOWN` / `REJECTED`: Rose/Red high-alert badge (`bg-rose-500/15 text-rose-600 border-rose-500/30`).
- **Instant Visual Feedback**: Immediate optimistic UI updates, clear loading spinners/skeletons, and unambiguous success toasts.

---

## 3. Color System & Palettes

| Token | Light Mode Class | Dark Mode Class | Semantic Meaning |
| :--- | :--- | :--- | :--- |
| **Primary** | `bg-indigo-600 hover:bg-indigo-700 text-white` | `bg-indigo-500 hover:bg-indigo-600 text-white` | Main brand actions, active tabs, primary buttons |
| **Success** | `bg-emerald-600 text-white` / `text-emerald-700` | `bg-emerald-500 text-slate-900` / `text-emerald-400` | OK parts, FPA approved, QC passed, active session |
| **Warning** | `bg-amber-500 text-slate-900` / `text-amber-700` | `bg-amber-400 text-slate-900` / `text-amber-300` | Tolerance warnings, mould load pending, partial bag |
| **Danger** | `bg-rose-600 text-white` / `text-rose-700` | `bg-rose-500 text-white` / `text-rose-400` | Rejections, scrap, breakdown, session stop |
| **Neutral Surface** | `bg-slate-50 border-slate-200 text-slate-900` | `bg-slate-900 border-slate-800 text-slate-100` | Card backgrounds, dialogs, sidebars |

---

## 4. Typography & Monospace Formatting

1. **Numeric Metrics**: Always use `font-mono tracking-tight tabular-nums` for shot counts, timestamps, lot numbers, weights, and tolerances.
2. **Part Identifiers**: Always display concise short names primarily (e.g., `LBC`, `MBC`, `HBC`) with full part descriptions or customer codes in subtle secondary muted text.
3. **Headings**: Clean sans-serif (`Inter`, `system-ui`, `-apple-system`) with crisp weights (`font-semibold` or `font-bold`).

---

## 5. Layout & Responsive Breakpoints

- **Mobile (<640px)**: Single-column stacked cards, bottom navigation or sticky bottom action bars, full-width inputs.
- **Tablet (640px - 1024px)**: 2-column grid, compact side navigation, sticky table headers.
- **Desktop / Touch Screen (>1024px)**: Multi-column Bento dashboard, dense data tables with pagination and search filters, split-pane detail views.

---

## 6. Accessibility & Contrast Checklist (WCAG AAA)

- [x] All text elements meet a minimum contrast ratio of **4.5:1** (normal text) and **3:1** (large text).
- [x] Visible focus rings (`focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2`).
- [x] Explicit `aria-label` attributes on icon-only buttons.
- [x] Form inputs include semantic `<label>` elements with matching `htmlFor` / `id`.
- [x] Color is never the sole indicator of state (always pair color with text or icons).
