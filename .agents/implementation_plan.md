# Implementation Plan: SaaS Plan Limits & Security Guards

This plan outlines the architecture, current state, and migration path to enforce strict plan limits (specialists, services, and AI generation) at both backend and frontend layers for ProBookia SaaS.

---

## Technical Audit & Current State

### 1. Origin Audit (Where do counts/limits come from?)
- **Visual Indicators:** The limits display card (`PlanLimitsCard.tsx`) fetches dynamic data from the backend `GET /settings/limits` endpoint in `backend/app/routers/settings.py`.
- **Database Schema:** `Tenant.plan_type` in the relational database stores the active plan (`free`, `basic`, `pro`, `gold`).
- **Specialist Rules:** Specialist invitations are triggered from the server action `inviteTeamMember` (`frontend/src/app/actions/team.ts`). It performs a double-check against Supabase:
  - Fetches `Tenant.plan_type` directly from the Supabase DB.
  - Matches the plan with hardcoded limits: `free` (1), `basic` (2), `pro` (10), `gold` (unlimited).
  - Rejects invitations if `currentCount >= maxSpecialists`.
- **Lacking Backend Enforcement:** Although `backend/app/limits.py` has a `check_specialist_limit(db)` function, it is **never called** in any backend router. Furthermore, **AI generation features** currently have zero limit checks; any tenant can call `/ai/generate` or `/ai/generate-image` regardless of their subscription plan.

---

## Dependency Map

### A. Specialists Management
- **Frontend Page:** `frontend/src/app/dashboard/(standard)/team/page.tsx`
- **Server Action (Creation Guard):** `frontend/src/app/actions/team.ts`
- **Backend Limits Definition:** `backend/app/limits.py` (defines `check_specialist_limit` which checks database counts, but is currently unused)

### B. AI Generation Features
- **Backend Routes (The targets):** `backend/app/routers/ai.py`
  - `POST /ai/optimize-prompt`
  - `POST /ai/generate`
  - `POST /ai/generate-image`
- **Backend Limits Source:** `backend/app/limits.py`
- **Frontend AI entrypoints:**
  - CMS Copywriter: `frontend/src/components/cms/AIGeneratorModal.tsx`
  - Services copy & SEO generator: `frontend/src/app/dashboard/(standard)/services/editor/components/SeoTab.tsx`
  - Media Image generator: `frontend/src/app/contexts/AIImageContext.tsx`

---

## Proposed Changes & Migration Plan

### 1. Backend: Establishing Security Guards (Middlewares)

#### [MODIFY] [limits.py](file:///c:/Users/Juan/MERCE/CLINICA%20MERCE/backend/app/limits.py)
- Update `PLAN_LIMITS` dictionary to include `"ai_allowed"` as a boolean parameter:
  - `free`, `basic`, `pro` Plans: `"ai_allowed": False`
  - `gold` Plan: `"ai_allowed": True`
- Implement `check_ai_allowed(db: Session)` to check the tenant's current plan and raise an `HTTP 403 Forbidden` if AI assistants are not allowed.

#### [MODIFY] [ai.py](file:///c:/Users/Juan/MERCE/CLINICA%20MERCE/backend/app/routers/ai.py)
- Import `check_ai_allowed` from `limits.py`.
- Call `check_ai_allowed(db)` at the start of all three generation endpoints: `/optimize-prompt`, `/generate`, `/generate-image`.

#### [MODIFY] [settings.py](file:///c:/Users/Juan/MERCE/CLINICA%20MERCE/backend/app/routers/settings.py)
- Expose the `"ai_allowed"` boolean parameter inside the `GET /settings/limits` response model so the frontend can dynamically adapt the user experience.

---

### 2. Frontend: High-End UI Locks & Upselling

To avoid poor UX (such as buttons throwing unexpected errors), we will integrate plan rules gracefully into the UI.

#### [MODIFY] [AIGeneratorModal.tsx](file:///c:/Users/Juan/MERCE/CLINICA%20MERCE/frontend/src/components/cms/AIGeneratorModal.tsx)
- Call `/settings/limits` upon rendering.
- If `ai_allowed` is `false`, hide or overlay the generator panel with a premium-designed, quiet-luxury style **Upgrade Card**:
  > ✦ **Acceso Premium a Inteligencia Artificial**
  > Redacción y generación de contenido optimizado para conversión. Disponible de forma ilimitada en el Plan Gold.
  > [Botón: "Actualizar Plan de Suscripción"](link to billing/onboarding)

#### [MODIFY] [SeoTab.tsx](file:///c:/Users/Juan/MERCE/CLINICA%20MERCE/frontend/src/app/dashboard/%28standard%29/services/editor/components/SeoTab.tsx)
- Fetch limits from `/settings/limits` or pass down `limits` context.
- If `ai_allowed` is `false`, render lock badges over the "Generar con IA" buttons, disabling clicks and displaying a clean tooltip encouraging upgrades.

---

## Verification Plan

### Automated Verification
- **Unit Tests:** Execute Stripe provisioning and middleware mocks to verify active plan assignments and endpoint exceptions.
- **REST Client Checks:** Send raw requests to `/ai/generate` for tenants with `pro`, `basic`, and `free` plans to confirm they correctly return `403 Forbidden` instead of invoking Gemini/OpenAI models.

### Manual Verification
- Log in with a **Pro Plan** tenant and verify in the Services Editor that the "Generar con IA" buttons are disabled and styled with premium locks.
- Log in with a **Gold Plan** tenant and confirm that AI Generation opens, executes, and updates content successfully.
