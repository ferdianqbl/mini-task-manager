# Technical Requirements Validation Results

This document lists the validation rules and verification checkpoints for the **Mini Task Manager** features, ensuring all product specs are met cleanly.

---

## 📊 Technical Requirements Traceability Matrix

| Requirement Area | Detailed Specification | Target Backend File | Target Frontend File |
| :--- | :--- | :--- | :--- |
| **Authentication** | Secure registration & login via username and password | `auth.routes.ts` | `login-form.tsx`, `register-form.tsx` |
| **Authentication** | JWT-based session authorization for API queries | `auth.middleware.ts` | `api.ts`, `auth-context.tsx` |
| **Session Security** | Session token stored in XSS-proof `HttpOnly` Cookies | `auth.controller.ts` | `api.ts` (withCredentials) |
| **Role Management** | User roles (`USER` and `ADMIN`) specified in JWT token | `auth.controller.ts` | `auth-context.tsx` |
| **Role Management** | Global Audit Logs fetch blocked for standard users (returns `403 Forbidden`) | `auth.middleware.ts` | `use-tasks.ts` |
| **Role Management** | Global Audit Logs fetch permitted for administrators | `auth.middleware.ts` | `global-audit-logs.tsx` |
| **Task Ownership** | Standard users can only view/transition/delete their own tasks | `task.repository.ts` | `page.tsx` |
| **Task Ownership** | Administrators can view/transition/delete tasks of any user | `task.repository.ts` | `page.tsx` |
| **Log Ownership** | Standard users can only view their own log actions ("self log") | `task.repository.ts` | `task-audit-logs.tsx` |
| **Log Ownership** | Administrators can view all task log actions regardless of actor | `task.repository.ts` | `task-audit-logs.tsx` |
| **Task Management** | Create a task (Title + Description), status initialized as `to_do` | `task.service.ts` | `task-dialog.tsx` |
| **Task Management** | List all active tasks on dashboard | `task.controller.ts` | `page.tsx` |
| **Task Management** | Transition status through strictly sequential path | `task.service.ts` | `task-card.tsx` |
| **Task Management** | Delete a task | `task.repository.ts` | `task-card.tsx` |
| **Audit Logging** | Create an audit log record on status updates | `task.service.ts` | *N/A (triggered via API)* |
| **Audit Logging** | Display logs in sorted chronological order | `task.repository.ts` | `task-audit-logs.tsx`, `global-audit-logs.tsx` |
| **Audit Logging** | Log must track: task identifier, actor, old status, new status, timestamp | `task.repository.ts` | `task-audit-logs.tsx`, `global-audit-logs.tsx` |
| **Audit Logging** | Immutability: Deleting a task does NOT delete its audit logs | `schema.sql` (set null) | *N/A* |
| **Non-Functional** | Idempotency: Same-status updates do not generate logs | `task.service.ts` | *N/A* |
| **Non-Functional** | Consistency: Transactional updates of tasks and audit logs | `task.repository.ts` | *N/A* |
| **Non-Functional** | Domain Validation: Backend rejects invalid transitions (e.g. skip/regression) | `task.service.ts` | *N/A* |
| **Non-Functional** | Secure Actor: Logged-in user username automatically binds as actor from JWT token | `auth.middleware.ts` | `api.ts` |

---

## 🔍 Validation Rules Checklist

### 1. State Transition Matrix (Strictly Enforced)

| From Status (`old_status`) | Target Status (`new_status`) | Allowed? | Rationale |
| :---: | :---: | :---: | :--- |
| `to_do` | `pending` | **Yes** | Valid sequential step |
| `to_do` | `in_progress` | **No** | Rejects: skipped `pending` |
| `to_do` | `done` | **No** | Rejects: skipped `pending`, `in_progress` |
| `pending` | `in_progress` | **Yes** | Valid sequential step |
| `pending` | `to_do` | **No** | Rejects: regression |
| `in_progress` | `done` | **Yes** | Valid sequential step |
| `in_progress` | `pending` | **No** | Rejects: regression |
| `done` | *Any status* | **No** | Rejects: `done` is terminal state |
| *Any status* | *Same status* | **Yes (Idempotent)** | Returns `200 OK` but writes 0 logs |

---

## 🏆 Evaluation Self-Assessment Guidelines

1.  **Code Structure Consistency**: Backend uses Repository-Service-Controller (RSC) architecture. Frontend isolates services into separate async hooks.
2.  **Audit Integrity**:
    *   Logs must be completely read-only (no update/delete routes exposed).
    *   Task deletion maps to `ON DELETE SET NULL` on the audit logs foreign key constraint, keeping historical actor records intact.
3.  **Concurrency & Security Safety**:
    *   Backend employs `SELECT ... FOR UPDATE` within transactions, preventing race conditions where multiple users try to transition a task concurrently.
    *   Backend validates user identity and checks for `role === 'ADMIN'` before executing global log requests, returning a `403 Forbidden` response in case of mismatch.
    *   JWT Session token is set via `Set-Cookie` with `HttpOnly`, `SameSite=Lax`, and `Secure` (production only) flags to prevent XSS-based session highjacks.
