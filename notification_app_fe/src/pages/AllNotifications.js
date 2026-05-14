import React, { useEffect, useState, useContext } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Button } from '@mui/material';
import { fetchNotifications } from '../api/NotificationService';
import NotificationCard from '../components/NotificationCard';
import { NotificationContext } from '../context/NotificationContext';

const AllNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { markAllAsRead } = useContext(NotificationContext);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        // Fetch all, we can add pagination later if needed
        const data = await fetchNotifications();
        // Sort by timestamp descending by default
        const sorted = data.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
        setNotifications(sorted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const handleMarkAllRead = () => {
    markAllAsRead(notifications.map(n => n.ID));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">All Notifications</Typography>
        <Button variant="outlined" color="primary" onClick={handleMarkAllRead} size="small">
          Mark all as read
        </Button>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && notifications.length === 0 && (
        <Typography color="text.secondary" textAlign="center" mt={4}>
          No notifications found.
        </Typography>
      )}

      {!loading && !error && notifications.map(notif => (
        <NotificationCard key={notif.ID} notification={notif} />
      ))}
    </Container>
  );
};

export default AllNotifications;
