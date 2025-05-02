import React from 'react';
import RoleList from './RoleList';
import RoleForm from './RoleForm';

function RoleCard({ roles, newRole, setNewRole, handleAddRole }) {
  return (
    <div className="card">
        <h2>Roles</h2>
        <RoleList roles={roles} />
        <RoleForm
            newRole={newRole}
            setNewRole={setNewRole}
            handleAddRole={handleAddRole}
        />
        
    </div>
    // <div className='card'>
    //   <h2>Users</h2>
    //   <UserList users={users} />
    //   <UserForm 
    //     newUser={newUser} 
    //     setNewUser={setNewUser} 
    //     handleAddUser={handleAddUser} 
    //   />
    // </div>
  );
}

export default RoleCard;