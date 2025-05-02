import React from 'react';
import { useState, useEffect } from 'react';   
import RoleCard from '../components/Roles/RoleCard';

function Roles() {
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState({
    id: '',
    name: ''
  });
  const API_URL = 'http://localhost:8080/api';

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_URL}/roles`);
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleAddRole = async () => {
    try {
      const response = await fetch(`${API_URL}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRole),
      });
      const data = await response.json();
      setRoles([...roles, data]);
    } catch (error) {
      console.error('Error adding role:', error);
    }
  }


  return (
    <div className="roles-page">
      <h1>Roles Management</h1>
      <RoleCard 
      roles={roles}
      newRole={newRole}
      setNewRole={setNewRole}
      handleAddRole={handleAddRole}
      />
    </div>
  );
}

export default Roles;