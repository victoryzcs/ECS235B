import React from 'react';
import UserList from './UserList';
import UserForm from './UserForm';
import { Card, CardContent, Typography, Divider } from '@mui/material';

function UserCard({ users, newUser, setNewUser, handleAddUser, handleAssignRole, handleGrantPermission }) {
  return (
    <Card sx={{ minWidth: 275, mb: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Users
        </Typography>
        <UserList users={users} />
        <Divider sx={{ my: 2 }} />
        <UserForm 
          newUser={newUser} 
          setNewUser={setNewUser} 
          handleAddUser={handleAddUser}
          handleAssignRole={handleAssignRole}
          handleGrantPermission={handleGrantPermission}
          users={users}
        />
      </CardContent>
    </Card>
  );
}

export default UserCard;