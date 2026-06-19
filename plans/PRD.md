# Product Requirements Document (PRD) - Mini Task Manager

## 1. Product Overview
The **Mini Task Manager** is a lightweight internal tool designed to manage tasks and provide transparent auditing of all status changes. 

In internal team settings, tasks frequently change status, but it is often unclear *who* changed *what* and *when*. This tool solves this problem by ensuring that:
1.  Users must register and log in using a username and password to view and manage tasks.
2.  Every status change is logged using the logged-in user's username as the actor.
3.  Audit logs are completely immutable and are preserved even if the task itself is deleted.
4.  The task status follows a strict, logical sequence.

---

## 2. Core User Journeys

*   **Authentication (Register, Login, Logout)**: Users sign up with a username and password, and log in securely. Sessions are protected via JWT tokens. Users can log out to clear their session.
*   **Task Creation**: Authenticated users can create a task by providing a title and description. The task starts in the `to_do` status.
*   **Task Status Progression**: Authenticated users can transition any task's status sequentially:
    $$\text{to\_do} \rightarrow \text{pending} \rightarrow \text{in\_progress} \rightarrow \text{done}$$
    The UI guides the user to make only valid transitions, and the backend strictly validates them.
*   **Task Deletion**: Authenticated users can delete any task.
*   **Audit Log View**: Authenticated users can view the complete, chronological audit history for a task, which answers:
    *   Which task was changed?
    *   Who made the change (actor - records the logged-in user's username)?
    *   From what status to what status?
    *   When did the change occur?
    *   *Note:* Even if a task is deleted, its audit logs must not be deleted or modified in the database.

---

## 3. Functional Requirements

### User Authentication
*   **User Registration**: Sign up with username and password (passwords are hashed with bcrypt).
*   **User Login**: Authenticate credentials and return a secure JWT.
*   **User Session**: Persist JWT in local storage on the client side, and intercept API requests to add authorization headers.
*   **Logout**: Clear JWT from the client storage.

### Task Management
*   **Create Task**: Users create tasks with a Title (required) and Description (optional). Initial status is `to_do`.
*   **List Tasks**: Fetch and display all active tasks.
*   **Update Task Status**: Move a task to its next valid status.
*   **Delete Task**: Permanently remove a task from the active tasks list.

### State Transition Validation (Domain Rules)
*   The status transitions MUST follow this sequence strictly:
    $$\text{to\_do} \rightarrow \text{pending} \rightarrow \text{in\_progress} \rightarrow \text{done}$$
*   Skipping states or regressing is strictly forbidden and must be rejected by the backend.
*   **Idempotency**: Transitioning to the current status (e.g., updating a `pending` task to `pending`) must succeed but must **not** generate a new audit log entry.

### Audit Logging
*   Every valid status change must trigger the creation of an audit log.
*   Each log must record:
    *   `task_id` (set to `NULL` if task is deleted, via `ON DELETE SET NULL`)
    *   `task_title` (hard-copied on log creation to preserve task name after deletion)
    *   `actor` (string containing the logged-in user's username)
    *   `old_status` (previous status, or `NULL` for initial creation)
    *   `new_status` (updated status)
    *   `changed_at` (timestamp of transition)
*   Audit logs must be read-only and cannot be updated or deleted under any circumstances.

### Non-Functional Constraints
*   **Data Consistency**: Status updates and log writes must be transactional.
*   **Security**: Guard tasks and audit log API endpoints behind the authentication middleware.
