# Mini Task Manager Roadmap Checklist

## Backend Phased Checklist (Completed)
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

## Frontend Phased Checklist (In Progress)
- [x] **Step 8: Update Auth Context & Forms**
  - [x] Modify `fe/src/context/auth-context.tsx` to handle cookie session, user role, and async logout
  - [x] Modify `fe/src/components/features/auth/login-form.tsx` (change email field to username, update style/labels)
  - [x] Modify `fe/src/components/features/auth/register-form.tsx` (change email field to username, update style/labels)
- [x] **Step 9: Create Task Services**
  - [x] Create Task types (`fe/src/services/task/types.ts`)
  - [x] Create TanStack Query hooks for tasks API (`fe/src/services/task/use-tasks.ts`)
  - [x] Export services from `fe/src/services/task/index.ts` and `fe/src/services/index.ts`
- [x] **Step 10: Build Task Components**
  - [x] Create `task-card.tsx` (renders status transitions, delete option, audit log button)
  - [x] Create `task-board.tsx` (Kanban board layout with To Do, Pending, In Progress, Done columns)
  - [x] Create `task-dialog.tsx` (Task creation modal overlay)
  - [x] Create `task-audit-logs.tsx` (Task specific audit log drawer)
  - [x] Create `global-audit-logs.tsx` (Admin dashboard log stream table)
- [x] **Step 11: Page Implementation & Integration**
  - [x] Integrate TaskBoard and headers in `fe/src/app/page.tsx`
  - [x] Implement Admin toggle between Task Board and Global Audit Logs
  - [x] Sanitize references from Habit Shaper to Mini Task Manager
- [x] **Step 12: Compilation and E2E Verification**
  - [x] Verify frontend compiles successfully via `npm run build`
  - [ ] Run `docker compose up --build` and verify full E2E flow
