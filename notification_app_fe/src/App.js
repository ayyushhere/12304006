import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './theme/theme';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import AllNotifications from './pages/AllNotifications';
import PriorityInbox from './pages/PriorityInbox';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <Router>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1, backgroundColor: 'background.default' }}>
              <Routes>
                <Route path="/" element={<AllNotifications />} />
                <Route path="/priority" element={<PriorityInbox />} />
              </Routes>
            </Box>
          </div>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
}

// We need to import Box from @mui/material, so let's modify the file properly.
export default App;
