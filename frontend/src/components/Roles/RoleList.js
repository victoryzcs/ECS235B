import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography,
  Box,
  Button,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function RoleList({ roles, onEdit, onDelete }) {
  return (
    <Box sx={{ mt: 2 }}>
      {roles.length === 0 ? (
        <Typography variant="body1">No roles found</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
          <Table stickyHeader aria-label="roles table">
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map(role => (
                <TableRow key={role._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">{role._id}</TableCell>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => onEdit(role)} 
                      startIcon={<EditIcon />} 
                      sx={{ mr: 1 }}
                      disabled={['admin', 'manager', 'worker'].includes(role._id)}
                    >
                      Edit
                    </Button>
                    <IconButton 
                      aria-label="delete" 
                      size="small" 
                      onClick={() => onDelete(role._id)}
                      color="error"
                      disabled={['admin', 'manager', 'worker'].includes(role._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
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

export default RoleList;