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

function DatasetList({ datasets }) {
  return (
    <Box sx={{ mt: 2 }}>
      {datasets.length === 0 ? (
        <Typography variant="body1">No datasets found</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
          <Table stickyHeader aria-label="datasets table">
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Objects</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {datasets.map(dataset => (
                <TableRow key={dataset.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">{dataset.id}</TableCell>
                  <TableCell>{dataset.name}</TableCell>
                  <TableCell>{dataset.description || 'No description'}</TableCell>
                  <TableCell>
                    {dataset.objects && dataset.objects.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {dataset.objects.map((objectId, index) => (
                          <Chip 
                            key={index} 
                            label={objectId} 
                            size="small" 
                            sx={{ margin: '2px', background: '#e3f2fd' }} 
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No objects</Typography>
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

export default DatasetList;