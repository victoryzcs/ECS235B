import React, { useState, useEffect } from 'react';

function UserForm({ newUser, setNewUser, handleAddUser, handleAssignRole }) {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  
  useEffect(() => {
    fetchRoles();
  }, []);
  
  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/roles');
      const data = await response.json();
      setRoles(Object.values(data));
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleAddUser} className='add-form'>
        <input
          type="text"
          placeholder="User ID"
          value={newUser.id}
          onChange={e => setNewUser({...newUser, id: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="User Name"
          value={newUser.name}
          onChange={e => setNewUser({...newUser, name: e.target.value})}
          required
        />
        <button type="submit">Add User</button>
      </form>
      
      <div className="assign-role-form">
        <h3>Assign Role to User</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleAssignRole(selectedUserId, selectedRole);
        }}>
          <select 
            value={selectedUserId} 
            onChange={e => setSelectedUserId(e.target.value)}
            required
          >
            <option value="">Select User</option>
            {newUser.users && newUser.users.map(user => (
              <option key={user.id} value={user.id}>{user.id} - {user.name}</option>
            ))}
          </select>
          
          <select 
            value={selectedRole} 
            onChange={e => setSelectedRole(e.target.value)}
            required
          >
            <option value="">Select Role</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.id} - {role.name}</option>
            ))}
          </select>
          
          <button type="submit">Assign Role</button>
        </form>
      </div>
    </div>
  );
}

export default UserForm;