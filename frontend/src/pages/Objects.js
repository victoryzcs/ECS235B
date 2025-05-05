import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert, Snackbar } from '@mui/material';
import ObjectCard from '../components/Objects/ObjectCard';

function Objects() {
  const [objects, setObjects] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [conflictClasses, setConflictClasses] = useState([]);
  const [newObject, setNewObject] = useState({ 
    id: '', 
    name: '', 
    dataset: '',
    conflict_class: ''
  });
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

  const handleAddObject = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/objects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newObject)
      });
      
      if (response.ok) {
        setNewObject({ id: '', name: '', dataset: '', conflict_class: '' });
        fetchObjects();
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Objects Management
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage objects, their datasets, and conflict classes.
        </Typography>
      </Box>
      
      <ObjectCard 
        objects={objects}
        newObject={newObject}
        setNewObject={setNewObject}
        handleAddObject={handleAddObject}
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
    </Container>
  );
}

export default Objects;