import React from 'react';
import PropTypes from 'prop-types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip,
  Box,
  Tooltip,
  Button,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../contexts/AuthContext';

function UserList({ users, onEditUser, onDeleteUser }) {
  const auth = useAuth();
  const isAdmin = auth?.isAdmin;
  
  let filteredUsers;
  if (!users) {
    filteredUsers = [];
  } else if (isAdmin) {
    filteredUsers = users;
  } else {
    filteredUsers = users.filter(user => {
      const objectId = user?._id;
      if (typeof objectId !== 'string') {
        return false;
      }
      const userId = objectId.toLowerCase();
      return !userId.startsWith('admin') && !userId.startsWith('manager');
    });
  }
  
  return (
    <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
      <Table stickyHeader aria-label="users table">
        <TableHead>
          <TableRow>
            <TableCell><strong>ID</strong></TableCell>
            <TableCell><strong>Name</strong></TableCell>
            <TableCell><strong>Role</strong></TableCell>
            <TableCell><strong>Access History</strong></TableCell>
            <TableCell><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredUsers.map(user => (
            <TableRow key={user._id}>
              <TableCell>{user._id}</TableCell>
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
              <TableCell>
                {user.access_history && user.access_history.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {user.access_history.map((datasetId, index) => (
                      <Tooltip key={index} title={`Dataset: ${datasetId}`} arrow>
                        <Chip 
                          label={datasetId} 
                          size="small" 
                          sx={{ margin: '2px', background: '#e3f2fd' }} 
                        />
                      </Tooltip>
                    ))}
                  </Box>
                ) : (
                  'No access history'
                )}
              </TableCell>
              <TableCell>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => onEditUser(user)} 
                  startIcon={<EditIcon />} 
                  sx={{ mr: 1 }}
                  disabled={user._id === 'admin'}
                >
                  Edit
                </Button>
                <IconButton 
                  aria-label="delete" 
                  size="small" 
                  onClick={() => onDeleteUser(user._id)}
                  color="error"
                  disabled={user._id === 'admin'}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

UserList.propTypes = {
  users: PropTypes.array,
  onEditUser: PropTypes.func.isRequired,
  onDeleteUser: PropTypes.func.isRequired,
};

export default UserList;
