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

Authentication is handled via a secure **HttpOnly cookie** named `token`.
*   The cookie is written by the server on `/api/auth/register` and `/api/auth/login`.
*   The cookie is sent automatically by the browser with every subsequent request.
*   Axios client requests must configure `withCredentials: true`.
*   The backend Express app uses `cookie-parser` to extract the cookie.
*   Once verified, the user's username and ID are bound to the request.
*   Failure to provide a valid session cookie results in a `401 Unauthorized` response.
*   Failure to pass ownership or role checks results in a `403 Forbidden` response.

---

## 📊 Endpoint Summary

| Route Category | Method | Path | Auth? | Required Role | Description | Success Code |
| :--- | :---: | :--- | :---: | :---: | :--- | :---: |
| **Authentication** | `POST` | `/api/auth/register` | No | *Any* | Create a new user & return `Set-Cookie` | `201` |
| **Authentication** | `POST` | `/api/auth/login` | No | *Any* | Authenticate user & return `Set-Cookie` | `200` |
| **Authentication** | `POST` | `/api/auth/logout` | **Yes** | *Any* | Clear session cookie | `200` |
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
*   **Response Headers**:
    `Set-Cookie: token=eyJhbGci...; HttpOnly; SameSite=Lax; Max-Age=604800`
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
        }
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
*   **Response Headers**:
    `Set-Cookie: token=eyJhbGci...; HttpOnly; SameSite=Lax; Max-Age=604800`
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
        }
      }
    }
    ```

#### `POST /api/auth/logout`
*   **Response Headers**:
    `Set-Cookie: token=; HttpOnly; SameSite=Lax; Max-Age=0`
*   **Success Response (200 OK)**:
    ```json
    {
      "success": true,
      "code": 200,
      "message": "Logged out successfully.",
      "data": null
    }
    ```

---

### 2. Task Management

#### `GET /api/tasks`
*   **Headers**: `Cookie: token=eyJhbGci...`
*   **Success Response (200 OK - Standard User)**:
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

#### `GET /api/tasks/:id/audit-logs`
*   **Headers**: `Cookie: token=eyJhbGci...`
*   **Success Response (200 OK - Standard User)**:
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

---

### 3. Admin Audits

#### `GET /api/tasks/global-audit-logs`
*   **Headers**: `Cookie: token=eyJhbGci...`
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
        }
      ]
    }
    ```
