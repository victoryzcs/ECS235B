import React from 'react';

function RoleList({ roles }) {
  return (
    <div className='role-list-container'>
        {roles.length === 0 ? (
            <p>No roles found</p>
            ): (
            <ul>
                {roles.map(role => (
                    <li key={role.id}>
                        <strong>{role.id}</strong>: {role.name}
                    </li>
                ))}
            </ul>
            )
        }
    </div>
  )
}

export default RoleList;