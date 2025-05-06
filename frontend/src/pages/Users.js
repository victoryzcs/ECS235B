import React, { useState, useEffect } from 'react';
import UserCard from '../components/Users/UserCard';
import { Container, Typography, Box, Alert, Snackbar } from '@mui/material';

function Users() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ id: '', name: '', users: [] });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const API_URL = 'http://localhost:8080/api';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const data = await response.json();
      const userList = Object.values(data);
      setUsers(userList);
      setNewUser(prev => ({ ...prev, users: userList }));
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Error fetching users', 'error');
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newUser.id, name: newUser.name })
      });
      
      if (response.ok) {
        setNewUser({ id: '', name: '', users: users });
        fetchUsers();
        showNotification('User added successfully');
      } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.error || 'Failed to add user'}`, 'error');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      showNotification('Failed to add user', 'error');
    }
  };
  
  const handleAssignRole = async (userId, roleId) => {
    if (!userId || !roleId) {
      showNotification('Please select both a user and a role', 'warning');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/assign_role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role_id: roleId })
      });
      
      if (response.ok) {
        fetchUsers(); // Refresh the user list to show updated roles
        showNotification('Role assigned successfully');
      } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.error || 'Something went wrong'}`, 'error');
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      showNotification('Failed to assign role', 'error');
    }
  };

  const handleGrantPermission = async (userId, objectId, action) => {
    if (!userId || !objectId || !action) {
      showNotification('Please select a user, object, and action', 'warning');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/grant_direct_permission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, object_id: objectId, action })
      });
      
      if (response.ok) {
        fetchUsers(); // Refresh the user list to show updated permissions
        showNotification(`Permission ${action} on ${objectId} granted to user ${userId}`);
      } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.error || 'Something went wrong'}`, 'error');
      }
    } catch (error) {
      console.error('Error granting permission:', error);
      showNotification('Failed to grant permission', 'error');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Users Management
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Add users, assign roles, and manage permissions in the system.
        </Typography>
      </Box>
      
      <UserCard 
        users={users}
        newUser={newUser}
        setNewUser={setNewUser}
        handleAddUser={handleAddUser}
        handleAssignRole={handleAssignRole}
        handleGrantPermission={handleGrantPermission}
      />
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Users;