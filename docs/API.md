# Sales CRM API Reference

This document describes the REST API currently mounted by the backend in `sales_crm_backend_w-production/sales_crm_backend_w-production`.

## Connection

- Local base URL: `http://localhost:5000`
- API base path: `http://localhost:5000/api`
- Content type: `application/json` unless an endpoint says otherwise
- Authentication: private endpoints require `Authorization: Bearer <access-token>`

The server also exposes `GET /` as a health check. The API is versionless at present; introduce `/api/v1` before committing to a long-lived production contract.

## Authentication and permissions

The auth middleware reads a bearer token, verifies it, loads the user, and attaches the user's effective permissions to the request. Permission-protected routes return an authorization error when the authenticated user lacks the required permission.

Typical headers:

```http
Authorization: Bearer eyJ...
Content-Type: application/json
```

Authentication endpoints:

| Method | Path | Auth | Body | Purpose |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/login` | No | `emailOrPhone`, optional `password`, `deviceId`, `fcmToken`, `userAgent`, `platform`, `ip` | Log in and issue an access token |
| POST | `/api/auth/logout` | No route middleware | Optional session/logout data | Log out the current session |
| POST | `/api/auth/validate` | Yes | None | Validate the current access token |

Example login request:

```json
{
  "emailOrPhone": "agent@example.com",
  "password": "password"
}
```

## Response and errors

Successful response shapes are controller-specific. Clients should treat the response body as JSON and use the HTTP status code as the primary success indicator.

The global error handler returns the shared error wrapper. A representative validation response is:

```json
{
  "success": false,
  "message": "Validation failed",
  "meta": {
    "details": ["\"name\" is required"]
  }
}
```

Common statuses:

| Status | Meaning |
| --- | --- |
| 200 | Successful read or update |
| 201 | Successful creation |
| 400 | Invalid body, query, or path-related input |
| 401 | Missing, invalid, or expired bearer token |
| 403 | Authenticated user lacks a required permission or role |
| 404 | Resource not found |
| 409 | Business conflict, such as a duplicate or invalid state transition |
| 500 | Unexpected server error |

## Public, webhook, and constants endpoints

| Method | Path | Auth | Permission | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/` | No | - | Health check; returns backend status |
| GET | `/api/legal/public/:type` | No | - | Read public legal content |
| POST | `/api/webhook/facebook` | No | - | Receive Facebook webhook events; preserves the raw request body for verification |
| GET | `/api/webhook/facebook` | No | - | Verify Facebook webhook subscription |
| POST | `/api/facebook/page-token` | No route middleware | - | Save a Facebook page token |
| POST | `/api/lead/webhooks/leads` | No | - | Ingest a lead from an external integration |
| GET | `/api/constants/all` | Yes | - | Fetch application constants |
| GET | `/api/lead/constants` | Yes | - | Fetch lead constants |
| GET | `/api/task/constants` | Yes | - | Fetch task constants |
| GET | `/api/property/constants` | Yes | - | Fetch property constants |
| GET | `/api/comment/constants` | Yes | - | Fetch comment constants |

For webhook requests, use the provider's required signature headers. Do not send webhook secrets in the JSON body.

## Leads

All paths below begin with `/api/lead`. The lead route group requires authentication unless noted otherwise.

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| POST | `/create` | `lead:create` | Create a lead |
| GET | `/getLeadFromDB` | - | Retrieve imported/meta leads |
| GET | `/export` | `lead:export` | Export leads |
| GET | `/list` | `lead:read` | Paginated and filtered lead list |
| GET | `/summary` | `lead:read` | Lead summary |
| GET | `/duplicates/:id` | `lead:duplicate:read` | Find duplicates for a lead |
| GET | `/:id` | `lead:read` | Fetch one lead |
| GET | `/assignment-history/:id` | `lead:read` | Fetch assignment history |
| GET | `/stage-history/:id` | `lead:read` | Fetch stage history |
| PUT | `/:id` | `lead:update` | Update a lead |
| PUT | `/stage/:id` | `lead:stage:update` | Change lead stage |
| PUT | `/assign/:id` | `lead:assign` | Assign a lead |
| POST | `/bulk/stage-change` | - | Change stages for multiple leads |
| POST | `/comment/:id` | `lead:update` | Add a comment to a lead |
| PUT | `/comment/:id` | - | Update a lead comment |
| GET | `/comment/:leadId` | - | List lead comments |
| DELETE | `/:id` | `lead:delete` | Soft-delete a lead |
| POST | `/bulk/assign` | `lead:assign` | Assign multiple leads |
| POST | `/bulk/import` | `lead:import` | Import a CSV/file upload; multipart request |
| POST | `/lock/:id` | - | Lock a lead for editing |
| POST | `/unlock/:id` | - | Release a lead lock |
| PUT | `/recycle/restore/:id` | - | Restore a removed lead |

Lead create body:

```json
{
  "fullName": "Ada Lovelace",
  "phone": "+1-555-0100",
  "email": "ada@example.com",
  "source": "website",
  "projectName": "Downtown Residences",
  "budgetMin": 100000,
  "budgetMax": 250000,
  "propertyType": "apartment",
  "locationPreference": "Central",
  "tags": ["hot"]
}
```

Required fields are `fullName` and `phone`. Supported lead sources include `website`, `referral`, `exhibition_event`, `online_ads`, `walk-in`, `phone_inquiry`, `email_campaign`, `property_portal`, `campaign`, `social_media`, `advertisement`, `cold_call`, `broker`, and `meta`. Supported tags are `hot`, `medium`, `low`, and `urgent`.

Lead list query parameters include `page`, `limit` (1-200), `q`, `stage`, `assignedTo`, `branch`, `source`, `dateFrom`, `dateTo`, and `tags`.

Stage change and assignment examples:

```json
{ "stage": "qualified" }
```

```json
{
  "assignedTo": "507f1f77bcf86cd799439011",
  "reason": "Reassigned to the central sales team"
}
```

## Customers

All paths begin with `/api/customer` and require the matching permission.

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| GET | `/dropdown` | `customer:read` | Customer dropdown for meeting forms |
| GET | `/` | `customer:read` | List customers |
| GET | `/:id` | `customer:read` | Get one customer |
| POST | `/` | `customer:create` | Create a customer |
| PUT | `/:id` | `customer:update` | Update a customer |
| DELETE | `/:id` | `customer:delete` | Remove a customer |

Create body:

```json
{
  "name": "Example Customer",
  "companyName": "Example Ltd",
  "contactPerson": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1-555-0110",
  "address": "1 Main Street",
  "latitude": 40.7128,
  "longitude": -74.006
}
```

`name` is required. Email must be valid when supplied. Latitude must be between -90 and 90; longitude must be between -180 and 180.

## Tasks

All paths begin with `/api/task` and require authentication.

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| GET | `/constants` | - | Task constants |
| POST | `/create` | - | Create a task |
| GET | `/list` | - | List tasks |
| PATCH | `/complete/:id` | - | Complete a task |
| DELETE | `/soft_delete/:id` | - | Soft-delete a task |
| PUT | `/:id` | - | Update a task |

Create body:

```json
{
  "title": "Call prospect",
  "description": "Discuss financing options",
  "lead": "507f1f77bcf86cd799439011",
  "assignedTo": "507f1f77bcf86cd799439012",
  "type": "call",
  "priority": "high",
  "dueDate": "2026-09-20T10:00:00.000Z",
  "reminderAt": "2026-09-20T09:30:00.000Z"
}
```

Required fields are `title`, `type`, and `dueDate`. Types are `call`, `meeting`, `follow-up`, `email`, `document`, and `site_visit`. Statuses are `fresh`, `in-progress`, `completed`, and `missed`; priorities are `low`, `medium`, `high`, and `urgent`.

Task list query parameters include `page`, `limit` (1-100), `status`, `priority`, `type`, `assignedTo`, and `lead`.

## Meetings

### General meetings

All paths begin with `/api/meeting` and require authentication plus the listed permission.

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| POST | `/` | `meeting:create` | Create a meeting |
| PATCH | `/:meetingId/cancel` | `meeting:update` | Cancel a meeting |
| PUT | `/:meetingId` | `meeting:update` | Update a meeting |
| GET | `/upcoming` | `meeting:read` | List upcoming meetings |

### Sales meetings and visits

All paths begin with `/api/sales-meeting`.

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| GET | `/assignable-employees` | `salesMeeting:read` | List employees who can be assigned |
| GET | `/stats` | `salesMeeting:read` | Sales meeting statistics |
| GET | `/` | `salesMeeting:read` | List sales meetings |
| GET | `/:id` | `salesMeeting:read` | Get one sales meeting |
| POST | `/` | `salesMeeting:create` | Create a sales meeting |
| PUT | `/:id` | `salesMeeting:update` | Update a sales meeting |
| POST | `/:id/confirm` | `salesMeeting:update` | Confirm a meeting |
| POST | `/:id/check-in` | `salesMeeting:update` | Check in with latitude/longitude |
| POST | `/:id/start` | `salesMeeting:update` | Start a meeting |
| POST | `/:id/check-out` | `salesMeeting:update` | Check out with latitude/longitude |
| POST | `/:id/complete` | `salesMeeting:update` | Complete with an outcome |
| POST | `/:id/cancel` | `salesMeeting:update` | Cancel with an optional reason |
| POST | `/:id/reopen` | `salesMeeting:reopen` plus role 1, 2, or 3 | Reopen a meeting |

Create body:

```json
{
  "customerId": "507f1f77bcf86cd799439011",
  "purpose": "Review proposal",
  "scheduledStart": "2026-09-21T10:00:00.000Z",
  "scheduledEnd": "2026-09-21T11:00:00.000Z",
  "location": "Customer office",
  "assignedEmployeeId": "507f1f77bcf86cd799439012",
  "notes": "Bring the revised pricing sheet"
}
```

`scheduledEnd` must be after `scheduledStart`. Check-in and check-out require `latitude` and `longitude`. Completion requires an outcome of `INTERESTED`, `FOLLOW_UP_REQUIRED`, `PROPOSAL_REQUESTED`, `NOT_INTERESTED`, or `UNABLE_TO_MEET`.

Check-in is allowed from exactly 15 minutes before `scheduledStart` through the meeting start and afterward. The 15-minute boundary is inclusive; an attempt even one second earlier is rejected by the backend. The frontend disables the action until the window opens, but the backend remains the authoritative enforcement point.

## Follow-ups

All paths begin with `/api/follow-up`.

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| GET | `/` | `followUp:read` | List follow-ups |
| GET | `/:id` | `followUp:read` | Get one follow-up |
| POST | `/` | `followUp:create` | Create a follow-up |
| PUT | `/:id` | `followUp:update` | Update a follow-up |
| DELETE | `/:id` | `followUp:delete` | Delete a follow-up |
| POST | `/:id/complete` | `followUp:complete` | Complete a follow-up |

Create body:

```json
{
  "meetingId": "507f1f77bcf86cd799439011",
  "customerId": "507f1f77bcf86cd799439012",
  "title": "Send proposal",
  "description": "Email the final proposal",
  "ownerId": "507f1f77bcf86cd799439013",
  "dueDate": "2026-09-22"
}
```

Statuses are `PENDING`, `COMPLETED`, and `CANCELLED`.

## Reminders and comments

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/reminders/` | Yes | Create a reminder |
| GET | `/api/reminders/` | Yes | List reminders |
| GET | `/api/reminders/:id` | Yes | Get a reminder |
| PATCH | `/api/reminders/:id` | Yes | Update a reminder |
| PATCH | `/api/reminders/:id/complete` | Yes | Mark a reminder complete |
| DELETE | `/api/reminders/:id` | Yes | Delete a reminder |
| GET | `/api/comment/constants` | Yes | Get comment constants |

Lead comment creation and listing are documented under the Leads section.

## Users, roles, permissions, and categories

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| POST | `/api/user/create` | `user:create` | Create a user |
| GET | `/api/user/fetch-all` | `user:read` | List users |
| GET | `/api/user/search` | `user:read` | Search users |
| GET | `/api/user/parent-user-dropdown` | - | Parent user dropdown |
| GET | `/api/user/tree/:id` | `user:read` | User hierarchy tree |
| GET | `/api/user/permission/:id` | `user:read` | User permissions |
| PATCH | `/api/user/change-parent` | `user:update` | Change a user's parent |
| PATCH | `/api/user/move-subtree` | `user:update` | Move a hierarchy subtree |
| GET | `/api/user/:id` | `user:read` | Get a user |
| PUT | `/api/user/:id` | `user:update` | Update a user |
| DELETE | `/api/user/:id` | `user:delete` | Soft-delete a user |
| DELETE | `/api/user/delete/:id` | `user:delete` | Delete with subtree transfer |
| PUT | `/api/user/:id/password` | `user:update` | Change a password |
| PATCH | `/api/user/restore/:id` | `user:restore` | Restore a user |
| POST | `/api/role/create` | `role:create` | Create a role |
| GET | `/api/role/fetch-all` | `role:read` | List roles |
| GET | `/api/role/:id` | `role:read` | Get a role |
| PUT | `/api/role/:id` | `role:update` | Update a role |
| DELETE | `/api/role/:id` | `role:delete` | Delete a role |
| PATCH | `/api/role/:id/restore` | `role:restore` | Restore a role |
| GET | `/api/role/` | `role:read` | Role dropdown |
| GET | `/api/permission/fetch-all` | `permission:read` | List permissions |
| PUT | `/api/permission/:id` | `permission:update` | Update a permission description |
| POST | `/api/category/create` | `category:create` | Create a category |
| GET | `/api/category/list` | `category:read` | List categories |
| GET | `/api/category/dropdown` | - | Category dropdown |
| PATCH | `/api/category/toggle/:id` | `category:toggle` | Toggle category status |
| POST | `/api/category/restore/:id` | `category:restore` | Restore category |
| GET | `/api/category/:id` | `category:read` | Get a category |
| PUT | `/api/category/:id` | `category:update` | Update a category |
| DELETE | `/api/category/:id` | `category:delete` | Delete a category |

## Properties, legal content, and performance

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| POST | `/api/property/create` | - | Create a property |
| GET | `/api/property/constants` | - | Property constants |
| GET | `/api/property/list` | - | List properties |
| PATCH | `/api/property/toggle/:id` | - | Toggle a property |
| DELETE | `/api/property/soft_delete/:id` | - | Soft-delete a property |
| DELETE | `/api/property/hard_delete/:id` | - | Permanently delete a property |
| GET | `/api/property/:id` | - | Get a property |
| PUT | `/api/property/:id` | - | Update a property |
| POST | `/api/legal/create` | `legal:create` | Create legal content |
| PUT | `/api/legal/:id` | `legal:update` | Upsert legal content |
| GET | `/api/legal/fetch-all` | `legal:read` | List legal content |
| GET | `/api/legal/:id` | `legal:read` | Get legal content |
| GET | `/api/salesperson/performance` | - | Fetch salesperson performance |

## Route coverage notes

- The route source contains notification routes, but `src/modules/index.js` does not currently mount a `/notification` router. Notification endpoints should not be treated as available through the current `/api` application until that router is registered.
- `GET /api/facebook/page-token` is not used; the mounted endpoint is `POST /api/facebook/page-token` directly in `src/app.js`.
- Some older routes do not attach explicit permission middleware even though they are inside an authenticated route group. The permission column above reflects the current source, not an assumed future policy.
- Exact response fields are controller-specific and should be captured with integration tests before publishing this as a stable external contract.
