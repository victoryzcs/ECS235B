import React, { useState } from 'react';

function RoleForm({newRole, setNewRole, handleAddRole}) {
    return(
    <form onSubmit={handleAddRole} className='add-form'>
        <input
            type="text"
            placeholder="Role ID"
            value={newRole.id}
            onChange={(e) => setNewRole({ ...newRole, id: e.target.value })}
        />
        <input
            type="text"
            placeholder="Role Name"
            value={newRole.name}
            onChange={(e) => setNewRole({...newRole, name: e.target.value })}
        />
        <button type="submit">Add Role</button>
    </form>
    );
}
export default RoleForm;