import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip 
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

function UserList({ users }) {
  const auth = useAuth();
  const isAdmin = auth?.isAdmin;
  // console.log('auth:', auth); 
  // console.log('isAdmin:', isAdmin); 
  console.log('users:', users);
  
  const filteredUsers = isAdmin 
    ? users 
    : users.filter(user => 
        !user.id.toLowerCase().startsWith('admin') && 
        !user.id.toLowerCase().startsWith('manager')
      );
  
  return (
    <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
      <Table stickyHeader aria-label="users table">
        <TableHead>
          <TableRow>
            <TableCell><strong>ID</strong></TableCell>
            <TableCell><strong>Name</strong></TableCell>
            <TableCell><strong>Role</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredUsers.map(user => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>
                {user.roles && user.roles.length > 0 ? (
                  <Chip 
                    label={user.roles[0]} 
                    color={user.roles[0] === 'admin' ? 'error' : user.roles[0] === 'manager' ? 'warning' : 'primary'} 
                    size="small" 
                  />
                ) : (
                  'No role assigned'
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default UserList;
