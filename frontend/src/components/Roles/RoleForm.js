import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  TextField,
  Button,
  Grid,
  Typography,
  Box,
} from '@mui/material';

function RoleForm({ 
  roleData,
  setRoleData,
  handleSubmit,
  isEditMode = false 
}) {

  useEffect(() => {
    // If not in edit mode, and we want to clear the form (e.g. after submission)
    // this could be handled here or in the parent by resetting roleData.
    // For now, the parent will manage clearing the form data after submission.
  }, [isEditMode]);

  const handleChange = (e) => {
    setRoleData({ ...roleData, [e.target.name]: e.target.value });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        {isEditMode ? 'Edit Role' : 'Add New Role'}
      </Typography>
      
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Role ID"
              name="id"
              value={roleData.id || ''}
              onChange={handleChange}
              required
              variant="outlined"
              margin="normal"
              disabled={isEditMode}
              helperText={isEditMode ? "ID cannot be changed" : "Enter a unique ID for the new role"}
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Role Name"
              name="name"
              value={roleData.name || ''}
              onChange={handleChange}
              required
              variant="outlined"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={2} sx={{ pb: '7px' }}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              {isEditMode ? 'Update Role' : 'Add Role'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}

RoleForm.propTypes = {
  roleData: PropTypes.object.isRequired,
  setRoleData: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool,
};

export default RoleForm;