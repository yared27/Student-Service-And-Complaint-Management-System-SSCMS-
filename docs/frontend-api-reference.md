# SSCMS Frontend API Reference

Last updated: 2026-04-16
Base URL: `http://localhost:5000/api`

## 1. Auth & Session

### `POST /auth/register-student`

Create a student account.

Request body:

```json
{
  "fullName": "Jane Doe",
  "studentId": "STU-2026-001",
  "campus": "Main Campus",
  "department": "Computer Science",
  "password": "strong-password"
}
```

Success `201`:

```json
{
  "message": "Account created successfully. Please login.",
  "user": {
    "id": "uuid",
    "name": "Jane Doe",
    "username": "STU-2026-001",
    "email": null,
    "role": "STUDENT",
    "campus": "Main Campus",
    "department": "Computer Science",
    "status": "ACTIVE"
  }
}
```

### `POST /auth/login`

Login and start session.

Request body:

```json
{
  "identity": "student",
  "identifier": "STU-2026-001",
  "password": "strong-password",
  "rememberMe": true
}
```

Success `200`:

```json
{
  "message": "Login successful.",
  "token": "access-jwt",
  "refreshToken": "refresh-jwt",
  "accessTokenExpiresIn": "7d",
  "refreshTokenExpiresAt": "2026-05-16T12:00:00.000Z",
  "user": {
    "id": "uuid",
    "name": "Jane Doe",
    "username": "STU-2026-001",
    "email": null,
    "role": "STUDENT",
    "campus": "Main Campus",
    "department": "Computer Science",
    "status": "ACTIVE"
  }
}
```

### `POST /auth/refresh`

Rotate session and get new tokens.

Request body:

```json
{
  "refreshToken": "refresh-jwt"
}
```

Success `200`:

```json
{
  "message": "Session refreshed.",
  "token": "new-access-jwt",
  "refreshToken": "new-refresh-jwt",
  "accessTokenExpiresIn": "12h",
  "refreshTokenExpiresAt": "2026-05-16T12:00:00.000Z",
  "user": { "id": "uuid", "role": "STUDENT" }
}
```

### `POST /auth/logout`

Revoke one refresh token.

Request body:

```json
{
  "refreshToken": "refresh-jwt"
}
```

Success `200`:

```json
{ "message": "Logged out." }
```

### `POST /auth/logout-all` (requires auth)

Revoke all sessions for current user.

Headers:

- `Authorization: Bearer <access-token>`

Success `200`:

```json
{
  "message": "Logged out from all devices.",
  "revokedSessions": 3
}
```

### Password endpoints

- `POST /auth/forgot-password` body: `{ "identifier": "email-or-username" }`
- `POST /auth/reset-password` body: `{ "token": "reset-token", "newPassword": "new-password" }`
- `POST /auth/change-password` (auth required) body: `{ "currentPassword": "old", "newPassword": "new" }`

Notes:

- `forgot-password` always returns 200 (anti-user-enumeration behavior).
- In non-production environments, forgot-password may include `resetToken` in the response.

---

## 2. Current User

### `GET /users/me` (requires auth)

Get signed-in user profile.

Success `200`:

```json
{
  "user": {
    "id": "uuid",
    "username": "STU-2026-001",
    "name": "Jane Doe",
    "email": null,
    "role": "STUDENT",
    "status": "ACTIVE",
    "campus": "Main Campus",
    "department": "Computer Science",
    "phone": null,
    "profileImage": null,
    "strikeCount": 0,
    "isFlagged": false,
    "suspensionEndsAt": null,
    "createdAt": "2026-04-16T11:00:00.000Z"
  }
}
```

### `PATCH /users/me` (requires auth)

Update own profile.

Request body (any subset):

```json
{
  "name": "Jane D.",
  "phone": "+1234567890",
  "profileImage": "https://...",
  "department": "Information Systems"
}
```

Success `200`:

```json
{
  "message": "Profile updated.",
  "user": { "id": "uuid", "name": "Jane D." }
}
```

---

## 3. Uploads (Cloudinary)

### `POST /uploads/images` (requires auth)

Upload image files (multipart).

Content type:

- `multipart/form-data`
- field name: `files` (multiple)

Limits:

- max 6 files
- max 8 MB each
- allowed types: jpeg/png/webp/gif

Success `201`:

```json
{
  "message": "Files uploaded successfully.",
  "files": [
    {
      "url": "https://res.cloudinary.com/...",
      "publicId": "sscms/service-requests/...",
      "width": 1280,
      "height": 720,
      "format": "jpg",
      "bytes": 145321
    }
  ]
}
```

Validation errors `400` examples:

```json
{ "message": "You can upload up to 6 files." }
```

```json
{ "message": "Each file must be 8MB or smaller." }
```

```json
{ "message": "Only image files are allowed." }
```

---

## 4. Complaints

### `POST /complaints` (requires auth)

Create complaint.

Request body:

```json
{
  "title": "Tuition Overcharge",
  "description": "Detailed complaint text...",
  "priority": "MEDIUM",
  "attachmentUrls": [
    {
      "url": "https://res.cloudinary.com/...",
      "publicId": "sscms/service-requests/...",
      "width": 1280,
      "height": 720,
      "format": "jpg",
      "bytes": 145321
    }
  ]
}
```

`attachmentUrls` can also be a string array for backward compatibility:

```json
{
  "attachmentUrls": ["https://res.cloudinary.com/..."]
}
```

Success `201`:

```json
{
  "message": "Complaint submitted.",
  "complaint": {
    "id": "uuid",
    "title": "Tuition Overcharge",
    "description": "Detailed complaint text...",
    "status": "SUBMITTED",
    "priority": "MEDIUM",
    "attachments": [
      {
        "id": "uuid",
        "url": "https://res.cloudinary.com/...",
        "publicId": "sscms/service-requests/...",
        "width": 1280,
        "height": 720,
        "format": "jpg",
        "bytes": 145321,
        "createdAt": "2026-04-16T12:00:00.000Z"
      }
    ]
  }
}
```

### `GET /complaints` (requires auth)

List complaints (role-filtered server-side).

Query params:

- `status` (optional)
- `priority` (optional)
- `page` (optional, default 1)
- `limit` (optional, default 20, max 100)

Success `200`:

```json
{
  "total": 12,
  "page": 1,
  "limit": 20,
  "items": [
    {
      "id": "uuid",
      "title": "Tuition Overcharge",
      "description": "...",
      "status": "UNDER_REVIEW",
      "priority": "MEDIUM",
      "createdAt": "2026-04-16T10:00:00.000Z",
      "attachments": []
    }
  ]
}
```

### `GET /complaints/:id` (requires auth)

Get one complaint with attachments.

Success `200`:

```json
{
  "complaint": {
    "id": "uuid",
    "title": "Tuition Overcharge",
    "description": "...",
    "status": "UNDER_REVIEW",
    "priority": "MEDIUM",
    "attachments": [
      {
        "id": "uuid",
        "url": "https://res.cloudinary.com/...",
        "publicId": "sscms/service-requests/...",
        "width": 1280,
        "height": 720,
        "format": "jpg",
        "bytes": 145321,
        "createdAt": "2026-04-16T12:00:00.000Z"
      }
    ]
  }
}
```

### Complaint assignment and status endpoints

- `PATCH /complaints/:id/assignment` (manager/admin roles)
- `PATCH /complaints/:id/status` (manager/admin/investigator roles)

Status enum:

- `SUBMITTED`
- `UNDER_REVIEW`
- `IN_PROGRESS`
- `RESOLVED`
- `REJECTED`

---

## 5. Service Requests

### `POST /service-requests` (requires auth)

Create service request.

Request body:

```json
{
  "title": "Leaking pipe in dorm",
  "description": "Water leaking near sink",
  "priority": "HIGH",
  "attachmentUrls": ["https://res.cloudinary.com/..."]
}
```

Success `201`:

```json
{
  "message": "Service request submitted.",
  "serviceRequest": {
    "id": "uuid",
    "title": "Leaking pipe in dorm",
    "status": "SUBMITTED",
    "priority": "HIGH"
  }
}
```

### `GET /service-requests` (requires auth)

List service requests (role-filtered server-side).

Query params:

- `status` (optional)
- `priority` (optional)
- `page` (optional)
- `limit` (optional, max 100)

### `GET /service-requests/:id` (requires auth)

Get one service request.

### Assignment and status endpoints

- `PATCH /service-requests/:id/assignment` (manager/admin roles)
- `PATCH /service-requests/:id/status` (staff/manager/admin roles)

Status enum:

- `SUBMITTED`
- `IN_PROGRESS`
- `COMPLETED`
- `REJECTED`

---

## 6. Headers, Auth, and Error Format

### Auth header

Use access token for protected endpoints:

```http
Authorization: Bearer <access-jwt>
```

### Typical error payload

```json
{
  "message": "Human readable error message"
}
```

Common statuses:

- `400` validation error
- `401` unauthorized / invalid credentials / invalid token
- `403` forbidden by role/ownership
- `404` not found
- `409` conflict (e.g., duplicate account)
- `500` server error

---

## 7. Frontend Integration Flow (Recommended)

### Create complaint with attachments

1. Upload files via `POST /uploads/images` (multipart).
2. Submit complaint via `POST /complaints` with `attachmentUrls` set to uploaded file metadata.
3. Open detail via `GET /complaints/:id` and render `complaint.attachments` as clickable previews.

### Session handling

1. Save `token` and `refreshToken` after login.
2. Add `Authorization` header on protected requests.
3. On access token expiry, call `/auth/refresh` once and retry original request.
4. On refresh failure, clear session and redirect to login.

---

## 8. Notes for Current Branch

- Complaint attachments are now stored in a dedicated DB model (`ComplaintAttachment`) and returned on list/detail endpoints.
- Ensure latest Prisma migration is applied before frontend QA of attachments.
