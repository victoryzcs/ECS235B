import React from 'react';

function UserList({ users }) {
  return (
    <div className="user-list">
      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        <ul>
          {users.map(user => (
            <li key={user.id}>
              <strong>{user.id}</strong>: {user.name}
              {user.roles && user.roles.length > 0 && (
                <span> - Roles: {user.roles.join(', ')}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserList;
