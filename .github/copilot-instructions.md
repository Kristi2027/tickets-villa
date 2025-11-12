## Purpose

This file gives concise, actionable guidance to code-writing AI agents working on the Tickets Villa repo. Focus on practical, discoverable patterns, integration points, and exact files to change.

## Big picture

- Front-end single-page React app (Vite + TypeScript) living in the repo root and `components/`.
- `hooks/useAppLogic.ts` is the central state/hub: navigation, activeView, selectedEvent/venue/artist, bookings and globalSettings.
- Small PHP backend proxy under `api/` (not a full server—only GenAI proxy): `api/genai.php` forwards prompts to Google GenAI using `api/config.php` for credentials.
- `services/` contains domain helpers: `geminiService.ts` (Google GenAI client usage) and `paymentService.ts` (Google Pay client flow).

## Key files to inspect and update

- `App.tsx` — top-level router-like view renderer keyed by `appState.activeView`.
- `hooks/useAppLogic.ts` — primary application logic; prefer changes here for global behaviors and navigation.
- `components/` — UI is split into many focused components. Follow existing prop shapes (e.g., `EventDetail`, `VenueDetail`, `BookingConfirmation`).
- `services/geminiService.ts` — server/API key expectations and error-handling patterns for AI features.
- `services/paymentService.ts` — Google Pay integration example (TEST environment, expected shape of paymentData handling).
- `api/genai.php` and `api/config.php` — PHP proxy to GenAI; used for server-side calls and deployment flows (Hostinger notes in `README.md`).
- `package.json` and `vite.config.ts` — build/dev commands and Vite config.

## Dev / build / run (exact commands from `package.json`)

- Install dependencies (assumes Node + npm): npm install
- Run dev server (Vite): npm run dev
- Build production bundle: npm run build
- Preview built bundle: npm run preview
- Serve built bundle (requires a static server like `serve`): npm run start

Note: `services/geminiService.ts` reads `process.env.API_KEY`. In Vite development you must ensure the key is injected or use a server-side proxy (recommended). See `api/config.php` for the server-side pattern used here.

## AI / secrets and how this repo wires them

- Client-side TS: `services/geminiService.ts` lazily initializes `@google/genai` and reads `process.env.API_KEY`. If missing it logs and returns friendly fallback strings — do not crash the app.
- Server-side PHP: `api/genai.php` forwards JSON prompts to `$GOOGLE_GENAI_ENDPOINT` using `$GOOGLE_API_KEY` from `api/config.php` (or environment variables). This is the safer production path; prefer server-side calls for private keys.

## Project-specific conventions / gotchas

- Centralized state: change behavior via `useAppLogic.ts` rather than editing `App.tsx` routing logic directly.
- Defensive AI code: both client TS and `api/genai.php` return non-fatal messages when keys or upstream services are missing — keep that behavior when refactoring.
- Payment flow: `services/paymentService.ts` expects the Google Pay client to exist on `window.google`. Use the `initiateGooglePayCheckout` helper to start payments and call the provided `onBookingSuccess` callback to persist bookings.
- File extensions: TSX/TS throughout — keep type imports (e.g., `types.ts`) up-to-date when changing shapes.

## Examples (copy-and-paste patterns)

- Generate event description (client helper): use `generateEventDescription(title, keywords)` in `services/geminiService.ts`. If API key missing, it returns a fallback message.
- Server-side GenAI proxy call: POST JSON { "prompt": "..." } to `/api/genai.php` and forward the response body.

## Where to be careful

- Do NOT hardcode API keys into client-side files. If adding server-side features, prefer `api/` and environment variables.
- `server.js` is empty in this repo — do not assume a Node server exists. The SPA is intended to be hosted as static files with a small PHP backend for GenAI.

## Quick checklist for code changes

1. Update types in `types.ts` when altering domain shapes (events, bookings, venues).
2. Update `useAppLogic.ts` for global flow changes (navigation, bookings, filters).
3. Add small, focused changes in `components/` to match new props.
4. If adding an integration that needs secrets, add a PHP proxy under `api/` and document required env vars in `api/config.php` and README.

## Feedback
If any section is unclear or you want more examples (e.g., sample server-side call, unit-test patterns), tell me which area to expand.
