# Product Requirements Document (PRD) - Mini Task Manager

## 1. Product Overview
The **Mini Task Manager** is a lightweight internal tool designed to manage tasks and provide transparent auditing of all status changes. 

In internal team settings, tasks frequently change status, but it is often unclear *who* changed *what* and *when*. This tool solves this problem by ensuring that:
1.  Users must register and log in using a username and password to view and manage tasks.
2.  Every status change is logged using the logged-in user's username as the actor.
3.  Audit logs are completely immutable and are preserved even if the task itself is deleted.
4.  The task status follows a strict, logical sequence.
5.  **Role-Based Access & Visibility**:
    *   Standard `USER` accounts can only manage tasks they created and see their own log entries ("self log") for those tasks.
    *   `ADMIN` accounts can manage all tasks in the system, view all log entries by any user, and view a centralized global audit feed.

---

## 2. Core User Journeys

*   **Authentication (Register, Login, Logout)**: Users sign up with a username and password (role defaults to `USER`). JWT-based sessions carry the user's role payload.
*   **User Task Board**: Standard `USER` accounts can create tasks, transition statuses sequentially, delete their tasks, and view logs of their tasks. However, standard users are restricted to only seeing their own log entries (their own actions).
*   **Admin Overseer Board**: Users with the `ADMIN` role see **all tasks** created by all users on their dashboard, can transition or delete any task, and view **all audit logs** from all users.
*   **Admin Global Audit Feed**: Users with the `ADMIN` role can access a "Global Logs" view displaying a chronological stream of all status changes across the entire system.

---

## 3. Functional Requirements

### User & Role Management
*   **User Registration**: Sign up with username and password (defaults to `USER` role).
*   **Role Identification**: Users have either a `USER` or `ADMIN` role.

### Task Management
*   **Create Task**: Initial status is `to_do`, owned by the creator (`user_id`).
*   **List Tasks**:
    *   Standard `USER` only sees tasks they created.
    *   `ADMIN` sees all tasks.
*   **Update Task Status**: Move a task to its next valid status. Checked for ownership (for `USER`) or admin override.
*   **Delete Task**: Checked for ownership (for `USER`) or admin override.

### State Transition Validation (Domain Rules)
*   Strict sequential transitions: `to_do` $\rightarrow$ `pending` $\rightarrow$ `in_progress` $\rightarrow$ `done`.
*   **Idempotency**: Same-status updates succeed but do not write logs.

### Audit Logging & Access Control
*   **Task Logs**: Every status change writes an audit log recording: task name, actor username, old/new status, and timestamp.
*   **Immutability**: Logs are read-only and preserved even if a task is deleted (`ON DELETE SET NULL`).
*   **Access Levels**:
    *   **Task-Specific Audit Logs**: 
        *   `USER` can only view log rows where `actor = logged_in_username`.
        *   `ADMIN` can view all log rows.
    *   **Global Audit Logs**: Only accessible by users with the `ADMIN` role.
