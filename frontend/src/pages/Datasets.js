import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert, Snackbar } from '@mui/material';
import DatasetCard from '../components/Datasets/DatasetCard';
import { useAuth } from '../contexts/AuthContext';

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
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [conflictWarning, setConflictWarning] = useState(false);
  const [conflictingDatasetNames, setConflictingDatasetNames] = useState('');
  const [loading, setLoading] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const API_URL = 'http://localhost:8080/api';
  
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  const isManager = auth?.isManager;
  const [dialogOpen, setDialogOpen] = useState(false);

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
  
  const handleViewDataset = async (dataset) => {
    if (isManager) {
      setLoading(true);
      
      const hasConflict = await checkConflictAccess(dataset.id);
      
      if (hasConflict) {
        showNotification('Access denied: You have already accessed a dataset in a conflicting class', 'error');
        setAccessDenied(true);
        setSelectedDataset(dataset);
        setDialogOpen(true);
        setLoading(false);
        return;
      }
      
      const conflictingDatasets = await getConflictingDatasets(dataset.id);
      
      setSelectedDataset(dataset);
      setConflictWarning(true);
      setConflictingDatasetNames(conflictingDatasets.map(d => d.name).join(", "));
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const hasAccess = await checkDatasetAccess(dataset.id);
    
    if (hasAccess) {
      setSelectedDataset(dataset);
      setAccessDenied(false);
      setDialogOpen(true);
    } else {
      setAccessDenied(true);
      setSelectedDataset(dataset);
      setDialogOpen(true);
    }
    
    setLoading(false);
  };

  const getConflictingDatasets = async (datasetId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/conflict_classes/${datasetId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error('Failed to get conflicting datasets');
        return [];
      }
      
      const data = await response.json();
      return data.conflicting_datasets || [];
    } catch (error) {
      console.error('Error getting conflicting datasets:', error);
      return [];
    }
  };

  const confirmAccessDespiteConflicts = async () => {
    setConflictWarning(false);
    
    await recordDatasetAccess(selectedDataset.id);
    
    setDialogOpen(true);
  };
  
  const checkDatasetAccess = async (datasetId) => {
    if (currentUser?.role === 'admin') {
      return true;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/check_access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: currentUser?.id,
          object_id: datasetId,
          action: 'read'
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Access check failed:', data);
        showNotification(data.error || 'Access denied. You do not have permission to view this dataset.', 'error');
        return false;
      }
      
      return data.allowed === true;
    } catch (error) {
      console.error('Error checking dataset access:', error);
      showNotification('Error checking access permissions. Please try again later.', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkConflictAccess = async (datasetId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/have_conflict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: currentUser?.id,
          dataset_id: datasetId,
          // action: 'read'
        })
      });
      console.log(response)
      
      const data = await response.json();
      return data.has_conflict === true;
    } catch (error) {
      console.error('Error checking conflict access:', error);
      return false;
    }
  };

  const recordDatasetAccess = async (datasetId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/record_access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: currentUser?.id,
          object_id: datasetId
        })
      });
      
      if (!response.ok) {
        console.error('Failed to record dataset access');
      }
    } catch (error) {
      console.error('Error recording dataset access:', error);
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
        handleViewDataset={handleViewDataset}
        selectedDataset={selectedDataset}
        conflictWarning={conflictWarning}
        setConflictWarning={setConflictWarning}
        conflictingDatasetNames={conflictingDatasetNames}
        confirmAccessDespiteConflicts={confirmAccessDespiteConflicts}
        loading={loading}
        accessDenied={accessDenied}
        isManager={isManager}
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