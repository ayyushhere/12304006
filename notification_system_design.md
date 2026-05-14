# Stage 1

Hey! Here's the API contract and structure I came up with for our new notification system. 

First off, we need a few core actions:
- Get all notifications for the logged-in user
- Mark one notification as read
- Mark all notifications as read at once
- Delete a notification

### Notification JSON Structure
I'm thinking our notification objects should look something like this:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "usr_987",
  "type": "alert", // could be info, alert, message, etc.
  "title": "Payment Failed",
  "message": "Your recent payment didn't go through.",
  "isRead": false,
  "actionUrl": "/billing",
  "createdAt": "2026-05-14T11:00:00Z"
}
```

### REST API Endpoints

**1. Fetch Notifications**
`GET /api/v1/notifications`
Headers: `Authorization: Bearer <token>`
We can use query params for pagination: `?page=1&limit=20`
Response (200):
```json
{
  "unreadCount": 3,
  "notifications": [ ... ]
}
```

**2. Mark as Read**
`PATCH /api/v1/notifications/:id/read`
Headers: `Authorization: Bearer <token>`
Response (200):
```json
{ "message": "Marked as read", "id": "123e4567-e89b-12d3-a456-426614174000" }
```

**3. Mark All as Read**
`PATCH /api/v1/notifications/read-all`
Headers: `Authorization: Bearer <token>`
Response (200):
```json
{ "message": "All notifications marked as read" }
```

**4. Delete Notification**
`DELETE /api/v1/notifications/:id`
Headers: `Authorization: Bearer <token>`
Response (200):
```json
{ "message": "Notification deleted" }
```

### Real-Time Mechanism
To actually show notifications in real-time when the user is logged in, we shouldn't rely on the frontend constantly polling the API. Instead, we should use Server-Sent Events (SSE). It's way lighter than WebSockets since the server is just pushing updates one-way to the client. The frontend can just listen to a `GET /api/v1/notifications/stream` endpoint using the browser's built-in `EventSource` and update the UI whenever a new notification event comes in.

---

# Stage 2

### Database Choice
I'd suggest going with MongoDB for this. Notifications are basically independent documents. They don't really need complex SQL joins, and the payload (like action URLs or extra data) can change depending on the notification type. Mongo's flexible schema handles that easily. Plus, it's super easy to shard by `userId` later on when the data gets huge, which gives us great write performance.

### Schema (MongoDB)
```json
{
  "_id": "ObjectId",
  "userId": "String", // Indexed
  "type": "String",
  "title": "String",
  "message": "String",
  "isRead": "Boolean", // Indexed
  "actionUrl": "String",
  "createdAt": "Date" // Indexed
}
```

### Scaling Issues & How to Fix Them
1. **The DB gets way too big:** Users get a ton of notifications and never delete them, eating up disk space. 
   *Fix:* We can add a TTL (Time-To-Live) index on the `createdAt` field in Mongo. Basically tells the DB to auto-delete notifications that are older than like 30 or 60 days.
2. **Counting unreads is slow:** Doing a `COUNT()` query on millions of rows every time a user logs in will kill the database.
   *Fix:* We should cache the unread count in Redis (e.g., `user:123:unread_count`). We just increment it when a new notification fires, and decrement when they read it.

### Some Basic Queries (MongoDB)

Fetch a user's latest 20 notifications:
```javascript
db.notifications.find({ userId: "usr_987" }).sort({ createdAt: -1 }).limit(20);
```

Mark one as read:
```javascript
db.notifications.updateOne(
  { _id: ObjectId("..."), userId: "usr_987" },
  { $set: { isRead: true } }
);
```

Mark all as read:
```javascript
db.notifications.updateMany(
  { userId: "usr_987", isRead: false },
  { $set: { isRead: true } }
);
```

Delete:
```javascript
db.notifications.deleteOne({ _id: ObjectId("..."), userId: "usr_987" });
```

---

# Stage 3

### The Slow Query Issue
The earlier developer wrote this query:
```sql
SELECT * FROM notifications 
WHERE studentID = 1042 AND isRead = false 
ORDER BY createdAt ASC;
```

**Is it accurate?** 
Technically yes, it fetches all unread notifications for that student. However, usually you want to show the newest notifications first, so it really should be `ORDER BY createdAt DESC` instead of `ASC`.

**Why is it so slow?**
Because the table has 5 million rows and there's no proper index. The database has to scan through tons of rows (a full table scan) just to find the ones belonging to student 1042. Sorting them afterwards makes it even worse.

**What I would change:**
1. I'd add a composite index on `(studentID, isRead, createdAt)`. This way the DB jumps straight to that student's unread notifications and they are already sorted.
2. I'd change it to `ORDER BY createdAt DESC`.
3. I'd avoid `SELECT *` and only select the columns we actually need to render the UI (like `id, title, message, createdAt`).
4. I'd probably add a `LIMIT` clause so we don't fetch thousands of notifications at once if they've been ignoring them.

**Computation Cost:**
Right now, it's roughly O(N) where N is 5,000,000 (a full table scan). By adding the composite index, it drops to basically O(log N) to find the index node, plus O(K) where K is just the few unread notifications for that student. It would run nearly instantly.

### Adding indexes on EVERY column?
**Is it effective?** Definitely not.
**Why:** While indexes speed up reads, they drastically slow down writes (`INSERT`, `UPDATE`, `DELETE`). Every time a notification is created or marked as read, the database would have to update every single index. In a write-heavy system like notifications, over-indexing will destroy the database's performance and eat up a massive amount of disk space and memory for no reason. We should only index columns we frequently query or filter by.

### Placement Notification Query
To find all students who got a placement notification in the last 7 days:

```sql
SELECT DISTINCT studentID 
FROM notifications 
WHERE notificationType = 'Placement' 
  AND createdAt >= NOW() - INTERVAL 7 DAY;
```
