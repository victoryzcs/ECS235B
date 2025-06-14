import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert, Snackbar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
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

  // State for Edit/Delete
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDataset, setEditingDataset] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState(null);

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
    } else {
      setAccessDenied(true);
      setSelectedDataset(dataset);
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

  const handleEditDataset = (dataset) => {
    setIsEditMode(true);
    setEditingDataset(dataset);
    setNewDataset({
      id: dataset._id,
      name: dataset.name,
      description: dataset.description || '',
      objects: dataset.objects || []
    });
  };

  const handleUpdateDataset = async () => {
    if (!editingDataset) return;
    try {
      const payload = {
        name: newDataset.name,
        description: newDataset.description
      };
      const response = await fetch(`${API_URL}/datasets/${editingDataset._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        fetchDatasets();
        showNotification('Dataset updated successfully');
        setIsEditMode(false);
        setEditingDataset(null);
        setNewDataset({ id: '', name: '', description: '', objects: [] });
      } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.error || 'Failed to update dataset'}`, 'error');
      }
    } catch (error) {
      console.error('Error updating dataset:', error);
      showNotification('Failed to update dataset', 'error');
    }
  };

  const openDeleteDatasetConfirm = (datasetId) => {
    setDatasetToDelete(datasetId);
    setShowDeleteConfirm(true);
  };

  const closeDeleteDatasetConfirm = () => {
    setDatasetToDelete(null);
    setShowDeleteConfirm(false);
  };

  const handleDeleteDataset = async () => {
    if (!datasetToDelete) return;
    try {
      const response = await fetch(`${API_URL}/datasets/${datasetToDelete}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchDatasets();
        showNotification('Dataset deleted successfully');
      } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.error || 'Failed to delete dataset'}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting dataset:', error);
      showNotification('Failed to delete dataset', 'error');
    }
    closeDeleteDatasetConfirm();
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Datasets Management
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
        onEditDataset={handleEditDataset}
        onDeleteDataset={openDeleteDatasetConfirm}
        isEditMode={isEditMode}
        initialFormDataset={editingDataset}
        handleUpdateDataset={handleUpdateDataset}
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

      {/* Delete Confirmation Dialog for Datasets */}
      <Dialog
        open={showDeleteConfirm}
        onClose={closeDeleteDatasetConfirm}
        aria-labelledby="delete-dataset-dialog-title"
      >
        <DialogTitle id="delete-dataset-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this dataset? This action cannot be undone. 
            Ensure all objects are removed from this dataset first.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDatasetConfirm}>Cancel</Button>
          <Button onClick={handleDeleteDataset} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}

export default Datasets;