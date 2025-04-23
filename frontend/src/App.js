import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';

function App() {
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
    <div className="App">
      {/* <header className="App-header">
        <h1>Chinese Wall Security Policy Engine</h1>
        <h2>Access Control System Implementation</h2>
      </header> */}

      <main className='App-main'>
        <div className='dashboard'>
          <div className='card'>
            <h2>Users</h2>
            <div className='content-list'>
              {users.length > 0 ? (
                <ul>
                  {users.map(user => (
                    <li key={user.id}>
                      <strong>{user.name}</strong> (ID: {user.id})
                      {user.roles && user.roles.length > 0 && (
                        <div className='tag-container'>
                          {user.roles.map(role => (
                            <span key={role} className='tag'>{role}</span>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='empty-state'>No users found</p>
              )}
            </div>
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
          </div>
        </div>
      </main>
      
    </div>
  );
}

export default App;
