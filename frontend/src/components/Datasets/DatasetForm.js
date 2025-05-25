import React from 'react';
import {
  TextField,
  Button,
  Grid,
  Typography,
  Box,
} from '@mui/material';

function DatasetForm({ newDataset, setNewDataset, handleAddDataset }) {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Add New Dataset
      </Typography>
      
      <form onSubmit={handleAddDataset}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="ID"
              value={newDataset.id}
              onChange={e => setNewDataset({...newDataset, id: e.target.value})}
              required
              variant="outlined"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Name"
              value={newDataset.name}
              onChange={e => setNewDataset({...newDataset, name: e.target.value})}
              required
              variant="outlined"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Description"
              value={newDataset.description}
              onChange={e => setNewDataset({...newDataset, description: e.target.value})}
              variant="outlined"
              margin="normal"
              placeholder="Optional description"
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12} sx={{ mt: 2, textAlign: 'center' }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              sx={{ minWidth: 150 }}
            >
              Add Dataset
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}

export default DatasetForm;