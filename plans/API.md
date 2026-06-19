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
*   Failure to provide a valid token results in a `401 Unauthorized` response envelope.

---

## 📊 Endpoint Summary

| Route Category | Method | Path | Auth? | Description | Success Code |
| :--- | :---: | :--- | :---: | :--- | :---: |
| **Authentication** | `POST` | `/api/auth/register` | No | Create a new user profile & return token | `201` |
| **Authentication** | `POST` | `/api/auth/login` | No | Authenticate user & return token | `200` |
| **User Profile** | `GET` | `/api/users/me` | **Yes** | Fetch current logged-in user profile | `200` |
| **Tasks** | `GET` | `/api/tasks` | **Yes** | Retrieve all active tasks | `200` |
| **Tasks** | `POST` | `/api/tasks` | **Yes** | Create a task (starts as `to_do`) | `201` |
| **Tasks** | `PUT` | `/api/tasks/:id/status`| **Yes** | Transition task status | `200` |
| **Tasks** | `DELETE` | `/api/tasks/:id` | **Yes** | Delete a task (audit logs remain) | `200` |
| **Tasks** | `GET` | `/api/tasks/:id/audit-logs`| **Yes** | Fetch chronological task audit logs | `200` |

---

## 📂 Endpoint Details

### 1. Authentication

#### `POST /api/auth/register`
Registers a new user and generates a session token.

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
          "username": "johndoe"
        },
        "token": "eyJhbGciOiJIUzI1NiIsIn..."
      }
    }
    ```

#### `POST /api/auth/login`
Authenticates credentials and returns a session token.

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
          "username": "johndoe"
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
    *(Note: `actor` is extracted by the backend from the JWT bearer token, securing the audit log).*
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
*   **Errors**:
    *   `400 Bad Request` — Invalid state transition (e.g. `to_do` $\rightarrow$ `in_progress`).
        ```json
        {
          "success": false,
          "code": 400,
          "message": "Invalid status transition from 'to_do' to 'in_progress'. Status must transition in sequence: to_do -> pending -> in_progress -> done.",
          "data": null
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
        },
        {
          "id": 11,
          "task_id": 3,
          "task_title": "Setup Server Logs",
          "actor": "johndoe",
          "old_status": "to_do",
          "new_status": "pending",
          "changed_at": "2026-06-19T03:40:00.000Z"
        }
      ]
    }
    ```
