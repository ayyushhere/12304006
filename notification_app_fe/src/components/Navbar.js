import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { NotificationsActive } from '@mui/icons-material';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar position="sticky" elevation={0}>
      <Container maxWidth="md">
        <Toolbar disableGutters>
          <NotificationsActive sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            NotifyCampus
          </Typography>
          <Box display="flex" gap={2}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/')}
              sx={{ 
                opacity: location.pathname === '/' ? 1 : 0.6,
                borderBottom: location.pathname === '/' ? '2px solid #6366f1' : '2px solid transparent',
                borderRadius: 0,
                pb: 0.5
              }}
            >
              All
            </Button>
            <Button 
              color="inherit" 
              onClick={() => navigate('/priority')}
              sx={{ 
                opacity: location.pathname === '/priority' ? 1 : 0.6,
                borderBottom: location.pathname === '/priority' ? '2px solid #6366f1' : '2px solid transparent',
                borderRadius: 0,
                pb: 0.5
              }}
            >
              Priority Inbox
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
