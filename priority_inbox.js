// IMPORTANT: Replace this with your currently active JWT token
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJheXVzaGt1bWFyMDIxMWFAZ21haWwuY29tIiwiZXhwIjoxNzc4NzU3OTcxLCJpYXQiOjE3Nzg3NTcwNzEsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiIyYjdjOTQ4My1mNzliLTQzNmQtOGU2ZS04NTg1MDJlMjA2YTgiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJheXVzaCBrdW1hciIsInN1YiI6IjBlNGVhMDRkLTBiN2ItNDY4Zi05MTUyLTNhZjVjNzY3YWU2OCJ9LCJlbWFpbCI6ImF5dXNoa3VtYXIwMjExYUBnbWFpbC5jb20iLCJuYW1lIjoiYXl1c2gga3VtYXIiLCJyb2xsTm8iOiIxMjMwNDAwNiIsImFjY2Vzc0NvZGUiOiJUUnZaV3EiLCJjbGllbnRJRCI6IjBlNGVhMDRkLTBiN2ItNDY4Zi05MTUyLTNhZjVjNzY3YWU2OCIsImNsaWVudFNlY3JldCI6InFOekpzRmR6Q3JyQk14dkUifQ.ToKLVJiMYdSsoCyf6U2uwMmAYJ1X_xC1oupZtU28opI";

const TYPE_WEIGHTS = {
  "Placement": 3,
  "Result": 2,
  "Event": 1
};


function compareNotifications(a, b) {
  const weightA = TYPE_WEIGHTS[a.Type] || 0;
  const weightB = TYPE_WEIGHTS[b.Type] || 0;

  // 1. Sort by weight (Placement > Result > Event)
  if (weightA !== weightB) {
    return weightB - weightA;
  }

  // 2. If weights are equal, sort by Timestamp (Recency: newer is better)
  const timeA = new Date(a.Timestamp).getTime();
  const timeB = new Date(b.Timestamp).getTime();
  
  return timeB - timeA;
}

async function fetchAndPrintTopNotifications(n = 10) {
  try {
    console.log(`Fetching notifications to find the top ${n}...`);
    const response = await fetch("http://4.224.186.213/evaluation-service/notifications", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const notifications = data.notifications || [];

    if (notifications.length === 0) {
      console.log("No notifications found.");
      return;
    }

    // Sort the entire list
    notifications.sort(compareNotifications);

    // Get the top 'n'
    const topNotifications = notifications.slice(0, n);

    console.log("\n--- PRIORITY INBOX ---");
    topNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. [${notif.Type.toUpperCase()}] ${notif.Message}`);
      console.log(`   Timestamp: ${notif.Timestamp}`);
      console.log(`   ID: ${notif.ID}\n`);
    });

  } catch (error) {
    console.error("Error generating Priority Inbox:", error);
  }
}

// Run the script to get top 10
fetchAndPrintTopNotifications(10);
