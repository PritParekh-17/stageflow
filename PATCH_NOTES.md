# StageFlow Audit & Polish Pass

Applied after auditing the existing repository.

## Fixes included
- Fixed frontend/backend auth session mismatch by mirroring the JWT into a browser session cookie for Next.js middleware while retaining the API Authorization header flow.
- Cleared the session cookie on logout.
- Removed the backend's unauthenticated demo-user fallback so protected API routes actually require authentication.
- Updated backend tests to authenticate before protected API calls.
- Added active-event tracking so contextual navbar links no longer assume event ID `1`.
- Updated dashboard, event overview, and new-event flow to remember the active event.
- Removed hardcoded event links from the global navigation and landing page.
- Replaced AI drawer browser `alert()` errors with the existing StageFlow toast system.
- Corrected README API paths for live, agenda, and speaker endpoints.
- Added `frontend/.env.example`.
- Kept SQLite as the current lightweight demo database; no unnecessary migration was introduced.

## Verification
- Frontend TypeScript check: PASS (`npx tsc --noEmit`)
- Backend Python syntax/compile check: PASS (`python -m compileall`)
- Full backend pytest could not run in the audit environment because the extracted environment did not have the `python-jose` runtime installed, although it is correctly declared in `backend/requirements.txt`.
- The supplied `node_modules`/`.next` were Windows-generated and are intentionally excluded from the clean package; run `npm install` locally before starting the frontend.

## Security
Real `.env` / `.env.local` files are excluded from the clean package. Use the provided `.env.example` files and create local environment files yourself.
