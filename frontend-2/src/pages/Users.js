import React, { useState, useEffect } from 'react';
import UserCard from '../components/Users/UserCard';
import { Container, Typography, Box, Alert, Snackbar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

function Users() {
  const [users, setUsers] = useState([]);
  const [userFormData, setUserFormData] = useState({
    id: '',
    name: '',
    password: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const API_URL = 'http://localhost:8080/api';

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  
  useEffect(() => {
    console.log('Refresh trigger changed:', refreshTrigger);
    fetchUsers();
  }, [refreshTrigger]); 
  
  useEffect(() => {
    const handleRefreshEvent = () => {
      console.log('Refresh event received');
      fetchUsers();
    };
    
    window.addEventListener('refreshUsers', handleRefreshEvent);
    
    return () => {
      window.removeEventListener('refreshUsers', handleRefreshEvent);
    };
  }, []); 

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const data = await response.json();
      const userList = Object.values(data);
      console.log('Fetched users:', userList); 
      setUsers(userList);
      setUserFormData(prev => ({ ...prev, users: userList }));
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

  const handleEditUser = (user) => {
    if (user._id === 'admin') {
      showNotification("The admin user cannot be edited through this form.", "warning");
      return;
    }
    setIsEditMode(true);
    setEditingUserId(user._id);
    setUserFormData({ id: user._id, name: user.name, password: '' });
  };

  const handleUserFormSubmit = async () => {
    if (isEditMode) {
      await handleUpdateUser();
    } else {
      await handleAddUser();
    }
  };

  const handleAddUser = async () => {
    if (!userFormData.id || !userFormData.name) {
      showNotification('User ID and Name are required', 'error');
      return;
    }
    if (users.some(u => u._id === userFormData.id)) {
        showNotification('User ID already exists.', 'error');
        return;
    }

    try {
      const payload = { 
        id: userFormData.id, 
        name: userFormData.name, 
        password: userFormData.password || 'password'
      };
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        fetchUsers(); 
        setUserFormData({ id: '', name: '', password: '' }); 
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

  const handleUpdateUser = async () => {
    if (!editingUserId || !userFormData.name) {
      showNotification('User Name is required for update', 'error');
      return;
    }
    try {
      const payload = {
        name: userFormData.name,
      };
      if (userFormData.password) {
        payload.password = userFormData.password;
      }

      const response = await fetch(`${API_URL}/users/${editingUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        fetchUsers();
        showNotification('User updated successfully');
        setIsEditMode(false);
        setEditingUserId(null);
        setUserFormData({ id: '', name: '', password: '' });
      } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.error || 'Failed to update user'}`, 'error');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification('Failed to update user', 'error');
    }
  };

  const openDeleteUserConfirm = (userId) => {
    if (userId === 'admin') {
      showNotification("The admin user cannot be deleted.", "error");
      return;
    }
    setUserToDelete(userId);
    setShowDeleteConfirm(true);
  };

  const closeDeleteUserConfirm = () => {
    setUserToDelete(null);
    setShowDeleteConfirm(false);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const response = await fetch(`${API_URL}/users/${userToDelete}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchUsers();
        showNotification('User deleted successfully');
      } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.error || 'Failed to delete user'}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('Failed to delete user', 'error');
    }
    closeDeleteUserConfirm();
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
        setRefreshTrigger(prev => prev + 1);
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
        setRefreshTrigger(prev => prev + 1);
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
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          Add users, assign roles, and manage permissions in the system.
        </Typography>
      </Box>
      
      <UserCard 
        users={users}
        userData={userFormData}
        setUserData={setUserFormData}
        handleUserFormSubmit={handleUserFormSubmit}
        isEditMode={isEditMode}
        onEditUser={handleEditUser}
        onDeleteUser={openDeleteUserConfirm}
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

      <Dialog
        open={showDeleteConfirm}
        onClose={closeDeleteUserConfirm}
        aria-labelledby="delete-user-dialog-title"
      >
        <DialogTitle id="delete-user-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user? This action cannot be undone. 
            All their role assignments and direct permissions will be removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteUserConfirm}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}

export default Users;