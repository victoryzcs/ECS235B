import React, { useState, useEffect } from 'react';
import UserCard from '../components/Users/UserCard';

function Users() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ id: '', name: '', users: [] });
  const API_URL = 'http://localhost:8080/api';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const data = await response.json();
      const userList = Object.values(data);
      setUsers(userList);
      setNewUser(prev => ({ ...prev, users: userList }));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newUser.id, name: newUser.name })
      });
      if (response.ok) {
        setNewUser({ id: '', name: '', users: users });
        fetchUsers();
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };
  
  const handleAssignRole = async (userId, roleId) => {
    if (!userId || !roleId) {
      alert('Please select both a user and a role');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/assign_role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role_id: roleId })
      });
      
      if (response.ok) {
        fetchUsers(); // Refresh the user list to show updated roles
        alert('Role assigned successfully');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Something went wrong'}`);
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      alert('Failed to assign role');
    }
  };

  return (
    <div className="users-page">
      <h1>Users Management</h1>
      <UserCard 
        users={users}
        newUser={newUser}
        setNewUser={setNewUser}
        handleAddUser={handleAddUser}
        handleAssignRole={handleAssignRole}
      />
    </div>
  );
}

export default Users;