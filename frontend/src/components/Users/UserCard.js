import React from 'react';
import UserList from './UserList';
import UserForm from './UserForm';
import { Card, CardContent, Typography, Divider,Button} from '@mui/material';


function UserCard({ 
  users, 
  // Props for UserForm (add/edit user)
  userData, // Renamed from newUser
  setUserData, // Renamed from setNewUser
  handleUserFormSubmit, // Renamed from handleAddUser
  isEditMode, // New prop for UserForm
  // Props for UserForm (assign role, grant permission - passed through)
  handleAssignRole, 
  handleGrantPermission,
  // Props for UserList
  onEditUser,
  onDeleteUser
}) {
  
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
        <UserList 
          users={users} 
          onEditUser={onEditUser}
          onDeleteUser={onDeleteUser}
        />
        <Divider sx={{ my: 2 }} />
        <UserForm 
          userData={userData}
          setUserData={setUserData}
          handleUserFormSubmit={handleUserFormSubmit}
          isEditMode={isEditMode}
          handleAssignRole={handleAssignRole}
          handleGrantPermission={handleGrantPermission}
          users={users}
        />
      </CardContent>
    </Card>
  );
}

export default UserCard;