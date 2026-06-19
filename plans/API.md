# Mini Task Manager API Specification

This document details the REST API endpoints, request/response structures, authorization rules, and error codes for the **Mini Task Manager** backend service.

---

## 🌐 Base URL & Envelope

All requests utilize JSON envelopes for responses to maintain parsing consistency.
- **Base API Path**: `/api`
- **Port**: `5001`
- **Content-Type**: `application/json`

### Success Response Envelope (`ApiResponse<T>`)
```json
{
  "success": true,
  "code": 200,
  "message": "Resource action succeeded.",
  "data": { ... }
}
```

### Error Response Envelope (`ApiResponse<null>`)
```json
{
  "success": false,
  "code": 400,
  "message": "Detailed validation or system error description.",
  "data": null
}
```

---

## 🔑 Authentication & Authorization

Endpoints marked with **Auth? Yes** expect a JSON Web Token (JWT) sent via HTTP headers:
```http
Authorization: Bearer <your_jwt_token_here>
```
*   The token is verified by the backend using a secure middleware.
*   Once verified, the user's username is bound to the request and automatically used as the `actor` in audit log operations.
*   The user's role (`ADMIN` or `USER`) is validated when accessing guarded admin routes.
*   Failure to provide a valid token results in a `401 Unauthorized` response.
*   Failure to pass role checks (e.g. standard `USER` calling an `ADMIN` route) results in a `403 Forbidden` response.

---

## 📊 Endpoint Summary

| Route Category | Method | Path | Auth? | Required Role | Description | Success Code |
| :--- | :---: | :--- | :---: | :---: | :--- | :---: |
| **Authentication** | `POST` | `/api/auth/register` | No | *Any* | Create a new user profile & return token | `201` |
| **Authentication** | `POST` | `/api/auth/login` | No | *Any* | Authenticate user & return token | `200` |
| **User Profile** | `GET` | `/api/users/me` | **Yes** | *Any* | Fetch current logged-in user profile | `200` |
| **Tasks** | `GET` | `/api/tasks` | **Yes** | *Any* | Retrieve all active tasks | `200` |
| **Tasks** | `POST` | `/api/tasks` | **Yes** | *Any* | Create a task (starts as `to_do`) | `201` |
| **Tasks** | `PUT` | `/api/tasks/:id/status`| **Yes** | *Any* | Transition task status | `200` |
| **Tasks** | `DELETE` | `/api/tasks/:id` | **Yes** | *Any* | Delete a task (audit logs remain) | `200` |
| **Tasks** | `GET` | `/api/tasks/:id/audit-logs`| **Yes** | *Any* | Fetch chronological task audit logs | `200` |
| **Tasks** | `GET` | `/api/tasks/global-audit-logs`| **Yes** | **ADMIN** | Fetch **all** audit logs in the system | `200` |

---

## 📂 Endpoint Details

### 1. Authentication

#### `POST /api/auth/register`
*   **Request Body**:
    ```json
    {
      "username": "johndoe",
      "password": "securepassword123"
    }
    ```
*   **Success Response (201 Created)**:
    ```json
    {
      "success": true,
      "code": 201,
      "message": "User registered successfully.",
      "data": {
        "user": {
          "id": 1,
          "username": "johndoe",
          "role": "USER"
        },
        "token": "eyJhbGciOiJIUzI1NiIsIn..."
      }
    }
    ```

#### `POST /api/auth/login`
*   **Request Body**:
    ```json
    {
      "username": "johndoe",
      "password": "securepassword123"
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
      "success": true,
      "code": 200,
      "message": "User logged in successfully.",
      "data": {
        "user": {
          "id": 1,
          "username": "johndoe",
          "role": "USER"
        },
        "token": "eyJhbGciOiJIUzI1NiIsIn..."
      }
    }
    ```

---

### 2. Task Management

#### `GET /api/tasks`
*   **Headers**: `Authorization: Bearer <token>`
*   **Success Response (200 OK)**:
    ```json
    {
      "success": true,
      "code": 200,
      "message": "Tasks list retrieved successfully.",
      "data": [
        {
          "id": 1,
          "title": "Prepare Invoice",
          "description": "Send June invoice to client.",
          "status": "pending",
          "created_at": "2026-06-19T03:00:00.000Z",
          "updated_at": "2026-06-19T03:10:00.000Z"
        }
      ]
    }
    ```

#### `POST /api/tasks`
*   **Headers**: `Authorization: Bearer <token>`
*   **Request Body**:
    ```json
    {
      "title": "Setup Server Logs",
      "description": "Configure logrotate for Express server."
    }
    ```
*   **Success Response (201 Created)**:
    ```json
    {
      "success": true,
      "code": 201,
      "message": "Task created successfully.",
      "data": {
        "id": 3,
        "title": "Setup Server Logs",
        "description": "Configure logrotate for Express server.",
        "status": "to_do",
        "created_at": "2026-06-19T03:30:00.000Z",
        "updated_at": "2026-06-19T03:30:00.000Z"
      }
    }
    ```

#### `PUT /api/tasks/:id/status`
*   **Headers**: `Authorization: Bearer <token>`
*   **Request Body**:
    ```json
    {
      "status": "pending"
    }
    ```
*   **Success Response (200 OK - Successful Transition)**:
    ```json
    {
      "success": true,
      "code": 200,
      "message": "Task status updated successfully.",
      "data": {
        "id": 3,
        "title": "Setup Server Logs",
        "status": "pending",
        "created_at": "2026-06-19T03:30:00.000Z",
        "updated_at": "2026-06-19T03:40:00.000Z"
      }
    }
    ```

#### `DELETE /api/tasks/:id`
*   **Headers**: `Authorization: Bearer <token>`
*   **Success Response (200 OK)**:
    ```json
    {
      "success": true,
      "code": 200,
      "message": "Task deleted successfully.",
      "data": {
        "id": 3
      }
    }
    ```

#### `GET /api/tasks/:id/audit-logs`
*   **Headers**: `Authorization: Bearer <token>`
*   **Success Response (200 OK)**:
    ```json
    {
      "success": true,
      "code": 200,
      "message": "Audit logs retrieved successfully.",
      "data": [
        {
          "id": 10,
          "task_id": 3,
          "task_title": "Setup Server Logs",
          "actor": "johndoe",
          "old_status": null,
          "new_status": "to_do",
          "changed_at": "2026-06-19T03:30:00.000Z"
        }
      ]
    }
    ```

---

### 3. Admin Audits

#### `GET /api/tasks/global-audit-logs`
Retrieves a global stream of all status changes across the entire system.

*   **Headers**: `Authorization: Bearer <token>` *(Token must have role set to `ADMIN`)*
*   **Success Response (200 OK)**:
    ```json
    {
      "success": true,
      "code": 200,
      "message": "Global audit logs retrieved successfully.",
      "data": [
        {
          "id": 10,
          "task_id": 3,
          "task_title": "Setup Server Logs",
          "actor": "johndoe",
          "old_status": null,
          "new_status": "to_do",
          "changed_at": "2026-06-19T03:30:00.000Z"
        },
        {
          "id": 11,
          "task_id": 1,
          "task_title": "Prepare Invoice",
          "actor": "adminuser",
          "old_status": "pending",
          "new_status": "in_progress",
          "changed_at": "2026-06-19T03:35:00.000Z"
        }
      ]
    }
    ```
*   **Errors**:
    *   `403 Forbidden` — Token verified but user lacks `ADMIN` privileges.
        ```json
        {
          "success": false,
          "code": 403,
          "message": "Forbidden. This resource requires administrator privileges.",
          "data": null
        }
        ```
