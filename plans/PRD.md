# Product Requirements Document (PRD) - Mini Task Manager

## 1. Product Overview
The **Mini Task Manager** is a lightweight internal tool designed to manage tasks and provide transparent auditing of all status changes. 

In internal team settings, tasks frequently change status, but it is often unclear *who* changed *what* and *when*. This tool solves this problem by ensuring that:
1.  Users must register and log in using a username and password to view and manage tasks.
2.  Every status change is logged using the logged-in user's username as the actor.
3.  Audit logs are completely immutable and are preserved even if the task itself is deleted.
4.  The task status follows a strict, logical sequence.
5.  **Role-Based Views**: Users are classified into `USER` and `ADMIN` roles. Administrators can access a centralized global audit log stream displaying all history logs across all users.

---

## 2. Core User Journeys

*   **Authentication (Register, Login, Logout)**: Users sign up with a username and password (role defaults to `USER`). Admins can be seeded or registered. JWT-based sessions carry the user's role payload.
*   **Collaborative Task Board**: All authenticated users (`USER` and `ADMIN`) can create tasks, transition statuses sequentially, and view task-specific logs.
*   **Status Progression**:
    $$\text{to\_do} \rightarrow \text{pending} \rightarrow \text{in\_progress} \rightarrow \text{done}$$
*   **Admin Global Audit Feed**: Logged-in users with the `ADMIN` role can access a "Global Logs" view. This displays a chronological stream of all status changes in the system to facilitate security audits. Standard `USER` accounts are restricted from this view.

---

## 3. Functional Requirements

### User & Role Management
*   **User Registration**: Sign up with username and password (defaults to `USER` role).
*   **Role Identification**: Users have either a `USER` or `ADMIN` role.
*   **Session Security**: API calls require a JWT token. Token payload includes user `id`, `username`, and `role`.

### Task Management
*   **Create Task**: Initial status is `to_do`.
*   **List Tasks**: Fetch and display all active tasks.
*   **Update Task Status**: Move a task to its next valid status.
*   **Delete Task**: Permanently remove a task from the active tasks list.

### State Transition Validation (Domain Rules)
*   Strict sequential transitions: `to_do` $\rightarrow$ `pending` $\rightarrow$ `in_progress` $\rightarrow$ `done`.
*   **Idempotency**: Same-status updates succeed but do not write logs.

### Audit Logging & Access Control
*   **Task Logs**: Every status change writes an audit log recording: task name, actor username, old/new status, and timestamp.
*   **Immutability**: Logs are read-only and preserved even if a task is deleted (`ON DELETE SET NULL`).
*   **Access Levels**:
    *   **Task-Specific Audit Logs**: Readable by any logged-in user.
    *   **Global Audit Logs**: Only accessible by users with the `ADMIN` role. Standard users fetching this endpoint receive a `403 Forbidden` error.

---

## 4. Non-Functional Constraints
*   **Data Consistency**: Status updates and log insertions are handled within database transactions.
*   **Security (RBAC)**: Backend validates the user's role from the JWT signature prior to returning global logs.
