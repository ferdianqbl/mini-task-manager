# Project Planning & Architecture - Mini Task Manager

This document acts as the index and development roadmap for the **Mini Task Manager** application.

---

## 1. Document Index

- **Product Requirements**: See [plans/PRD.md](./PRD.md).
- **UI/UX Design**: See [plans/DESIGN.md](./DESIGN.md).
- **System Architecture**: See [plans/SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md).
- **Feature Validation**: See [plans/VALIDATION_RESULTS.md](./VALIDATION_RESULTS.md).
- **API Reference**: See [plans/API.md](./API.md).

---

## 2. Entity Relationship Diagram (ERD)

### Mermaid Specification

```mermaid
erDiagram
    users {
        int id PK
        string username UK
        string password_hash
        timestamp created_at
        timestamp updated_at
    }

    tasks {
        int id PK
        string title
        text description
        enum status "to_do / pending / in_progress / done"
        timestamp created_at
        timestamp updated_at
    }

    audit_logs {
        int id PK
        int task_id FK "ON DELETE SET NULL"
        string task_title
        string actor
        enum old_status "to_do / pending / in_progress / done"
        enum new_status "to_do / pending / in_progress / done"
        timestamp changed_at
    }

    users ||--o{ audit_logs : "creates actions (actor = username)"
    tasks ||--o{ audit_logs : "tracks transitions"
```

### Database Tables (MySQL DDL)

```sql
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('to_do', 'pending', 'in_progress', 'done') NOT NULL DEFAULT 'to_do',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NULL,
    task_title VARCHAR(255) NOT NULL,
    actor VARCHAR(255) NOT NULL,
    old_status ENUM('to_do', 'pending', 'in_progress', 'done') NULL,
    new_status ENUM('to_do', 'pending', 'in_progress', 'done') NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
) ENGINE=InnoDB;
```

---

## 3. Development Roadmap

- [ ] **Step 1: Setup Workspace scaffolding**
  - Clean up goals and habits modules from backend and frontend, preserving `auth` and `user` configurations.
- [ ] **Step 2: Database Schema & Migration**
  - Update DDL in `be/src/db/schema.sql` (defining `users`, `tasks`, and `audit_logs`).
  - Rewrite `be/src/db/migrate.ts` to wait for DB connection and pre-seed default tasks, a default user `demo` (password: `password123`), and initial audit logs.
- [ ] **Step 3: Backend Task Module**
  - Define interfaces in `be/src/modules/task/task.types.ts`.
  - Write SQL repository query methods in `be/src/modules/task/task.repository.ts` implementing MySQL pool transactions.
  - Implement sequential transition checks and idempotency guards in `be/src/modules/task/task.service.ts`.
  - Create REST controller mapping in `be/src/modules/task/task.controller.ts` and routes in `be/src/routes/task.routes.ts` (protect with `authMiddleware`).
- [ ] **Step 4: Frontend Auth Pages**
  - Adapt `fe/src/app/login/page.tsx` and `fe/src/app/register/page.tsx` forms to authenticate the user and save token in `localStorage`.
- [ ] **Step 5: Frontend Task Service & Dashboard**
  - Implement API endpoints call hooks in `fe/src/services/task/use-tasks.ts`.
  - Build dashboard in `fe/src/app/page.tsx` rendering user username, logout, task columns, and modals.
- [ ] **Step 6: Task Actions & Transition Buttons**
  - Display task cards grouped by status. Add sequential progression buttons mapping to PUT status requests.
- [ ] **Step 7: Audit Log Viewer Modal**
  - Create a Radix Dialog modal popup (`task-audit-logs.tsx`) displaying task log list chronologically.
- [ ] **Step 8: Verification & Compilation Checks**
  - Run containers via `docker compose up`. Check TypeScript compilations and run audit-trail test cases.
