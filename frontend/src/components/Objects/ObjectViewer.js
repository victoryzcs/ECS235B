import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

function ObjectViewer({ open, onClose, object, onAccessRecorded }) {
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (open && object && currentUser) {
      checkAccess();
    }
  }, [open, object, currentUser]);

  const checkAccess = async () => {
    if (!object || !currentUser) {
      setError('Invalid object or user');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      console.log('object:', object);
      // Check if user has access
      const checkResponse = await fetch('http://localhost:8080/api/check_access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          object_id: object._id,
          action: 'read'
        })
      });
      
      const checkData = await checkResponse.json();
      
      if (!checkResponse.ok) {
        throw new Error(checkData.error || 'Failed to check access');
      }
      
      if (!checkData.allowed) {
        setError(checkData.reason || 'Access denied');
        setHasAccess(false);
        return;
      }

      // Record the access
      const recordResponse = await fetch('http://localhost:8080/api/record_access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          object_id: object._id
        })
      });
      
      const recordData = await recordResponse.json();
      
      if (!recordResponse.ok) {
        throw new Error(recordData.error || 'Failed to record access');
      }
      
      setHasAccess(true);
      onAccessRecorded();
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An error occurred while accessing the object');
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setLoading(true);
    setHasAccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Object Details</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : hasAccess ? (
            <>
              <Typography variant="h6" gutterBottom>
                {object?.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                ID: {object?._id}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Dataset: {object?.dataset}
              </Typography>
              {object?.conflict_class && (
                <Typography variant="body1" color="text.secondary" paragraph>
                  Conflict Class: {object?.conflict_class}
                </Typography>
              )}
              <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body1">
                  This is a placeholder for the object content. In a real application, 
                  this would display the actual content of the object.
                </Typography>
              </Box>
            </>
          ) : (
            null
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ObjectViewer; 