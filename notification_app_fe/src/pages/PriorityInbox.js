import React, { useEffect, useState, useContext } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, MenuItem, Select, FormControl, InputLabel, Button } from '@mui/material';
import { fetchNotifications } from '../api/NotificationService';
import NotificationCard from '../components/NotificationCard';
import { NotificationContext } from '../context/NotificationContext';

const TYPE_WEIGHTS = {
  "Placement": 3,
  "Result": 2,
  "Event": 1
};

const PriorityInbox = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(10);
  const [filterType, setFilterType] = useState('All');
  const { markAllAsRead } = useContext(NotificationContext);

  useEffect(() => {
    const loadPriorityNotifications = async () => {
      try {
        setLoading(true);
        // If filter is All, don't pass type. Otherwise pass it.
        const params = {};
        if (filterType !== 'All') {
          params.notification_type = filterType;
        }

        const data = await fetchNotifications(params);
        
        // Sort by priority logic (Weight > Timestamp)
        data.sort((a, b) => {
          const weightA = TYPE_WEIGHTS[a.Type] || 0;
          const weightB = TYPE_WEIGHTS[b.Type] || 0;
          if (weightA !== weightB) return weightB - weightA;
          
          const timeA = new Date(a.Timestamp).getTime();
          const timeB = new Date(b.Timestamp).getTime();
          return timeB - timeA;
        });

        // Slice top n
        const topN = data.slice(0, limit);
        setNotifications(topN);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPriorityNotifications();
  }, [limit, filterType]);

  const handleMarkAllRead = () => {
    markAllAsRead(notifications.map(n => n.ID));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Typography variant="h4">Priority Inbox</Typography>
        
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filterType}
              label="Type"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="All">All Types</MenuItem>
              <MenuItem value="Placement">Placement</MenuItem>
              <MenuItem value="Result">Result</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Top N</InputLabel>
            <Select
              value={limit}
              label="Top N"
              onChange={(e) => setLimit(e.target.value)}
            >
              <MenuItem value={5}>Top 5</MenuItem>
              <MenuItem value={10}>Top 10</MenuItem>
              <MenuItem value={20}>Top 20</MenuItem>
              <MenuItem value={50}>Top 50</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box display="flex" justifyContent="flex-end" mb={3}>
        <Button variant="outlined" color="primary" onClick={handleMarkAllRead} size="small">
          Mark Priority as Read
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
          No priority notifications found.
        </Typography>
      )}

      {!loading && !error && notifications.map(notif => (
        <NotificationCard key={notif.ID} notification={notif} />
      ))}
    </Container>
  );
};

export default PriorityInbox;
