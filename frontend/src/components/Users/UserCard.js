import React from 'react';
import UserList from './UserList';
import UserForm from './UserForm';
import { Card, CardContent, Typography, Divider,Button} from '@mui/material';


function UserCard({ users, newUser, setNewUser, handleAddUser, handleAssignRole, handleGrantPermission }) {
  
  const handleRefresh = () => {
    const refreshEvent = new CustomEvent('refreshUsers');
    window.dispatchEvent(refreshEvent);
  };

  return (
    <Card sx={{ minWidth: 275, mb: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Users
        </Typography>
        {/* <Button 
            variant="outlined" 
            onClick={handleRefresh}
            size="small"
          >
            Refresh
          </Button> */}
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