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

function ConflictClassList({ conflictClasses }) {
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
              </TableRow>
            </TableHead>
            <TableBody>
              {conflictClasses.map(cc => (
                <TableRow key={cc.class_id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">{cc.class_id}</TableCell>
                  <TableCell>{cc.name}</TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default ConflictClassList;