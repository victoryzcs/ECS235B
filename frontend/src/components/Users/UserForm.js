import React from 'react';

function UserForm({ newUser, setNewUser, handleAddUser }) {
  return (
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
  );
}

export default UserForm;