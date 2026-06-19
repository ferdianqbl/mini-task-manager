# System Architecture - Mini Task Manager

This document breaks down the technology stack, library details, folder structures, and multi-container topology for the **Mini Task Manager** application.

---

## 1. Stack Selection & Libraries Detail

### A. Frontend Service (`fe/`)
*   **Core Framework**: **Next.js (App Router)** - Binds to port `3000`.
*   **Styling**: **Tailwind CSS v4** & **Radix UI** primitives.
*   **Libraries**:
    *   `@tanstack/react-query` — Client caching and API state synchronization.
    *   `@radix-ui/react-dialog` — Accessible centered modal overlays for viewing task audit logs.
    *   `sonner` — Lightweight confirmation and error toast notifications.
    *   `axios` — Promise-based HTTP client. Features an interceptor to automatically attach JWT header from `localStorage`.
    *   `lucide-react` — Accessible vector SVG icons (e.g. `ClipboardList`, `CheckCircle`, `Calendar`, `History`, `User`, `LogIn`, `LogOut`).

### B. Backend Service (`be/`)
*   **Runtime**: **Node.js** with **Express** & **TypeScript** - Binds to port `5001`.
*   **Libraries**:
    *   `mysql2` — High-performance MySQL client supporting pool connections and transactions.
    *   `jsonwebtoken` — Signature verification of sessions inside authorization middleware.
    *   `bcryptjs` — Blowfish password hashing for safe user profile creation.
    *   `cors` — Standard middleware enabling safe requests from the frontend origin.
    *   `dotenv` — Configuration manager mapping environment variables.
    *   `ts-node-dev` — Dev-mode hot reloader.

---

## 2. Folder Structure

### A. Frontend (`fe/`)
```
fe/
├── Dockerfile                # alpine node development configuration
├── package.json              # Next.js, Radix, Tailwind, TanStack Query
├── tsconfig.json             # compiler config
└── src/
    ├── app/
    │   ├── layout.tsx        # Base document shell (mounting providers, fonts)
    │   ├── globals.css       # Tailwind v4 theme configurations
    │   ├── page.tsx          # Dashboard page containing Task columns
    │   ├── login/
    │   │   └── page.tsx      # Sign-in panel
    │   ├── register/
    │   │   └── page.tsx      # Sign-up panel
    │   └── providers.tsx     # TanStack query client provider
    ├── components/
    │   ├── ui/               # Radix Dialog, Card, Button, Input, Sonner
    │   └── features/
    │       ├── auth/
    │       │   ├── login-form.tsx      # Authenticating forms
    │       │   └── register-form.tsx   # Register forms
    │       └── tasks/
    │           ├── task-card.tsx       # Renders task title, status badge & next-state buttons
    │           ├── task-dialog.tsx     # Modal to add a new task
    │           └── task-audit-logs.tsx # Modal to display task audit logs
    ├── context/
    │   └── auth-context.tsx  # Coordinates user login/registration tokens
    ├── lib/
    │   ├── api.ts            # Axios configuration & JWT headers injector interceptor
    │   └── utils.ts          # Merging Tailwind classes
    └── services/
        └── task/             # Task API queries and React Query hooks
            ├── index.ts      # Exporter
            └── use-tasks.ts  # TanStack query hooks for tasks
```

### B. Backend (`be/`)
```
be/
├── Dockerfile                # alpine Node container config
├── package.json              # Express TS runtime settings
├── tsconfig.json             # compiler settings
└── src/
    ├── server.ts             # Server entry point
    ├── db/
    │   ├── db.ts             # MySQL pool initialization
    │   ├── migrate.ts        # Wait-for-DB helper and SQL migration runner
    │   └── schema.sql        # Tables DDL (users, tasks, audit_logs)
    ├── routes/
    │   ├── index.ts          # Mounts route sub-directories
    │   ├── auth.routes.ts    # Authentication API paths
    │   ├── user.routes.ts    # User profile API paths
    │   └── task.routes.ts    # Routes for Tasks CRUD & log fetch
    └── modules/
        ├── auth/
        │   ├── auth.middleware.ts # JWT authentication guard
        │   ├── auth.controller.ts # Login/register HTTP endpoint mapping
        │   └── auth.service.ts    # Token validation and signers
        ├── user/
        │   ├── user.repository.ts # User database queries
        │   ├── user.service.ts    # Business logic for users
        │   └── user.controller.ts # Express routes mapper
        └── task/
            ├── task.controller.ts # Express request/response mapper
            ├── task.service.ts    # State machine transition rules & transactions
            ├── task.repository.ts # Raw MySQL transaction-aware queries
            └── task.types.ts      # TypeScript interfaces and enum validators
```

---

## 3. Container Topology & Service Relations

Orchestrated using `compose.yml` on a shared bridge network (`task-manager-network`):

```
                        ┌────────────────────────┐
                        │      compose.yml       │
                        └────────────────────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             ▼                      ▼                      ▼
    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │     db (db)     │    │  backend (be)   │    │  frontend (fe)  │
    │  - Image: mysql │    │  - Port: 3306   │    │  - Port: 3000   │
    │  - Port: 3306   │    │  - Port: 5001   │    │  - Port: 3000   │
    └─────────────────┘    └─────────────────┘    └─────────────────┘
             ▲                      │                      │
             │ (healthcheck check)  │                      │
             └──────────────────────┴──────────────────────┘
```

*   **Database Health Check**: The database container exposes a health check ping. The backend container depends on this health check being healthy (`condition: service_healthy`) before booting, preventing startup crashes.
*   **Persistence**: MySQL writes to a named volume `task-manager-db-data` to preserve tasks and audit logs across containers being stopped.
