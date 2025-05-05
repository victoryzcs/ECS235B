import React from 'react';
import UserList from './UserList';
import UserForm from './UserForm';

function UserCard({ users, newUser, setNewUser, handleAddUser, handleAssignRole }) {
  return (
    <div className='card'>
      <h2>Users</h2>
      <UserList users={users} />
      <UserForm 
        newUser={newUser} 
        setNewUser={setNewUser} 
        handleAddUser={handleAddUser}
        handleAssignRole={handleAssignRole}
      />
    </div>
  );
}

export default UserCard;