import React from 'react';
import RoleList from './RoleList';
import RoleForm from './RoleForm';
import { Card, CardContent, Typography, Divider } from '@mui/material';

function RoleCard({ roles, newRole, setNewRole, handleAddRole }) {
  return (
    <Card sx={{ minWidth: 275, mb: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Roles
        </Typography>
        <RoleList roles={roles} />
        <Divider sx={{ my: 2 }} />
        <RoleForm
          newRole={newRole}
          setNewRole={setNewRole}
          handleAddRole={handleAddRole}
        />
      </CardContent>
    </Card>
  );
}

export default RoleCard;