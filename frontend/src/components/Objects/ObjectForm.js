import React from 'react';
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

function ObjectForm({ newObject, setNewObject, handleAddObject, datasets, conflictClasses }) {
  const auth = useAuth();
  const isAdmin = auth?.isAdmin;
  const isManager = auth?.isManager;
  
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
        Add New Object
      </Typography>
      
      <form onSubmit={handleAddObject}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="ID"
              value={newObject._id}
              onChange={e => setNewObject({...newObject, id: e.target.value})}
              required
              variant="outlined"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Name"
              value={newObject.name}
              onChange={e => setNewObject({...newObject, name: e.target.value})}
              required
              variant="outlined"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined" margin="normal" >
              <InputLabel id="dataset-select-label">Dataset *</InputLabel>
              <Select
                labelId="dataset-select-label"
                value={newObject.dataset}
                onChange={e => setNewObject({...newObject, dataset: e.target.value})}
                label="Dataset *"
                required
              >
                <MenuItem value="">
                  <em>Select a dataset</em>
                </MenuItem>
                {datasets.map(dataset => (
                  <MenuItem key={dataset._id} value={dataset._id}>
                    {dataset._id} - {dataset.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Required - Object must belong to a dataset</FormHelperText>
            </FormControl>
          </Grid>
          {/* <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel>Conflict Class</InputLabel>
              <Select
                value={newObject.conflict_class}
                onChange={e => setNewObject({...newObject, conflict_class: e.target.value})}
                label="Conflict Class"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {conflictClasses.map(cc => (
                  <MenuItem key={cc.class_id} value={cc.class_id}>
                    {cc.class_id} - {cc.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Optional</FormHelperText>
            </FormControl>
          </Grid> */}
          <Grid item xs={12} sx={{ mt: 2, textAlign: 'center' }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              sx={{ minWidth: 150 }}
            >
              Add Object
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}

export default ObjectForm;