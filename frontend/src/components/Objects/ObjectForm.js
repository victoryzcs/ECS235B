import React, { useEffect } from 'react';
import {
  TextField,
  Button,
  Grid,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  Box,
  Alert
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

function ObjectForm({ 
  objectData,
  setObjectData,
  handleFormSubmit,
  isEditMode,
  datasets,
  conflictClasses
}) {
  const auth = useAuth();
  const isAdmin = auth?.isAdmin;
  const isManager = auth?.isManager;
  
  useEffect(() => {
    // If in edit mode and objectData (initial data for edit) is provided,
    // it's already set by the parent. No specific action needed here for pre-filling
    // unless we need to transform it.
    // If switching from edit to add, parent should reset objectData.
  }, [isEditMode, objectData]);

  if (!isAdmin && !isManager) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="info">
          You do not have permission to create new objects. Please contact your manager.
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        {isEditMode ? 'Edit Object' : 'Add New Object'}
      </Typography>
      
      <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Object ID"
              value={objectData.id || ''}
              onChange={e => setObjectData({...objectData, id: e.target.value})}
              required
              variant="outlined"
              margin="normal"
              disabled={isEditMode}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Object Name"
              value={objectData.name || ''}
              onChange={e => setObjectData({...objectData, name: e.target.value})}
              required
              variant="outlined"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined" margin="normal" required>
              <InputLabel>Dataset</InputLabel>
              <Select
                value={objectData.dataset || ''}
                onChange={e => setObjectData({...objectData, dataset: e.target.value})}
              >
                <MenuItem value="">
                  <em>Select a dataset</em>
                </MenuItem>
                {datasets.map(ds => (
                  <MenuItem key={ds._id} value={ds._id}>
                    {ds._id} - {ds.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select the dataset this object belongs to.</FormHelperText>
            </FormControl>
          </Grid>
          {isEditMode && objectData.conflict_class && (
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Conflict Class (Auto)"
                value={objectData.conflict_class}
                disabled
                variant="outlined"
                margin="normal"
                helperText="Determined by selected dataset"
              />
            </Grid>
          )}
          <Grid item xs={12} sx={{ mt: 2, textAlign: 'center' }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              sx={{ minWidth: 150 }}
            >
              {isEditMode ? 'Update Object' : 'Add Object'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}

export default ObjectForm;