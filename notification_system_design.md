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

---

# Stage 2

## Persistent Storage Suggestion
**Choice:** MongoDB (NoSQL)

**Explanation:**
For a notification system, NoSQL document databases like MongoDB are highly effective for several reasons:
1. **Flexible Schema:** Notifications often contain varied payload structures (e.g., action URLs, custom metadata) depending on the notification type. A document database easily absorbs these variable fields without needing complex schema migrations.
2. **High Write Volume:** Notification systems are typically write-heavy. MongoDB provides excellent insert performance and handles large volumes of data natively.
3. **Horizontal Scalability:** Notifications accumulate very quickly. MongoDB makes it easy to shard the data horizontally across multiple servers based on the `userId`, which isolates data logically and optimizes querying since users only ever fetch their own notifications.
4. **No Complex Joins:** Notifications are generally standalone events. Once created, they rarely require complex ACID transactions or `JOIN` operations with other tables.

## DB Schema (MongoDB Collection: `notifications`)
```json
{
  "_id": "ObjectId",
  "userId": "String (Indexed)",
  "type": "String",
  "title": "String",
  "message": "String",
  "isRead": "Boolean (Indexed)",
  "actionUrl": "String (Optional)",
  "createdAt": "Date (Indexed)"
}
```

## Potential Problems at Scale & Solutions

### 1. Massive Storage Growth
**Problem:** As users accumulate hundreds of notifications daily, the database size will explode, leading to expensive storage costs, massive indexes, and slower query times.
**Solution:** 
- **TTL (Time-To-Live) Indexes:** Notifications are highly transient. Users rarely care about notifications older than a month. Create a TTL index in MongoDB on the `createdAt` field to automatically delete or archive notifications after 30 to 90 days.

### 2. Expensive "Unread Count" Queries
**Problem:** Calculating the total number of unread notifications for a user by scanning the database every time they log in or receive an event is an expensive `COUNT()` operation that drains database resources.
**Solution:**
- **In-Memory Caching (Redis):** Maintain an integer counter for unread notifications in Redis (e.g., Key: `user:{id}:unread_count`). Increment this counter when a notification is created, and decrement it when one is read.

### 3. Read/Write Bottlenecks
**Problem:** A sudden surge of system events (e.g., an app-wide announcement) could throttle the database with too many simultaneous writes.
**Solution:**
- **Message Queues (Kafka/RabbitMQ):** Decouple the event generation from database insertion. Use a message queue to buffer notification creation requests and process them asynchronously in batches.
- **Database Sharding:** Shard the MongoDB collection by the `userId` key so that reads and writes are distributed evenly across a cluster of database nodes.

## MongoDB Queries (Based on Stage 1 APIs)

### 1. Fetch Notifications
Retrieve the most recent notifications for a user (Pagination handled via skip/limit).
```javascript
db.notifications.find({ userId: "user-123" })
  .sort({ createdAt: -1 })
  .skip(0)
  .limit(20);
```

### 2. Mark Notification as Read
Update a specific notification to `isRead: true`.
```javascript
db.notifications.updateOne(
  { _id: ObjectId("a1b2c3d4..."), userId: "user-123" },
  { $set: { isRead: true } }
);
```

### 3. Mark All Notifications as Read
Update all unread notifications for a specific user.
```javascript
db.notifications.updateMany(
  { userId: "user-123", isRead: false },
  { $set: { isRead: true } }
);
```

### 4. Delete Notification
Remove a specific notification entirely.
```javascript
db.notifications.deleteOne({
  _id: ObjectId("a1b2c3d4..."),
  userId: "user-123"
});
```
