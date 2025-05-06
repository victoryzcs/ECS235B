import React from 'react';
import {
  TextField,
  Button,
  Grid,
  Typography,
  Box,
} from '@mui/material';

function RoleForm({newRole, setNewRole, handleAddRole}) {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Add New Role
      </Typography>
      
      <form onSubmit={handleAddRole}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Role ID"
              value={newRole.id}
              onChange={(e) => setNewRole({ ...newRole, id: e.target.value })}
              required
              variant="outlined"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Role Name"
              value={newRole.name}
              onChange={(e) => setNewRole({...newRole, name: e.target.value })}
              required
              variant="outlined"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
            <Button type="submit" variant="contained" color="primary">
              Add Role
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}

export default RoleForm;