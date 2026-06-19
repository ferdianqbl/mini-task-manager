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
*   Once verified, the user's username and ID are bound to the request.
*   The user's role (`ADMIN` or `USER`) is validated when accessing routes:
    *   `USER` can only access tasks where `tasks.user_id = logged_in_user.id`.
    *   `ADMIN` can access any task.
*   Failure to provide a valid token results in a `401 Unauthorized` response.
*   Failure to pass ownership or role checks results in a `403 Forbidden` response.

---

## 📊 Endpoint Summary

| Route Category | Method | Path | Auth? | Required Role | Description | Success Code |
| :--- | :---: | :--- | :---: | :---: | :--- | :---: |
| **Authentication** | `POST` | `/api/auth/register` | No | *Any* | Create a new user profile & return token | `201` |
| **Authentication** | `POST` | `/api/auth/login` | No | *Any* | Authenticate user & return token | `200` |
| **User Profile** | `GET` | `/api/users/me` | **Yes** | *Any* | Fetch current logged-in user profile | `200` |
| **Tasks** | `GET` | `/api/tasks` | **Yes** | *Any* | Retrieve active tasks (filtered by user unless ADMIN) | `200` |
| **Tasks** | `POST` | `/api/tasks` | **Yes** | *Any* | Create a task (starts as `to_do`, owned by user) | `201` |
| **Tasks** | `PUT` | `/api/tasks/:id/status`| **Yes** | *Any* | Transition status (guarded by ownership/role) | `200` |
| **Tasks** | `DELETE` | `/api/tasks/:id` | **Yes** | *Any* | Delete task (guarded by ownership/role) | `200` |
| **Tasks** | `GET` | `/api/tasks/:id/audit-logs`| **Yes** | *Any* | Fetch task audit logs (filtered to self unless ADMIN) | `200` |
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
*   **Success Response (200 OK - Standard User)**:
    *(Returns only tasks owned by this user)*
    ```json
    {
      "success": true,
      "code": 200,
      "message": "Tasks list retrieved successfully.",
      "data": [
        {
          "id": 1,
          "user_id": 1,
          "title": "Prepare Invoice",
          "description": "Send June invoice to client.",
          "status": "pending",
          "created_at": "2026-06-19T03:00:00.000Z",
          "updated_at": "2026-06-19T03:10:00.000Z"
        }
      ]
    }
    ```
*   **Success Response (200 OK - Admin)**:
    *(Returns all tasks with creator username details)*
    ```json
    {
      "success": true,
      "code": 200,
      "message": "Tasks list retrieved successfully.",
      "data": [
        {
          "id": 1,
          "user_id": 1,
          "title": "Prepare Invoice",
          "description": "Send June invoice to client.",
          "status": "pending",
          "creator_username": "johndoe",
          "created_at": "2026-06-19T03:00:00.000Z",
          "updated_at": "2026-06-19T03:10:00.000Z"
        },
        {
          "id": 2,
          "user_id": 2,
          "title": "Setup Server Logs",
          "description": "Configure logrotate.",
          "status": "to_do",
          "creator_username": "jane.smith",
          "created_at": "2026-06-19T03:30:00.000Z",
          "updated_at": "2026-06-19T03:30:00.000Z"
        }
      ]
    }
    ```

#### `GET /api/tasks/:id/audit-logs`
*   **Headers**: `Authorization: Bearer <token>`
*   **Success Response (200 OK - Standard User)**:
    *(Returns only logs where actor is the current user)*
    ```json
    {
      "success": true,
      "code": 200,
      "message": "Audit logs retrieved successfully.",
      "data": [
        {
          "id": 10,
          "task_id": 1,
          "task_title": "Prepare Invoice",
          "actor": "johndoe",
          "old_status": null,
          "new_status": "to_do",
          "changed_at": "2026-06-19T03:00:00.000Z"
        }
      ]
    }
    ```
*   **Success Response (200 OK - Admin)**:
    *(Returns all logs for that task regardless of actor)*
    ```json
    {
      "success": true,
      "code": 200,
      "message": "Audit logs retrieved successfully.",
      "data": [
        {
          "id": 10,
          "task_id": 1,
          "task_title": "Prepare Invoice",
          "actor": "johndoe",
          "old_status": null,
          "new_status": "to_do",
          "changed_at": "2026-06-19T03:00:00.000Z"
        },
        {
          "id": 11,
          "task_id": 1,
          "task_title": "Prepare Invoice",
          "actor": "jane.smith",
          "old_status": "to_do",
          "new_status": "pending",
          "changed_at": "2026-06-19T03:10:00.000Z"
        }
      ]
    }
    ```
