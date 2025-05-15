import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert, Snackbar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import ObjectCard from '../components/Objects/ObjectCard';

function Objects() {
  const [objects, setObjects] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [conflictClasses, setConflictClasses] = useState([]);
  const [objectFormData, setObjectFormData] = useState({ 
    id: '', 
    name: '', 
    dataset: '',
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingObject, setEditingObject] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [objectToDelete, setObjectToDelete] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const API_URL = 'http://localhost:8080/api';

  useEffect(() => {
    fetchObjects();
    fetchDatasets();
    fetchConflictClasses();
  }, []);

  const fetchObjects = async () => {
    try {
      const response = await fetch(`${API_URL}/objects`);
      const data = await response.json();
      setObjects(Object.values(data));
    } catch (error) {
      console.error('Error fetching objects:', error);
      showNotification('Error fetching objects', 'error');
    }
  };

  const fetchDatasets = async () => {
    try {
      const response = await fetch(`${API_URL}/datasets`);
      const data = await response.json();
      setDatasets(Object.values(data));
    } catch (error) {
      console.error('Error fetching datasets:', error);
      showNotification('Error fetching datasets', 'error');
    }
  };

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

  const handleEditObject = (object) => {
    setIsEditMode(true);
    setEditingObject(object); 
    setObjectFormData({ 
      id: object._id, 
      name: object.name, 
      dataset: object.dataset,
    });
  };

  const handleFormSubmit = async () => {
    if (isEditMode) {
      await handleUpdateObject();
    } else {
      await handleAddObject();
    }
  };

  const handleAddObject = async () => {
    if (!objectFormData.id || !objectFormData.name || !objectFormData.dataset) {
      showNotification('Object ID, Name, and Dataset are required', 'error');
      return;
    }
    if (objects.some(o => o._id === objectFormData.id)) {
        showNotification('Object ID already exists.', 'error');
        return;
    }

    try {
      const payload = { 
        id: objectFormData.id, 
        name: objectFormData.name, 
        dataset: objectFormData.dataset 
      };
      const response = await fetch(`${API_URL}/objects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        fetchObjects(); 
        setObjectFormData({ id: '', name: '', dataset: '' }); 
        showNotification('Object added successfully');
      } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.error || 'Failed to add object'}`, 'error');
      }
    } catch (error) {
      console.error('Error adding object:', error);
      showNotification('Failed to add object', 'error');
    }
  };

  const handleUpdateObject = async () => {
    if (!editingObject || !objectFormData.name || !objectFormData.dataset) {
      showNotification('Object Name and Dataset are required for update', 'error');
      return;
    }
    try {
      const payload = {
        name: objectFormData.name,
        dataset: objectFormData.dataset
      };

      const response = await fetch(`${API_URL}/objects/${editingObject._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        fetchObjects();
        showNotification('Object updated successfully');
        setIsEditMode(false);
        setEditingObject(null);
        setObjectFormData({ id: '', name: '', dataset: '' });
      } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.error || 'Failed to update object'}`, 'error');
      }
    } catch (error) {
      console.error('Error updating object:', error);
      showNotification('Failed to update object', 'error');
    }
  };

  const openDeleteObjectConfirm = (objectId) => {
    setObjectToDelete(objectId);
    setShowDeleteConfirm(true);
  };

  const closeDeleteObjectConfirm = () => {
    setObjectToDelete(null);
    setShowDeleteConfirm(false);
  };

  const handleDeleteObject = async () => {
    if (!objectToDelete) return;
    try {
      const response = await fetch(`${API_URL}/objects/${objectToDelete}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchObjects();
        showNotification('Object deleted successfully');
      } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.error || 'Failed to delete object'}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting object:', error);
      showNotification('Failed to delete object', 'error');
    }
    closeDeleteObjectConfirm();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Objects Management
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          Manage objects, their datasets, and conflict classes.
        </Typography>
      </Box>
      
      <ObjectCard 
        objects={objects}
        objectData={objectFormData}
        setObjectData={setObjectFormData}
        handleFormSubmit={handleFormSubmit}
        isEditMode={isEditMode}
        onEditObject={handleEditObject}
        onDeleteObject={openDeleteObjectConfirm}
        datasets={datasets}
        conflictClasses={conflictClasses}
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
        onClose={closeDeleteObjectConfirm}
        aria-labelledby="delete-object-dialog-title"
      >
        <DialogTitle id="delete-object-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this object? This action cannot be undone. 
            It will be removed from its dataset and any permissions.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteObjectConfirm}>Cancel</Button>
          <Button onClick={handleDeleteObject} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}

export default Objects;