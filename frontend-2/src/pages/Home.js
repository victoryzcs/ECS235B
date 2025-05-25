import React from 'react';
import { Typography, Paper, Box, Card, CardContent } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

function Home() {
  const auth = useAuth();
  
  const currentUser = auth?.currentUser;
  const isAdmin = auth?.isAdmin;
  const isManager = auth?.isManager;

  return (
    <div className="home-page">
      <Typography variant="h4" gutterBottom>
        Welcome to the Security Policy Management System
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          User Information
        </Typography>
        <Typography>
          <strong>Name:</strong> {currentUser?.name}
        </Typography>
        <Typography>
          <strong>Role:</strong> {currentUser?.role}
        </Typography>
      </Paper>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Your Access Level
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 , justifyContent: 'center'}}>
          {isAdmin && (
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6" color="primary">
                  Admin Access
                </Typography>
                <Typography variant="body2">
                  You have full access to the system, including user management, role assignment, and security policy configuration.
                </Typography>
              </CardContent>
            </Card>
          )}
          
          {isManager && (
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6" color="primary">
                  Manager Access
                </Typography>
                <Typography variant="body2">
                  You can view and manage resources within your assigned scope, but cannot modify system-wide settings.
                </Typography>
              </CardContent>
            </Card>
          )}
          
          {!isAdmin && !isManager && (
            <Card sx={{ minWidth: 200 }}>
              <CardContent>
                <Typography variant="h6" color="primary">
                  Worker Access
                </Typography>
                <Typography variant="body2">
                  You can access resources based on your assigned permissions and role.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </div>
  );
}

export default Home;