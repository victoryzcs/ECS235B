import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert, Snackbar } from '@mui/material';
import DatasetCard from '../components/Datasets/DatasetCard';

function Datasets() {
  const [datasets, setDatasets] = useState([]);
  const [newDataset, setNewDataset] = useState({ 
    id: '', 
    name: '', 
    description: '',
    objects: []
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const API_URL = 'http://localhost:8080/api';

  useEffect(() => {
    fetchDatasets();
  }, []);

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

  const handleAddDataset = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/datasets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newDataset.id,
          name: newDataset.name,
          description: newDataset.description
        })
      });
      
      if (response.ok) {
        setNewDataset({ id: '', name: '', description: '', objects: [] });
        fetchDatasets();
        showNotification('Dataset added successfully');
      } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.error || 'Failed to add dataset'}`, 'error');
      }
    } catch (error) {
      console.error('Error adding dataset:', error);
      showNotification('Failed to add dataset', 'error');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Datasets Management
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Create and manage datasets for organizing objects.
        </Typography>
      </Box>
      
      <DatasetCard 
        datasets={datasets}
        newDataset={newDataset}
        setNewDataset={setNewDataset}
        handleAddDataset={handleAddDataset}
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

export default Datasets;