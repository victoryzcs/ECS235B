import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert, Snackbar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import ConflictClassCard from '../components/ConflictClasses/ConflictClassCard';

function ConflictClasses() {
  const [conflictClasses, setConflictClasses] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [newConflictClass, setNewConflictClass] = useState({ 
    class_id: '', 
    name: '', 
    datasets: []
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingConflictClass, setEditingConflictClass] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [conflictClassToDelete, setConflictClassToDelete] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const API_URL = 'http://localhost:8080/api';

  useEffect(() => {
    fetchConflictClasses();
    fetchDatasets();
  }, []);

  const fetchConflictClasses = async () => {
    try {
      const response = await fetch(`${API_URL}/conflict_classes`);
      const data = await response.json();
      setConflictClasses(Object.values(data));
    } catch (error) {
      console.error('Error fetching conflict classes:', error);
      showNotification('Error fetching conflict classes', 'error');
    }
  };

  const fetchDatasets = async () => {
    try {
      const response = await fetch(`${API_URL}/datasets`);
      const data = await response.json();
      setDatasets(Object.values(data));
      console.log('datasets:', Object.values(data));
    } catch (error) {
      console.error('Error fetching datasets:', error);
      showNotification('Error fetching datasets', 'error');
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

  const handleEditConflictClass = (conflictClass) => {
    setIsEditMode(true);
    setEditingConflictClass(conflictClass);
    setNewConflictClass({
      class_id: conflictClass._id,
      name: conflictClass.name,
      datasets: conflictClass.datasets || []
    });
  };

  const handleUpdateConflictClass = async () => {
    if (!editingConflictClass) return;
    try {
      const response = await fetch(`${API_URL}/conflict_classes/${editingConflictClass._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newConflictClass.name,
          datasets: newConflictClass.datasets
        })
      });
      if (response.ok) {
        fetchConflictClasses();
        showNotification('Conflict class updated successfully');
        setIsEditMode(false);
        setEditingConflictClass(null);
        setNewConflictClass({ class_id: '', name: '', datasets: [] });
      } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.error || 'Failed to update conflict class'}`, 'error');
      }
    } catch (error) {
      console.error('Error updating conflict class:', error);
      showNotification('Failed to update conflict class', 'error');
    }
  };

  const openDeleteConfirmDialog = (ccId) => {
    setConflictClassToDelete(ccId);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirmDialog = () => {
    setConflictClassToDelete(null);
    setShowDeleteConfirm(false);
  };

  const handleDeleteConflictClass = async () => {
    if (!conflictClassToDelete) return;
    try {
      const response = await fetch(`${API_URL}/conflict_classes/${conflictClassToDelete}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchConflictClasses();
        showNotification('Conflict class deleted successfully');
      } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.error || 'Failed to delete conflict class'}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting conflict class:', error);
      showNotification('Failed to delete conflict class', 'error');
    }
    closeDeleteConfirmDialog();
  };

  const handleAddConflictClass = async (e) => {
    e.preventDefault();
    try {
      console.log('newConflictClass:', newConflictClass);
      const response = await fetch(`${API_URL}/conflict_classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: newConflictClass.class_id,
          name: newConflictClass.name,
          datasets: newConflictClass.datasets
        })
      });
      
      if (response.ok) {
        setNewConflictClass({ class_id: '', name: '', datasets: [] });
        fetchConflictClasses();
        showNotification('Conflict class added successfully');
      } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.error || 'Failed to add conflict class'}`, 'error');
      }
    } catch (error) {
      console.error('Error adding conflict class:', error);
      showNotification('Failed to add conflict class', 'error');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Conflict Classes Management
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          Create and manage conflict classes to organize datasets and prevent conflicts.
        </Typography>
      </Box>
      
      <ConflictClassCard 
        conflictClasses={conflictClasses}
        newConflictClass={newConflictClass}
        setNewConflictClass={setNewConflictClass}
        handleAddConflictClass={handleAddConflictClass}
        datasets={datasets}
        isEditMode={isEditMode}
        initialData={editingConflictClass}
        handleUpdateConflictClass={handleUpdateConflictClass}
        onEditConflictClass={handleEditConflictClass}
        onDeleteConflictClass={openDeleteConfirmDialog}
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
        onClose={closeDeleteConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this conflict class? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirmDialog}>Cancel</Button>
          <Button onClick={handleDeleteConflictClass} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ConflictClasses;