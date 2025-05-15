import React, { useEffect } from 'react';
import {
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

function RoleForm({newRole, setNewRole, handleAddRole, roles = []}) {



  const predefinedRoles = [
    { id: 'admin', name: 'Admin' },
    { id: 'manager', name: 'Manager' },
    { id: 'worker', name: 'Worker' }
  ];

  useEffect(() => {
    const selectedRole = predefinedRoles.find(role => role.name === newRole.name);
    if (selectedRole) {
      setNewRole({ ...newRole, id: selectedRole.id });
    }
  }, [newRole.name, setNewRole]);

  const handleRoleChange = (e) => {
    const selectedName = e.target.value;
    const selectedRole = predefinedRoles.find(role => role.name === selectedName);
    
    if (selectedRole) {
      setNewRole({
        id: selectedRole.id,
        name: selectedRole.name
      });
    }
  };

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
              disabled
              variant="outlined"
              margin="normal"
              helperText="ID is automatically set based on role selection"
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <FormControl fullWidth margin="normal">
            <InputLabel id="role-name-label" sx={{ fontSize: '1rem', padding: '0 0 8px 0' }}>Role Name</InputLabel>              <Select
                labelId="role-name-label"
                id="role-name"
                value={newRole.name}
                label="Role Name"
                onChange={handleRoleChange}
                required
              >
                {predefinedRoles.map((role) => (
                  <MenuItem key={role.id} value={role.name}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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