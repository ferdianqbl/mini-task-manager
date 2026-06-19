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
- [ ] **Step 8: Update Auth Context & Forms**
  - [ ] Modify `fe/src/context/auth-context.tsx` to handle cookie session, user role, and async logout
  - [ ] Modify `fe/src/components/features/auth/login-form.tsx` (change email field to username, update style/labels)
  - [ ] Modify `fe/src/components/features/auth/register-form.tsx` (change email field to username, update style/labels)
- [ ] **Step 9: Create Task Services**
  - [ ] Create Task types (`fe/src/services/task/types.ts`)
  - [ ] Create TanStack Query hooks for tasks API (`fe/src/services/task/use-tasks.ts`)
  - [ ] Export services from `fe/src/services/task/index.ts` and `fe/src/services/index.ts`
- [ ] **Step 10: Build Task Components**
  - [ ] Create `task-card.tsx` (renders status transitions, delete option, audit log button)
  - [ ] Create `task-board.tsx` (Kanban board layout with To Do, Pending, In Progress, Done columns)
  - [ ] Create `task-dialog.tsx` (Task creation modal overlay)
  - [ ] Create `task-audit-logs.tsx` (Task specific audit log drawer)
  - [ ] Create `global-audit-logs.tsx` (Admin dashboard log stream table)
- [ ] **Step 11: Page Implementation & Integration**
  - [ ] Integrate TaskBoard and headers in `fe/src/app/page.tsx`
  - [ ] Implement Admin toggle between Task Board and Global Audit Logs
  - [ ] Sanitize references from Habit Shaper to Mini Task Manager
- [ ] **Step 12: Compilation and E2E Verification**
  - [ ] Verify frontend compiles successfully via `npm run build`
  - [ ] Run `docker compose up --build` and verify full E2E flow
