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
  Typography,
  Box,
  Button,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function ConflictClassList({ conflictClasses, onEdit, onDelete }) {
  return (
    <Box sx={{ mt: 2 }}>
      {conflictClasses.length === 0 ? (
        <Typography variant="body1">No conflict classes found</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
          <Table stickyHeader aria-label="conflict classes table">
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Datasets</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {conflictClasses.map((cc, index) => (
                <TableRow key={cc._id != null ? cc._id : `cc-${index}`} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    {cc._id != null ? cc._id : 'N/A'}
                  </TableCell>
                  <TableCell>{cc.name || 'N/A'}</TableCell>
                  <TableCell>
                    {cc.datasets && cc.datasets.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {cc.datasets.map((datasetId, index) => (
                          <Chip 
                            key={index} 
                            label={datasetId} 
                            size="small" 
                            sx={{ margin: '2px', background: '#e3f2fd' }} 
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No datasets</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => onEdit(cc)} 
                      startIcon={<EditIcon />} 
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <IconButton 
                      aria-label="delete" 
                      size="small" 
                      onClick={() => onDelete(cc._id)}
                      color="error"
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

ConflictClassList.propTypes = {
  conflictClasses: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ConflictClassList;