import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip,
  Typography,
  Box
} from '@mui/material';

function UserList({ users }) {
  return (
    <Box sx={{ mt: 2 }}>
      {users.length === 0 ? (
        <Typography variant="body1">No users found</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
          <Table stickyHeader aria-label="users table">
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Roles</strong></TableCell>
                <TableCell><strong>Access History</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>
                    {user.roles && user.roles.length > 0 ? (
                      user.roles.map((role, index) => (
                        <Chip 
                          key={index} 
                          label={role} 
                          size="small" 
                          sx={{ margin: '2px', background: '#e3f2fd' }} 
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">No roles assigned</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.access_history && user.access_history.length > 0 ? (
                      user.access_history.map((access, index) => (
                        <Chip 
                          key={index} 
                          label={access} 
                          size="small" 
                          sx={{ margin: '2px', background: '#fff8e1' }} 
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">No access history</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default UserList;
