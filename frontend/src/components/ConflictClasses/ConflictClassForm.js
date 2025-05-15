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
  Chip,
  Box,
  OutlinedInput,
} from '@mui/material';

function ConflictClassForm({ 
  newConflictClass, 
  setNewConflictClass, 
  handleAddConflictClass, 
  datasets,
  isEditMode = false,
  initialData = null,
  handleUpdateConflictClass
}) {
  
  useEffect(() => {
    if (isEditMode && initialData) {
      setNewConflictClass({
        class_id: initialData._id,
        name: initialData.name,
        datasets: initialData.datasets || []
      });
    } else if (!isEditMode) {
      setNewConflictClass({ class_id: '', name: '', datasets: [] });
    }
  }, [isEditMode, initialData, setNewConflictClass]);

  const handleDatasetChange = (event) => {
    const {
      target: { value },
    } = event;
    setNewConflictClass({
      ...newConflictClass,
      datasets: typeof value === 'string' ? value.split(',') : value,
    });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        {isEditMode ? 'Edit Conflict Class' : 'Add New Conflict Class'}
      </Typography>
      
      <form onSubmit={isEditMode ? (e) => { e.preventDefault(); handleUpdateConflictClass(); } : handleAddConflictClass}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="ID"
              value={newConflictClass.class_id || ''}
              onChange={e => setNewConflictClass({...newConflictClass, class_id: e.target.value})}
              required
              variant="outlined"
              margin="normal"
              disabled={isEditMode}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Name"
              value={newConflictClass.name || ''}
              onChange={e => setNewConflictClass({...newConflictClass, name: e.target.value})}
              required
              variant="outlined"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel id="dataset-multiple-chip-label">Datasets</InputLabel>
              <Select
                fullWidth
                sx={{ width: '100%' }}
                labelId="dataset-multiple-chip-label"
                label="Datasets"
                id="dataset-multiple-chip"
                multiple
                value={newConflictClass.datasets || []}
                onChange={handleDatasetChange}
                input={<OutlinedInput fullWidth id="select-multiple-chip" label="Datasets" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 280,
                    },
                  },
                }}
              >
                {datasets.map((dataset, index) => (
                  <MenuItem
                    key={dataset._id != null ? dataset._id : `dataset-${index}`}
                    value={dataset._id != null ? dataset._id : ''}
                  >
                    {(dataset._id != null ? dataset._id : 'N/A')} - {dataset.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sx={{ mt: 2, textAlign: 'center' }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              sx={{ minWidth: 150 }}
            >
              {isEditMode ? 'Update Conflict Class' : 'Add Conflict Class'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}

export default ConflictClassForm;