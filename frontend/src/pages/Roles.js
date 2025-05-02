import React from 'react';
import RoleList from '../components/Roles/RoleList';
import { useState, useEffect } from 'react';   

function Roles() {
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState({
    name: '',
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

  return (
    <div className="roles-page">
      <h1>Roles Management</h1>
      <RoleList roles={roles}/>
    </div>
  );
}

export default Roles;