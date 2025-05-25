import React from 'react';
import PropTypes from 'prop-types';
import RoleList from './RoleList';
import RoleForm from './RoleForm';
import { Card, CardContent, Typography, Divider } from '@mui/material';

function RoleCard({ 
  roles, 
  // Props for the form (can be for add or edit)
  roleData, 
  setRoleData, 
  handleFormSubmit, // Renamed from handleAddRole
  isEditMode, 
  // Props for the list
  onEditRole, 
  onDeleteRole 
}) {
  return (
    <Card sx={{ minWidth: 275, mb: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Roles
        </Typography>
        <RoleList 
          roles={roles} 
          onEdit={onEditRole} 
          onDelete={onDeleteRole} 
        />
        <Divider sx={{ my: 2 }} />
        <RoleForm
          roleData={roleData} // Pass roleData (for new or existing role)
          setRoleData={setRoleData} // Pass setter for roleData
          handleSubmit={handleFormSubmit} // Pass the unified submit handler
          isEditMode={isEditMode} // Pass edit mode status
        />
      </CardContent>
    </Card>
  );
}

RoleCard.propTypes = {
  roles: PropTypes.array.isRequired,
  roleData: PropTypes.object.isRequired,
  setRoleData: PropTypes.func.isRequired,
  handleFormSubmit: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  onEditRole: PropTypes.func.isRequired,
  onDeleteRole: PropTypes.func.isRequired,
};

export default RoleCard;