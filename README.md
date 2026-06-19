# Mini Task Manager

A secure, audit-ready full-stack task management application with role-based visibility (`USER` and `ADMIN`) and immutable status change logs.

---

## 🚀 Quick Start (Docker Compose)

The entire application stack is containerized. No local installation of Node.js, TypeScript, or MySQL is required on your host machine.

### Prerequisites
*   [Docker](https://www.docker.com/get-started)
*   [Docker Compose](https://docs.docker.com/compose/install/)

### Running the Application
1.  **Clone the repository** and navigate to the project root.
2.  **Create the environment variables file**:
    ```bash
    cp .env.example .env
    ```
3.  **Launch the services**:
    ```bash
    docker compose up --build
    ```
4.  **Access the application**:
    *   **Frontend Dashboard**: `http://localhost:3000`
    *   **Backend API server**: `http://localhost:5001`
    *   **MySQL database**: `localhost:3306`

### Pre-seeded Demo Credentials
To help review the application immediately, the database is auto-seeded on first boot with:
1.  **Administrator Account**:
    *   **Username**: `admin`
    *   **Password**: `admin123`
    *   *Privileges:* Can view all tasks, view all task audit logs, and access the global system audit log stream.
2.  **Standard User Account**:
    *   **Username**: `demo`
    *   **Password**: `password123`
    *   *Privileges:* Can only manage and view their own tasks, and view their own log actions ("self logs").

---

## 🛠️ Architecture & Tech Stack

*   **Frontend:** React (Next.js App Router), TypeScript, Tailwind CSS v4, Radix UI Dialog, Axios, and TanStack React Query.
*   **Backend:** Node.js, Express, TypeScript, and native MySQL (`mysql2` connection pool).
*   **Database:** MySQL 8.0 with named volumes for persistence.
*   **Authentication & Security:** JWT session token stored in secure, HttpOnly cookies (`Cookie: token=...`), guarding requests against XSS attacks.
*   **Design Pattern:** Repository-Service-Controller (RSC) on the backend for clean separation of concerns.

---

## 📝 Technical Decisions, Assumptions & Trade-offs

### Assumptions Taken
1.  **Shared vs. Personal Tasks:** To make user roles meaningful, we assumed a task ownership model. A standard `USER` manages their personal tasks and sees only their own actions. An `ADMIN` acts as an supervisor who can see all tasks, all logs, and a global log feed.
2.  **Sequential State Machine:** Tasks must transition strictly as follows:
    $$\text{to\_do} \rightarrow \text{pending} \rightarrow \text{in\_progress} \rightarrow \text{done}$$
    No shortcuts (e.g. `to_do` $\rightarrow$ `in_progress`) or regressions (e.g. `in_progress` $\rightarrow$ `pending`) are allowed.
3.  **Log Permanence:** If a task is deleted, its audit logs must not be deleted. We copy the task's title into the log row (`task_title`) and use `ON DELETE SET NULL` on the `task_id` foreign key.

### Trade-offs Made
1.  **Session Cookies over Authorization Headers:** Storing JWTs in HttpOnly cookies increases XSS protection but introduces CSRF risks. We mitigated this by setting the `SameSite=Lax` cookie policy.
2.  **Raw SQL Pools over ORMs:** Using raw SQL via `mysql2/promise` gives maximum performance and control over transaction locks but increases query management overhead compared to Prisma or TypeORM.

---

## ❓ Essay Questions & Answers

### 1. Bagaimana kamu memastikan audit log tidak ter-modifikasi? (How do you ensure audit logs are not modified?)
*   **Database Engine Restrictions:** The database schema has no triggers or endpoints that execute SQL `UPDATE` or `DELETE` on the `audit_logs` table. Only `INSERT` and `SELECT` are implemented in code.
*   **No Mutating API Routes:** The backend REST API strictly exposes `GET` endpoints for audit log retrieval. No `PUT`, `PATCH`, or `DELETE` routes exist for logs.
*   **Task Deletion Safety:** The foreign key `task_id` is configured with `ON DELETE SET NULL`. Deleting a task keeps the log row intact. The task title is hard-copied into the log row as `task_title` at creation time, preserving log readability.
*   **Production Hardening:** In a real production deployment, we would grant the database user connection only `INSERT` and `SELECT` privileges on the `audit_logs` table, preventing modifications even if the backend application is compromised.

### 2. Bagian mana dari solusi ini yang paling berisiko jika digunakan oleh banyak user? (Which part is most risky under high concurrency?)
*   **State Machine Race Conditions:** If multiple users attempt to update a task's status concurrently, race conditions could lead to invalid sequence jumps or double-logging.
    *   *Mitigation:* Status transitions are locked using a database transaction with a row-level lock (`SELECT ... FOR UPDATE` on the task row), serializing updates.
*   **Connection Pool Contention:** High concurrent requests will exhaust the connection pool limit. Long-running locks on the `tasks` table under heavy load could cause transaction timeouts.

### 3. Jika task ini berkembang menjadi sistem besar, bagian mana yang akan kamu refactor terlebih dahulu dan kenapa? (What would you refactor first for a large system?)
*   **Audit Log Database Split:** Storing audit logs in the same relational database as active tasks will affect query performance as logs grow. I would refactor audit logging into an asynchronous event-driven system (e.g. via RabbitMQ/Kafka) publishing to an append-only NoSQL log store (like Elasticsearch, AWS CloudWatch, or BigQuery).
*   **ORM Integration:** As the business logic grows, I would integrate Prisma or TypeORM to replace raw SQL queries, improving type safety, migration tracking, and code maintenance.

### 4. Jika kamu menggunakan AI, jelaskan bagian mana yang dibantu AI dan bagaimana kamu memvalidasinya. (How did AI assist you and how did you validate it?)
*   **AI Assistance:** The AI (Antigravity coding assistant) helped generate initial workspace scaffolding configurations (e.g. `tsconfig.json`, `compose.yml`), standard Tailwind CSS v4 styling rules, and raw SQL queries.
*   **Validation Methods:**
    *   *TypeScript Compilation:* Running `tsc --noEmit` and build commands to verify type safety.
    *   *Manual Testing:* Triggering invalid status transitions and verifying the backend rejects them with `400 Bad Request`.
    *   *Database Integrity Checks:* Simulating task deletions and verifying the database retained the corresponding audit logs with `task_id = NULL` and the title intact.
