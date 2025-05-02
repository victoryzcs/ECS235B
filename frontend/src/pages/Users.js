import React, { useState, useEffect } from 'react';
import UserCard from '../components/Users/UserCard';

function Users() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ id: '', name: '' });
  const API_URL = 'http://localhost:8080/api';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const data = await response.json();
      setUsers(Object.values(data));
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
        body: JSON.stringify(newUser)
      });
      if (response.ok) {
        setNewUser({ id: '', name: '' });
        fetchUsers();
      }
    } catch (error) {
      console.error('Error adding user:', error);
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
      />
    </div>
  );
}

export default Users;