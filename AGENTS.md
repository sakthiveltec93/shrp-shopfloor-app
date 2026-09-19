# Agent Guidelines & Tool Workflows

## 1. Sequential Thinking & Structured Reasoning
- Use sequential thinking steps before executing multi-file refactors, complex state changes, or database migrations.
- Formulate concise problem hypotheses, test them against the codebase, and verify changes systematically to prevent regressions and minimize context/token churn.

## 2. API Verification & Testing (Postman)
- Use Postman MCP / API tools to test and validate backend API endpoints (`/api/...`) under various payloads and auth scenarios before and after modifying routes.
- Ensure all query parameters, permissions, role restrictions, and edge cases (e.g. operator-specific filtering, FIFO tolerance rules) return expected status codes and payloads.

## 3. UI/UX Pro Max & Design Tokens
- Reference the **UI/UX Pro Max** skill (`.agents/skills/ui-ux-pro-max/SKILL.md`) for all interface implementations.
- Enforce industrial touch ergonomics (minimum 48px touch targets), high contrast (WCAG AAA), monospace metrics, and clear semantic state badges across all screens.
- Show part short names by default with secondary full descriptions.

## 4. Google Stitch & Vite/Webpack Build-Dev Integration
- Use Google Stitch MCP tools for rapid UI layout design sync and design-to-code token generation.
- Use Vite Dev Server tools (`vite-dev-server`) for inspecting live HMR events, capturing screenshots, debugging console errors, and evaluating browser-side DOM state.
