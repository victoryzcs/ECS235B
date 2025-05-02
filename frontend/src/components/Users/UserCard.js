import React from 'react';
import UserList from './UserList';
import UserForm from './UserForm';

function UserCard({ users, newUser, setNewUser, handleAddUser }) {
  return (
    <div className='card'>
      <h2>Users</h2>
      <UserList users={users} />
      <UserForm 
        newUser={newUser} 
        setNewUser={setNewUser} 
        handleAddUser={handleAddUser} 
      />
    </div>
  );
}

export default UserCard;