import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert, Snackbar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import RoleCard from '../components/Roles/RoleCard';

function Roles() {
  const [roles, setRoles] = useState([]);
  const [roleFormData, setRoleFormData] = useState({
    id: '',
    name: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const API_URL = 'http://localhost:8080/api';

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_URL}/roles`);
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      showNotification('Error fetching roles', 'error');
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

  const handleEditRole = (role) => {
    setIsEditMode(true);
    setEditingRoleId(role._id);
    setRoleFormData({ id: role._id, name: role.name });
  };

  const handleFormSubmit = async () => {
    if (isEditMode) {
      await handleUpdateRole();
    } else {
      await handleAddRole();
    }
  };

  const handleAddRole = async () => {
    if (!roleFormData.id || !roleFormData.name) {
      showNotification('Role ID and Name are required', 'error');
      return;
    }
    if (roles.some(r => r._id === roleFormData.id)) {
        showNotification('Role ID already exists. Please use a unique ID.', 'error');
        return;
    }

    try {
      const response = await fetch(`${API_URL}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: roleFormData.id, name: roleFormData.name }),
      });
      
      if (response.ok) {
        fetchRoles();
        setRoleFormData({ id: '', name: '' });
        showNotification('Role added successfully');
      } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.error || 'Failed to add role'}`, 'error');
      }
    } catch (error) {
      console.error('Error adding role:', error);
      showNotification('Failed to add role', 'error');
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRoleId || !roleFormData.name) {
      showNotification('Role Name is required for update', 'error');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/roles/${editingRoleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roleFormData.name })
      });
      if (response.ok) {
        fetchRoles();
        showNotification('Role updated successfully');
        setIsEditMode(false);
        setEditingRoleId(null);
        setRoleFormData({ id: '', name: '' });
      } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.error || 'Failed to update role'}`, 'error');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      showNotification('Failed to update role', 'error');
    }
  };

  const openDeleteRoleConfirm = (roleId) => {
    setRoleToDelete(roleId);
    setShowDeleteConfirm(true);
  };

  const closeDeleteRoleConfirm = () => {
    setRoleToDelete(null);
    setShowDeleteConfirm(false);
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    try {
      const response = await fetch(`${API_URL}/roles/${roleToDelete}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchRoles();
        showNotification('Role deleted successfully');
      } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.error || 'Failed to delete role'}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      showNotification('Failed to delete role', 'error');
    }
    closeDeleteRoleConfirm();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Roles Management
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Create and manage roles for assigning to users.
        </Typography>
      </Box>
      
      <RoleCard 
        roles={roles}
        roleData={roleFormData}
        setRoleData={setRoleFormData}
        handleFormSubmit={handleFormSubmit}
        isEditMode={isEditMode}
        onEditRole={handleEditRole}
        onDeleteRole={openDeleteRoleConfirm}
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
        onClose={closeDeleteRoleConfirm}
        aria-labelledby="delete-role-dialog-title"
      >
        <DialogTitle id="delete-role-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this role? This action cannot be undone. 
            Ensure the role is not assigned to any users.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteRoleConfirm}>Cancel</Button>
          <Button onClick={handleDeleteRole} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}

export default Roles;