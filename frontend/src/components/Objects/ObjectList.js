import React, { useState, useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

function ObjectList({ objects: allObjects }) {
  const [filteredObjects, setFilteredObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  const isAdmin = auth?.isAdmin;
  const isManager = auth?.isManager;

  useEffect(() => {
    if (isAdmin) {
      setFilteredObjects(allObjects);
      setLoading(false);
      return;
    }

    const checkObjectPermissions = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const permittedObjects = [];
      
      for (const object of allObjects) {
        try {
          if (isManager) {
            permittedObjects.push(object);
            continue;
          }
          
          const response = await fetch('http://localhost:8080/api/check_access', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              user_id: currentUser?.id,
              object_id: object.id,
              action: 'read'
            })
          });
          
          const data = await response.json();
          
          if (response.ok && data.allowed === true) {
            permittedObjects.push(object);
          }
        } catch (error) {
          console.error(`Error checking permission for object ${object.id}:`, error);
        }
      }
      
      setFilteredObjects(permittedObjects);
      setLoading(false);
    };
    
    if (currentUser && allObjects.length > 0) {
      checkObjectPermissions();
    } else {
      setFilteredObjects([]);
      setLoading(false);
    }
  }, [allObjects, currentUser, isAdmin, isManager]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {filteredObjects.length === 0 ? (
        <Typography variant="body1">
          {allObjects.length === 0 
            ? "No objects found" 
            : "You don't have permission to view any objects"}
        </Typography>
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
              {filteredObjects.map(object => (
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