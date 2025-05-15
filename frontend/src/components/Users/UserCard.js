import React from 'react';
import PropTypes from 'prop-types';
import UserList from './UserList';
import UserForm from './UserForm';
import { Card, CardContent, Typography, Divider,Button} from '@mui/material';


function UserCard({ 
  users, 
  userData,   
  setUserData, 
  handleUserFormSubmit, 
  isEditMode, 
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

UserCard.propTypes = {
  users: PropTypes.array.isRequired,
  userData: PropTypes.object.isRequired,
  setUserData: PropTypes.func.isRequired,
  handleUserFormSubmit: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool,
  handleAssignRole: PropTypes.func.isRequired,
  handleGrantPermission: PropTypes.func.isRequired,
  onEditUser: PropTypes.func.isRequired,
  onDeleteUser: PropTypes.func.isRequired,
};

export default UserCard;