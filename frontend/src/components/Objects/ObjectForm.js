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
} from '@mui/material';

function ObjectForm({ newObject, setNewObject, handleAddObject, datasets, conflictClasses }) {
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
              value={newObject.id}
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
            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel>Dataset</InputLabel>
              <Select
                value={newObject.dataset}
                onChange={e => setNewObject({...newObject, dataset: e.target.value})}
                label="Dataset"
                required
              >
                <MenuItem value="">
                  <em>Select a dataset</em>
                </MenuItem>
                {datasets.map(dataset => (
                  <MenuItem key={dataset.id} value={dataset.id}>
                    {dataset.id} - {dataset.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Required</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
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
          </Grid>
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