import React, { useContext } from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton, Badge } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { NotificationContext } from '../context/NotificationContext';
import { CheckCircleOutline, Work, School, Event } from '@mui/icons-material';

const NotificationCard = ({ notification }) => {
  const theme = useTheme();
  const { readIds, markAsRead } = useContext(NotificationContext);
  
  const isRead = readIds.includes(notification.ID);

  const getTypeConfig = (type) => {
    switch (type.toLowerCase()) {
      case 'placement':
        return { color: theme.palette.placement.main, bgColor: theme.palette.placement.light, icon: <Work fontSize="small" /> };
      case 'result':
        return { color: theme.palette.result.main, bgColor: theme.palette.result.light, icon: <School fontSize="small" /> };
      case 'event':
        return { color: theme.palette.event.main, bgColor: theme.palette.event.light, icon: <Event fontSize="small" /> };
      default:
        return { color: theme.palette.primary.main, bgColor: 'rgba(99, 102, 241, 0.1)', icon: <Event fontSize="small" /> };
    }
  };

  const config = getTypeConfig(notification.Type);

  const handleCardClick = () => {
    markAsRead(notification.ID);
  };

  return (
    <Card 
      onClick={handleCardClick}
      sx={{ 
        mb: 2, 
        cursor: 'pointer',
        borderLeft: `4px solid ${config.color}`,
        position: 'relative',
        opacity: isRead ? 0.7 : 1,
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip 
              icon={config.icon} 
              label={notification.Type} 
              size="small"
              sx={{ 
                backgroundColor: config.bgColor, 
                color: config.color,
                fontWeight: 600,
                '& .MuiChip-icon': { color: config.color }
              }} 
            />
            {!isRead && (
              <Chip 
                label="NEW" 
                size="small" 
                color="error" 
                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} 
              />
            )}
          </Box>
          <Typography variant="caption" color="text.secondary">
            {new Date(notification.Timestamp).toLocaleString()}
          </Typography>
        </Box>
        
        <Typography variant="body1" sx={{ fontWeight: isRead ? 400 : 600, mt: 1 }}>
          {notification.Message}
        </Typography>

        {isRead && (
          <Box display="flex" alignItems="center" gap={0.5} mt={2}>
            <CheckCircleOutline sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Viewed
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
