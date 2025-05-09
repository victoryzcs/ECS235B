import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

function DatasetList({ datasets }) {
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [accessError, setAccessError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  const isManager = auth?.isManager;
  
  const datasetsArray = Array.isArray(datasets) ? datasets : Object.values(datasets || {});

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setAccessDenied(false);
    setAccessError('');
  };

  const checkDatasetAccess = async (datasetId) => {
    if (currentUser?.role === 'admin') {
      return true;
    }
    
    if (currentUser?.role === 'manager') {
      return true;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8080/api/check_access', {
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
        setAccessError(data.error || 'Access denied. You do not have permission to view this dataset.');
        return false;
      }
      
      return data.allowed === true;
    } catch (error) {
      console.error('Error checking dataset access:', error);
      setAccessError('Error checking access permissions. Please try again later.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const recordDatasetAccess = async (datasetId) => {
    try {
      const token = localStorage.getItem('token');
      
      await fetch('http://localhost:8080/api/grant_access', {
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
    } catch (error) {
      console.error('Error recording dataset access:', error);
    }
  };

  const handleViewDataset = async (dataset) => {
    if (isManager) {
      const conflictingDatasets = await getConflictingDatasets(dataset.id);
      
      setSelectedDataset(dataset);
      setConflictWarning(true);
      setConflictingDatasetNames(conflictingDatasets.map(d => d.name).join(", "));
      return;
    }
    
    setLoading(true);
    const hasAccess = await checkDatasetAccess(dataset.id);
    
    if (hasAccess) {
      await recordDatasetAccess(dataset.id);
      
      setSelectedDataset(dataset);
      setAccessDenied(false);
    } else {
      setAccessDenied(true);
    }
    
    setDialogOpen(true);
    setLoading(false);
  };

  const getConflictingDatasets = async (datasetId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:8080/api/conflict_classes/${datasetId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("getConflictingDatasets response: ", response)

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

  const [conflictWarning, setConflictWarning] = useState(false);
  const [conflictingDatasetNames, setConflictingDatasetNames] = useState('');

  const confirmAccessDespiteConflicts = async () => {
    setConflictWarning(false);
    
    setLoading(true);
    await recordDatasetAccess(selectedDataset.id);
    setLoading(false);
    
    setDialogOpen(true);
  };

  return (
    <Box sx={{ mt: 2 }}>
      {datasetsArray.length === 0 ? (
        <Typography variant="body1">No datasets found</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
          <Table stickyHeader aria-label="datasets table">
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {datasetsArray.map(dataset => (
                <TableRow key={dataset.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">{dataset.id}</TableCell>
                  <TableCell>{dataset.name}</TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      size="small" 
                      color="primary"
                      onClick={() => handleViewDataset(dataset)}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'View'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="dataset-dialog-title"
        maxWidth="md"
        fullWidth
      >
        {accessDenied ? (
          <>
            <DialogTitle id="dataset-dialog-title" sx={{ bgcolor: '#ffebee' }}>
              Access Denied
            </DialogTitle>
            <DialogContent>
              <Alert severity="error" sx={{ mb: 2 }}>
                {accessError || 'You do not have permission to view this dataset.'}
              </Alert>
              <DialogContentText>
                Based on your role and permissions, you cannot access this dataset.
                Please contact your administrator if you believe this is an error.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Close
              </Button>
            </DialogActions>
          </>
        ) : selectedDataset && (
          <>
            <DialogTitle id="dataset-dialog-title">
              Dataset: {selectedDataset.name}
            </DialogTitle>
            <DialogContent>
              <Typography variant="subtitle1" gutterBottom>
                ID: {selectedDataset.id}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedDataset.description || 'No description available'}
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Objects in this Dataset
              </Typography>
              
              {selectedDataset.objects && selectedDataset.objects.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedDataset.objects.map((objectId, index) => (
                    <Chip 
                      key={index} 
                      label={objectId} 
                      size="small" 
                      sx={{ margin: '2px', background: '#e3f2fd' }} 
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No objects in this dataset
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default DatasetList;