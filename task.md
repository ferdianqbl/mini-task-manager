# Backend Phased Roadmap Checklist

- [x] **Step 1: Setup Workspace Scaffolding**
  - [x] Delete unused backend boilerplate modules (`goal/`, `habit/`)
  - [x] Delete unused backend routes (`goal.routes.ts`, `habit.routes.ts`)
  - [x] Update central router (`be/src/routes/index.ts`)
- [x] **Step 2: Database Schema & Migration**
  - [x] Update DDL in `be/src/db/schema.sql`
  - [x] Update seeding logic in `be/src/db/migrate.ts`
- [x] **Step 3: Update Auth for HttpOnly Cookies**
  - [x] Install `cookie-parser` dependencies
  - [x] Update Express initialization (`be/src/server.ts`) to use `cookie-parser`
  - [x] Update auth controllers and middleware
- [x] **Step 4: Implement Task Module**
  - [x] Create Task types (`be/src/modules/task/task.types.ts`)
  - [x] Create Task repository database operations (`be/src/modules/task/task.repository.ts`)
  - [x] Create Task service business logic (`be/src/modules/task/task.service.ts`)
  - [x] Create Task controller route handlers (`be/src/modules/task/task.controller.ts`)
- [x] **Step 5: Route Registration**
  - [x] Create Task routes (`be/src/routes/task.routes.ts`)
  - [x] Mount Task routes in central router (`be/src/routes/index.ts`)
- [x] **Step 6: Compilation and Verification**
  - [x] Verify build compiles
  - [x] Verify migration logic structure (seeding script compiles successfully)

---

# Frontend Phased Roadmap Checklist

- [x] **Step 7: Setup Frontend Workspace Scaffolding**
  - [x] Delete unused frontend boilerplate components (`goals/`, `habits/`)
  - [x] Delete unused frontend services (`goal/`, `habit/`)
  - [x] Clean up and configure API Axios instance (`fe/src/lib/api.ts`) with `withCredentials = true`
- [/] **Step 8: Update Auth Context & forms for Username/Cookies**
  - [ ] Update `fe/src/context/auth-context.tsx` to handle username, role, and cookie-based status checks
  - [ ] Update auth forms (`login-form.tsx`, `register-form.tsx`) to use username inputs
- [ ] **Step 9: Implement Task API Services & Hooks**
  - [ ] Create Task types (`fe/src/services/task/types.ts`)
  - [ ] Create TanStack React Query hooks for tasks (`fe/src/services/task/use-tasks.ts`)
- [ ] **Step 10: Build Task Dialog, Cards & Logs components**
  - [ ] Create task creation modal (`fe/src/components/features/tasks/task-dialog.tsx`)
  - [ ] Create task card component (`fe/src/components/features/tasks/task-card.tsx`) with sequential action buttons
  - [ ] Create single task audit log modal (`fe/src/components/features/tasks/task-audit-logs.tsx`)
  - [ ] Create admin global audit logs panel (`fe/src/components/features/tasks/global-audit-logs.tsx`)
- [ ] **Step 11: Implement Main Dashboard page**
  - [ ] Update dashboard page (`fe/src/app/page.tsx`) with column layout, admin badging, and routing guards
- [ ] **Step 12: Compilation and Verification**
  - [ ] Verify frontend build compiles cleanly
