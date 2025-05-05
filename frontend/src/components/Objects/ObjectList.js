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

function ObjectList({ objects }) {
  return (
    <Box sx={{ mt: 2 }}>
      {objects.length === 0 ? (
        <Typography variant="body1">No objects found</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
          <Table stickyHeader aria-label="objects table">
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Dataset</strong></TableCell>
                <TableCell><strong>Conflict Class</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {objects.map(object => (
                <TableRow key={object.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">{object.id}</TableCell>
                  <TableCell>{object.name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={object.dataset} 
                      size="small" 
                      sx={{ background: '#e3f2fd' }} 
                    />
                  </TableCell>
                  <TableCell>
                    {object.conflict_class ? (
                      <Chip 
                        label={object.conflict_class} 
                        size="small" 
                        sx={{ background: '#fff8e1' }} 
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">None</Typography>
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

export default ObjectList;