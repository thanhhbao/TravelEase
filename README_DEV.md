README_DEV.md for TravelEase

Purpose
-------
This document helps developers get started with the TravelEase repository. It covers how to setup and run the backend (Laravel) and frontend (Vite + React + TypeScript), explains the current authentication approach, describes a known "logout on refresh" issue and what was done to mitigate it, and lists common troubleshooting steps and commands.

Repository layout
-----------------
- backend/ — Laravel backend (API + auth)
- frontend/ — React + TypeScript frontend (Vite)

Prerequisites
-------------
- PHP 8.x (compatible with the composer packages used)
- Composer
- MySQL (or another DB configured in `.env`)
- Node.js (16/18 recommended) and npm
- (Optional) Redis for queue/session caching

Quick start (backend)
----------------------
1. Copy environment file and set values:
   - cp backend/.env.example backend/.env (or copy the provided `.env` if present).
   - Edit `backend/.env`: set `DB_*`, `APP_URL`, `FRONTEND_URL`, `SANCTUM_STATEFUL_DOMAINS`, and `SESSION_DOMAIN` for your environment.

2. Install composer deps and generate app key:

   On Windows PowerShell:

   ```powershell
   cd backend
   composer install
   php artisan key:generate
   php artisan migrate --seed
   ```

3. Run development server:

   ```powershell
   php artisan serve --host=127.0.0.1 --port=8000
   ```

Notes about environment variables (backend)
-------------------------------------------
Key variables (in `backend/.env`) to check:
- APP_URL — e.g. `http://127.0.0.1:8000`
- FRONTEND_URL — e.g. `http://localhost:5173`
- SANCTUM_STATEFUL_DOMAINS — include frontend host(s), e.g. `localhost:5173,127.0.0.1:5173`
- SESSION_DOMAIN — usually `localhost` for local dev
- SESSION_DRIVER — currently `database` in this repo (make sure sessions table exists)

Quick start (frontend)
----------------------
1. Install dependencies and run dev server:

```powershell
cd frontend
npm install
npm run dev
```

2. Dev server will typically be at http://localhost:5173 (or 5174 as your environment shows). Use that URL as `FRONTEND_URL` in backend `.env` when testing.

Auth design (current implementation)
-----------------------------------
This project currently uses token-based authentication (Laravel Sanctum tokens) where the backend issues a Personal Access Token via `$user->createToken('web')->plainTextToken` on login/register. The frontend stores this token in `localStorage` and sends it in the `Authorization: Bearer <token>` header on subsequent API calls.

Key files (frontend):
- `frontend/src/lib/api.ts` — Axios instance and helpers to store and set token.
- `frontend/src/store/auth.ts` — Zustand store that bootstraps the user on app start by calling `/api/user` (the `me()` helper).

Known issue: "Logged in but after refresh I'm logged out"
-------------------------------------------------------
Symptom
- User logs in successfully and sees protected UI.
- On page reload (F5), app briefly shows loading then ends up logged out.

Root cause (diagnosed)
- Frontend calls `/api/user` to fetch the current user during app bootstrap.
- If the Axios default Authorization header isn't set yet from `localStorage`, the request goes without a token and the backend responds `401`.
- Frontend code treats `401` as invalid token and clears localStorage token immediately — producing the observed logout behavior.

Mitigation applied (safe, frontend-only changes)
- Ensure Axios default headers are populated from `localStorage` at module initialization time in `frontend/src/lib/api.ts` so requests made early will include the Authorization header.
- During store bootstrap (`frontend/src/store/auth.ts`), read token from `localStorage` and call `setAuthToken(token)` before calling `me()`.

Files changed (summary)
- `frontend/src/lib/api.ts` — set axios defaults from persisted token at module init, handle AxiosHeaders cases, and make setAuthToken robust.
- `frontend/src/store/auth.ts` — ensure token from localStorage is set into api before the bootstrap /user request.

Why these changes
- They fix the race condition without changing the auth model (token-based) and avoid risky backend changes. They are minimal and reversible.

Alternative: cookie-based Sanctum SPA flow
-----------------------------------------
If you prefer to use Sanctum SPA cookie-based sessions (HTTP-only cookies, recommended for security), you'll need to:
1. Switch login to use session-based login (authenticate via `web` guard) and let Laravel set an HTTP-only cookie.
2. Configure `SANCTUM_STATEFUL_DOMAINS`, `SESSION_DOMAIN`, and `CORS` correctly.
3. On the frontend, use `axios.defaults.withCredentials = true` and call `/sanctum/csrf-cookie` before login.

This requires backend changes and careful env configuration; open a follow-up issue if you want this work done.

Testing auth locally (manual steps)
----------------------------------
1. Start backend and frontend dev servers.
2. Open DevTools (Network tab).
3. Sign in via the frontend UI. Confirm `/api/login` response contains `token`.
4. Confirm that subsequent requests include `Authorization: Bearer <token>` in the request headers.
5. Reload page and observe `/api/user` request during app bootstrap:
   - It should include the same Authorization header and return 200 with user data.
   - If it returns 401, check console and network traces and ensure localStorage token exists and axios defaults are set.

Common commands
---------------
Backend
```powershell
cd backend
composer install
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8000
```

Frontend
```powershell
cd frontend
npm install
npm run dev
# build for production
npm run build
```

Troubleshooting checklist for login-on-refresh
---------------------------------------------
- Make sure frontend is using the correct API base URL (Vite env or `frontend/src/lib/api.ts` `API_BASE_URL`).
- Confirm token exists in localStorage under key `auth_token` after login.
- In DevTools, check the `/api/user` request headers on reload. If Authorization header missing, check `frontend/src/lib/api.ts` and `frontend/src/store/auth.ts` for the setAuthToken usage.
- If backend returns 401 and you expect cookie-based auth instead of bearer token, ensure frontend sets `withCredentials` and backend CORS supports credentials and stateful domains.

Notes about current repo state
-----------------------------
- I ran `npm run build` and found TypeScript errors unrelated to the auth fix (implicit any, nullable `src` props on images, unused variables). These need cleanup if you want a clean production build — I can fix them if you want.
- The quick auth fixes implemented are frontend-only and low-risk.

Next steps you may want me to take
---------------------------------
- (A) Fix TypeScript errors so `npm run build` completes successfully.
- (B) Convert to cookie-based Sanctum SPA auth (backend + frontend changes) for improved security.
- (C) Add an E2E test (Cypress or Playwright) that covers login + reload persistence.

If you want, I can proceed with one of the next steps — tell me which and I'll implement it.

Contact
-------
If you need more details or want me to update this document with environment-specific instructions (Docker, production deploy, CI), tell me the target environment and I'll add steps.
