# Walkthrough — Mini Task Manager Integration

We have completed the frontend integration phase for the **Mini Task Manager** application, successfully implementing secure cookie-based session verification, Kanban board layout, task creation, status transitions, audit logs, and an administrator panel.

## Changes Completed

### 1. Authentication & Cookie session
*   **[auth-context.tsx](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/qonflo/mini-task-manager/fe/src/context/auth-context.tsx)**: Refactored to read user profile (username and role) directly from `/api/users/me` on mount. Deleted all localStorage token getters and setters. Configured logouts to call the `/api/auth/logout` endpoint, which instructs the browser to clear the HttpOnly cookie.
*   **[login-form.tsx](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/qonflo/mini-task-manager/fe/src/components/features/auth/login-form.tsx)** & **[register-form.tsx](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/qonflo/mini-task-manager/fe/src/components/features/auth/register-form.tsx)**: Replaced email fields with username fields, matching backend authentication. Cleaned up template references.

### 2. Task Services & API Hooks
*   **[types.ts](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/qonflo/mini-task-manager/fe/src/services/task/types.ts)**: Declared types for Tasks, TaskStatus (`to_do` | `pending` | `in_progress` | `done`), and AuditLogs.
*   **[use-tasks.ts](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/qonflo/mini-task-manager/fe/src/services/task/use-tasks.ts)**: Built React Query hooks (`useTasks`, `useCreateTask`, `useUpdateTaskStatus`, `useDeleteTask`, `useTaskAuditLogs`, `useGlobalAuditLogs`) using Axios configured to send cookies credentials.

### 3. Interactive Task UI
*   **[task-card.tsx](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/qonflo/mini-task-manager/fe/src/components/features/tasks/task-card.tsx)**: Renders details for a task. Ensures sequential progression is strictly enforced (e.g., `to_do` can only transition to `pending`). Admins can see the creator's username badge.
*   **[task-board.tsx](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/qonflo/mini-task-manager/fe/src/components/features/tasks/task-board.tsx)**: Displays the 4 Kanban columns (To Do, Pending, In Progress, Done) and maps tasks to each column.
*   **[task-dialog.tsx](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/qonflo/mini-task-manager/fe/src/components/features/tasks/task-dialog.tsx)**: Modal overlay to add new tasks.
*   **[task-audit-logs.tsx](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/qonflo/mini-task-manager/fe/src/components/features/tasks/task-audit-logs.tsx)**: Sleek slide-out panel that displays a timeline of status changes for a specific task.
*   **[global-audit-logs.tsx](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/qonflo/mini-task-manager/fe/src/components/features/tasks/global-audit-logs.tsx)**: Admin-only panel showing a searchable list table of all system status transitions (including tasks that have been deleted).

### 4. Layout
*   **[page.tsx](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/qonflo/mini-task-manager/fe/src/app/page.tsx)**: Merged the features into the core view. Added an admin toolbar to switch between the Kanban Board and the System Audit Log stream.

---

## Verification Results

### Frontend Compilation
We executed `npm run build` inside `fe/` and verified that Next.js and TypeScript compile successfully with **0 errors**.

### Local E2E Stack execution
Note: The local Docker daemon is currently not running on this machine.
To run the full stack locally:
1. Ensure your Docker Desktop is running.
2. From the project root, run:
   ```bash
   docker compose up --build
   ```
3. The frontend is accessible at [http://localhost:3000](http://localhost:3000). The backend runs at [http://localhost:5001](http://localhost:5001).

Once running, you can:
*   Sign up a new account (default role: `USER`).
*   Create tasks and verify they appear in the `To Do` column.
*   Progress tasks sequentially using the button controls and verify the task moves columns.
*   Log in using the admin account seeded by migrations (`admin` / `password123`).
*   Toggle the **System Audit Stream** tab on the admin header to see the list of all state changes, including tasks that were deleted.
