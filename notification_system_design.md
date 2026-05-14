# Stage 1

## Core Actions for Notification Platform
To display and manage notifications for logged-in users, the notification platform should support the following core actions:
1. **Fetch Notifications**: Retrieve a paginated list of notifications for the authenticated user.
2. **Mark as Read**: Mark a specific notification as read.
3. **Mark All as Read**: Mark all unread notifications for the user as read.
4. **Delete Notification**: Remove a specific notification from the user's view.

## Notification Object Schema
```json
{
  "id": "a1b2c3d4-5678-90ef-ghij-klmnopqrstuv",
  "userId": "user-123",
  "type": "alert",          // "info", "alert", "message", "system"
  "title": "Payment Failed",
  "message": "Your recent subscription payment could not be processed.",
  "isRead": false,
  "actionUrl": "/billing/update",
  "createdAt": "2026-05-14T11:00:00Z"
}
```

---

## REST API Design & Contract

### 1. Fetch Notifications
Retrieves the user's notifications.

* **Endpoint:** `GET /api/v1/notifications`
* **Headers:**
  ```json
  {
    "Authorization": "Bearer <JWT_TOKEN>",
    "Accept": "application/json"
  }
  ```
* **Query Parameters:** `?page=1&limit=20&status=unread` (status is optional)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "unreadCount": 3,
      "notifications": [
        {
          "id": "a1b2c3d4",
          "type": "alert",
          "title": "Payment Failed",
          "message": "Your recent payment failed.",
          "isRead": false,
          "createdAt": "2026-05-14T11:00:00Z"
        }
      ]
    },
    "meta": {
      "currentPage": 1,
      "totalPages": 5
    }
  }
  ```

### 2. Mark Notification as Read
Marks a specific notification as read.

* **Endpoint:** `PATCH /api/v1/notifications/:id/read`
* **Headers:**
  ```json
  {
    "Authorization": "Bearer <JWT_TOKEN>",
    "Content-Type": "application/json"
  }
  ```
* **Request Body:** None required.
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Notification marked as read successfully.",
    "data": {
      "id": "a1b2c3d4",
      "isRead": true
    }
  }
  ```

### 3. Mark All Notifications as Read
Marks every unread notification belonging to the user as read.

* **Endpoint:** `PATCH /api/v1/notifications/read-all`
* **Headers:**
  ```json
  {
    "Authorization": "Bearer <JWT_TOKEN>",
    "Content-Type": "application/json"
  }
  ```
* **Request Body:** None required.
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "All notifications marked as read."
  }
  ```

### 4. Delete Notification
Removes a notification entirely.

* **Endpoint:** `DELETE /api/v1/notifications/:id`
* **Headers:**
  ```json
  {
    "Authorization": "Bearer <JWT_TOKEN>"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Notification deleted successfully."
  }
  ```

---

## Mechanism for Real-Time Notifications

To push real-time notifications to the front-end client without requiring the client to constantly poll the REST API, we will implement **Server-Sent Events (SSE)** or **WebSockets**. 

Given that notifications are primarily a one-way communication stream (Server -> Client), **Server-Sent Events (SSE)** is the most lightweight and HTTP-friendly approach.

### Server-Sent Events (SSE) Design

* **Endpoint:** `GET /api/v1/notifications/stream`
* **Headers:**
  ```json
  {
    "Authorization": "Bearer <JWT_TOKEN>",
    "Accept": "text/event-stream"
  }
  ```
* **Behavior:**
  1. The client establishes a persistent HTTP connection to the `/stream` endpoint.
  2. The backend maintains this open connection.
  3. Whenever a system event generates a notification for the user, the server pushes an event over this open stream.

* **Stream Event Payload Example:**
  ```text
  event: NEW_NOTIFICATION
  data: {"id": "123", "title": "New Message", "message": "You have a new message from Support.", "isRead": false, "createdAt": "2026-05-14T11:05:00Z"}
  
  event: UNREAD_COUNT_UPDATE
  data: {"unreadCount": 4}
  ```

* **Client-Side Handling:**
  The frontend colleague can use the native browser `EventSource` API (or a library like `@microsoft/fetch-event-source` if headers are required) to listen for the `NEW_NOTIFICATION` event and update the UI in real-time.
