import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert, Snackbar } from '@mui/material';
import ConflictClassCard from '../components/ConflictClasses/ConflictClassCard';

function ConflictClasses() {
  const [conflictClasses, setConflictClasses] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [newConflictClass, setNewConflictClass] = useState({ 
    class_id: '', 
    name: '', 
    datasets: []
  });
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
        <Typography variant="body1" color="text.secondary" paragraph>
          Create and manage conflict classes to organize datasets and prevent conflicts.
        </Typography>
      </Box>
      
      <ConflictClassCard 
        conflictClasses={conflictClasses}
        newConflictClass={newConflictClass}
        setNewConflictClass={setNewConflictClass}
        handleAddConflictClass={handleAddConflictClass}
        datasets={datasets}
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

export default ConflictClasses;